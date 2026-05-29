export const TEMPLATE_OPTIONS = [
  {
    id: "Business",
    name: "Business",
    description: "Executive-ready layouts with crisp structure and clean hierarchy.",
    palette: ["#0f172a", "#2563eb", "#f8fafc"],
    font: "Plus Jakarta Sans"
  },
  {
    id: "Minimal",
    name: "Minimal",
    description: "Lightweight typography and whitespace for focused storytelling.",
    palette: ["#1e293b", "#38bdf8", "#ffffff"],
    font: "Sora"
  },
  {
    id: "Modern",
    name: "Modern",
    description: "Contemporary gradients and bold section framing.",
    palette: ["#0f172a", "#0ea5e9", "#e0f2fe"],
    font: "Plus Jakarta Sans"
  },
  {
    id: "Tech",
    name: "Tech",
    description: "High contrast with a sharp product-demo visual tone.",
    palette: ["#111827", "#0891b2", "#f1f5f9"],
    font: "Sora"
  },
  {
    id: "Creative",
    name: "Creative",
    description: "Expressive accent color blocks for brand and concept decks.",
    palette: ["#0c4a6e", "#06b6d4", "#ecfeff"],
    font: "Plus Jakarta Sans"
  }
];

export const getTemplateById = (templateId) =>
  TEMPLATE_OPTIONS.find((item) => item.id === templateId) || TEMPLATE_OPTIONS[0];


