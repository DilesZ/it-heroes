export type QuestDef = {
  id: string;
  nameKey: string;
  descKey: string;
  act: number;
  type: "main" | "side";
  objective: {
    kind: "kill" | "collect" | "talk" | "reach" | "boss";
    target: string;
    count: number;
  };
  rewardXp: number;
  rewardGold: number;
  next?: string;
};

export const QUESTS: QuestDef[] = [
  {
    id: "q_boot",
    nameKey: "quests.q_boot.name",
    descKey: "quests.q_boot.desc",
    act: 1,
    type: "main",
    objective: { kind: "talk", target: "npc_chief", count: 1 },
    rewardXp: 50,
    rewardGold: 25,
    next: "q_bugs",
  },
  {
    id: "q_bugs",
    nameKey: "quests.q_bugs.name",
    descKey: "quests.q_bugs.desc",
    act: 1,
    type: "main",
    objective: { kind: "kill", target: "bug", count: 8 },
    rewardXp: 120,
    rewardGold: 40,
    next: "q_bsod",
  },
  {
    id: "q_bsod",
    nameKey: "quests.q_bsod.name",
    descKey: "quests.q_bsod.desc",
    act: 1,
    type: "main",
    objective: { kind: "boss", target: "bsod_lord", count: 1 },
    rewardXp: 300,
    rewardGold: 120,
    next: "q_worms",
  },
  {
    id: "q_worms",
    nameKey: "quests.q_worms.name",
    descKey: "quests.q_worms.desc",
    act: 2,
    type: "main",
    objective: { kind: "kill", target: "worm", count: 12 },
    rewardXp: 380,
    rewardGold: 150,
    next: "q_wormqueen",
  },
  {
    id: "q_wormqueen",
    nameKey: "quests.q_wormqueen.name",
    descKey: "quests.q_wormqueen.desc",
    act: 2,
    type: "main",
    objective: { kind: "boss", target: "worm_queen", count: 1 },
    rewardXp: 700,
    rewardGold: 300,
    next: "q_mainframe",
  },
  {
    id: "q_mainframe",
    nameKey: "quests.q_mainframe.name",
    descKey: "quests.q_mainframe.desc",
    act: 3,
    type: "main",
    objective: { kind: "boss", target: "mainframe", count: 1 },
    rewardXp: 1500,
    rewardGold: 600,
  },
  {
    id: "q_scrap",
    nameKey: "quests.q_scrap.name",
    descKey: "quests.q_scrap.desc",
    act: 1,
    type: "side",
    objective: { kind: "collect", target: "scrap", count: 10 },
    rewardXp: 80,
    rewardGold: 60,
  },
];
