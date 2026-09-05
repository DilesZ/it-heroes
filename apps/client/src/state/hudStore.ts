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
  cdSp: number;
  shield: boolean;
  haste: boolean;
  dead: boolean;
  bossFrac: number;
  bossNameKey: string;
  hurt: boolean;
  comboN: number;
  comboMult: number;
  setVitals: (hp: number, mana: number, stamina: number) => void;
  setMax: (maxHp: number, maxMana: number) => void;
  setCds: (basic: number, s1: number, s2: number, sp: number, shield: boolean, haste: boolean) => void;
  setDead: (dead: boolean) => void;
  setBoss: (frac: number, nameKey: string) => void;
  setHurt: (hurt: boolean) => void;
  setCombo: (n: number, mult: number) => void;
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
  cdSp: 0,
  shield: false,
  haste: false,
  dead: false,
  bossFrac: -1,
  bossNameKey: "",
  hurt: false,
  comboN: 0,
  comboMult: 1,
  setVitals: (hp, mana, stamina) => set({ hp, mana, stamina }),
  setMax: (maxHp, maxMana) => set({ maxHp, maxMana }),
  setCds: (cdBasic, cdS1, cdS2, cdSp, shield, haste) => set({ cdBasic, cdS1, cdS2, cdSp, shield, haste }),
  setDead: (dead) => set({ dead }),
  setBoss: (bossFrac, bossNameKey) => set({ bossFrac, bossNameKey }),
  setHurt: (hurt: boolean) => set({ hurt }),
  setCombo: (comboN: number, comboMult: number) => set({ comboN, comboMult }),
}));
