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
  setVitals: (hp: number, mana: number, stamina: number) => void;
  setCds: (basic: number, s1: number, s2: number, shield: boolean, haste: boolean) => void;
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
  setVitals: (hp, mana, stamina) => set({ hp, mana, stamina }),
  setCds: (cdBasic, cdS1, cdS2, shield, haste) => set({ cdBasic, cdS1, cdS2, shield, haste }),
}));
