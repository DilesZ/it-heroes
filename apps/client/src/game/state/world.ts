import * as THREE from "three";
import { PLAYER_BASE } from "@it-heroes/shared";

export type ZoneId = "hub" | "corridorA" | "cables" | "corridorB" | "cloud";

export function zoneOf(x: number, z: number): ZoneId | null {
  if (Math.hypot(x, z) <= 38) return "hub";
  if (Math.abs(x) <= 6 && z <= -34 && z >= -62) return "corridorA";
  if (Math.hypot(x, z + 90) <= 30) return "cables";
  if (Math.abs(x) <= 6 && z <= -116 && z >= -142) return "corridorB";
  if (Math.hypot(x, z + 175) <= 32) return "cloud";
  return null;
}

export function insideWorld(x: number, z: number, margin = 0): boolean {
  if (Math.hypot(x, z) <= 38 + margin) return true;
  if (Math.abs(x) <= 6 + margin && z <= -34 + margin && z >= -62 - margin) return true;
  if (Math.hypot(x, z + 90) <= 30 + margin) return true;
  if (Math.abs(x) <= 6 + margin && z <= -116 + margin && z >= -142 - margin) return true;
  if (Math.hypot(x, z + 175) <= 32 + margin) return true;
  return false;
}

export type Combatant = {
  id: number;
  kind: "dummy" | "enemy";
  defId: string | null;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  hp: number;
  maxHp: number;
  dead: boolean;
  deadT: number;
  respawnT: number;
  hitFlash: number;
  scale: number;
  color: string;
  emissive: string;
  bobPhase: number;
  attackT: number;
  aiState: "sleep" | "idle" | "chase" | "windup" | "cooldown" | "slamTel";
  aiT: number;
  skillT: number;
  summonT: number;
  volleyT: number;
  home: THREE.Vector3;
};

export type Projectile = {
  alive: boolean;
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  speed: number;
  damage: number;
  life: number;
  color: string;
  pierce: number;
  fromPlayer: boolean;
};

export type Turret = { id: number; pos: THREE.Vector3; life: number; shotT: number };
export type Trap = { id: number; pos: THREE.Vector3; life: number };
export type Slash = { pos: THREE.Vector3; facing: number; t: number; color: string; radius: number };
export type Blast = { pos: THREE.Vector3; t: number; color: string; radius: number };
export type Particle = {
  alive: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
};
export type LootDrop = {
  id: number;
  item: import("@it-heroes/shared").ItemInstance;
  pos: THREE.Vector3;
  life: number;
};
export type FloatText = {
  alive: boolean;
  pos: THREE.Vector3;
  text: string;
  color: string;
  t: number;
  dur: number;
  big: boolean;
};

function makePool<T>(n: number, factory: () => T): T[] {
  return Array.from({ length: n }, factory);
}

export const world = {
  time: 0,
  timeScale: 1,
  hitstopT: 0,
  shake: 0,
  hubBounds: 38,
  nextId: 1,
  player: {
    pos: new THREE.Vector3(0, 0, 10),
    vel: new THREE.Vector3(),
    facing: Math.PI,
    state: "idle" as "idle" | "walk" | "dodge",
    health: PLAYER_BASE.maxHealth,
    mana: PLAYER_BASE.maxMana,
    stamina: PLAYER_BASE.maxStamina,
    dodgeTimer: 0,
    dodgeDir: new THREE.Vector3(0, 0, -1),
    invulnerable: false,
    speedBonus: 1,
    attackBonus: 0,
    magicBonus: 0,
    critBonus: 0,
    defense: 0,
    shield: 0,
    shieldT: 0,
    hasteT: 0,
    cd: { basic: 0, s1: 0, s2: 0 },
    alive: true,
    deathT: 0,
    slotDmg: { basic: 1, s1: 1, s2: 1 },
    cdMult: 1,
    shieldMult: 1,
    hasteBonus: 0,
    passive: { attack: 0, magic: 0, defense: 0, speed: 0, crit: 0, maxHealth: 0, maxMana: 0 },
  },
  combatants: [] as Combatant[],
  drops: [] as LootDrop[],
  dropVersion: 0,
  turretVersion: 0,
  trapVersion: 0,
  dummyVersion: 0,
  enemyVersion: 0,
  projectiles: makePool(64, () => ({
    alive: false,
    pos: new THREE.Vector3(),
    dir: new THREE.Vector3(0, 0, 1),
    speed: 0,
    damage: 0,
    life: 0,
    color: "#fff",
    pierce: 0,
    fromPlayer: true,
  })),
  turrets: [] as Turret[],
  traps: [] as Trap[],
  slashes: makePool(8, () => ({ pos: new THREE.Vector3(), facing: 0, t: 0, color: "#fff", radius: 2 })),
  blasts: makePool(8, () => ({ pos: new THREE.Vector3(), t: 0, color: "#fff", radius: 3 })),
  particles: makePool(280, () => ({
    alive: false,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    life: 0,
    maxLife: 1,
    size: 1,
    color: new THREE.Color(),
  })),
  floats: makePool(28, () => ({
    alive: false,
    pos: new THREE.Vector3(),
    text: "",
    color: "#fff",
    t: 0,
    dur: 0.9,
    big: false,
  })),
};

export function resetWorld() {
  world.combatants.length = 0;
  world.drops.length = 0;
  world.dropVersion++;
  world.turrets.length = 0;
  world.traps.length = 0;
  for (const p of world.projectiles) p.alive = false;
  for (const p of world.particles) p.alive = false;
  for (const f of world.floats) f.alive = false;
  const pl = world.player;
  pl.pos.set(0, 0, 10);
  pl.vel.set(0, 0, 0);
  pl.state = "idle";
  pl.health = PLAYER_BASE.maxHealth;
  pl.mana = PLAYER_BASE.maxMana;
  pl.stamina = PLAYER_BASE.maxStamina;
  pl.dodgeTimer = 0;
  pl.invulnerable = false;
  pl.shield = 0;
  pl.shieldT = 0;
  pl.hasteT = 0;
  pl.alive = true;
  pl.deathT = 0;
  pl.slotDmg = { basic: 1, s1: 1, s2: 1 };
  pl.cdMult = 1;
  pl.shieldMult = 1;
  pl.hasteBonus = 0;
  pl.passive = { attack: 0, magic: 0, defense: 0, speed: 0, crit: 0, maxHealth: 0, maxMana: 0 };
  pl.cd.basic = 0;
  pl.cd.s1 = 0;
  pl.cd.s2 = 0;
}
