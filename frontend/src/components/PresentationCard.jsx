import { Link } from "react-router-dom";
import { MonitorPlay, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../utils/date";

export default function PresentationCard({ presentation, onDelete }) {
  const coverImage = presentation.slides?.[0]?.imageUrl || "";

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slatePro-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-glass">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slatePro-900 via-brand-700 to-cyan-400">
        {coverImage ? (
          <img
            src={coverImage}
            alt={presentation.title}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-end p-5 text-white">
            <p className="line-clamp-2 text-lg font-semibold">{presentation.title}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slatePro-950/70 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slatePro-900 shadow-soft">
            {presentation.template}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            {presentation.template}
          </span>
          <span className="text-xs text-slatePro-500">{formatDate(presentation.updatedAt)}</span>
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold text-slatePro-900">{presentation.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slatePro-600">{presentation.prompt}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-slatePro-400">
          {presentation.slideCount || 0} slides
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Link
            to={`/editor/${presentation._id}`}
            className="btn-secondary px-3 py-2 text-xs font-semibold"
          >
            <Pencil className="h-4 w-4" />
            Open
          </Link>
          <Link
            to={`/present/${presentation._id}`}
            className="btn-secondary px-3 py-2 text-xs font-semibold"
          >
            <MonitorPlay className="h-4 w-4" />
            Present
          </Link>
          <button
            onClick={() => onDelete(presentation._id)}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
