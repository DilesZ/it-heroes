import { create } from "zustand";
import type { ClassId, Lang } from "@it-heroes/shared";

export type Screen = "menu" | "classSelect" | "game";

interface UiStore {
  screen: Screen;
  lang: Lang;
  classId: ClassId;
  setScreen: (s: Screen) => void;
  setLang: (l: Lang) => void;
  setClass: (c: ClassId) => void;
}

export const useUi = create<UiStore>((set) => ({
  screen: "menu",
  lang: (localStorage.getItem("it-heroes:lang") as Lang) || "es",
  classId: "helpdesk",
  setScreen: (screen) => set({ screen }),
  setLang: (lang) => {
    localStorage.setItem("it-heroes:lang", lang);
    set({ lang });
  },
  setClass: (classId) => set({ classId }),
}));
