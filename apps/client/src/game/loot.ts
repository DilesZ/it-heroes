import i18next from "i18next";
import * as THREE from "three";
import {
  ITEMS,
  RARITIES,
  RARITY_AFFIX_COUNT,
  RARITY_COLOR,
  RARITY_MULT,
  PLAYER_BASE,
  type Affix,
  type ItemDef,
  type ItemInstance,
  type Rarity,
  type StatKey,
} from "@it-heroes/shared";
import { world, type Combatant } from "./state/world";
import { spawnFloat, spawnParticles } from "./combat";
import { useInventory } from "../state/inventoryStore";
import { useHud } from "../state/hudStore";
import { useQuests } from "../state/questStore";
import { sfx } from "./audio";

const DEF_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((d) => [d.id, d]));

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 55,
  uncommon: 25,
  rare: 12,
  epic: 6,
  legendary: 2,
};

const AFFIX_POOL: { stat: StatKey; min: number; max: number }[] = [
  { stat: "attack", min: 2, max: 6 },
  { stat: "magic", min: 2, max: 6 },
  { stat: "defense", min: 2, max: 5 },
  { stat: "speed", min: 1, max: 3 },
  { stat: "crit", min: 2, max: 5 },
  { stat: "maxHealth", min: 8, max: 25 },
  { stat: "maxMana", min: 6, max: 18 },
];

export function itemName(item: ItemInstance): string {
  const def = DEF_BY_ID[item.defId];
  return def ? i18next.t(def.nameKey) : item.defId;
}

export function itemColor(item: ItemInstance): string {
  const def = DEF_BY_ID[item.defId];
  return RARITY_COLOR[def?.rarity ?? "common"];
}

export function itemStats(item: ItemInstance): Partial<Record<StatKey, number>> {
  const def = DEF_BY_ID[item.defId];
  if (!def) return {};
  const mult = RARITY_MULT[def.rarity] * (1 + 0.08 * item.upgrade);
  const out: Partial<Record<StatKey, number>> = {};
  for (const [k, v] of Object.entries(def.baseStats)) {
    out[k as StatKey] = Math.round(v * mult);
  }
  for (const a of item.affixes) {
    out[a.stat] = (out[a.stat] ?? 0) + a.value;
  }
  return out;
}

export function genItem(defId: string, upgrade = 0): ItemInstance {
  const def = DEF_BY_ID[defId];
  const n = RARITY_AFFIX_COUNT[def.rarity];
  const pool = [...AFFIX_POOL].sort(() => Math.random() - 0.5).slice(0, n);
  const lvlScale = 1 + def.level * 0.06;
  const affixes: Affix[] = pool.map((p) => ({
    stat: p.stat,
    value: Math.max(1, Math.round((p.min + Math.random() * (p.max - p.min)) * lvlScale)),
  }));
  return { uid: `it-${world.nextId++}`, defId, affixes, upgrade };
}

function rollRarity(luck = 0): Rarity {
  const total = RARITIES.reduce((s, r) => s + RARITY_WEIGHT[r], 0);
  let roll = Math.random() * (total + luck);
  for (const r of RARITIES) {
    roll -= RARITY_WEIGHT[r];
    if (roll <= 0) return r;
  }
  return "common";
}

export function rollDrops(c: Combatant) {
  const isBoss = c.defId === "bsod_lord";
  const gold = Math.round((3 + c.maxHp * 0.15) * (isBoss ? 5 : 1));
  useInventory.getState().addGold(gold);
  spawnFloat(c.pos, `+${gold} G`, "#fbbf24");
  sfx.gold();

  if (!isBoss && Math.random() < 0.3) {
    const n = 1 + (Math.random() < 0.25 ? 1 : 0);
    useQuests.getState().addScrap(n);
    spawnFloat(c.pos, `+${n} ${i18next.t("items.scrap")}`, "#d6a35c");
  }

  const inv = useInventory.getState();
  if (isBoss) {
    inv.addMaterial("core", 3);
    inv.addMaterial("chip", 5);
    spawnFloat(c.pos, `+3 ${i18next.t("items.core")}`, "#f472b6", true);
  } else if (c.defId === "spyware" || c.defId === "rootkit") {
    if (Math.random() < 0.25) {
      inv.addMaterial("chip", 1);
      spawnFloat(c.pos, `+1 ${i18next.t("items.chip")}`, "#67e8f9");
    }
  } else if (c.defId === "trojan" || c.defId === "firewall") {
    if (Math.random() < 0.2) {
      inv.addMaterial("core", 1);
      spawnFloat(c.pos, `+1 ${i18next.t("items.core")}`, "#f472b6");
    }
  }

  const chance = isBoss ? 1 : c.elite ? 0.6 : 0.22;
  if (Math.random() > chance) return;
  const minIdx = isBoss ? RARITIES.indexOf("rare") : 0;
  let rarity = rollRarity(isBoss ? 40 : c.elite ? 30 : 0);
  if (RARITIES.indexOf(rarity) < minIdx) rarity = "rare";
  const cap = isBoss ? 99 : 8;
  const pool = ITEMS.filter((d) => d.rarity === rarity && d.level <= cap);
  const pickFrom = pool.length > 0 ? pool : ITEMS.filter((d) => d.level <= cap);
  const def = pickFrom[Math.floor(Math.random() * pickFrom.length)];
  const item = genItem(def.id);
  const a = Math.random() * Math.PI * 2;
  const pos = new THREE.Vector3(c.pos.x + Math.cos(a) * 1.2, 0, c.pos.z + Math.sin(a) * 1.2);
  if (world.drops.length >= 24) world.drops.shift();
  world.drops.push({ id: world.nextId++, item, pos, life: 40 });
  world.dropVersion++;
}

export function collectDrop(id: number) {
  const i = world.drops.findIndex((d) => d.id === id);
  if (i < 0) return;
  const [drop] = world.drops.splice(i, 1);
  world.dropVersion++;
  useInventory.getState().addItem(drop.item);
  spawnFloat(drop.pos, itemName(drop.item), itemColor(drop.item));
  spawnParticles(drop.pos, itemColor(drop.item), 10, 4, 0.9);
  sfx.pickup();
}

export function applyStats() {
  const { equipped } = useInventory.getState();
  let atk = 0;
  let mag = 0;
  let def = 0;
  let spd = 0;
  let crit = 0;
  let hp = 0;
  let mp = 0;
  for (const item of Object.values(equipped)) {
    if (!item) continue;
    const stats = itemStats(item);
    atk += stats.attack ?? 0;
    mag += stats.magic ?? 0;
    def += stats.defense ?? 0;
    spd += stats.speed ?? 0;
    crit += stats.crit ?? 0;
    hp += stats.maxHealth ?? 0;
    mp += stats.maxMana ?? 0;
  }
  const p = world.player;
  p.attackBonus = atk + p.passive.attack + p.boonPassive.attack;
  p.magicBonus = mag + p.passive.magic + p.boonPassive.magic;
  p.defense = def + p.passive.defense + p.boonPassive.defense;
  p.speedBonus = 1 + (spd + p.passive.speed + p.boonSpeed + p.boonPassive.speed) / 100;
  p.critBonus = (crit + p.passive.crit + p.boonPassive.crit) / 100;
  const maxHp = PLAYER_BASE.maxHealth + hp + p.passive.maxHealth + p.boonPassive.maxHealth;
  const maxMp = PLAYER_BASE.maxMana + mp + p.passive.maxMana + p.boonPassive.maxMana;
  useHud.getState().setMax(maxHp, maxMp);
  p.health = Math.min(p.health, maxHp);
  p.mana = Math.min(p.mana, maxMp);
}

export function initStarterKit() {
  const s = useInventory.getState();
  if (s.items.length > 0 || Object.values(s.equipped).some(Boolean)) return;
  const starter = ["cpu_i3", "ram_ddr4", "periph_keyboard", "firmware_bios"];
  const equipped = { ...s.equipped };
  for (const defId of starter) {
    const item = genItem(defId);
    const def = DEF_BY_ID[defId];
    equipped[def.slot] = item;
  }
  useInventory.setState({ equipped });
  applyStats();
}
