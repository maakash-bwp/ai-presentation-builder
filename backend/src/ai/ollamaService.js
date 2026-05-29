const axios = require("axios");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { parseOutline, parseSlideContent } = require("../utils/responseParsers");

const ollamaClient = axios.create({
  baseURL: env.ollamaBaseUrl,
  timeout: env.ollamaTimeoutMs
});

const generateWithOllama = async (prompt) => {
  try {
    const { data } = await ollamaClient.post("/api/generate", {
      model: env.ollamaModel,
      prompt,
      stream: false
    });

    return String(data?.response || "").trim();
  } catch (error) {
    const ollamaReason =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message;

    const message = ollamaReason?.includes("system memory")
      ? `Ollama could not run the "${env.ollamaModel}" model.`
      : "Failed to communicate with Ollama.";

    throw new ApiError(503, message, {
      reason: ollamaReason
    });
  }
};

const generateOutline = async (topic, numberOfSlides = 6) => {
  const prompt = [
    "You are a presentation assistant.",
    `Generate exactly ${numberOfSlides} concise slide headings for the topic: "${topic}".`,
    "Return only a valid JSON array of strings, with no extra text."
  ].join("\n");

  const responseText = await generateWithOllama(prompt);
  return parseOutline(responseText, numberOfSlides);
};

const generateSingleSlide = async (title, topic) => {
  const prompt = [
    "You are generating one presentation slide in JSON format.",
    `Topic context: "${topic}"`,
    `Slide title: "${title}"`,
    "Return ONLY valid JSON using this schema:",
    '{ "title": "string", "bulletPoints": ["4 concise bullet points"], "summary": "1-2 sentence summary" }'
  ].join("\n");

  const responseText = await generateWithOllama(prompt);
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

  const slidePromises = outline.map((heading) => generateSingleSlide(heading, topic));
  const slideContent = await Promise.all(slidePromises);

  return slideContent.map((slide, index) => ({
    ...slide,
    order: index + 1
  }));
};

module.exports = {
  generateOutline,
  generateSlides
};
