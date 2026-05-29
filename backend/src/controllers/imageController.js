const axios = require("axios");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

const pexelsClient = axios.create({
  baseURL: env.pexelsBaseUrl,
  timeout: 15000,
  proxy: false
});

const normalizePexelsPhoto = (photo) => ({
  id: `pexels-${photo?.id || Math.random().toString(36).slice(2)}`,
  provider: "pexels",
  url:
    photo?.src?.landscape ||
    photo?.src?.large2x ||
    photo?.src?.large ||
    photo?.src?.original ||
    "",
  photographer: photo?.photographer || "",
  photographerUrl: photo?.photographer_url || "",
  width: photo?.width || null,
  height: photo?.height || null,
  alt: photo?.alt || ""
});

const searchImagesController = asyncHandler(async (req, res) => {
  const query = String(req.query?.query || "").trim();
  const perPage = Math.min(Math.max(Number(req.query?.per_page || 8), 1), 20);

  if (query.length < 2) {
    throw new ApiError(400, "Query must be at least 2 characters.");
  }

  if (env.pexelsApiKey) {
    try {
      const { data } = await pexelsClient.get("/search", {
        params: {
          query,
          per_page: perPage,
          orientation: "landscape"
        },
        headers: {
          Authorization: env.pexelsApiKey
        }
      });

      const photos = Array.isArray(data?.photos) ? data.photos : [];
      const normalized = photos.map(normalizePexelsPhoto).filter((item) => item.url);
      if (normalized.length) {
        return res.status(200).json({
          success: true,
          data: {
            provider: "pexels",
            images: normalized
          }
        });
      }
    } catch {
      // Continue to empty response below.
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      provider: "none",
      images: []
    }
  });
});

module.exports = {
  searchImagesController
};
