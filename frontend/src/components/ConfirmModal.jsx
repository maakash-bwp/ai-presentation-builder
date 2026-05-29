import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  onConfirm,
  onCancel,
  isLoading = false
}) {
  const confirmClassName =
    confirmTone === "danger"
      ? "border-red-400/30 bg-red-500/15 text-red-100 hover:bg-red-500/25"
      : "border-cyan-300/35 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="w-full max-w-md rounded-[1.75rem] border border-slate-700 bg-slate-950/95 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.65)]"
          >
            <h3 className="font-display text-2xl font-bold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                disabled={isLoading}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${confirmClassName}`}
                disabled={isLoading}
              >
                {isLoading ? "Working..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
