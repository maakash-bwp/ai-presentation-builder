import clsx from "clsx";
import { Check } from "lucide-react";

export default function TemplateSelector({ templates, selected, onSelect, variant = "grid" }) {
  const containerClassName =
    variant === "carousel"
      ? "flex gap-4 overflow-x-auto pb-2"
      : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={containerClassName}>
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template.id)}
          className={clsx(
            "shrink-0 rounded-2xl border text-left p-4 transition hover:-translate-y-0.5",
            variant === "carousel"
              ? "w-[320px] border-slate-700 bg-slate-950/70 text-slate-100 shadow-[0_18px_40px_rgba(2,6,23,0.5)]"
              : "saas-card",
            selected === template.id &&
              (variant === "carousel"
                ? "border-cyan-300 ring-2 ring-cyan-300/25 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
                : "border-brand-400 ring-2 ring-brand-100")
          )}
        >
          <div
            className={clsx(
              "mb-4 overflow-hidden rounded-2xl p-4",
              variant === "carousel" ? "border border-slate-700" : "border border-slatePro-200"
            )}
            style={{
              background: `linear-gradient(135deg, ${template.palette[0]}, ${template.palette[1]}, ${template.palette[2]})`
            }}
          >
            <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
              <div className="mb-3 h-3 w-1/2 rounded-full bg-white/85" />
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-white/60" />
                <div className="h-2 w-5/6 rounded-full bg-white/50" />
                <div className="h-2 w-4/6 rounded-full bg-white/40" />
              </div>
            </div>
          </div>

          <div className="mb-3 flex items-start justify-between">
            <h3 className={clsx("font-semibold", variant === "carousel" ? "text-slate-100" : "text-slatePro-900")}>
              {template.name}
            </h3>
            {selected === template.id ? (
              <span className={clsx("rounded-full p-1", variant === "carousel" ? "bg-cyan-300/20 text-cyan-200" : "bg-brand-100 text-brand-700")}>
                <Check className="h-4 w-4" />
              </span>
            ) : null}
          </div>

          <div className="mb-3 flex gap-2">
            {template.palette.map((color) => (
              <span
                key={color}
                className="h-6 w-6 rounded-full border border-slatePro-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className={clsx("text-sm", variant === "carousel" ? "text-slate-300" : "text-slatePro-600")}>
            {template.description}
          </p>
          <p className={clsx("mt-3 text-xs font-semibold uppercase tracking-[0.24em]", variant === "carousel" ? "text-slate-400" : "text-slatePro-400")}>
            {template.font}
          </p>
        </button>
      ))}
    </div>
  );
}
