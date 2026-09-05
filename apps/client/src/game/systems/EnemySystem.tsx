import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENEMIES, type EnemyDef } from "@it-heroes/shared";
import { world, type Combatant } from "../state/world";
import { isPaused } from "../../state/progressionStore";
import {
  damagePlayer,
  spawnParticles,
  spawnFloat,
  spawnProjectile,
  spawnBlast,
} from "../combat";

const toPlayer = new THREE.Vector3();
const tmpDir = new THREE.Vector3();
const spawnAt = new THREE.Vector3();

const DEF_BY_ID: Record<string, EnemyDef> = Object.fromEntries(
  ENEMIES.map((d) => [d.id, d])
);

export function defOf(c: Combatant): EnemyDef | null {
  return c.defId ? DEF_BY_ID[c.defId] ?? null : null;
}

const ROTATION: string[] = ["bug", "bug", "trojan", "spyware", "trojan", "bug", "spyware"];
let rotIndex = 0;
let elapsed = 0;

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
    home: new THREE.Vector3(x, 0, z),
  };
  c.vel.set(0, 0, 0);
  void dmgMult;
  world.combatants.push(c);
  world.enemyVersion++;
  return c;
}

export function spawnBoss() {
  const existing = world.combatants.find((c) => c.defId === "bsod_lord");
  if (existing) return existing;
  const c = spawnEnemy("bsod_lord", 0, -22, 1, 1);
  c.respawnT = 45;
  return c;
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
        const defId = ROTATION[rotIndex++ % ROTATION.length];
        const a = Math.random() * Math.PI * 2;
        const r = 26 + Math.random() * 6;
        const mult = 1 + elapsed / 300;
        spawnEnemy(defId, Math.cos(a) * r, Math.sin(a) * r, mult, mult);
      }
    }

    if (elapsed > 20) spawnBoss();

    for (const c of enemies) {
      const def = DEF_BY_ID[c.defId!];
      if (!def) continue;
      if (def.isBoss) updateBoss(c, def, dt);
      else updateEnemy(c, def, dt);
    }

    separate(enemies, dt);

    for (const c of enemies) {
      const d = Math.hypot(c.pos.x, c.pos.z);
      if (d > world.hubBounds) {
        const s = world.hubBounds / d;
        c.pos.x *= s;
        c.pos.z *= s;
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
  c.respawnT = 45;

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
        spawnBlast(c.pos, def.emissive, 6);
        spawnParticles(c.pos, def.emissive, 40, 10, 1.5);
        spawnFloat(c.pos, "BSOD LORD", def.emissive, true);
        world.shake = 1;
        world.hitstopT = Math.max(world.hitstopT, 0.12);
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
      if (phase >= 3 && c.summonT <= 0) {
        c.summonT = 9;
        const minions = world.combatants.filter((x) => x.kind === "enemy" && !x.dead && x.defId === "bug").length;
        if (minions < 4) {
          for (let i = 0; i < 2; i++) {
            const a = Math.random() * Math.PI * 2;
            spawnEnemy("bug", c.pos.x + Math.cos(a) * 3, c.pos.z + Math.sin(a) * 3, 1, 1);
          }
          spawnFloat(c.pos, "SPAWN BUGS", def.emissive);
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
        spawnBlast(c.pos, def.emissive, 5.5);
        spawnParticles(c.pos, def.emissive, 45, 12, 1.6);
        world.shake = 1;
        world.hitstopT = Math.max(world.hitstopT, 0.1);
        if (p.alive) {
          toPlayer.copy(p.pos).sub(c.pos).setY(0);
          if (toPlayer.length() < 5.8) damagePlayer(def.damage * 1.4, c.pos);
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
