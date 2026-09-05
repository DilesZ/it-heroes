import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CLASSES, SKILLS, PLAYER_BASE, type SkillDef, type ClassId } from "@it-heroes/shared";
import { world, resetWorld, insideWorld, type Combatant } from "../state/world";
import { input } from "../input";
import { useUi } from "../../state/uiStore";
import { useInventory } from "../../state/inventoryStore";
import { useHud } from "../../state/hudStore";
import { computeMods, isPaused, useProgression } from "../../state/progressionStore";
import { useQuests } from "../../state/questStore";
import { resetSpawning } from "./EnemySystem";
import { initStarterKit } from "../loot";
import {
  dealDamage,
  damagePlayer,
  spawnParticles,
  spawnFloat,
  spawnProjectile,
  spawnSlash,
  spawnBlast,
  aliveCombatants,
  ensureDummies,
} from "../combat";

const mouseVec = new THREE.Vector2();
const aimPoint = new THREE.Vector3();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const toTarget = new THREE.Vector3();
const spawnPos = new THREE.Vector3();
let lastNoMana = -10;

function classSkills(classId: ClassId): [SkillDef, SkillDef, SkillDef] {
  const list = SKILLS.filter((s) => s.classId === classId);
  return [list[0], list[1], list[2]];
}

export default function CombatSystem() {
  const classId = useUi((s) => s.classId);
  const { camera, raycaster } = useThree();

  useEffect(() => {
    resetWorld();
    ensureDummies();
    resetSpawning();
    useInventory.getState().reset();
    useProgression.getState().reset();
    useQuests.getState().reset();
    initStarterKit();
    computeMods();
  }, []);

  useFrame((_, raw) => {
    if (isPaused()) return;
    const rawDt = Math.min(raw, 0.05);
    world.hitstopT = Math.max(0, world.hitstopT - rawDt);
    world.timeScale = world.hitstopT > 0 ? 0.06 : 1;
    const dt = rawDt * world.timeScale;
    world.time += dt;
    world.shake = Math.max(0, world.shake - rawDt * 2.2);

    mouseVec.set(input.mouseNdc.x, input.mouseNdc.y);
    raycaster.setFromCamera(mouseVec, camera);
    const hasAim = raycaster.ray.intersectPlane(groundPlane, aimPoint) !== null;

    const p = world.player;
    p.shieldT = Math.max(0, p.shieldT - dt);
    if (p.shieldT <= 0) p.shield = 0;
    p.hasteT = Math.max(0, p.hasteT - dt);
    p.cd.basic = Math.max(0, p.cd.basic - dt);
    p.cd.s1 = Math.max(0, p.cd.s1 - dt);
    p.cd.s2 = Math.max(0, p.cd.s2 - dt);

    const [basic, s1, s2] = classSkills(classId);
    const attack = CLASSES[classId].baseAttack + p.attackBonus;
    const magic = CLASSES[classId].baseMagic + p.magicBonus;

    if (!p.alive) {
      p.deathT += dt;
      if (p.deathT > 2.5) {
        const max = useHud.getState();
        p.alive = true;
        p.health = max.maxHp;
        p.mana = max.maxMana;
        p.stamina = PLAYER_BASE.maxStamina;
        p.pos.set(0, 0, 10);
        p.vel.set(0, 0, 0);
        p.shield = 0;
        p.shieldT = 0;
        spawnParticles(p.pos, "#22d3ee", 20, 6, 1.1);
        spawnFloat(p.pos, "REBOOT OK", "#22d3ee");
      }
    } else if (input.isMouseDown(0)) {
      if (p.cd.basic <= 0) {
        if (basic.type === "melee") tryMeleeAttack(basic, attack, p.cd);
        else tryProjectileAttack(basic, classId, p.cd, "basic");
      }
    }
    if (input.consumePress("Digit1")) {
      if (!p.alive) return;
      if (s1.id === "firewall_trap") tryTrap(s1, p.cd, aimPoint, hasAim);
      else if (s1.type === "aoe") tryAoe(s1, classId, p.cd, "s1");
      else if (s1.type === "summon") trySummon(s1, p.cd, "s1");
    }
    if (input.consumePress("Digit2")) {
      if (!p.alive) return;
      if (s2.type === "buff") tryBuff(s2, p.cd, "s2");
      else if (s2.type === "aoe") tryAoe(s2, classId, p.cd, "s2");
    }

    updateCombatants(dt);
    updateProjectiles(dt, magic);
    updateTurrets(dt, magic);
    updateTraps(dt, magic);
    updateFx(dt);
  });

  return null;
}

function rollCrit(): boolean {
  return Math.random() < 0.05 + world.player.critBonus;
}

function noMana(pos: THREE.Vector3) {
  spawnFloat(pos, "SIN MANA", "#f87171");
}

function tryMeleeAttack(basic: SkillDef, attack: number, cd: { basic: number }) {
  const p = world.player;
  if (p.mana < basic.manaCost) return;
  p.mana -= basic.manaCost;
  cd.basic = basic.cooldown * (p.hasteT > 0 ? 0.55 : 1) * p.cdMult;
  spawnSlash(p.pos, p.facing, basic.color, basic.range);
  const dmg = basic.damage * attack * p.slotDmg.basic;
  const arc = 2.1;
  for (const c of aliveCombatants()) {
    toTarget.copy(c.pos).sub(p.pos).setY(0);
    const dist = toTarget.length();
    if (dist > basic.range + 0.4 * c.scale) continue;
    let diff = Math.atan2(toTarget.x, toTarget.z) - p.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > arc / 2 && dist > 1.1) continue;
    const crit = rollCrit();
    dealDamage(c, dmg * (crit ? 2 : 1), {
      crit,
      color: basic.color,
      from: p.pos,
      knock: 4,
    });
  }
}

function tryProjectileAttack(basic: SkillDef, classId: ClassId, cd: { basic: number; s1: number; s2: number }, slot: "basic") {
  const p = world.player;
  if (p.mana < basic.manaCost) {
    if (world.time - lastNoMana > 0.8) {
      lastNoMana = world.time;
      noMana(p.pos);
    }
    return;
  }
  p.mana -= basic.manaCost;
  cd[slot] = basic.cooldown * (p.hasteT > 0 ? 0.55 : 1) * p.cdMult;
  const stat = classId === "devops" ? CLASSES[classId].baseMagic + p.magicBonus : CLASSES[classId].baseAttack + p.attackBonus;
  spawnPos.copy(p.pos);
  spawnPos.y = 1.1;
  spawnProjectile({
    pos: spawnPos,
    dir: new THREE.Vector3(Math.sin(p.facing), 0, Math.cos(p.facing)),
    speed: classId === "blueteam" ? 28 : 24,
    damage: basic.damage * stat * p.slotDmg.basic,
    color: basic.color,
  });
  spawnParticles(spawnPos, basic.color, 3, 2, 0.7);
}

function tryAoe(skill: SkillDef, classId: ClassId, cd: { basic: number; s1: number; s2: number }, slot: "s1" | "s2") {
  const p = world.player;
  if (p.mana < skill.manaCost) {
    noMana(p.pos);
    return;
  }
  p.mana -= skill.manaCost;
  cd[slot] = skill.cooldown * p.cdMult;
  const stat = classId === "devops" ? CLASSES[classId].baseMagic + p.magicBonus : CLASSES[classId].baseAttack + p.attackBonus;
  const radius = skill.radius ?? 3;
  spawnBlast(p.pos, skill.color, radius);
  spawnParticles(p.pos, skill.color, 30, 10, 1.3);
  world.shake = Math.max(world.shake, 0.5);
  const mult = p.slotDmg[slot];
  for (const c of aliveCombatants()) {
    toTarget.copy(c.pos).sub(p.pos).setY(0);
    if (toTarget.length() > radius + 0.3 * c.scale) continue;
    const crit = rollCrit();
    dealDamage(c, skill.damage * stat * mult * (crit ? 2 : 1), {
      crit,
      color: skill.color,
      from: p.pos,
      knock: 8,
    });
  }
}

function tryTrap(s1: SkillDef, cd: { basic: number; s1: number; s2: number }, aim: THREE.Vector3, hasAim: boolean) {
  const p = world.player;
  if (p.mana < s1.manaCost) {
    noMana(p.pos);
    return;
  }
  if (!hasAim) return;
  toTarget.copy(aim).sub(p.pos).setY(0);
  if (toTarget.length() > s1.range) {
    toTarget.setLength(s1.range);
    aim.copy(p.pos).add(toTarget);
  }
  if (world.traps.length >= 8) world.traps.shift();
  p.mana -= s1.manaCost;
  cd.s1 = s1.cooldown * p.cdMult;
  world.traps.push({ id: world.nextId++, pos: aim.clone().setY(0), life: 20 });
  world.trapVersion++;
  spawnParticles(aim, s1.color, 8, 3, 0.8);
}

function tryBuff(skill: SkillDef, cd: { basic: number; s1: number; s2: number }, slot: "s2") {
  const p = world.player;
  if (p.mana < skill.manaCost) {
    noMana(p.pos);
    return;
  }
  p.mana -= skill.manaCost;
  cd[slot] = skill.cooldown * p.cdMult;
  if (skill.id === "sudo_shield") {
    p.shield = Math.round(60 * p.shieldMult);
    p.shieldT = 6;
    spawnBlast(p.pos, skill.color, 2);
    spawnFloat(p.pos, "sudo shield", skill.color);
  } else {
    p.hasteT = 7 + p.hasteBonus;
    spawnParticles(p.pos, skill.color, 18, 5, 1);
    spawnFloat(p.pos, "OVERCLOCK", skill.color);
  }
}

function trySummon(skill: SkillDef, cd: { basic: number; s1: number; s2: number }, slot: "basic" | "s1" | "s2") {
  const p = world.player;
  if (p.mana < skill.manaCost) {
    noMana(p.pos);
    return;
  }
  if (world.turrets.length >= 2) {
    spawnFloat(p.pos, "MAX TURRETS", "#f87171");
    return;
  }
  p.mana -= skill.manaCost;
  cd[slot] = skill.cooldown * p.cdMult;
  spawnPos.set(Math.sin(p.facing) * 1.6, 0, Math.cos(p.facing) * 1.6).add(p.pos);
  world.turrets.push({ id: world.nextId++, pos: spawnPos.clone(), life: 25, shotT: 0.4 });
  world.turretVersion++;
  spawnParticles(spawnPos, skill.color, 14, 4, 1);
  spawnFloat(spawnPos, "TURRET ON", skill.color);
}

function updateCombatants(dt: number) {
  for (const c of world.combatants) {
    if (c.dead) {
      c.deadT += dt;
      if (c.respawnT > 0) {
        c.respawnT -= dt;
        if (c.respawnT <= 0) {
          c.dead = false;
          c.hp = c.maxHp;
          c.vel.set(0, 0, 0);
          spawnParticles(c.pos, c.emissive, 10, 4, 1);
        }
      }
      continue;
    }
    c.hitFlash = Math.max(0, c.hitFlash - dt);
    c.vel.multiplyScalar(Math.exp(-6 * dt));
    c.pos.addScaledVector(c.vel, dt);
  }
  const before = world.combatants.length;
  for (let i = world.combatants.length - 1; i >= 0; i--) {
    const c = world.combatants[i];
    if (c.kind === "dummy") continue;
    if (c.dead && c.respawnT < 0 && c.deadT > 1.2) world.combatants.splice(i, 1);
  }
  if (world.combatants.length !== before) world.enemyVersion++;
}

function updateProjectiles(dt: number, magic: number) {
  for (const pr of world.projectiles) {
    if (!pr.alive) continue;
    pr.life -= dt;
    if (pr.life <= 0) {
      pr.alive = false;
      continue;
    }
    pr.pos.addScaledVector(pr.dir, pr.speed * dt);
    if (!insideWorld(pr.pos.x, pr.pos.z, 8)) {
      pr.alive = false;
      continue;
    }
    if (!pr.fromPlayer) {
      toTarget.copy(world.player.pos).sub(pr.pos).setY(0);
      if (world.player.alive && toTarget.length() < 0.7) {
        damagePlayer(pr.damage, pr.pos);
        spawnParticles(pr.pos, pr.color, 6, 4, 0.8);
        pr.alive = false;
      }
      continue;
    }
    for (const c of aliveCombatants()) {
      toTarget.copy(c.pos).sub(pr.pos).setY(0);
      if (toTarget.length() < 0.45 * c.scale + 0.35) {
        const crit = rollCrit();
        dealDamage(c, pr.damage * (crit ? 2 : 1), { crit, color: pr.color });
        pr.alive = false;
        break;
      }
    }
  }
  void magic;
}

function updateTurrets(dt: number, magic: number) {
  for (let i = world.turrets.length - 1; i >= 0; i--) {
    const t = world.turrets[i];
    t.life -= dt;
    if (t.life <= 0) {
      spawnParticles(t.pos, "#a78bfa", 10, 4, 1);
      world.turrets.splice(i, 1);
      world.turretVersion++;
      continue;
    }
    t.shotT -= dt;
    if (t.shotT > 0) continue;
    let best: Combatant | null = null;
    let bestDist = 13;
    for (const c of aliveCombatants()) {
      const d = toTarget.copy(c.pos).sub(t.pos).setY(0).length();
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    if (!best) continue;
    t.shotT = 0.55;
    spawnPos.copy(t.pos);
    spawnPos.y = 1.3;
    toTarget.copy((best as Combatant).pos).sub(t.pos).setY(0).normalize();
    spawnProjectile({
      pos: spawnPos,
      dir: toTarget,
      speed: 26,
      damage: (0.6 * magic + 2) * world.player.slotDmg.s2,
      color: "#a78bfa",
      life: 1.2,
    });
  }
}

function updateTraps(dt: number, magic: number) {
  void magic;
  for (let i = world.traps.length - 1; i >= 0; i--) {
    const trap = world.traps[i];
    trap.life -= dt;
    if (trap.life <= 0) {
      world.traps.splice(i, 1);
      world.trapVersion++;
      continue;
    }
    let triggered = false;
    for (const c of aliveCombatants()) {
      if (toTarget.copy(c.pos).sub(trap.pos).setY(0).length() < 1.5) {
        triggered = true;
        break;
      }
    }
    if (!triggered) continue;
    world.traps.splice(i, 1);
    world.trapVersion++;
    spawnBlast(trap.pos, "#10b981", 2.8);
    spawnParticles(trap.pos, "#10b981", 26, 9, 1.2);
    world.shake = Math.max(world.shake, 0.4);
    for (const c of aliveCombatants()) {
      if (toTarget.copy(c.pos).sub(trap.pos).setY(0).length() > 3) continue;
      const crit = rollCrit();
      dealDamage(c, 1.8 * (world.player.magicBonus + 7) * world.player.slotDmg.s1 * (crit ? 2 : 1), {
        crit,
        color: "#10b981",
        from: trap.pos,
        knock: 6,
      });
    }
  }
}

function updateFx(dt: number) {
  for (const pr of world.projectiles) if (!pr.alive) pr.pos.set(0, -50, 0);
  for (const pt of world.particles) {
    if (!pt.alive) continue;
    pt.life -= dt;
    if (pt.life <= 0) {
      pt.alive = false;
      continue;
    }
    pt.pos.addScaledVector(pt.vel, dt);
    pt.vel.y -= 6 * dt;
  }
  for (const f of world.floats) {
    if (!f.alive) continue;
    f.t += dt;
    if (f.t >= f.dur) {
      f.alive = false;
      continue;
    }
    f.pos.y += 1.5 * dt;
  }
  for (const s of world.slashes) if (s.t > 0) s.t = Math.max(0, s.t - dt * 5.5);
  for (const b of world.blasts) if (b.t > 0) b.t = Math.max(0, b.t - dt * 2.4);
}
