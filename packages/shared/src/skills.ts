export type ClassId = "helpdesk" | "devops" | "blueteam";

export type SkillType = "melee" | "projectile" | "aoe" | "buff" | "summon";

export type SkillDef = {
  id: string;
  classId: ClassId;
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

export const SKILLS: SkillDef[] = [
  {
    id: "keyboard_slash",
    classId: "helpdesk",
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
];
