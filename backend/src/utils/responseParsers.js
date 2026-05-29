const sanitizeHeading = (value) =>
  String(value || "")
    .replace(/^[-*0-9.\s]+/, "")
    .trim();

const toJsonObject = (value) => {
  const text = String(value || "").trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const toJsonArray = (value) => {
  const text = String(value || "").trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const parseOutline = (raw, numberOfSlides) => {
  const normalizedCount = Number(numberOfSlides) || 6;
  const jsonArray = toJsonArray(raw);
  let headings = [];

  if (Array.isArray(jsonArray)) {
    headings = jsonArray.map(sanitizeHeading).filter(Boolean);
  } else {
    headings = String(raw || "")
      .split("\n")
      .map(sanitizeHeading)
      .filter(Boolean);
  }

  if (!headings.length) {
    headings = Array.from(
      { length: normalizedCount },
      (_, index) => `Slide ${index + 1}`
    );
  }

  if (headings.length < normalizedCount) {
    const additional = Array.from(
      { length: normalizedCount - headings.length },
      (_, index) => `Slide ${headings.length + index + 1}`
    );
    headings = [...headings, ...additional];
  }

  return headings.slice(0, normalizedCount);
};

const parseSlideContent = (raw, fallbackTitle) => {
  const parsed = toJsonObject(raw);

  if (parsed && typeof parsed === "object") {
    const title = String(parsed.title || fallbackTitle || "Untitled Slide").trim();
    const bulletPoints = Array.isArray(parsed.bulletPoints)
      ? parsed.bulletPoints.map((point) => String(point).trim()).filter(Boolean)
      : [];
    const summary = String(parsed.summary || "").trim();

    return {
      title,
      bulletPoints: bulletPoints.slice(0, 6),
      summary
    };
  }

  const lines = String(raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines
    .filter((line) => /^[-*]/.test(line) || /^[0-9]+\./.test(line))
    .map((line) => sanitizeHeading(line))
    .filter(Boolean)
    .slice(0, 4);

  const summaryCandidate = lines.find((line) => !/^[-*]/.test(line));

  return {
    title: fallbackTitle || "Untitled Slide",
    bulletPoints: bullets.length
      ? bullets
      : ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
    summary: summaryCandidate || "Summary unavailable."
  };
};

module.exports = {
  parseOutline,
  parseSlideContent,
  sanitizeHeading
};
