import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoritesStore = create(
  persist(
    (set) => ({
      favoriteIds: [],
      syncFavorites(presentations = []) {
        set({
          favoriteIds: presentations.filter((item) => item.isFavorite).map((item) => item._id)
        });
      },
      addFavorite(id) {
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds
            : [...state.favoriteIds, id]
        }));
      },
      removeFavorite(id) {
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((item) => item !== id)
        }));
      }
    }),
    {
      name: "apb-favorites-store"
    }
  )
);
