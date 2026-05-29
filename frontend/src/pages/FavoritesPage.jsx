import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import { usePresentationStore } from "../store/presentationStore";
import WorkspacePresentationCard from "../components/WorkspacePresentationCard";
import ConfirmModal from "../components/ConfirmModal";

export default function FavoritesPage() {
  const presentations = usePresentationStore((state) => state.presentations);
  const fetchPresentations = usePresentationStore((state) => state.fetchPresentations);
  const toggleFavorite = usePresentationStore((state) => state.toggleFavorite);
  const deletePresentation = usePresentationStore((state) => state.deletePresentation);
  const renamePresentation = usePresentationStore((state) => state.renamePresentation);
  const duplicatePresentation = usePresentationStore((state) => state.duplicatePresentation);
  const presentationsView = usePresentationStore((state) => state.presentationsView);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchPresentations().catch((error) => {
      toast.error(error?.response?.data?.message || "Failed to load favorites.");
    });
  }, [fetchPresentations]);

  const favorites = useMemo(
    () => presentations.filter((presentation) => presentation.isFavorite),
    [presentations]
  );

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-5 shadow-[0_16px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Favorites</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Your saved standout decks</h2>
      </div>

      {favorites.length ? (
        <div className={presentationsView === "list" ? "space-y-4" : "grid gap-5 md:grid-cols-2 2xl:grid-cols-3"}>
          {favorites.map((presentation) => (
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
                toast.success("Removed from favorites.");
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-700 bg-slate-950/65 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold text-white">No favorites yet</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Favorite decks from the presentations workspace to pin the ones you revisit most.
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Delete favorite deck?"
        description={`This will remove "${pendingDelete?.title || "this deck"}" from your workspace.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deletePresentation(pendingDelete._id);
          toast.success("Presentation deleted.");
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
