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

interface InvStore {
  items: ItemInstance[];
  equipped: Record<EquipSlot, ItemInstance | null>;
  gold: number;
  invOpen: boolean;
  selectedUid: string | null;
  addItem: (item: ItemInstance) => void;
  removeItem: (uid: string) => void;
  equip: (uid: string) => void;
  unequip: (slot: EquipSlot) => void;
  addGold: (n: number) => void;
  setInvOpen: (open: boolean) => void;
  select: (uid: string | null) => void;
  reset: () => void;
}

export const useInventory = create<InvStore>((set, get) => ({
  items: [],
  equipped: { cpu: null, ram: null, gpu: null, peripheral: null, firmware: null },
  gold: 0,
  invOpen: false,
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
  setInvOpen: (open) => set({ invOpen: open, selectedUid: open ? get().selectedUid : null }),
  select: (selectedUid) => set({ selectedUid }),
  reset: () =>
    set({
      items: [],
      equipped: { cpu: null, ram: null, gpu: null, peripheral: null, firmware: null },
      gold: 0,
      selectedUid: null,
    }),
}));
