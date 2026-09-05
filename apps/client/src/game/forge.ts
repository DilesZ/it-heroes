import {
  ITEMS,
  SLOTS,
  type EquipSlot,
  type ItemInstance,
  type Rarity,
} from "@it-heroes/shared";
import { world } from "./state/world";
import { spawnFloat, spawnParticles } from "./combat";
import { useInventory } from "../state/inventoryStore";
import { applyStats, genItem, itemName } from "./loot";

export const MAX_UPGRADE = 5;

export function upgradeCost(item: ItemInstance): { gold: number; chip: number } {
  const lvl = item.upgrade + 1;
  return { gold: 40 * lvl, chip: lvl };
}

export function upgradeItem(uid: string): boolean {
  const inv = useInventory.getState();
  const all = [...inv.items, ...Object.values(inv.equipped).filter(Boolean) as ItemInstance[]];
  const item = all.find((i) => i.uid === uid);
  if (!item || item.upgrade >= MAX_UPGRADE) return false;
  const cost = upgradeCost(item);
  if (!inv.spendMaterials({ gold: cost.gold, chip: cost.chip })) return false;
  item.upgrade += 1;
  useInventory.setState({ items: [...inv.items], equipped: { ...inv.equipped } });
  applyStats();
  spawnParticles(world.player.pos, "#fbbf24", 18, 6, 1.2);
  spawnFloat(world.player.pos, `+${item.upgrade} ${itemName(item)}`, "#fbbf24");
  return true;
}

const CRAFT_COST: Record<Rarity, { gold: number; core: number }> = {
  common: { gold: 30, core: 0 },
  uncommon: { gold: 80, core: 1 },
  rare: { gold: 180, core: 2 },
  epic: { gold: 350, core: 4 },
  legendary: { gold: 700, core: 7 },
};

export function craftCost(rarity: Rarity): { gold: number; core: number } {
  return CRAFT_COST[rarity];
}

export function craftItem(slot: EquipSlot, rarity: Rarity): boolean {
  const inv = useInventory.getState();
  const cost = CRAFT_COST[rarity];
  const pool = ITEMS.filter((d) => d.slot === slot && d.rarity === rarity);
  const fallback = ITEMS.filter((d) => d.slot === slot);
  const list = pool.length > 0 ? pool : fallback;
  if (list.length === 0) return false;
  if (!inv.spendMaterials({ gold: cost.gold, core: cost.core })) return false;
  const def = list[Math.floor(Math.random() * list.length)];
  const item = genItem(def.id);
  inv.addItem(item);
  spawnParticles(world.player.pos, "#c084fc", 22, 7, 1.3);
  spawnFloat(world.player.pos, itemName(item), "#c084fc", true);
  return true;
}

export function slots(): EquipSlot[] {
  return SLOTS;
}
