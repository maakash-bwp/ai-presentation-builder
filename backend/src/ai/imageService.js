// const axios = require("axios");
// const env = require("../config/env");

// const pexelsClient = axios.create({
//   baseURL: env.pexelsBaseUrl,
//   timeout: 15000,
//   proxy: false
// });

// const CACHE_TTL_MS = 1000 * 60 * 30;
// const MAX_CACHE_ENTRIES = 400;
// const imageCache = new Map();
// const DEFAULT_PEXELS_IMAGE =
//   "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

// const logImageEvent = (stage, payload) => {
//   if (env.nodeEnv === "production") return;
//   console.info(`[image-service] ${stage}`, payload);
// };

// const createQueryHash = (value) =>
//   String(value || "")
//     .split("")
//     .reduce((hash, char) => ((hash * 33 + char.charCodeAt(0)) >>> 0), 5381);

// const sanitizeWords = (value) =>
//   String(value || "")
//     .replace(/[^\w\s-]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

// const toImageResult = ({ prompt, imageUrl, seed }) => ({
//   imageUrl,
//   prompt,
//   provider: "pexels",
//   generatedAt: new Date().toISOString(),
//   seed
// });

// const getCachedImage = (cacheKey) => {
//   const entry = imageCache.get(cacheKey);
//   if (!entry) return null;
//   if (Date.now() > entry.expiresAt) {
//     imageCache.delete(cacheKey);
//     return null;
//   }
//   return entry.value;
// };

// const setCachedImage = (cacheKey, value) => {
//   imageCache.set(cacheKey, {
//     value,
//     expiresAt: Date.now() + CACHE_TTL_MS
//   });
//   if (imageCache.size > MAX_CACHE_ENTRIES) {
//     const firstKey = imageCache.keys().next().value;
//     imageCache.delete(firstKey);
//   }
//   return value;
// };

// const buildShortKeywordPrompt = (query) => {
//   const stopWords = new Set([
//     "the",
//     "and",
//     "for",
//     "with",
//     "slide",
//     "presentation",
//     "overview",
//     "introduction",
//     "conclusion",
//     "visual",
//     "cinematic",
//     "detailed",
//     "professional",
//     "composition",
//     "lighting",
//     "text",
//     "aspect",
//     "ratio",
//     "summary",
//     "bullet",
//     "points",
//     "content",
//     "generated",
//     "direction"
//   ]);

//   const tokens = sanitizeWords(query)
//     .split(/\s+/)
//     .filter(Boolean)
//     .filter((word) => word.length > 2)
//     .filter((word) => !stopWords.has(word.toLowerCase()))
//     .slice(0, 3);

//   if (!tokens.length) {
//     return "business meeting";
//   }
//   return tokens.join(" ");
// };

// const normalizePexelsUrl = (photo = {}) =>
//   photo?.src?.landscape ||
//   photo?.src?.large2x ||
//   photo?.src?.large ||
//   photo?.src?.original ||
//   "";

// const searchPexels = async ({ keywordPrompt, seed }) => {
//   if (!env.pexelsApiKey) {
//     throw new Error("PEXELS_API_KEY is missing.");
//   }

//   const { data } = await pexelsClient.get("/search", {
//     params: {
//       query: keywordPrompt,
//       orientation: "landscape",
//       per_page: 10,
//       page: (seed % 5) + 1
//     },
//     headers: {
//       Authorization: env.pexelsApiKey
//     }
//   });

//   const photos = Array.isArray(data?.photos) ? data.photos : [];
//   const urls = photos.map(normalizePexelsUrl).filter(Boolean);
//   if (!urls.length) {
//     return "";
//   }

//   return urls[seed % urls.length];
// };

// const generateImage = async (query) => {
//   const startedAt = Date.now();
//   const prompt = buildShortKeywordPrompt(query);
//   const seed = createQueryHash(prompt);
//   const cacheKey = `${prompt}::${seed}`;

//   const cached = getCachedImage(cacheKey);
//   if (cached) {
//     logImageEvent("cache-hit", { prompt, seed });
//     return cached;
//   }

//   try {
//     const imageUrl = await searchPexels({ keywordPrompt: prompt, seed });
//     if (imageUrl) {
//       const result = toImageResult({ prompt, imageUrl, seed });
//       logImageEvent("provider-success", {
//         provider: "pexels",
//         prompt,
//         seed,
//         ms: Date.now() - startedAt
//       });
//       return setCachedImage(cacheKey, result);
//     }
//   } catch (error) {
//     logImageEvent("provider-error", {
//       provider: "pexels",
//       prompt,
//       seed,
//       error: error?.message || "Unknown pexels error"
//     });
//   }

//   const emergency = toImageResult({
//     prompt,
//     imageUrl: DEFAULT_PEXELS_IMAGE,
//     seed
//   });
//   logImageEvent("provider-default", {
//     provider: "pexels-default",
//     prompt,
//     seed,
//     ms: Date.now() - startedAt
//   });
//   return setCachedImage(cacheKey, emergency);
// };

// module.exports = {
//   generateImage
// };





const axios = require("axios");

const imageCache = new Map();

const createQueryHash = (value) =>
  String(value)
    .split("")
    .reduce((hash, char) => ((hash * 33 + char.charCodeAt(0)) >>> 0), 5381);

const cleanPrompt = (query) => {
  if (!query) return "technology";

  const stopWords = [
    "presentation",
    "slide",
    "visual",
    "cinematic",
    "lighting",
    "modern",
    "professional",
    "high",
    "quality",
    "ultra",
    "detailed",
    "composition",
    "dashboard"
  ];

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((word) => word.length > 2)
    .filter((word) => !stopWords.includes(word))
    .slice(0, 3)
    .join(" ");
};

const getPicsumFallback = (query) => {
  const seed = createQueryHash(query);
  return `https://picsum.photos/seed/${seed}/1600/900`;
};

const searchPexels = async (query) => {
  const keyword = cleanPrompt(query);

  console.log("PEXELS KEYWORD:", keyword);

  const response = await axios.get(
    "https://api.pexels.com/v1/search",
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY
      },
      params: {
        query: keyword,
        per_page: 10,
        orientation: "landscape"
      },
      timeout: 10000
    }
  );

  const photos = response?.data?.photos || [];

  if (!photos.length) {
    return null;
  }

  const randomIndex = createQueryHash(keyword) % photos.length;

  return photos[randomIndex]?.src?.large2x;
};

const generateImage = async (query) => {
  const cleanedQuery = cleanPrompt(query);

  if (imageCache.has(cleanedQuery)) {
    return {
      imageUrl: imageCache.get(cleanedQuery),
      prompt: cleanedQuery,
      provider: "cache"
    };
  }

  try {
    const pexelsImage = await searchPexels(cleanedQuery);

    if (pexelsImage) {
      imageCache.set(cleanedQuery, pexelsImage);

      return {
        imageUrl: pexelsImage,
        prompt: cleanedQuery,
        provider: "pexels"
      };
    }
  } catch (error) {
    console.log("PEXELS ERROR:", error.message);
  }

  const fallbackImage = getPicsumFallback(cleanedQuery);

  return {
    imageUrl: fallbackImage,
    prompt: cleanedQuery,
    provider: "picsum"
  };
};

module.exports = {
  generateImage
};