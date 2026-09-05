import { create } from "zustand";
import { setVolumes } from "../game/audio";

export type Quality = "low" | "med" | "high";

interface SettingsStore {
  master: number;
  music: number;
  sfx: number;
  quality: Quality;
  shake: boolean;
  setMaster: (v: number) => void;
  setMusic: (v: number) => void;
  setSfx: (v: number) => void;
  setQuality: (q: Quality) => void;
  setShake: (v: boolean) => void;
}

const KEY = "it-heroes:settings";

function load(): Partial<SettingsStore> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<SettingsStore>;
  } catch {
    return {};
  }
}

function persist(s: SettingsStore) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ master: s.master, music: s.music, sfx: s.sfx, quality: s.quality, shake: s.shake })
    );
  } catch {
    /* noop */
  }
}

const saved = load();

export const useSettings = create<SettingsStore>((set, get) => ({
  master: saved.master ?? 0.8,
  music: saved.music ?? 0.5,
  sfx: saved.sfx ?? 0.8,
  quality: saved.quality ?? "high",
  shake: saved.shake ?? true,
  setMaster: (master) => {
    set({ master });
    setVolumes(master, get().music, get().sfx);
    persist(get());
  },
  setMusic: (music) => {
    set({ music });
    setVolumes(get().master, music, get().sfx);
    persist(get());
  },
  setSfx: (sfx) => {
    set({ sfx });
    setVolumes(get().master, get().music, sfx);
    persist(get());
  },
  setQuality: (quality) => {
    set({ quality });
    persist(get());
  },
  setShake: (shake) => {
    set({ shake });
    persist(get());
  },
}));

export function applySavedVolumes() {
  const s = useSettings.getState();
  setVolumes(s.master, s.music, s.sfx);
}
