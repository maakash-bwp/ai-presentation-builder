import { motion } from "framer-motion";
import { Bot, CheckCircle2, LockKeyhole, Sparkles, Wand2 } from "lucide-react";

const highlights = [
  "Live outline and slide streaming",
  "Inline slide canvas editing",
  "Context-aware image generation",
  "Auto-save and presentation workspace"
];

export default function AuthShowcasePanel() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative hidden min-h-[720px] overflow-hidden rounded-[2rem] border border-white/15 bg-slatePro-950 p-8 text-white shadow-soft lg:flex lg:flex-col"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.96)_0%,rgba(15,23,42,0.88)_42%,rgba(30,41,59,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.18),_transparent_30%)]" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/8 to-transparent opacity-70" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-xs font-semibold text-cyan-200">
            <Sparkles className="h-4 w-4" />
            Premium AI presentation workflow
          </div>
          <h2 className="mt-6 max-w-xl font-display text-5xl font-bold leading-[1.05] text-white drop-shadow-[0_12px_32px_rgba(15,23,42,0.35)]">
            Build decks that feel designed, not just generated.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-200/95">
            SlideCraft AI combines live generation, rich canvas editing, and a polished workspace so the product feels like a real AI startup platform from the first screen.
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <Wand2 className="h-5 w-5 text-cyan-300" />
              <p className="mt-3 text-sm text-slate-200/90">Generate complete presentation narratives with streaming AI feedback.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <Bot className="h-5 w-5 text-cyan-300" />
              <p className="mt-3 text-sm text-slate-200/90">Unique slide imagery and visual layouts that vary across the deck.</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-300">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Secure access flow</p>
                <p className="text-xs text-slate-300/90">OTP verification, password recovery, and Google sign-in</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-100/95">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
