import { Heart, MoreHorizontal, PencilLine, Copy, Trash2, MonitorPlay } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDate } from "../utils/date";

export default function WorkspacePresentationCard({
  presentation,
  layout = "grid",
  onRename,
  onDuplicate,
  onDelete,
  onToggleFavorite
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(presentation.title);

  const thumbnail = useMemo(
    () => presentation.slides?.find((slide) => slide.imageUrl)?.imageUrl || "",
    [presentation.slides]
  );

  const submitRename = async () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle || nextTitle === presentation.title) {
      setDraftTitle(presentation.title);
      setIsRenaming(false);
      return;
    }
    await onRename(nextTitle);
    setIsRenaming(false);
  };

  if (layout === "list") {
    return (
      <motion.article
        layout
        className={`relative overflow-visible rounded-[1.6rem] border border-slate-700/80 bg-slate-950/85 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.45)] transition hover:border-cyan-300/25 hover:shadow-[0_24px_60px_rgba(8,47,73,0.35)] ${menuOpen ? "z-50" : "z-0"}`}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onToggleFavorite()}
            className={`rounded-2xl border p-2 transition ${
              presentation.isFavorite
                ? "border-cyan-300/35 bg-cyan-400/15 text-cyan-100"
                : "border-slate-700 bg-slate-900 text-slate-400"
            }`}
          >
            <Heart className={`h-4 w-4 ${presentation.isFavorite ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/editor/${presentation._id}`)}
            className="flex min-w-0 flex-1 items-center gap-4 text-left"
          >
            <div className="h-20 w-32 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
              {thumbnail ? (
                <img src={thumbnail} alt={presentation.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-end bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20 p-3">
                  <span className="line-clamp-2 text-sm font-semibold text-white">{presentation.title}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {isRenaming ? (
                <input
                  autoFocus
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onBlur={submitRename}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      submitRename();
                    }
                    if (event.key === "Escape") {
                      setDraftTitle(presentation.title);
                      setIsRenaming(false);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-300"
                />
              ) : (
                <p className="truncate text-lg font-semibold text-white">{presentation.title}</p>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{presentation.prompt}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                <span>{presentation.slideCount || 0} slides</span>
                <span>{presentation.template}</span>
                <span>Updated {formatDate(presentation.updatedAt)}</span>
              </div>
            </div>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-12 z-[60] w-44 rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-[0_20px_50px_rgba(2,6,23,0.55)]">
                <button type="button" onClick={() => navigate(`/editor/${presentation._id}`)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
                  <PencilLine className="h-4 w-4" />
                  Open
                </button>
                <button type="button" onClick={() => navigate(`/present/${presentation._id}`)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
                  <MonitorPlay className="h-4 w-4" />
                  Present
                </button>
                <button type="button" onClick={() => { setIsRenaming(true); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
                  <PencilLine className="h-4 w-4" />
                  Rename
                </button>
                <button type="button" onClick={() => { onDuplicate(); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button type="button" onClick={() => { onDelete(); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout
      className={`relative overflow-visible rounded-[1.8rem] border border-slate-700/80 bg-slate-950/85 shadow-[0_18px_50px_rgba(2,6,23,0.45)] transition hover:-translate-y-1 hover:border-cyan-300/25 hover:shadow-[0_24px_60px_rgba(8,47,73,0.35)] ${menuOpen ? "z-50" : "z-0"}`}
    >
      <div className="relative h-48 overflow-hidden border-b border-slate-800 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20">
        {thumbnail ? (
          <img src={thumbnail} alt={presentation.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-end p-5">
            <p className="line-clamp-2 text-lg font-semibold text-white">{presentation.title}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2">
          <span className="rounded-full border border-cyan-300/25 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-cyan-100">
            {presentation.template}
          </span>
          <button
            type="button"
            onClick={() => onToggleFavorite()}
            className={`rounded-full border p-2 backdrop-blur ${
              presentation.isFavorite
                ? "border-cyan-300/35 bg-cyan-400/15 text-cyan-100"
                : "border-slate-700 bg-slate-950/70 text-slate-300"
            }`}
          >
            <Heart className={`h-4 w-4 ${presentation.isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <input
                autoFocus
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                onBlur={submitRename}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitRename();
                  }
                  if (event.key === "Escape") {
                    setDraftTitle(presentation.title);
                    setIsRenaming(false);
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-300"
              />
            ) : (
              <h3 className="line-clamp-2 text-lg font-semibold text-white">{presentation.title}</h3>
            )}
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">{presentation.prompt}</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-12 z-[60] w-44 rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-[0_20px_50px_rgba(2,6,23,0.55)]">
                <button type="button" onClick={() => navigate(`/editor/${presentation._id}`)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
                  <PencilLine className="h-4 w-4" />
                  Open
                </button>
                <button type="button" onClick={() => navigate(`/present/${presentation._id}`)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
                  <MonitorPlay className="h-4 w-4" />
                  Present
                </button>
                <button type="button" onClick={() => { setIsRenaming(true); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
                  <PencilLine className="h-4 w-4" />
                  Rename
                </button>
                <button type="button" onClick={() => { onDuplicate(); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900">
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button type="button" onClick={() => { onDelete(); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <span>{presentation.slideCount || 0} slides</span>
          <span>Edited {formatDate(presentation.updatedAt)}</span>
        </div>
      </div>
    </motion.article>
  );
}
