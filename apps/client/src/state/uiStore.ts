import { create } from "zustand";
import type { ClassId, Lang } from "@it-heroes/shared";

export type Screen = "menu" | "classSelect" | "game";

interface UiStore {
  screen: Screen;
  lang: Lang;
  classId: ClassId;
  paused: boolean;
  freshStart: boolean;
  setScreen: (s: Screen) => void;
  setLang: (l: Lang) => void;
  setClass: (c: ClassId) => void;
  setPaused: (p: boolean) => void;
  startNewGame: () => void;
  continueGame: () => void;
}

export const useUi = create<UiStore>((set) => ({
  screen: "menu",
  lang: (localStorage.getItem("it-heroes:lang") as Lang) || "es",
  classId: "helpdesk",
  paused: false,
  freshStart: true,
  setScreen: (screen) => set({ screen, paused: false }),
  setLang: (lang) => {
    localStorage.setItem("it-heroes:lang", lang);
    set({ lang });
  },
  setClass: (classId) => set({ classId }),
  setPaused: (paused) => set({ paused }),
  startNewGame: () => set({ screen: "game", paused: false, freshStart: true }),
  continueGame: () => set({ screen: "game", paused: false, freshStart: false }),
}));
