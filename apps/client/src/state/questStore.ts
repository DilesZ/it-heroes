import { create } from "zustand";
import { QUESTS, type QuestDef } from "@it-heroes/shared";
import { useInventory } from "./inventoryStore";
import { grantXp } from "./progressionStore";

export type Toast = { id: number; textKey: string; param?: string };

interface QuestStore {
  started: string[];
  progress: Record<string, number>;
  done: string[];
  collectedScrap: number;
  toasts: Toast[];
  dialogNpc: string | null;
  start: (id: string) => void;
  advanceKill: (defId: string) => void;
  advanceTalk: () => void;
  addScrap: (n: number) => void;
  complete: (id: string) => void;
  pushToast: (textKey: string, param?: string) => void;
  dismissToast: (id: number) => void;
  setDialog: (npc: string | null) => void;
  reset: () => void;
}

let toastId = 1;

const QUEST_BY_ID: Record<string, QuestDef> = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

export function questDef(id: string): QuestDef | undefined {
  return QUEST_BY_ID[id];
}

export function mainChain(): QuestDef[] {
  const chain: QuestDef[] = [];
  let cur = QUESTS.find((q) => q.type === "main" && q.id === "q_boot");
  while (cur) {
    chain.push(cur);
    cur = cur.next ? QUEST_BY_ID[cur.next] : undefined;
  }
  return chain;
}

export const useQuests = create<QuestStore>((set, get) => ({
  started: [],
  progress: {},
  done: [],
  collectedScrap: 0,
  toasts: [],
  dialogNpc: null,
  start: (id) => {
    const s = get();
    if (s.started.includes(id) || s.done.includes(id)) return;
    const q = QUEST_BY_ID[id];
    if (!q) return;
    const progress = { ...s.progress };
    if (q.objective.kind === "talk") progress[id] = 1;
    if (q.objective.kind === "collect") progress[id] = s.collectedScrap;
    set({ started: [...s.started, id], progress });
  },
  advanceKill: (defId) => {
    const s = get();
    let changed = false;
    const progress = { ...s.progress };
    for (const id of s.started) {
      if (s.done.includes(id)) continue;
      const q = QUEST_BY_ID[id];
      if (!q) continue;
      const k = q.objective.kind;
      if ((k === "kill" || k === "boss") && q.objective.target === defId) {
        progress[id] = Math.min(q.objective.count, (progress[id] ?? 0) + 1);
        changed = true;
      }
    }
    if (changed) set({ progress });
  },
  advanceTalk: () => {},
  addScrap: (n) => {
    const s = get();
    const collectedScrap = s.collectedScrap + n;
    const progress = { ...s.progress };
    for (const id of s.started) {
      if (s.done.includes(id)) continue;
      const q = QUEST_BY_ID[id];
      if (q && q.objective.kind === "collect") {
        progress[id] = Math.min(q.objective.count, collectedScrap);
      }
    }
    set({ collectedScrap, progress });
  },
  complete: (id) => {
    const s = get();
    const q = QUEST_BY_ID[id];
    if (!q || s.done.includes(id)) return;
    if (!isTurnable(s, q)) return;
    grantXp(q.rewardXp);
    useInventory.getState().addGold(q.rewardGold);
    set({ done: [...s.done, id] });
    get().pushToast("quest.completed", id);
    if (q.next && QUEST_BY_ID[q.next]) get().start(q.next);
  },
  pushToast: (textKey, param) => {
    const id = toastId++;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, textKey, param }] }));
    setTimeout(() => get().dismissToast(id), 4000);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setDialog: (dialogNpc) => set({ dialogNpc }),
  reset: () =>
    set({ started: [], progress: {}, done: [], collectedScrap: 0, toasts: [], dialogNpc: null }),
}));

export function isTurnable(
  s: { progress: Record<string, number> },
  q: QuestDef
): boolean {
  return (s.progress[q.id] ?? 0) >= q.objective.count;
}

export function activeMainQuest(s: { started: string[]; done: string[] }): QuestDef | undefined {
  for (const q of mainChain()) {
    if (s.started.includes(q.id) && !s.done.includes(q.id)) return q;
  }
  return undefined;
}

export function activeSideQuests(s: { started: string[]; done: string[] }): QuestDef[] {
  return QUESTS.filter((q) => q.type === "side" && s.started.includes(q.id) && !s.done.includes(q.id));
}
