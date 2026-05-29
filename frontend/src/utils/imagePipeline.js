const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toBase64Url = (value) => {
  const utf8Bytes = new TextEncoder().encode(String(value || ""));
  let binary = "";
  utf8Bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const buildImageProxyUrl = (apiBaseUrl, sourceUrl) => {
  if (!sourceUrl || sourceUrl.startsWith("data:image")) {
    return sourceUrl || "";
  }

  const baseApi = String(apiBaseUrl || "").replace(/\/+$/, "");
  const encoded = toBase64Url(sourceUrl);
  return `${baseApi}/ai/image/proxy?src=${encodeURIComponent(encoded)}`;
};

export const preloadImage = async (
  imageUrl,
  { timeoutMs = 18000, retries = 2, retryDelayMs = 450 } = {}
) => {
  const targetUrl = String(imageUrl || "").trim();
  if (!targetUrl) {
    console.debug("IMAGE PRELOAD SKIPPED: empty URL");
    return { ok: false, url: targetUrl, error: new Error("Missing image URL") };
  }

  let attempt = 0;
  while (attempt <= retries) {
    try {
      console.debug("IMAGE PRELOAD START:", { targetUrl, attempt });
      const preloadedUrl = await new Promise((resolve, reject) => {
        const image = new Image();
        const timeout = window.setTimeout(() => {
          reject(new Error("Image preload timeout"));
        }, timeoutMs);

        image.onload = () => {
          window.clearTimeout(timeout);
          resolve(targetUrl);
        };

        image.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error("Image preload failed"));
        };

        image.src = targetUrl;
      });

      console.debug("IMAGE PRELOAD SUCCESS:", { targetUrl, attempt });
      return { ok: true, url: preloadedUrl, attempt };
    } catch (error) {
      console.debug("IMAGE PRELOAD ERROR:", {
        targetUrl,
        attempt,
        message: error?.message || "Unknown preload error"
      });
      if (attempt >= retries) {
        return { ok: false, url: targetUrl, error, attempt };
      }
      attempt += 1;
      await delay(retryDelayMs * attempt);
    }
  }

  return { ok: false, url: targetUrl, error: new Error("Image preload failed") };
};
