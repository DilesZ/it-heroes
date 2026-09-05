import * as THREE from "three";
import { PLAYER_BASE } from "@it-heroes/shared";

export type PlayerState = "idle" | "walk" | "dodge";

export const world = {
  time: 0,
  hubBounds: 38,
  player: {
    pos: new THREE.Vector3(0, 0, 10),
    vel: new THREE.Vector3(),
    facing: Math.PI,
    state: "idle" as PlayerState,
    health: PLAYER_BASE.maxHealth,
    mana: PLAYER_BASE.maxMana,
    stamina: PLAYER_BASE.maxStamina,
    dodgeTimer: 0,
    dodgeDir: new THREE.Vector3(0, 0, -1),
    invulnerable: false,
    speedBonus: 1,
    attackBonus: 0,
    defense: 0,
  },
};

export function resetPlayer() {
  const p = world.player;
  p.pos.set(0, 0, 10);
  p.vel.set(0, 0, 0);
  p.state = "idle";
  p.health = PLAYER_BASE.maxHealth;
  p.mana = PLAYER_BASE.maxMana;
  p.stamina = PLAYER_BASE.maxStamina;
  p.dodgeTimer = 0;
  p.invulnerable = false;
}
