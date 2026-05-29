const axios = require("axios");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const {
  parseOutline,
  parseSlideContent
} = require("../utils/responseParsers");

const geminiClient = axios.create({
  baseURL: env.geminiBaseUrl,
  timeout: env.geminiTimeoutMs,
  headers: {
    "Content-Type": "application/json"
  }
});

const RETRYABLE_GEMINI_ERRORS = new Set([
  "ECONNRESET",
  "ECONNABORTED",
  "ETIMEDOUT",
  "EAI_AGAIN"
]);

const ensureGeminiApiKey = () => {
  if (!env.geminiApiKey) {
    throw new ApiError(500, "Gemini API key is missing.", {
      reason: "Set GEMINI_API_KEY in backend/.env to enable text generation."
    });
  }
};

const buildGeminiUrl = (methodName) =>
  `${env.geminiModel}:${methodName}?key=${encodeURIComponent(env.geminiApiKey)}`;

const extractTextFromGemini = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => String(part?.text || ""))
    .join("")
    .trim();
};

const normalizeGeminiError = (error) => {
  const reason =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error.message;

  throw new ApiError(503, "Gemini text generation failed.", {
    reason
  });
};

const shouldRetryGeminiError = (error) => {
  const status = error?.response?.status;
  const reason = String(
    error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error.message ||
      ""
  ).toLowerCase();

  return (
    RETRYABLE_GEMINI_ERRORS.has(error?.code) ||
    reason.includes("socket hang up") ||
    reason.includes("timeout") ||
    reason.includes("temporarily unavailable") ||
    status === 429 ||
    (status >= 500 && status < 600)
  );
};

const generateContent = async (prompt, generationConfig = {}) => {
  ensureGeminiApiKey();

  try {
    const { data } = await withGeminiRetry(() =>
      geminiClient.post(buildGeminiUrl("generateContent"), {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig
      })
    );

    return extractTextFromGemini(data);
  } catch (error) {
    normalizeGeminiError(error);
  }
};

const streamGenerateContent = async (prompt, onTextChunk) => {
  ensureGeminiApiKey();

  try {
    const response = await geminiClient.post(
      buildGeminiUrl("streamGenerateContent") + "&alt=sse",
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        responseType: "stream",
        timeout: env.geminiTimeoutMs
      }
    );

    return await new Promise((resolve, reject) => {
      let rawBuffer = "";
      let fullText = "";
      let previousChunkText = "";

      response.data.on("data", (chunk) => {
        rawBuffer += chunk.toString("utf8");

        while (rawBuffer.includes("\n\n")) {
          const separatorIndex = rawBuffer.indexOf("\n\n");
          const eventBlock = rawBuffer.slice(0, separatorIndex);
          rawBuffer = rawBuffer.slice(separatorIndex + 2);

          const dataLines = eventBlock
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("data:"));

          dataLines.forEach((line) => {
            const payload = line.replace(/^data:\s*/, "");
            if (!payload || payload === "[DONE]") {
              return;
            }

            try {
              const parsed = JSON.parse(payload);
              const text = extractTextFromGemini(parsed);

              if (text) {
                const delta = text.startsWith(previousChunkText)
                  ? text.slice(previousChunkText.length)
                  : text;

                previousChunkText = text;

                if (delta) {
                  fullText += delta;
                  onTextChunk(delta);
                }
              }
            } catch {
              // Ignore partial or non-JSON SSE frames.
            }
          });
        }
      });

      response.data.on("end", () => resolve(fullText));
      response.data.on("error", (error) => reject(error));
    });
  } catch (error) {
    normalizeGeminiError(error);
  }
};

const createOutlinePrompt = (topic, numberOfSlides) =>
  [
    "You are generating slide outline headings for a presentation.",
    `Topic: "${topic}"`,
    `Return exactly ${numberOfSlides} slide headings.`,
    "Output rules:",
    "- One heading per line",
    "- No numbering",
    "- No bullet characters",
    "- No commentary before or after the list",
    "- Never output generic placeholders like Slide 1, Slide 2, Introduction, or Conclusion by themselves",
    "- Each heading must refer to a concrete angle, challenge, use case, trend, or strategy tied to the topic",
    "- Keep each heading concise and presentation-ready"
  ].join("\n");

const createSlidePrompt = (title, topic) =>
  [
    "You are generating one presentation slide as strict JSON.",
    `Topic: "${topic}"`,
    `Slide title: "${title}"`,
    "Return ONLY valid JSON with this schema:",
    '{"title":"string","bulletPoints":["string","string","string","string"],"summary":"string"}',
    "Rules:",
    "- bulletPoints must contain exactly 4 concise bullets",
    "- summary must be 1 or 2 short sentences",
    "- no markdown fences"
  ].join("\n");

const wait = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const withGeminiRetry = async (operation) => {
  const delays = [0, 800];
  let lastError = null;

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt] > 0) {
      await wait(delays[attempt]);
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!shouldRetryGeminiError(error) || attempt === delays.length - 1) {
        throw error;
      }
    }
  }

  throw lastError;
};

const generateOutline = async (topic, numberOfSlides = 6) => {
  const prompt = createOutlinePrompt(topic, numberOfSlides);
  const responseText = await generateContent(prompt, {
    temperature: 0.7
  });

  return parseOutline(responseText, numberOfSlides);
};

const streamOutline = async ({ topic, numberOfSlides, onHeading }) => {
  const finalOutline = await generateOutline(topic, numberOfSlides);

  for (let index = 0; index < finalOutline.length; index += 1) {
    onHeading(finalOutline[index], index);
    await wait(120);
  }

  return finalOutline;
};

const generateSingleSlide = async (title, topic) => {
  const prompt = createSlidePrompt(title, topic);
  const responseText = await generateContent(prompt, {
    temperature: 0.8
  });

  return parseSlideContent(responseText, title);
};

const generateSlides = async (outlineInput, topicInput = "") => {
  const outline = Array.isArray(outlineInput)
    ? outlineInput
    : outlineInput?.outline;
  const topic = Array.isArray(outlineInput)
    ? topicInput
    : outlineInput?.topic || "";

  if (!Array.isArray(outline) || !outline.length) {
    throw new ApiError(400, "Outline is required to generate slides.");
  }

  const slides = [];

  for (let index = 0; index < outline.length; index += 1) {
    const slide = await generateSingleSlide(outline[index], topic);
    slides.push({
      ...slide,
      order: index + 1
    });
  }

  return slides;
};

const streamSlides = async ({ topic, outline, onSlide }) => {
  if (!Array.isArray(outline) || !outline.length) {
    throw new ApiError(400, "Outline is required to generate slides.");
  }

  const slides = [];

  for (let index = 0; index < outline.length; index += 1) {
    const heading = outline[index];
    const slide = await generateSingleSlide(heading, topic);
    const hydratedSlide = {
      ...slide,
      order: index + 1
    };

    slides.push(hydratedSlide);
    onSlide(hydratedSlide, index);
  }

  return slides;
};

module.exports = {
  generateOutline,
  streamOutline,
  generateSlides,
  streamSlides
};
