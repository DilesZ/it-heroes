import { create } from "zustand";
import { SKILL_NODES, XP_CURVE, type StatKey } from "@it-heroes/shared";
import { world } from "../game/state/world";
import { spawnBlast, spawnFloat, spawnParticles } from "../game/combat";
import { applyStats } from "../game/loot";
import { useHud } from "./hudStore";
import { useInventory } from "./inventoryStore";

export function isPaused(): boolean {
  return useInventory.getState().invOpen || useProgression.getState().treeOpen;
}

export const MAX_LEVEL = 20;

interface ProgressionStore {
  level: number;
  xp: number;
  skillPoints: number;
  ranks: Record<string, number>;
  treeOpen: boolean;
  addXp: (n: number) => void;
  spendPoint: (nodeId: string) => boolean;
  setTreeOpen: (open: boolean) => void;
  reset: () => void;
}

export const useProgression = create<ProgressionStore>((set, get) => ({
  level: 1,
  xp: 0,
  skillPoints: 0,
  ranks: {},
  treeOpen: false,
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
  reset: () =>
    set({ level: 1, xp: 0, skillPoints: 0, ranks: {}, treeOpen: false }),
}));

export function grantXp(n: number) {
  if (n <= 0) return;
  useProgression.getState().addXp(n);
  spawnFloat(world.player.pos, `+${Math.round(n)} XP`, "#67e8f9");
}

export function computeMods() {
  const { ranks } = useProgression.getState();
  const p = world.player;
  p.slotDmg = { basic: 1, s1: 1, s2: 1 };
  p.cdMult = 1;
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
