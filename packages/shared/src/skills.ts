import type { StatKey } from "./items";

export type ClassId = "helpdesk" | "devops" | "blueteam";

export type SkillType = "melee" | "projectile" | "aoe" | "buff" | "summon";

export type SkillDef = {
  id: string;
  classId: ClassId;
  slot: "basic" | "s1" | "s2" | "sp";
  nameKey: string;
  descKey: string;
  type: SkillType;
  damage: number;
  manaCost: number;
  cooldown: number;
  range: number;
  radius?: number;
  unlockLevel: number;
  icon: string;
  color: string;
};

export const CLASSES: Record<
  ClassId,
  { id: ClassId; nameKey: string; descKey: string; color: string; baseAttack: number; baseMagic: number; baseDefense: number }
> = {
  helpdesk: {
    id: "helpdesk",
    nameKey: "classes.helpdesk.name",
    descKey: "classes.helpdesk.desc",
    color: "#38bdf8",
    baseAttack: 10,
    baseMagic: 2,
    baseDefense: 8,
  },
  devops: {
    id: "devops",
    nameKey: "classes.devops.name",
    descKey: "classes.devops.desc",
    color: "#a78bfa",
    baseAttack: 3,
    baseMagic: 11,
    baseDefense: 5,
  },
  blueteam: {
    id: "blueteam",
    nameKey: "classes.blueteam.name",
    descKey: "classes.blueteam.desc",
    color: "#34d399",
    baseAttack: 7,
    baseMagic: 6,
    baseDefense: 6,
  },
};

export const CLASS_IDS: ClassId[] = ["helpdesk", "devops", "blueteam"];

export type SkillNodeDef = {
  id: string;
  classId: ClassId;
  nameKey: string;
  descKey: string;
  maxRank: number;
  reqLevel: number;
  target?: "basic" | "s1" | "s2";
  dmgPerRank?: number;
  stat?: StatKey;
  statPerRank?: number;
  special?: "shield" | "haste";
  icon: string;
  color: string;
};

export const SKILLS: SkillDef[] = [
  {
    id: "keyboard_slash",
    classId: "helpdesk",
    slot: "basic",
    nameKey: "skills.keyboard_slash.name",
    descKey: "skills.keyboard_slash.desc",
    type: "melee",
    damage: 1.0,
    manaCost: 0,
    cooldown: 0.45,
    range: 2.6,
    unlockLevel: 1,
    icon: "slash",
    color: "#38bdf8",
  },
  {
    id: "reboot_slam",
    classId: "helpdesk",
    slot: "s1",
    nameKey: "skills.reboot_slam.name",
    descKey: "skills.reboot_slam.desc",
    type: "aoe",
    damage: 2.2,
    manaCost: 20,
    cooldown: 6,
    range: 3.2,
    radius: 3.4,
    unlockLevel: 2,
    icon: "slam",
    color: "#0ea5e9",
  },
  {
    id: "sudo_shield",
    classId: "helpdesk",
    slot: "s2",
    nameKey: "skills.sudo_shield.name",
    descKey: "skills.sudo_shield.desc",
    type: "buff",
    damage: 0,
    manaCost: 25,
    cooldown: 14,
    range: 0,
    unlockLevel: 5,
    icon: "shield",
    color: "#22d3ee",
  },
  {
    id: "packet_bolt",
    classId: "devops",
    slot: "basic",
    nameKey: "skills.packet_bolt.name",
    descKey: "skills.packet_bolt.desc",
    type: "projectile",
    damage: 1.1,
    manaCost: 6,
    cooldown: 0.5,
    range: 22,
    unlockLevel: 1,
    icon: "bolt",
    color: "#a78bfa",
  },
  {
    id: "script_nova",
    classId: "devops",
    slot: "s1",
    nameKey: "skills.script_nova.name",
    descKey: "skills.script_nova.desc",
    type: "aoe",
    damage: 2.4,
    manaCost: 24,
    cooldown: 7,
    range: 5,
    radius: 4.6,
    unlockLevel: 3,
    icon: "nova",
    color: "#c084fc",
  },
  {
    id: "deploy_turret",
    classId: "devops",
    slot: "s2",
    nameKey: "skills.deploy_turret.name",
    descKey: "skills.deploy_turret.desc",
    type: "summon",
    damage: 0.6,
    manaCost: 35,
    cooldown: 18,
    range: 4,
    unlockLevel: 6,
    icon: "turret",
    color: "#8b5cf6",
  },
  {
    id: "cable_shot",
    classId: "blueteam",
    slot: "basic",
    nameKey: "skills.cable_shot.name",
    descKey: "skills.cable_shot.desc",
    type: "projectile",
    damage: 1.0,
    manaCost: 4,
    cooldown: 0.42,
    range: 24,
    unlockLevel: 1,
    icon: "arrow",
    color: "#34d399",
  },
  {
    id: "firewall_trap",
    classId: "blueteam",
    slot: "s1",
    nameKey: "skills.firewall_trap.name",
    descKey: "skills.firewall_trap.desc",
    type: "aoe",
    damage: 1.8,
    manaCost: 18,
    cooldown: 8,
    range: 10,
    radius: 2.8,
    unlockLevel: 4,
    icon: "trap",
    color: "#10b981",
  },
  {
    id: "patch_burst",
    classId: "blueteam",
    slot: "s2",
    nameKey: "skills.patch_burst.name",
    descKey: "skills.patch_burst.desc",
    type: "buff",
    damage: 0,
    manaCost: 22,
    cooldown: 16,
    range: 0,
    unlockLevel: 7,
    icon: "burst",
    color: "#6ee7b7",
  },
  {
    id: "bluescreen",
    classId: "helpdesk",
    slot: "sp",
    nameKey: "skills.bluescreen.name",
    descKey: "skills.bluescreen.desc",
    type: "aoe",
    damage: 4.0,
    manaCost: 30,
    cooldown: 16,
    range: 6,
    radius: 6,
    unlockLevel: 1,
    icon: "nova",
    color: "#38bdf8",
  },
  {
    id: "rmrf",
    classId: "devops",
    slot: "sp",
    nameKey: "skills.rmrf.name",
    descKey: "skills.rmrf.desc",
    type: "aoe",
    damage: 1.1,
    manaCost: 35,
    cooldown: 18,
    range: 14,
    radius: 14,
    unlockLevel: 1,
    icon: "bolt",
    color: "#c084fc",
  },
  {
    id: "killswitch",
    classId: "blueteam",
    slot: "sp",
    nameKey: "skills.killswitch.name",
    descKey: "skills.killswitch.desc",
    type: "projectile",
    damage: 5.0,
    manaCost: 30,
    cooldown: 14,
    range: 18,
    unlockLevel: 1,
    icon: "arrow",
    color: "#34d399",
  },
];

export const SKILL_NODES: SkillNodeDef[] = [
  { id: "hd_edge", classId: "helpdesk", nameKey: "nodes.hd_edge.name", descKey: "nodes.hd_edge.desc", maxRank: 3, reqLevel: 2, target: "basic", dmgPerRank: 0.15, icon: "slash", color: "#38bdf8" },
  { id: "hd_reboot", classId: "helpdesk", nameKey: "nodes.hd_reboot.name", descKey: "nodes.hd_reboot.desc", maxRank: 3, reqLevel: 3, target: "s1", dmgPerRank: 0.2, icon: "slam", color: "#0ea5e9" },
  { id: "hd_root", classId: "helpdesk", nameKey: "nodes.hd_root.name", descKey: "nodes.hd_root.desc", maxRank: 2, reqLevel: 4, target: "s2", special: "shield", icon: "shield", color: "#22d3ee" },
  { id: "hd_muscle", classId: "helpdesk", nameKey: "nodes.hd_muscle.name", descKey: "nodes.hd_muscle.desc", maxRank: 3, reqLevel: 2, stat: "attack", statPerRank: 4, icon: "slash", color: "#f87171" },
  { id: "hd_armor", classId: "helpdesk", nameKey: "nodes.hd_armor.name", descKey: "nodes.hd_armor.desc", maxRank: 3, reqLevel: 3, stat: "defense", statPerRank: 3, icon: "shield", color: "#94a3b8" },
  { id: "hd_coffee", classId: "helpdesk", nameKey: "nodes.hd_coffee.name", descKey: "nodes.hd_coffee.desc", maxRank: 2, reqLevel: 4, stat: "speed", statPerRank: 4, icon: "burst", color: "#fbbf24" },
  { id: "hd_luck", classId: "helpdesk", nameKey: "nodes.hd_luck.name", descKey: "nodes.hd_luck.desc", maxRank: 3, reqLevel: 5, stat: "crit", statPerRank: 2, icon: "nova", color: "#f472b6" },
  { id: "hd_battery", classId: "helpdesk", nameKey: "nodes.hd_battery.name", descKey: "nodes.hd_battery.desc", maxRank: 3, reqLevel: 2, stat: "maxHealth", statPerRank: 15, icon: "slam", color: "#4ade80" },
  { id: "hd_cable", classId: "helpdesk", nameKey: "nodes.hd_cable.name", descKey: "nodes.hd_cable.desc", maxRank: 2, reqLevel: 6, stat: "maxMana", statPerRank: 12, icon: "bolt", color: "#60a5fa" },
  { id: "do_jumbo", classId: "devops", nameKey: "nodes.do_jumbo.name", descKey: "nodes.do_jumbo.desc", maxRank: 3, reqLevel: 2, target: "basic", dmgPerRank: 0.15, icon: "bolt", color: "#a78bfa" },
  { id: "do_obf", classId: "devops", nameKey: "nodes.do_obf.name", descKey: "nodes.do_obf.desc", maxRank: 3, reqLevel: 3, target: "s1", dmgPerRank: 0.2, icon: "nova", color: "#c084fc" },
  { id: "do_k8s", classId: "devops", nameKey: "nodes.do_k8s.name", descKey: "nodes.do_k8s.desc", maxRank: 3, reqLevel: 4, target: "s2", dmgPerRank: 0.2, icon: "turret", color: "#8b5cf6" },
  { id: "do_oc", classId: "devops", nameKey: "nodes.do_oc.name", descKey: "nodes.do_oc.desc", maxRank: 3, reqLevel: 2, stat: "magic", statPerRank: 4, icon: "bolt", color: "#f472b6" },
  { id: "do_ssd", classId: "devops", nameKey: "nodes.do_ssd.name", descKey: "nodes.do_ssd.desc", maxRank: 2, reqLevel: 3, stat: "speed", statPerRank: 4, icon: "burst", color: "#fbbf24" },
  { id: "do_fw", classId: "devops", nameKey: "nodes.do_fw.name", descKey: "nodes.do_fw.desc", maxRank: 3, reqLevel: 4, stat: "defense", statPerRank: 3, icon: "shield", color: "#94a3b8" },
  { id: "do_crit", classId: "devops", nameKey: "nodes.do_crit.name", descKey: "nodes.do_crit.desc", maxRank: 3, reqLevel: 5, stat: "crit", statPerRank: 2, icon: "nova", color: "#fb7185" },
  { id: "do_ram", classId: "devops", nameKey: "nodes.do_ram.name", descKey: "nodes.do_ram.desc", maxRank: 3, reqLevel: 2, stat: "maxMana", statPerRank: 10, icon: "slam", color: "#60a5fa" },
  { id: "do_ci", classId: "devops", nameKey: "nodes.do_ci.name", descKey: "nodes.do_ci.desc", maxRank: 2, reqLevel: 6, stat: "maxHealth", statPerRank: 12, icon: "trap", color: "#4ade80" },
  { id: "bt_fiber", classId: "blueteam", nameKey: "nodes.bt_fiber.name", descKey: "nodes.bt_fiber.desc", maxRank: 3, reqLevel: 2, target: "basic", dmgPerRank: 0.15, icon: "arrow", color: "#34d399" },
  { id: "bt_honey", classId: "blueteam", nameKey: "nodes.bt_honey.name", descKey: "nodes.bt_honey.desc", maxRank: 3, reqLevel: 3, target: "s1", dmgPerRank: 0.2, icon: "trap", color: "#10b981" },
  { id: "bt_patch", classId: "blueteam", nameKey: "nodes.bt_patch.name", descKey: "nodes.bt_patch.desc", maxRank: 2, reqLevel: 4, target: "s2", special: "haste", icon: "burst", color: "#6ee7b7" },
  { id: "bt_aim", classId: "blueteam", nameKey: "nodes.bt_aim.name", descKey: "nodes.bt_aim.desc", maxRank: 3, reqLevel: 2, stat: "attack", statPerRank: 4, icon: "arrow", color: "#f87171" },
  { id: "bt_agil", classId: "blueteam", nameKey: "nodes.bt_agil.name", descKey: "nodes.bt_agil.desc", maxRank: 3, reqLevel: 3, stat: "speed", statPerRank: 4, icon: "burst", color: "#fbbf24" },
  { id: "bt_vest", classId: "blueteam", nameKey: "nodes.bt_vest.name", descKey: "nodes.bt_vest.desc", maxRank: 3, reqLevel: 4, stat: "defense", statPerRank: 3, icon: "shield", color: "#94a3b8" },
  { id: "bt_hawk", classId: "blueteam", nameKey: "nodes.bt_hawk.name", descKey: "nodes.bt_hawk.desc", maxRank: 3, reqLevel: 5, stat: "crit", statPerRank: 2, icon: "nova", color: "#f472b6" },
  { id: "bt_batt", classId: "blueteam", nameKey: "nodes.bt_batt.name", descKey: "nodes.bt_batt.desc", maxRank: 3, reqLevel: 2, stat: "maxHealth", statPerRank: 15, icon: "slam", color: "#4ade80" },
  { id: "bt_auto", classId: "blueteam", nameKey: "nodes.bt_auto.name", descKey: "nodes.bt_auto.desc", maxRank: 2, reqLevel: 6, stat: "maxMana", statPerRank: 12, icon: "bolt", color: "#60a5fa" },
];
