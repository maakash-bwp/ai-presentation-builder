const sanitizeHeading = (value) =>
  String(value || "")
    .replace(/^[-*0-9.\s]+/, "")
    .trim();

const toJsonObject = (value) => {
  const text = String(value || "").trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

export const parseOutline = (raw, numberOfSlides) => {
  const normalizedCount = Number(numberOfSlides) || 6;
  const headings = String(raw || "")
    .split("\n")
    .map(sanitizeHeading)
    .filter(Boolean)
    .filter((heading) => !/^slide\s+\d+$/i.test(heading))
    .slice(0, normalizedCount);

  return headings;
};

export const parseSlideContent = (raw, fallbackTitle) => {
  const parsed = toJsonObject(raw);

  if (parsed && typeof parsed === "object") {
    return {
      title: String(parsed.title || fallbackTitle || "Untitled Slide").trim(),
      bulletPoints: Array.isArray(parsed.bulletPoints)
        ? parsed.bulletPoints.map((point) => String(point).trim()).filter(Boolean).slice(0, 4)
        : [],
      summary: String(parsed.summary || "").trim()
    };
  }

  return {
    title: fallbackTitle || "Untitled Slide",
    bulletPoints: ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
    summary: "Summary unavailable."
  };
};

export const sanitizeOutlineLine = sanitizeHeading;
