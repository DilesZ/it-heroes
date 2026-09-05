import type { ClassId, EquipSlot, ItemInstance, Lang } from "@it-heroes/shared";
import { world } from "../game/state/world";
import { useUi } from "./uiStore";
import { useInventory, type Materials } from "./inventoryStore";
import { computeMods, restoreBoons, useProgression } from "./progressionStore";
import { useQuests } from "./questStore";

const KEY = "it-heroes:save:v1";

type SaveData = {
  v: number;
  classId: ClassId;
  lang: Lang;
  level: number;
  xp: number;
  skillPoints: number;
  ranks: Record<string, number>;
  boons: string[];
  items: ItemInstance[];
  equipped: Record<EquipSlot, ItemInstance | null>;
  gold: number;
  materials: Materials;
  quests: { started: string[]; progress: Record<string, number>; done: string[]; collectedScrap: number };
  time: number;
};

export function hasSave(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

export function saveGame(): boolean {
  try {
    const ui = useUi.getState();
    const prog = useProgression.getState();
    const inv = useInventory.getState();
    const q = useQuests.getState();
    const data: SaveData = {
      v: 1,
      classId: ui.classId,
      lang: ui.lang,
      level: prog.level,
      xp: prog.xp,
      skillPoints: prog.skillPoints,
      ranks: prog.ranks,
      boons: [...world.player.boons],
      items: inv.items,
      equipped: inv.equipped,
      gold: inv.gold,
      materials: inv.materials,
      quests: { started: q.started, progress: q.progress, done: q.done, collectedScrap: q.collectedScrap },
      time: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function loadSave(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as SaveData;
    if (data.v !== 1) return false;
    useUi.getState().setClass(data.classId);
    useUi.getState().setLang(data.lang);
    useProgression.setState({
      level: data.level,
      xp: data.xp,
      skillPoints: data.skillPoints,
      ranks: data.ranks,
      treeOpen: false,
      draftOpen: false,
      draftOptions: [],
    });
    useInventory.setState({
      items: data.items,
      equipped: data.equipped,
      gold: data.gold,
      materials: data.materials,
      invOpen: false,
      forgeOpen: false,
      selectedUid: null,
    });
    useQuests.setState({
      started: data.quests.started,
      progress: data.quests.progress,
      done: data.quests.done,
      collectedScrap: data.quests.collectedScrap,
      toasts: [],
      dialogNpc: null,
    });
    restoreBoons(data.boons ?? []);
    computeMods();
    return true;
  } catch {
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
