import { create } from "zustand";
import { PLAYER_BASE } from "@it-heroes/shared";

interface HudStore {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  setVitals: (hp: number, mana: number, stamina: number) => void;
}

export const useHud = create<HudStore>((set) => ({
  hp: PLAYER_BASE.maxHealth,
  maxHp: PLAYER_BASE.maxHealth,
  mana: PLAYER_BASE.maxMana,
  maxMana: PLAYER_BASE.maxMana,
  stamina: PLAYER_BASE.maxStamina,
  maxStamina: PLAYER_BASE.maxStamina,
  setVitals: (hp, mana, stamina) => set({ hp, mana, stamina }),
}));
