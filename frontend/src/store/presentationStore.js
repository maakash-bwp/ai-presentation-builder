import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createPresentationRequest,
  deletePresentationRequest,
  duplicatePresentationRequest,
  getPresentationByIdRequest,
  getPresentationsRequest,
  updatePresentationRequest
} from "../services/presentationService";
import { useFavoritesStore } from "./favoritesStore";

const defaultDraft = {
  topic: "",
  numberOfSlides: "6",
  title: "",
  presentationType: "Pitch Deck",
  prompt: "",
  outline: [],
  template: "Business",
  slides: []
};

const applyPresentationShape = (presentation) => ({
  ...presentation,
  isFavorite: Boolean(presentation?.isFavorite),
  slideCount:
    typeof presentation?.slideCount === "number"
      ? presentation.slideCount
      : Array.isArray(presentation?.slides)
        ? presentation.slides.length
        : 0
});

export const usePresentationStore = create(
  persist(
    (set, get) => ({
      presentations: [],
      selectedPresentation: null,
      draft: defaultDraft,
      isLoading: false,
      globalSearch: "",
      presentationsView: "grid",
      presentationFilter: "recent",
      async fetchPresentations() {
        set({ isLoading: true });
        const presentations = (await getPresentationsRequest()).map(applyPresentationShape);
        useFavoritesStore.getState().syncFavorites(presentations);
        set({ presentations, isLoading: false });
        return presentations;
      },
      async fetchPresentationById(id) {
        set({ isLoading: true });
        const presentation = applyPresentationShape(await getPresentationByIdRequest(id));
        set({ selectedPresentation: presentation, isLoading: false });
        return presentation;
      },
      async createPresentation(payload) {
        set({ isLoading: true });
        const presentation = applyPresentationShape(await createPresentationRequest(payload));
        set((state) => ({
          presentations: [presentation, ...state.presentations],
          selectedPresentation: presentation,
          isLoading: false
        }));
        useFavoritesStore.getState().syncFavorites(get().presentations);
        return presentation;
      },
      async updatePresentation(id, payload) {
        set({ isLoading: true });
        const presentation = applyPresentationShape(await updatePresentationRequest(id, payload));
        set((state) => ({
          presentations: state.presentations.map((item) =>
            item._id === presentation._id ? presentation : item
          ),
          selectedPresentation:
            state.selectedPresentation?._id === presentation._id
              ? presentation
              : state.selectedPresentation,
          isLoading: false
        }));
        useFavoritesStore.getState().syncFavorites(get().presentations);
        return presentation;
      },
      async deletePresentation(id) {
        set({ isLoading: true });
        await deletePresentationRequest(id);
        set((state) => ({
          presentations: state.presentations.filter((item) => item._id !== id),
          selectedPresentation:
            state.selectedPresentation?._id === id ? null : state.selectedPresentation,
          isLoading: false
        }));
        useFavoritesStore.getState().removeFavorite(id);
      },
      async duplicatePresentation(id) {
        set({ isLoading: true });
        const presentation = applyPresentationShape(await duplicatePresentationRequest(id));
        set((state) => ({
          presentations: [presentation, ...state.presentations],
          isLoading: false
        }));
        return presentation;
      },
      async renamePresentation(id, title) {
        return get().updatePresentation(id, { title });
      },
      async toggleFavorite(id) {
        const current = get().presentations.find((item) => item._id === id);
        if (!current) return null;
        const nextFavoriteState = !current.isFavorite;
        const updated = await get().updatePresentation(id, { isFavorite: nextFavoriteState });
        if (nextFavoriteState) {
          useFavoritesStore.getState().addFavorite(updated._id);
        } else {
          useFavoritesStore.getState().removeFavorite(updated._id);
        }
        return updated;
      },
      setDraft(values) {
        set((state) => ({
          draft: { ...state.draft, ...values }
        }));
      },
      resetDraft() {
        set({ draft: defaultDraft });
      },
      setGlobalSearch(globalSearch) {
        set({ globalSearch });
      },
      setPresentationsView(presentationsView) {
        set({ presentationsView });
      },
      setPresentationFilter(presentationFilter) {
        set({ presentationFilter });
      }
    }),
    {
      name: "apb-presentation-store",
      partialize: (state) => ({
        draft: state.draft,
        globalSearch: state.globalSearch,
        presentationsView: state.presentationsView,
        presentationFilter: state.presentationFilter
      })
    }
  )
);
