export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type EquipSlot = "cpu" | "ram" | "gpu" | "peripheral" | "firmware";

export type StatKey =
  | "attack"
  | "magic"
  | "defense"
  | "speed"
  | "crit"
  | "maxHealth"
  | "maxMana";

export type Affix = { stat: StatKey; value: number };

export type ItemDef = {
  id: string;
  nameKey: string;
  slot: EquipSlot;
  rarity: Rarity;
  baseStats: Partial<Record<StatKey, number>>;
  level: number;
  icon: string;
};

export type ItemInstance = {
  uid: string;
  defId: string;
  affixes: Affix[];
  upgrade: number;
};

export const RARITIES: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

export const RARITY_AFFIX_COUNT: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export const RARITY_MULT: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.15,
  rare: 1.35,
  epic: 1.6,
  legendary: 2,
};

export const ITEMS: ItemDef[] = [
  {
    id: "cpu_i3",
    nameKey: "items.cpu_i3",
    slot: "cpu",
    rarity: "common",
    baseStats: { attack: 4 },
    level: 1,
    icon: "cpu",
  },
  {
    id: "cpu_ryzen",
    nameKey: "items.cpu_ryzen",
    slot: "cpu",
    rarity: "rare",
    baseStats: { attack: 12, crit: 5 },
    level: 8,
    icon: "cpu",
  },
  {
    id: "cpu_quantum",
    nameKey: "items.cpu_quantum",
    slot: "cpu",
    rarity: "legendary",
    baseStats: { attack: 28, crit: 12, speed: 5 },
    level: 18,
    icon: "cpu",
  },
  {
    id: "ram_ddr4",
    nameKey: "items.ram_ddr4",
    slot: "ram",
    rarity: "common",
    baseStats: { maxMana: 20 },
    level: 1,
    icon: "ram",
  },
  {
    id: "ram_ecc",
    nameKey: "items.ram_ecc",
    slot: "ram",
    rarity: "epic",
    baseStats: { maxMana: 60, magic: 10 },
    level: 12,
    icon: "ram",
  },
  {
    id: "gpu_gtx",
    nameKey: "items.gpu_gtx",
    slot: "gpu",
    rarity: "uncommon",
    baseStats: { magic: 6, crit: 3 },
    level: 3,
    icon: "gpu",
  },
  {
    id: "gpu_rtx",
    nameKey: "items.gpu_rtx",
    slot: "gpu",
    rarity: "legendary",
    baseStats: { magic: 24, crit: 10, maxMana: 40 },
    level: 20,
    icon: "gpu",
  },
  {
    id: "periph_keyboard",
    nameKey: "items.periph_keyboard",
    slot: "peripheral",
    rarity: "common",
    baseStats: { attack: 3 },
    level: 1,
    icon: "keyboard",
  },
  {
    id: "periph_mechkeyboard",
    nameKey: "items.periph_mechkeyboard",
    slot: "peripheral",
    rarity: "rare",
    baseStats: { attack: 10, speed: 3 },
    level: 9,
    icon: "keyboard",
  },
  {
    id: "firmware_bios",
    nameKey: "items.firmware_bios",
    slot: "firmware",
    rarity: "common",
    baseStats: { maxHealth: 15 },
    level: 1,
    icon: "chip",
  },
  {
    id: "firmware_hardened",
    nameKey: "items.firmware_hardened",
    slot: "firmware",
    rarity: "epic",
    baseStats: { maxHealth: 60, defense: 12 },
    level: 14,
    icon: "chip",
  },
];

export const SLOTS: EquipSlot[] = [
  "cpu",
  "ram",
  "gpu",
  "peripheral",
  "firmware",
];
