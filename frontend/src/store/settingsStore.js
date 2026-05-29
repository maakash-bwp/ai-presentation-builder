import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create(
  persist(
    (set) => ({
      darkMode: true,
      animationsEnabled: true,
      compactMode: false,
      defaultSlideCount: 6,
      defaultTemplate: "Business",
      imageProvider: "Pexels",
      setSetting(key, value) {
        set({ [key]: value });
      }
    }),
    {
      name: "apb-settings-store"
    }
  )
);
