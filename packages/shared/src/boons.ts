export type BoonDef = {
  id: string;
  nameKey: string;
  descKey: string;
  icon: string;
  color: string;
};

export const BOONS: BoonDef[] = [
  { id: "boon_power", nameKey: "boons.boon_power.name", descKey: "boons.boon_power.desc", icon: "slam", color: "#f87171" },
  { id: "boon_swift", nameKey: "boons.boon_swift.name", descKey: "boons.boon_swift.desc", icon: "burst", color: "#fbbf24" },
  { id: "boon_deadly", nameKey: "boons.boon_deadly.name", descKey: "boons.boon_deadly.desc", icon: "arrow", color: "#fb7185" },
  { id: "boon_vital", nameKey: "boons.boon_vital.name", descKey: "boons.boon_vital.desc", icon: "shield", color: "#4ade80" },
  { id: "boon_flow", nameKey: "boons.boon_flow.name", descKey: "boons.boon_flow.desc", icon: "bolt", color: "#38bdf8" },
  { id: "boon_vamp", nameKey: "boons.boon_vamp.name", descKey: "boons.boon_vamp.desc", icon: "nova", color: "#c084fc" },
  { id: "boon_phase", nameKey: "boons.boon_phase.name", descKey: "boons.boon_phase.desc", icon: "slash", color: "#22d3ee" },
  { id: "boon_cache", nameKey: "boons.boon_cache.name", descKey: "boons.boon_cache.desc", icon: "trap", color: "#60a5fa" },
];
