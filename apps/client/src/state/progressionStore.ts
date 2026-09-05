import { create } from "zustand";
import { SKILL_NODES, BOONS, XP_CURVE, type StatKey } from "@it-heroes/shared";
import { world } from "../game/state/world";
import { spawnBlast, spawnFloat, spawnParticles } from "../game/combat";
import { applyStats } from "../game/loot";
import { useHud } from "./hudStore";
import { useInventory } from "./inventoryStore";
import { useQuests } from "./questStore";
import { useUi } from "./uiStore";
import { sfx } from "../game/audio";

export function isPaused(): boolean {
  return (
    useInventory.getState().invOpen ||
    useInventory.getState().forgeOpen ||
    useProgression.getState().treeOpen ||
    useProgression.getState().draftOpen ||
    useQuests.getState().dialogNpc !== null ||
    useUi.getState().paused
  );
}

export const MAX_LEVEL = 20;

interface ProgressionStore {
  level: number;
  xp: number;
  skillPoints: number;
  ranks: Record<string, number>;
  treeOpen: boolean;
  draftOpen: boolean;
  draftOptions: string[];
  addXp: (n: number) => void;
  spendPoint: (nodeId: string) => boolean;
  setTreeOpen: (open: boolean) => void;
  openDraft: () => void;
  pickBoon: (boonId: string) => void;
  reset: () => void;
}

export const useProgression = create<ProgressionStore>((set, get) => ({
  level: 1,
  xp: 0,
  skillPoints: 0,
  ranks: {},
  treeOpen: false,
  draftOpen: false,
  draftOptions: [],
  addXp: (n) => {
    const s = get();
    if (s.level >= MAX_LEVEL) return;
    let { level, xp, skillPoints } = s;
    xp += n;
    let leveled = false;
    while (level < MAX_LEVEL && xp >= XP_CURVE(level)) {
      xp -= XP_CURVE(level);
      level++;
      skillPoints++;
      leveled = true;
    }
    set({ level, xp, skillPoints });
    if (leveled) {
      const p = world.player;
      const { maxHp } = useHud.getState();
      p.health = Math.min(p.health + 40, maxHp);
      spawnBlast(p.pos, "#fbbf24", 4);
      spawnParticles(p.pos, "#fbbf24", 36, 10, 1.4);
      spawnFloat(p.pos, "LEVEL UP", "#fbbf24", true);
      world.shake = Math.max(world.shake, 0.4);
      world.hitstopT = Math.max(world.hitstopT, 0.08);
      sfx.levelup();
    }
  },
  spendPoint: (nodeId) => {
    const s = get();
    const node = SKILL_NODES.find((x) => x.id === nodeId);
    if (!node || s.skillPoints <= 0 || s.level < node.reqLevel) return false;
    const rank = s.ranks[nodeId] ?? 0;
    if (rank >= node.maxRank) return false;
    set({ skillPoints: s.skillPoints - 1, ranks: { ...s.ranks, [nodeId]: rank + 1 } });
    computeMods();
    return true;
  },
  setTreeOpen: (treeOpen) => set({ treeOpen }),
  openDraft: () => {
    const taken = new Set(world.player.boons);
    const pool = BOONS.filter((b) => !taken.has(b.id));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 3).map((b) => b.id);
    if (options.length === 0) return;
    set({ draftOpen: true, draftOptions: options });
    sfx.boon();
  },
  pickBoon: (boonId) => {
    applyBoon(boonId);
    set({ draftOpen: false, draftOptions: [] });
  },
  reset: () =>
    set({ level: 1, xp: 0, skillPoints: 0, ranks: {}, treeOpen: false, draftOpen: false, draftOptions: [] }),
}));

export function grantXp(n: number) {
  if (n <= 0) return;
  useProgression.getState().addXp(n);
  spawnFloat(world.player.pos, `+${Math.round(n)} XP`, "#67e8f9");
}

export function applyBoon(boonId: string) {
  const p = world.player;
  if (p.boons.includes(boonId)) return;
  p.boons.push(boonId);
  applyBoonEffect(boonId);
  computeMods();
  spawnFloat(p.pos, "BOON", "#f0abfc", true);
}

export function restoreBoons(ids: string[]) {
  const p = world.player;
  p.boons = [];
  p.boonDmg = 0;
  p.boonSpeed = 0;
  p.boonCdr = 1;
  p.lifesteal = 0;
  p.dodgeCostMult = 1;
  p.manaRegenMult = 1;
  p.boonPassive = { attack: 0, magic: 0, defense: 0, speed: 0, crit: 0, maxHealth: 0, maxMana: 0 };
  for (const id of ids) {
    if (p.boons.includes(id)) continue;
    p.boons.push(id);
    applyBoonEffect(id);
  }
}

function applyBoonEffect(boonId: string) {
  const p = world.player;
  const hud = useHud.getState();
  switch (boonId) {
    case "boon_power":
      p.boonDmg += 0.15;
      break;
    case "boon_swift":
      p.boonSpeed += 10;
      break;
    case "boon_deadly":
      p.boonPassive.crit += 6;
      break;
    case "boon_vital":
      p.boonPassive.maxHealth += 40;
      p.health = Math.min(p.health + 40, hud.maxHp + 40);
      break;
    case "boon_flow":
      p.boonCdr *= 0.85;
      break;
    case "boon_vamp":
      p.lifesteal += 0.03;
      break;
    case "boon_phase":
      p.dodgeCostMult *= 0.7;
      break;
    case "boon_cache":
      p.manaRegenMult *= 2;
      break;
  }
  computeMods();
  spawnFloat(p.pos, "BOON", "#f0abfc", true);
}

export function computeMods() {
  const { ranks } = useProgression.getState();
  const p = world.player;
  p.slotDmg = { basic: 1, s1: 1, s2: 1, sp: 1 };
  p.cdMult = p.boonCdr;
  p.shieldMult = 1;
  p.hasteBonus = 0;
  const passive: Record<StatKey, number> = {
    attack: 0,
    magic: 0,
    defense: 0,
    speed: 0,
    crit: 0,
    maxHealth: 0,
    maxMana: 0,
  };
  for (const node of SKILL_NODES) {
    const r = ranks[node.id] ?? 0;
    if (!r) continue;
    if (node.target && node.dmgPerRank) p.slotDmg[node.target] *= 1 + node.dmgPerRank * r;
    if (node.stat && node.statPerRank) passive[node.stat] += node.statPerRank * r;
    if (node.special === "shield") p.shieldMult += 0.25 * r;
    if (node.special === "haste") p.hasteBonus += 2 * r;
  }
  p.passive = passive;
  applyStats();
}
