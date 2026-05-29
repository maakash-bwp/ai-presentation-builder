export const SLIDE_THEME_MAP = {
  Business: {
    shell: "bg-gradient-to-br from-white via-slate-50 to-slate-100",
    darkShell: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800",
    accent: "bg-brand-600",
    chip: "bg-brand-50 text-brand-700",
    border: "border-slatePro-200",
    contentMode: "light"
  },
  Minimal: {
    shell: "bg-gradient-to-br from-white via-stone-50 to-slate-50",
    darkShell: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700",
    accent: "bg-slatePro-900",
    chip: "bg-slatePro-100 text-slatePro-700",
    border: "border-slatePro-200",
    contentMode: "light"
  },
  Modern: {
    shell: "bg-gradient-to-br from-cyan-50 via-white to-sky-100",
    darkShell: "bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-900",
    accent: "bg-cyan-500",
    chip: "bg-cyan-50 text-cyan-700",
    border: "border-cyan-100",
    contentMode: "light"
  },
  Tech: {
    shell: "bg-gradient-to-br from-slate-950 via-[#081223] to-blue-950",
    darkShell: "bg-gradient-to-br from-slate-950 via-[#081223] to-blue-950",
    accent: "bg-cyan-400",
    chip: "bg-cyan-400/15 text-cyan-200",
    border: "border-cyan-500/20",
    contentMode: "dark"
  },
  Creative: {
    shell: "bg-gradient-to-br from-rose-50 via-white to-amber-50",
    darkShell: "bg-gradient-to-br from-fuchsia-950 via-rose-900 to-orange-900",
    accent: "bg-fuchsia-500",
    chip: "bg-fuchsia-50 text-fuchsia-700",
    border: "border-rose-100",
    contentMode: "light"
  }
};

export const getSlideTheme = (template = "Business") =>
  SLIDE_THEME_MAP[template] || SLIDE_THEME_MAP.Business;
