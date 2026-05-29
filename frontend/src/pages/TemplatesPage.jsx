import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TEMPLATE_OPTIONS } from "../utils/templates";
import { usePresentationStore } from "../store/presentationStore";
import { useSettingsStore } from "../store/settingsStore";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const setDraft = usePresentationStore((state) => state.setDraft);
  const defaultSlideCount = useSettingsStore((state) => state.defaultSlideCount);

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Templates</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Start from a proven visual system</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATE_OPTIONS.map((template) => (
          <article
            key={template.id}
            className="overflow-hidden rounded-[1.8rem] border border-slate-700/80 bg-slate-950/85 shadow-[0_18px_50px_rgba(2,6,23,0.45)] transition hover:-translate-y-1 hover:border-cyan-300/25"
          >
            <div
              className="h-44 border-b border-slate-800"
              style={{
                background: `linear-gradient(135deg, ${template.palette[0]}, ${template.palette[1]} 55%, ${template.palette[2]})`
              }}
            >
              <div className="flex h-full flex-col justify-between p-5">
                <span className="inline-flex w-fit rounded-full border border-white/20 bg-slate-950/40 px-3 py-1 text-xs font-semibold text-white">
                  {template.font}
                </span>
                <div className="space-y-2 text-white">
                  <p className="text-xs uppercase tracking-[0.26em] opacity-80">Template</p>
                  <h3 className="font-display text-2xl font-bold">{template.name}</h3>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-7 text-slate-400">{template.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Premium
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                  {template.name} category
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraft({
                    template: template.id,
                    numberOfSlides: String(defaultSlideCount)
                  });
                  navigate("/create");
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Use template
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
