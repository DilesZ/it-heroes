import * as THREE from "three";
import { ENEMIES } from "@it-heroes/shared";
import { world, type Combatant } from "./state/world";
import { rollDrops } from "./loot";
import { grantXp } from "../state/progressionStore";
import { useQuests } from "../state/questStore";
import { sfx } from "./audio";

const XP_BY_DEF: Record<string, number> = Object.fromEntries(ENEMIES.map((d) => [d.id, d.xp]));

export function enemyXp(defId: string): number {
  return XP_BY_DEF[defId] ?? 10;
}

export function spawnParticles(
  pos: THREE.Vector3,
  colorHex: string,
  count = 12,
  speed = 6,
  size = 1
) {
  let spawned = 0;
  for (const p of world.particles) {
    if (p.alive) continue;
    const a = Math.random() * Math.PI * 2;
    const el = Math.random() * Math.PI * 0.5;
    const s = speed * (0.4 + Math.random() * 0.8);
    p.pos.copy(pos);
    p.vel.set(Math.cos(a) * Math.cos(el) * s, Math.sin(el) * s + 1.5, Math.sin(a) * Math.cos(el) * s);
    p.maxLife = 0.35 + Math.random() * 0.35;
    p.life = p.maxLife;
    p.size = size * (0.5 + Math.random() * 0.7);
    p.color.set(colorHex);
    p.alive = true;
    if (++spawned >= count) break;
  }
}

export function spawnFloat(pos: THREE.Vector3, text: string, color: string, big = false) {
  for (const f of world.floats) {
    if (f.alive) continue;
    f.pos.copy(pos);
    f.pos.x += (Math.random() - 0.5) * 0.5;
    f.pos.y += 1.2 + Math.random() * 0.4;
    f.text = text;
    f.color = color;
    f.t = 0;
    f.dur = big ? 1.1 : 0.8;
    f.big = big;
    f.alive = true;
    return;
  }
}

export function spawnProjectile(opts: {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  speed: number;
  damage: number;
  color: string;
  life?: number;
  fromPlayer?: boolean;
}) {
  for (const pr of world.projectiles) {
    if (pr.alive) continue;
    pr.alive = true;
    pr.pos.copy(opts.pos);
    pr.dir.copy(opts.dir).normalize();
    pr.speed = opts.speed;
    pr.damage = opts.damage;
    pr.color = opts.color;
    pr.life = opts.life ?? 2;
    pr.pierce = 0;
    pr.fromPlayer = opts.fromPlayer ?? true;
    return;
  }
}

export function spawnSlash(pos: THREE.Vector3, facing: number, color: string, radius: number) {
  for (const s of world.slashes) {
    if (s.t > 0) continue;
    s.pos.copy(pos);
    s.facing = facing;
    s.t = 1;
    s.color = color;
    s.radius = radius;
    return;
  }
}

export function spawnBlast(pos: THREE.Vector3, color: string, radius: number) {
  for (const b of world.blasts) {
    if (b.t > 0) continue;
    b.pos.copy(pos);
    b.t = 1;
    b.color = color;
    b.radius = radius;
    return;
  }
}

export function dealDamage(c: Combatant, amount: number, opts?: { crit?: boolean; color?: string; from?: THREE.Vector3; knock?: number }) {
  if (c.dead) return;
  const crit = opts?.crit ?? false;
  const dmg = Math.max(1, Math.round(amount));
  c.hp -= dmg;
  c.hitFlash = 0.18;
  spawnFloat(c.pos, crit ? `${dmg}!` : `${dmg}`, crit ? "#fbbf24" : opts?.color ?? "#ffffff", crit);
  spawnParticles(c.pos, opts?.color ?? c.emissive, crit ? 16 : 8, crit ? 8 : 5);
  sfx.hit(crit);
  if (opts?.from && opts.knock) {
    const k = tmpV.copy(c.pos).sub(opts.from).setY(0).normalize().multiplyScalar(opts.knock);
    c.vel.add(k);
  }
  if (crit) {
    world.hitstopT = Math.max(world.hitstopT, 0.07);
    world.shake = Math.max(world.shake, 0.35);
  } else {
    world.shake = Math.max(world.shake, 0.12);
  }
  if (c.hp <= 0) {
    c.dead = true;
    c.deadT = 0;
    c.respawnT = c.kind === "dummy" ? 3 : -1;
    spawnParticles(c.pos, c.emissive, 26, 9, 1.4);
    spawnFloat(c.pos, "K.I.A.", "#f43f5e", true);
    world.shake = Math.max(world.shake, 0.45);
    sfx.explode();
    if (c.kind === "enemy") {
      rollDrops(c);
      const def = c.defId ? enemyXp(c.defId) : 0;
      grantXp(def);
      if (c.defId) useQuests.getState().advanceKill(c.defId);
    }
  }
}

export function damagePlayer(amount: number, from?: THREE.Vector3) {
  const p = world.player;
  if (!p.alive || p.invulnerable) return;
  let dmg = Math.max(1, Math.round(amount - p.defense));
  if (p.shield > 0) {
    const absorbed = Math.min(p.shield, dmg);
    p.shield -= absorbed;
    dmg -= absorbed;
    spawnParticles(p.pos, "#22d3ee", 8, 4, 0.9);
  }
  if (dmg > 0) {
    p.health -= dmg;
    spawnFloat(p.pos, `-${dmg}`, "#f87171");
    spawnParticles(p.pos, "#f87171", 6, 4, 0.8);
    world.hurtT = world.time;
    sfx.hurt();
  }
  world.shake = Math.max(world.shake, 0.5);
  if (p.health <= 0) {
    p.health = 0;
    p.alive = false;
    p.deathT = 0;
    spawnParticles(p.pos, "#f43f5e", 30, 9, 1.4);
    spawnFloat(p.pos, "K.O.", "#f43f5e", true);
  }
  void from;
}

export function aliveCombatants(): Combatant[] {
  return world.combatants.filter((c) => !c.dead);
}

export function ensureDummies() {
  const existing = world.combatants.filter((c) => c.kind === "dummy");
  if (existing.length > 0) return;  const spots: [number, number][] = [
    [5, 5],
    [-5, 5],
    [8, 11],
  ];
  for (const [x, z] of spots) {
    world.combatants.push({
      id: world.nextId++,
      kind: "dummy",
      defId: null,
      pos: new THREE.Vector3(x, 0, z),
      vel: new THREE.Vector3(),
      hp: 120,
      maxHp: 120,
      dead: false,
      deadT: 0,
      respawnT: 0,
      hitFlash: 0,
      scale: 1,
      color: "#1e293b",
      emissive: "#f97316",
      bobPhase: Math.random() * Math.PI * 2,
      attackT: 0,
      aiState: "idle",
      aiT: 0,
      skillT: 0,
      summonT: 0,
      volleyT: 0,
      home: new THREE.Vector3(x, 0, z),
    });
  }
  world.dummyVersion++;
}

const tmpV = new THREE.Vector3();
