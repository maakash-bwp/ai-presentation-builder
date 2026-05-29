import { useEffect, useMemo, useState } from "react";
import { Grid2X2, List, Search, Star, SlidersHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import { usePresentationStore } from "../store/presentationStore";
import { filterPresentations } from "../utils/presentations";
import { TEMPLATE_OPTIONS } from "../utils/templates";
import WorkspacePresentationCard from "../components/WorkspacePresentationCard";
import ConfirmModal from "../components/ConfirmModal";

export default function PresentationsPage() {
  const presentations = usePresentationStore((state) => state.presentations);
  const isLoading = usePresentationStore((state) => state.isLoading);
  const fetchPresentations = usePresentationStore((state) => state.fetchPresentations);
  const renamePresentation = usePresentationStore((state) => state.renamePresentation);
  const duplicatePresentation = usePresentationStore((state) => state.duplicatePresentation);
  const deletePresentation = usePresentationStore((state) => state.deletePresentation);
  const toggleFavorite = usePresentationStore((state) => state.toggleFavorite);
  const globalSearch = usePresentationStore((state) => state.globalSearch);
  const presentationsView = usePresentationStore((state) => state.presentationsView);
  const presentationFilter = usePresentationStore((state) => state.presentationFilter);
  const setPresentationsView = usePresentationStore((state) => state.setPresentationsView);
  const setPresentationFilter = usePresentationStore((state) => state.setPresentationFilter);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPresentations().catch((error) => {
      toast.error(error?.response?.data?.message || "Failed to load presentations.");
    });
  }, [fetchPresentations]);

  const filteredPresentations = useMemo(
    () =>
      filterPresentations({
        presentations,
        query: globalSearch,
        filter: presentationFilter,
        template: templateFilter
      }),
    [globalSearch, presentationFilter, presentations, templateFilter]
  );

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deletePresentation(pendingDelete._id);
      toast.success("Presentation deleted.");
      setPendingDelete(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Presentations</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Manage every deck in one place</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-2xl border border-slate-700 bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setPresentationsView("grid")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${presentationsView === "grid" ? "bg-cyan-400/15 text-cyan-100" : "text-slate-300"}`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPresentationsView("list")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${presentationsView === "list" ? "bg-cyan-400/15 text-cyan-100" : "text-slate-300"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <select
              value={presentationFilter}
              onChange={(event) => setPresentationFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-300"
            >
              <option value="recent">Recent</option>
              <option value="favorite">Favorite</option>
              <option value="date">Date created</option>
            </select>
            <select
              value={templateFilter}
              onChange={(event) => setTemplateFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-300"
            >
              <option value="all">All templates</option>
              {TEMPLATE_OPTIONS.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredPresentations.length ? (
        <div className={presentationsView === "grid" ? "grid gap-5 md:grid-cols-2 2xl:grid-cols-3" : "space-y-4"}>
          {filteredPresentations.map((presentation) => (
            <WorkspacePresentationCard
              key={presentation._id}
              presentation={presentation}
              layout={presentationsView}
              onRename={async (title) => {
                await renamePresentation(presentation._id, title);
                toast.success("Presentation renamed.");
              }}
              onDuplicate={async () => {
                await duplicatePresentation(presentation._id);
                toast.success("Presentation duplicated.");
              }}
              onDelete={() => setPendingDelete(presentation)}
              onToggleFavorite={async () => {
                await toggleFavorite(presentation._id);
                toast.success(
                  presentation.isFavorite ? "Removed from favorites." : "Added to favorites."
                );
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-700 bg-slate-950/65 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold text-white">No presentations match this view</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Try a different search, template filter, or favorite toggle to widen the workspace results.
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Delete presentation?"
        description={`This will permanently remove "${pendingDelete?.title || "this deck"}" from your workspace.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        isLoading={isDeleting}
      />
    </section>
  );
}
