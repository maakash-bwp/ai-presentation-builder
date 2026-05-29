import api from "./api";
import { parseOutline, parseSlideContent, sanitizeOutlineLine } from "../utils/aiParsers";

const IMAGE_CACHE_LIMIT = 80;
const imageCache = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



const createApiError = (message, status = 500, data = null) => {
  const error = new Error(message);
  error.response = {
    status,
    data: data || { message }
  };
  return error;
};

const getApiBaseUrl = () =>
  String(api?.defaults?.baseURL || "http://localhost:5000/api").replace(/\/+$/, "");

const getAuthHeaders = () => {
  const token = localStorage.getItem("apb_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseErrorResponse = async (response) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const message = payload?.message || `Request failed with status ${response.status}`;
  throw createApiError(message, response.status, payload);
};

const streamNdjsonRequest = async ({ endpoint, payload, onEvent }) => {
  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  if (!response.body) {
    throw createApiError("Streaming response body is unavailable.", response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      try {
        const parsed = JSON.parse(line);
        onEvent(parsed);
      } catch (error) {
        console.debug("NDJSON PARSE ERROR:", { endpoint, line, message: error?.message });
      }
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    try {
      onEvent(JSON.parse(trailing));
    } catch (error) {
      console.debug("NDJSON TRAILING PARSE ERROR:", {
        endpoint,
        trailing,
        message: error?.message
      });
    }
  }
};

export const generateOutlineRequest = async ({ topic, numberOfSlides }) => {
  const { data } = await api.post("/ai/outline", { topic, numberOfSlides });
  return data.data;
};

export const generateSlidesRequest = async ({ topic, outline }) => {
  const { data } = await api.post("/ai/slides", { topic, outline });
  return data.data;
};

export const generateImageRequest = async (query) => {
  const requestedPrompt = String(query || "business meeting").trim().slice(0, 120);
  const cacheKey = requestedPrompt.toLowerCase();
  const cached = imageCache.get(cacheKey);
  if (cached?.imageUrl) {
    console.debug("HYBRID IMAGE CACHE HIT:", cached);
    return {
      ...cached,
      generatedAt: new Date().toISOString()
    };
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      console.debug("HYBRID IMAGE REQUEST:", { prompt: requestedPrompt, attempt });
      const { data } = await api.post("/ai/image", { query: requestedPrompt });
      const imageUrl = String(
        data?.data?.imageUrl ||
          data?.data?.url ||
          data?.imageUrl ||
          data?.url ||
          ""
      ).trim();
      if (!imageUrl) throw new Error("Hybrid image API returned empty URL.");

      const normalized = {
        imageUrl,
        prompt: data?.data?.prompt || requestedPrompt,
        provider: "pexels",
        generatedAt: data?.data?.generatedAt || new Date().toISOString()
      };

      imageCache.set(cacheKey, normalized);
      if (imageCache.size > IMAGE_CACHE_LIMIT) {
        const firstKey = imageCache.keys().next().value;
        imageCache.delete(firstKey);
      }

      console.debug("HYBRID IMAGE SUCCESS:", normalized);
      return normalized;
    } catch (error) {
      console.debug("HYBRID IMAGE FAILURE:", {
        attempt,
        prompt: requestedPrompt,
        message: error?.message || "Unknown image error"
      });
      if (attempt < 3) {
        await delay(attempt * 900);
      }
    }
  }

  throw createApiError("Pexels image fetch failed.");
};

export const streamOutlineRequest = async (payload, onEvent) => {
  await streamNdjsonRequest({
    endpoint: "/ai/outline/stream",
    payload,
    onEvent
  });
};

export const streamSlidesRequest = async (payload, onEvent) => {
  await streamNdjsonRequest({
    endpoint: "/ai/slides/stream",
    payload,
    onEvent
  });
};
