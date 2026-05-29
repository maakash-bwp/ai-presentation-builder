import { getSlideLayoutVariant } from "./slideLayouts";

const VISUAL_STYLES = {
  intro: "cinematic hero composition, polished product storytelling, premium lighting",
  data: "clean analytics dashboard, modern charts, editorial business visualization",
  future: "futuristic innovation concept, glowing interfaces, ambitious atmosphere",
  problem: "dramatic challenge framing, tension, complexity, contrast",
  solution: "confident solution reveal, clean product interaction, clarity and momentum",
  process: "workflow steps, structured visual narrative, professional diagram energy",
  team: "collaborative team scene, modern workspace, confident human-centered composition",
  outcome: "success, momentum, achievement, forward-looking optimism",
  default: "premium editorial illustration, modern SaaS branding, polished presentation visual"
};

const COMPOSITION_VARIATIONS = [
  "cinematic wide angle",
  "isometric perspective",
  "editorial close-up with depth",
  "minimal product hero composition",
  "dynamic diagonal composition",
  "clean layered depth with soft glow"
];

const toTitleCase = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const inferSlideIntent = (slide = {}) => {
  const combined = `${slide.title || ""} ${slide.summary || ""} ${(slide.bulletPoints || []).join(" ")}`.toLowerCase();

  if (/(market|stat|revenue|growth|metric|analytics|data|kpi|research)/i.test(combined)) {
    return "data";
  }

  if (/(future|vision|roadmap|trend|innovation|tomorrow|emerging)/i.test(combined)) {
    return "future";
  }

  if (/(problem|challenge|risk|barrier|pain|issue|obstacle)/i.test(combined)) {
    return "problem";
  }

  if (/(solution|platform|product|system|tool|feature|benefit)/i.test(combined)) {
    return "solution";
  }

  if (/(team|customer|audience|people|user|client)/i.test(combined)) {
    return "team";
  }

  if (/(overview|introduction|intro|agenda|summary)/i.test(combined)) {
    return "intro";
  }

  if (/(process|timeline|workflow|steps|framework|implementation)/i.test(combined)) {
    return "process";
  }

  if (/(conclusion|next steps|success|impact|result|outcome)/i.test(combined)) {
    return "outcome";
  }

  return "default";
};

const getIntentLabel = (intent) =>
  ({
    intro: "overview hero visual",
    data: "analytics and insight visual",
    future: "future-forward concept visual",
    problem: "challenge-focused visual",
    solution: "solution showcase visual",
    process: "workflow visual",
    team: "people and collaboration visual",
    outcome: "success and momentum visual",
    default: "topic-aligned visual"
  }[intent] || "topic-aligned visual");

export const createSlideImagePrompt = (presentationTitle, slide) => {
  const intent = inferSlideIntent(slide);
  const topic = toTitleCase(presentationTitle);
  const title = toTitleCase(slide.title);
  const summary = String(slide.summary || "").trim();
  const bullets = (slide.bulletPoints || []).filter(Boolean).slice(0, 2).join(", ");
  const slideOrder = Number(slide.order || 1);
  const composition = COMPOSITION_VARIATIONS[(slideOrder - 1) % COMPOSITION_VARIATIONS.length];

  return [
    `${title} for ${topic}`,
    `Slide ${slideOrder} visual direction`,
    getIntentLabel(intent),
    VISUAL_STYLES[intent],
    composition,
    summary ? `Scene idea: ${summary}` : "",
    bullets ? `Include ideas about ${bullets}` : "",
    "editorial presentation illustration, high quality, ultra detailed, cinematic, 16:9, no text, visually clean"
  ]
    .filter(Boolean)
    .join(". ")
    .slice(0, 420);
};

const paletteByIntent = {
  intro: ["#0f172a", "#0ea5e9", "#8b5cf6"],
  data: ["#0f172a", "#2563eb", "#14b8a6"],
  future: ["#020617", "#06b6d4", "#9333ea"],
  problem: ["#1e293b", "#ef4444", "#f97316"],
  solution: ["#082f49", "#0ea5e9", "#22c55e"],
  process: ["#1e293b", "#7c3aed", "#06b6d4"],
  team: ["#0f172a", "#ec4899", "#0ea5e9"],
  outcome: ["#0f172a", "#14b8a6", "#22c55e"],
  default: ["#0f172a", "#0284c7", "#38bdf8"]
};

export const createFallbackSlideImage = (presentationTitle, slide) => {
  const intent = inferSlideIntent(slide);
  const palette = paletteByIntent[intent] || paletteByIntent.default;
  const title = toTitleCase(slide.title || "Generated visual");
  const subtitle = toTitleCase(presentationTitle || "AI Presentation");
  const caption = getIntentLabel(intent);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="55%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
        <radialGradient id="glow" cx="20%" cy="20%" r="80%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.38)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      <circle cx="280" cy="180" r="260" fill="url(#glow)" />
      <circle cx="1320" cy="120" r="200" fill="rgba(255,255,255,0.12)" />
      <circle cx="1260" cy="760" r="240" fill="rgba(255,255,255,0.09)" />
      <rect x="110" y="120" width="860" height="560" rx="34" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)" />
      <rect x="1010" y="170" width="420" height="220" rx="28" fill="rgba(255,255,255,0.12)" />
      <rect x="1010" y="430" width="280" height="180" rx="28" fill="rgba(255,255,255,0.12)" />
      <rect x="1320" y="430" width="110" height="180" rx="28" fill="rgba(255,255,255,0.2)" />
      <text x="150" y="190" fill="rgba(255,255,255,0.72)" font-size="34" font-family="Arial, sans-serif" letter-spacing="5">${subtitle.toUpperCase()}</text>
      <text x="150" y="315" fill="#ffffff" font-size="78" font-weight="700" font-family="Arial, sans-serif">${title}</text>
      <text x="150" y="392" fill="rgba(255,255,255,0.92)" font-size="38" font-family="Arial, sans-serif">${caption}</text>
      <text x="150" y="770" fill="rgba(255,255,255,0.74)" font-size="28" font-family="Arial, sans-serif">Generated visual fallback - SlideCraft AI</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const createEmptySlide = (index, presentationTitle = "Presentation") => {
  const slide = {
    title: `New Slide ${index + 1}`,
    bulletPoints: ["Primary point", "Supporting point", "Insight", "Call to action"],
    summary: "Add your narrative here.",
    imageUrl: "",
    imagePrompt: "",
    layoutVariant: getSlideLayoutVariant(index),
    imageStyle: {
      offsetX: 50,
      offsetY: 50,
      scale: 100
    },
    order: index + 1
  };

  return {
    ...slide,
    imagePrompt: createSlideImagePrompt(presentationTitle, slide),
    imageUrl: ""
  };
};

export const normalizeSlideForEditor = (slide, index, presentationTitle) => {
  const normalized = {
    ...slide,
    bulletPoints:
      Array.isArray(slide?.bulletPoints) && slide.bulletPoints.length
        ? slide.bulletPoints
        : ["", "", "", ""],
    layoutVariant: slide?.layoutVariant || getSlideLayoutVariant(index),
    imageStyle: {
      offsetX: Number(slide?.imageStyle?.offsetX ?? 50),
      offsetY: Number(slide?.imageStyle?.offsetY ?? 50),
      scale: Number(slide?.imageStyle?.scale ?? 100)
    }
  };

  return {
    ...normalized,
    imagePrompt:
      slide?.imagePrompt || createSlideImagePrompt(presentationTitle, normalized),
    imageUrl: typeof slide?.imageUrl === "string" ? slide.imageUrl : ""
  };
};

export const reindexSlides = (slides) =>
  slides.map((slide, index) => ({
    ...slide,
    order: index + 1
  }));
