import { create } from "zustand";
import { ITEMS, type EquipSlot, type ItemInstance } from "@it-heroes/shared";
import { applyStats } from "../game/loot";

const DEF_BY_ID = Object.fromEntries(ITEMS.map((d) => [d.id, d]));

export function slotOf(item: ItemInstance): EquipSlot | null {
  const def = DEF_BY_ID[item.defId];
  return def ? def.slot : null;
}

export function defOfItem(item: ItemInstance) {
  return DEF_BY_ID[item.defId];
}

export type Materials = { chip: number; core: number };

interface InvStore {
  items: ItemInstance[];
  equipped: Record<EquipSlot, ItemInstance | null>;
  gold: number;
  materials: Materials;
  invOpen: boolean;
  forgeOpen: boolean;
  selectedUid: string | null;
  addItem: (item: ItemInstance) => void;
  removeItem: (uid: string) => void;
  equip: (uid: string) => void;
  unequip: (slot: EquipSlot) => void;
  addGold: (n: number) => void;
  spendGold: (n: number) => boolean;
  addMaterial: (kind: keyof Materials, n: number) => void;
  spendMaterials: (cost: Partial<Materials> & { gold?: number }) => boolean;
  setInvOpen: (open: boolean) => void;
  setForgeOpen: (open: boolean) => void;
  select: (uid: string | null) => void;
  reset: () => void;
}

export const useInventory = create<InvStore>((set, get) => ({
  items: [],
  equipped: { cpu: null, ram: null, gpu: null, peripheral: null, firmware: null },
  gold: 0,
  materials: { chip: 0, core: 0 },
  invOpen: false,
  forgeOpen: false,
  selectedUid: null,
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (uid) =>
    set((s) => ({
      items: s.items.filter((i) => i.uid !== uid),
      selectedUid: s.selectedUid === uid ? null : s.selectedUid,
    })),
  equip: (uid) => {
    const s = get();
    const item = s.items.find((i) => i.uid === uid);
    if (!item) return;
    const slot = slotOf(item);
    if (!slot) return;
    const prev = s.equipped[slot];
    const items = s.items.filter((i) => i.uid !== uid);
    if (prev) items.push(prev);
    set({ items, equipped: { ...s.equipped, [slot]: item }, selectedUid: null });
    applyStats();
  },
  unequip: (slot) => {
    const s = get();
    const item = s.equipped[slot];
    if (!item) return;
    set({ equipped: { ...s.equipped, [slot]: null }, items: [...s.items, item] });
    applyStats();
  },
  addGold: (n) => set((s) => ({ gold: s.gold + n })),
  spendGold: (n) => {
    const s = get();
    if (s.gold < n) return false;
    set({ gold: s.gold - n });
    return true;
  },
  addMaterial: (kind, n) => set((s) => ({ materials: { ...s.materials, [kind]: s.materials[kind] + n } })),
  spendMaterials: (cost) => {
    const s = get();
    const gold = cost.gold ?? 0;
    const chip = cost.chip ?? 0;
    const core = cost.core ?? 0;
    if (s.gold < gold || s.materials.chip < chip || s.materials.core < core) return false;
    set({
      gold: s.gold - gold,
      materials: { chip: s.materials.chip - chip, core: s.materials.core - core },
    });
    return true;
  },
  setInvOpen: (open) => set({ invOpen: open, selectedUid: open ? get().selectedUid : null }),
  setForgeOpen: (forgeOpen) => set({ forgeOpen }),
  select: (selectedUid) => set({ selectedUid }),
  reset: () =>
    set({
      items: [],
      equipped: { cpu: null, ram: null, gpu: null, peripheral: null, firmware: null },
      gold: 0,
      materials: { chip: 0, core: 0 },
      selectedUid: null,
      forgeOpen: false,
    }),
}));
