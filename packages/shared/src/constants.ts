export const GAME_NAME = "IT Heroes";
export const VERSION = "0.1.0";

export const PLAYER_BASE = {
  speed: 6,
  maxHealth: 100,
  maxMana: 50,
  maxStamina: 100,
  staminaRegen: 25,
  manaRegen: 4,
  dodgeSpeed: 16,
  dodgeDuration: 0.28,
  dodgeIFrames: 0.22,
  dodgeStaminaCost: 30,
};

export const XP_CURVE = (level: number): number =>
  Math.floor(80 * Math.pow(level, 1.5));

export const RARITY_COLOR: Record<string, string> = {
  common: "#b8c2cc",
  uncommon: "#4ade80",
  rare: "#60a5fa",
  epic: "#c084fc",
  legendary: "#fbbf24",
};

export const WORLD = {
  hubRadius: 42,
  biomeSize: 120,
  enemyDensity: 0.004,
} as const;
