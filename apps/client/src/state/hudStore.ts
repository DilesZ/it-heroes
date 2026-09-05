import { create } from "zustand";
import { PLAYER_BASE } from "@it-heroes/shared";

interface HudStore {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  cdBasic: number;
  cdS1: number;
  cdS2: number;
  shield: boolean;
  haste: boolean;
  dead: boolean;
  bossFrac: number;
  bossNameKey: string;
  setVitals: (hp: number, mana: number, stamina: number) => void;
  setMax: (maxHp: number, maxMana: number) => void;
  setCds: (basic: number, s1: number, s2: number, shield: boolean, haste: boolean) => void;
  setDead: (dead: boolean) => void;
  setBoss: (frac: number, nameKey: string) => void;
}

export const useHud = create<HudStore>((set) => ({
  hp: PLAYER_BASE.maxHealth,
  maxHp: PLAYER_BASE.maxHealth,
  mana: PLAYER_BASE.maxMana,
  maxMana: PLAYER_BASE.maxMana,
  stamina: PLAYER_BASE.maxStamina,
  maxStamina: PLAYER_BASE.maxStamina,
  cdBasic: 0,
  cdS1: 0,
  cdS2: 0,
  shield: false,
  haste: false,
  dead: false,
  bossFrac: -1,
  bossNameKey: "",
  setVitals: (hp, mana, stamina) => set({ hp, mana, stamina }),
  setMax: (maxHp, maxMana) => set({ maxHp, maxMana }),
  setCds: (cdBasic, cdS1, cdS2, shield, haste) => set({ cdBasic, cdS1, cdS2, shield, haste }),
  setDead: (dead) => set({ dead }),
  setBoss: (bossFrac, bossNameKey) => set({ bossFrac, bossNameKey }),
}));
