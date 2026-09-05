import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENEMIES, type EnemyDef } from "@it-heroes/shared";
import { world, insideWorld, zoneOf, type Combatant } from "../state/world";
import { isPaused } from "../../state/progressionStore";
import {
  damagePlayer,
  spawnParticles,
  spawnFloat,
  spawnProjectile,
  spawnBlast,
} from "../combat";
import { sfx } from "../audio";

const toPlayer = new THREE.Vector3();
const tmpDir = new THREE.Vector3();
const spawnAt = new THREE.Vector3();

const DEF_BY_ID: Record<string, EnemyDef> = Object.fromEntries(
  ENEMIES.map((d) => [d.id, d])
);

export function defOf(c: Combatant): EnemyDef | null {
  return c.defId ? DEF_BY_ID[c.defId] ?? null : null;
}

const ZONE_POOLS: Record<string, string[]> = {
  hub: ["bug", "bug", "trojan", "spyware", "trojan", "bug", "spyware"],
  corridorA: ["bug", "trojan", "worm"],
  cables: ["worm", "worm", "rootkit", "botnet", "botnet", "rootkit", "worm"],
  corridorB: ["rootkit", "botnet", "firewall"],
  cloud: ["firewall", "firewall", "rootkit", "botnet", "spyware", "firewall"],
};

const BOSS_ARENAS: { defId: string; x: number; z: number }[] = [
  { defId: "bsod_lord", x: 0, z: -22 },
  { defId: "worm_queen", x: 0, z: -105 },
  { defId: "mainframe", x: 0, z: -195 },
];

export function spawnBosses() {
  for (const a of BOSS_ARENAS) {
    const existing = world.combatants.find((c) => c.defId === a.defId);
    if (existing) continue;
    const c = spawnEnemy(a.defId, a.x, a.z, 1, 1);
    c.respawnT = 45;
  }
}

export function spawnEnemy(defId: string, x: number, z: number, hpMult = 1, dmgMult = 1): Combatant {
  const def = DEF_BY_ID[defId];
  const c: Combatant = {
    id: world.nextId++,
    kind: "enemy",
    defId,
    pos: new THREE.Vector3(x, 0, z),
    vel: new THREE.Vector3(),
    hp: def.health * hpMult,
    maxHp: def.health * hpMult,
    dead: false,
    deadT: 0,
    respawnT: -1,
    hitFlash: 0,
    scale: def.scale * (def.isBoss ? 1 : 0.9 + Math.random() * 0.2),
    color: def.color,
    emissive: def.emissive,
    bobPhase: Math.random() * Math.PI * 2,
    attackT: 0,
    aiState: def.isBoss ? "sleep" : "idle",
    aiT: Math.random() * 0.5,
    skillT: 3,
    summonT: 8,
    volleyT: 3,
    home: new THREE.Vector3(x, 0, z),
  };
  c.vel.set(0, 0, 0);
  void dmgMult;
  world.combatants.push(c);
  world.enemyVersion++;
  return c;
}

export function spawnBoss() {
  spawnBosses();
  return world.combatants.find((c) => c.defId === "bsod_lord");
}

let rotIndex = 0;
let elapsed = 0;

export function resetSpawning() {
  rotIndex = 0;
  elapsed = 0;
  spawnTick = 0;
}

export default function EnemySystem() {
  useFrame((_, raw) => {
    if (isPaused()) return;
    const dt = Math.min(raw, 0.05) * world.timeScale;
    if (dt <= 0) return;
    elapsed += dt;

    const enemies = world.combatants.filter((c) => c.kind === "enemy");
    const maxAlive = Math.min(9, 4 + Math.floor(elapsed / 60));
    const awake = enemies.filter((c) => !c.dead && !DEF_BY_ID[c.defId!]?.isBoss);

    if (awake.length < maxAlive && elapsed > 3) {
      spawnTick++;
      if (spawnTick > 90) {
        spawnTick = 0;
        const ppos = world.player.pos;
        const zone = zoneOf(ppos.x, ppos.z) ?? "hub";
        const pool = ZONE_POOLS[zone] ?? ZONE_POOLS.hub;
        const defId = pool[rotIndex++ % pool.length];
        const mult = 1 + elapsed / 300 + (zone === "cloud" ? 0.5 : zone === "cables" ? 0.25 : 0);
        for (let tries = 0; tries < 8; tries++) {
          const a = Math.random() * Math.PI * 2;
          const r = 16 + Math.random() * 8;
          const sx = ppos.x + Math.cos(a) * r;
          const sz = ppos.z + Math.sin(a) * r;
          if (insideWorld(sx, sz, -1)) {
            spawnEnemy(defId, sx, sz, mult, mult);
            break;
          }
        }
      }
    }

    if (elapsed > 20) spawnBosses();

    for (const c of enemies) {
      const def = DEF_BY_ID[c.defId!];
      if (!def) continue;
      if (def.isBoss) updateBoss(c, def, dt);
      else updateEnemy(c, def, dt);
    }

    separate(enemies, dt);

    for (const c of enemies) {
      if (!insideWorld(c.pos.x, c.pos.z)) {
        c.pos.copy(c.home);
        c.vel.set(0, 0, 0);
      }
    }
  });
  return null;
}

let spawnTick = 0;

function updateEnemy(c: Combatant, def: EnemyDef, dt: number) {
  if (c.dead) return;
  const p = world.player;
  c.aiT -= dt;

  toPlayer.copy(p.pos).sub(c.pos).setY(0);
  const dist = toPlayer.length();

  switch (c.aiState) {
    case "idle":
      if (p.alive && dist < def.aggroRange) {
        c.aiState = "chase";
        break;
      }
      tmpDir.copy(c.home).sub(c.pos).setY(0);
      if (tmpDir.length() > 2) {
        tmpDir.normalize();
        c.vel.lerp(tmpDir.multiplyScalar(def.speed * 0.4), 1 - Math.exp(-4 * dt));
      } else {
        c.vel.multiplyScalar(Math.exp(-3 * dt));
      }
      break;
    case "chase": {
      if (!p.alive) {
        c.aiState = "idle";
        break;
      }
      if (dist > def.aggroRange * 1.6) {
        c.aiState = "idle";
        break;
      }
      tmpDir.copy(toPlayer).normalize();
      if (def.ranged && dist < def.attackRange * 0.6) tmpDir.multiplyScalar(-1);
      const want = def.ranged && dist < def.attackRange && dist > def.attackRange * 0.6 ? 0 : def.speed;
      c.vel.lerp(tmpDir.multiplyScalar(want), 1 - Math.exp(-5 * dt));
      if (dist <= def.attackRange) {
        c.aiState = "windup";
        c.aiT = def.ranged ? 0.6 : 0.45;
      }
      break;
    }
    case "windup":
      c.vel.multiplyScalar(Math.exp(-8 * dt));
      if (c.aiT <= 0) {
        if (def.ranged) {
          spawnAt.copy(c.pos);
          spawnAt.y = 1.4;
          tmpDir.copy(p.pos).sub(c.pos).setY(0).normalize();
          spawnProjectile({
            pos: spawnAt,
            dir: tmpDir,
            speed: 13,
            damage: def.damage,
            color: def.emissive,
            life: 3,
            fromPlayer: false,
          });
          spawnParticles(spawnAt, def.emissive, 4, 2, 0.7);
        } else if (dist <= def.attackRange + 0.8 && p.alive) {
          damagePlayer(def.damage, c.pos);
        }
        c.aiState = "cooldown";
        c.aiT = def.attackCooldown;
      }
      break;
    case "cooldown":
      c.vel.multiplyScalar(Math.exp(-6 * dt));
      if (c.aiT <= 0) c.aiState = "chase";
      break;
    default:
      c.aiState = "idle";
      break;
  }
}

function updateBoss(c: Combatant, def: EnemyDef, dt: number) {
  if (c.dead) {
    c.respawnT = 45;
    return;
  }
  const p = world.player;
  c.aiT -= dt;
  c.skillT -= dt;
  c.summonT -= dt;
  c.volleyT -= dt;
  c.respawnT = 45;

  const cfg = BOSS_CFG[c.defId!] ?? BOSS_CFG.bsod_lord;
  toPlayer.copy(p.pos).sub(c.pos).setY(0);
  const dist = toPlayer.length();
  const frac = c.hp / c.maxHp;
  const phase = frac > 0.66 ? 1 : frac > 0.33 ? 2 : 3;

  switch (c.aiState) {
    case "sleep":
      c.vel.multiplyScalar(Math.exp(-4 * dt));
      if (p.alive && dist < 14) {
        c.aiState = "chase";
        c.skillT = 3;
        c.summonT = 6;
        c.volleyT = 2.5;
        spawnBlast(c.pos, def.emissive, 6);
        spawnParticles(c.pos, def.emissive, 40, 10, 1.5);
        spawnFloat(c.pos, bossTitle(c.defId!), def.emissive, true);
        world.shake = 1;
        world.hitstopT = Math.max(world.hitstopT, 0.12);
        sfx.roar();
      }
      break;
    case "chase": {
      if (!p.alive) {
        c.vel.multiplyScalar(Math.exp(-4 * dt));
        break;
      }
      tmpDir.copy(toPlayer).normalize();
      c.vel.lerp(tmpDir.multiplyScalar(def.speed * (phase === 3 ? 1.35 : 1)), 1 - Math.exp(-4 * dt));
      if (dist <= def.attackRange) {
        c.aiState = "windup";
        c.aiT = 0.5;
        break;
      }
      if (phase >= 2 && c.skillT <= 0 && dist < 16) {
        c.aiState = "slamTel";
        c.aiT = 1.0;
        c.vel.set(0, 0, 0);
        spawnFloat(c.pos, "!!", "#fbbf24", true);
      }
      if (cfg.volley && phase >= 2 && c.volleyT <= 0 && dist < 20) {
        c.volleyT = 3.2;
        const baseA = Math.atan2(toPlayer.x, toPlayer.z);
        for (const off of [-0.18, 0, 0.18]) {
          spawnAt.copy(c.pos);
          spawnAt.y = 2.2;
          tmpDir.set(Math.sin(baseA + off), 0, Math.cos(baseA + off));
          spawnProjectile({
            pos: spawnAt,
            dir: tmpDir,
            speed: 12,
            damage: def.damage * 0.7,
            color: def.emissive,
            life: 3,
            fromPlayer: false,
          });
        }
        spawnParticles(c.pos, def.emissive, 8, 4, 1);
      }
      if (phase >= (cfg.earlySummon ? 2 : 3) && c.summonT <= 0 && cfg.summonId) {
        c.summonT = cfg.summonEvery;
        const minions = world.combatants.filter((x) => x.kind === "enemy" && !x.dead && x.defId === cfg.summonId).length;
        if (minions < cfg.summonCap) {
          for (let i = 0; i < cfg.summonN; i++) {
            const a = Math.random() * Math.PI * 2;
            spawnEnemy(cfg.summonId, c.pos.x + Math.cos(a) * 3, c.pos.z + Math.sin(a) * 3, 1, 1);
          }
          spawnFloat(c.pos, "SPAWN", def.emissive);
        }
      }
      break;
    }
    case "windup":
      c.vel.multiplyScalar(Math.exp(-8 * dt));
      if (c.aiT <= 0) {
        if (dist <= def.attackRange + 0.9 && p.alive) damagePlayer(def.damage, c.pos);
        spawnSlashAt(c.pos, Math.atan2(toPlayer.x, toPlayer.z), def.emissive, def.attackRange + 1);
        c.aiState = "cooldown";
        c.aiT = def.attackCooldown * (phase === 3 ? 0.6 : 1);
      }
      break;
    case "slamTel":
      if (c.aiT <= 0) {
        spawnBlast(c.pos, def.emissive, cfg.slamR);
        spawnParticles(c.pos, def.emissive, 45, 12, 1.6);
        world.shake = 1;
        world.hitstopT = Math.max(world.hitstopT, 0.1);
        sfx.explode();
        if (p.alive) {
          toPlayer.copy(p.pos).sub(c.pos).setY(0);
          if (toPlayer.length() < cfg.slamR + 0.3) damagePlayer(def.damage * cfg.slamMult, c.pos);
        }
        c.aiState = "cooldown";
        c.aiT = 0.8;
        c.skillT = 4.5;
      }
      break;
    case "cooldown":
      c.vel.multiplyScalar(Math.exp(-5 * dt));
      if (c.aiT <= 0) c.aiState = "chase";
      break;
    default:
      c.aiState = "chase";
      break;
  }
}

const BOSS_CFG: Record<
  string,
  { slamR: number; slamMult: number; summonId: string; summonN: number; summonCap: number; summonEvery: number; earlySummon: boolean; volley: boolean }
> = {
  bsod_lord: { slamR: 5.5, slamMult: 1.4, summonId: "", summonN: 0, summonCap: 0, summonEvery: 99, earlySummon: false, volley: false },
  worm_queen: { slamR: 4.5, slamMult: 1.5, summonId: "botnet", summonN: 3, summonCap: 5, summonEvery: 12, earlySummon: true, volley: false },
  mainframe: { slamR: 6.5, slamMult: 1.6, summonId: "firewall", summonN: 1, summonCap: 2, summonEvery: 14, earlySummon: true, volley: true },
};

function bossTitle(defId: string): string {
  if (defId === "worm_queen") return "WORM QUEEN";
  if (defId === "mainframe") return "MAINFRAME";
  return "BSOD LORD";
}

function spawnSlashAt(pos: THREE.Vector3, facing: number, color: string, radius: number) {
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

function separate(enemies: Combatant[], dt: number) {
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (a.dead) continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j];
      if (b.dead) continue;
      tmpDir.copy(b.pos).sub(a.pos).setY(0);
      const d = tmpDir.length();
      const min = 0.9 * (a.scale + b.scale) * 0.5 + 0.4;
      if (d > 0.001 && d < min) {
        tmpDir.normalize().multiplyScalar(((min - d) * 3 * dt) / Math.max(0.05, dt * 60));
        a.pos.addScaledVector(tmpDir, -1);
        b.pos.addScaledVector(tmpDir, 1);
      }
    }
  }
}
