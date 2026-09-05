import { useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { PLAYER_BASE, CLASSES } from "@it-heroes/shared";
import { world } from "../state/world";
import { input } from "../input";
import { useUi } from "../../state/uiStore";

const UP = new THREE.Vector3(0, 1, 0);
const camFwd = new THREE.Vector3();
const camRight = new THREE.Vector3();
const aimPoint = new THREE.Vector3();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const moveVec = new THREE.Vector3();
const tmpVec = new THREE.Vector3();
const mouseVec = new THREE.Vector2();

export default function Player() {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const { camera, gl, raycaster } = useThree();
  const classId = useUi((s) => s.classId);
  const accent = CLASSES[classId].color;

  const walkT = useRef(0);

  const mats = useMemo(
    () => ({
      suit: new THREE.MeshStandardMaterial({ color: "#1c2740", roughness: 0.55, metalness: 0.25 }),
      dark: new THREE.MeshStandardMaterial({ color: "#0d1526", roughness: 0.5, metalness: 0.4 }),
      accent: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4, metalness: 0.3 }),
      visor: new THREE.MeshStandardMaterial({ color: "#04101c", emissive: accent, emissiveIntensity: 2.4, roughness: 0.2 }),
      skin: new THREE.MeshStandardMaterial({ color: "#e8b98a", roughness: 0.7 }),
    }),
    [accent]
  );

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = world.player;
    world.time += dt;

    camera.getWorldDirection(camFwd);
    camFwd.y = 0;
    camFwd.normalize();
    camRight.crossVectors(camFwd, UP).normalize();

    mouseVec.set(input.mouseNdc.x, input.mouseNdc.y);
    raycaster.setFromCamera(mouseVec, camera);
    if (raycaster.ray.intersectPlane(groundPlane, aimPoint)) {
      p.facing = Math.atan2(aimPoint.x - p.pos.x, aimPoint.z - p.pos.z);
    }

    const ix =
      (input.isDown("KeyD") || input.isDown("ArrowRight") ? 1 : 0) -
      (input.isDown("KeyA") || input.isDown("ArrowLeft") ? 1 : 0);
    const iy =
      (input.isDown("KeyW") || input.isDown("ArrowUp") ? 1 : 0) -
      (input.isDown("KeyS") || input.isDown("ArrowDown") ? 1 : 0);

    moveVec.set(camRight.x * ix + camFwd.x * iy, 0, camRight.z * ix + camFwd.z * iy);
    if (moveVec.lengthSq() > 0) moveVec.normalize();

    if (
      (input.consumePress("ShiftLeft") || input.consumePress("ShiftRight") || input.consumePress("Space")) &&
      p.state !== "dodge" &&
      p.stamina >= PLAYER_BASE.dodgeStaminaCost
    ) {
      p.state = "dodge";
      p.dodgeTimer = PLAYER_BASE.dodgeDuration;
      if (moveVec.lengthSq() > 0) p.dodgeDir.copy(moveVec);
      else p.dodgeDir.set(Math.sin(p.facing), 0, Math.cos(p.facing));
      p.facing = Math.atan2(p.dodgeDir.x, p.dodgeDir.z);
      p.stamina -= PLAYER_BASE.dodgeStaminaCost;
      input.clearPresses();
    }

    if (p.state === "dodge") {
      p.dodgeTimer -= dt;
      p.vel.copy(p.dodgeDir).multiplyScalar(PLAYER_BASE.dodgeSpeed);
      p.invulnerable = p.dodgeTimer > PLAYER_BASE.dodgeDuration - PLAYER_BASE.dodgeIFrames;
      if (p.dodgeTimer <= 0) {
        p.state = "idle";
        p.invulnerable = false;
      }
    } else {
      tmpVec.copy(moveVec).multiplyScalar(PLAYER_BASE.speed * p.speedBonus);
      p.vel.lerp(tmpVec, 1 - Math.exp(-12 * dt));
      p.state = p.vel.lengthSq() > 0.3 ? "walk" : "idle";
    }

    p.pos.addScaledVector(p.vel, dt);
    const dist = Math.hypot(p.pos.x, p.pos.z);
    if (dist > world.hubBounds) {
      const s = world.hubBounds / dist;
      p.pos.x *= s;
      p.pos.z *= s;
    }

    p.stamina = Math.min(PLAYER_BASE.maxStamina, p.stamina + PLAYER_BASE.staminaRegen * dt);
    p.mana = Math.min(PLAYER_BASE.maxMana, p.mana + PLAYER_BASE.manaRegen * dt);

    const g = group.current;
    const b = body.current;
    if (!g || !b) return;
    g.position.set(p.pos.x, 0, p.pos.z);
    let yaw = g.rotation.y;
    let diff = p.facing - yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    g.rotation.y = yaw + diff * (1 - Math.exp(-18 * dt));

    const speed = p.vel.length();
    walkT.current += dt * (2.2 + speed * 0.65);
    const amp = Math.min(1, speed / 4);
    const swing = Math.sin(walkT.current * 4.5) * amp;
    if (legL.current) legL.current.rotation.x = swing * 0.75;
    if (legR.current) legR.current.rotation.x = -swing * 0.75;
    if (armL.current) armL.current.rotation.x = -swing * 0.55;
    if (armR.current) armR.current.rotation.x = swing * 0.55;

    if (p.state === "dodge") {
      const prog = 1 - p.dodgeTimer / PLAYER_BASE.dodgeDuration;
      b.rotation.x = prog * Math.PI * 2;
      b.position.y = 0.55 - Math.sin(prog * Math.PI) * 0.18;
      b.scale.set(1, 1 - Math.sin(prog * Math.PI) * 0.15, 1);
    } else {
      b.rotation.x = THREE.MathUtils.lerp(b.rotation.x, 0, 1 - Math.exp(-14 * dt));
      b.position.y = THREE.MathUtils.lerp(
        b.position.y,
        0.55 + Math.abs(Math.sin(walkT.current * 4.5)) * 0.05 * amp,
        1 - Math.exp(-20 * dt)
      );
      b.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={group} position={[world.player.pos.x, 0, world.player.pos.z]}>
      <group ref={body} position={[0, 0.55, 0]}>
        <mesh castShadow position={[0, 0.32, 0]} material={mats.suit}>
          <capsuleGeometry args={[0.21, 0.32, 6, 14]} />
        </mesh>
        <mesh castShadow position={[0, 0.38, 0.16]} material={mats.accent}>
          <boxGeometry args={[0.22, 0.3, 0.06]} />
        </mesh>
        <mesh castShadow position={[0, 0.45, -0.17]} material={mats.dark}>
          <boxGeometry args={[0.34, 0.4, 0.14]} />
        </mesh>
        <mesh position={[0, 0.45, -0.245]} material={mats.visor}>
          <planeGeometry args={[0.2, 0.06]} />
        </mesh>

        <group ref={armL} position={[-0.27, 0.48, 0]}>
          <mesh castShadow position={[0, -0.14, 0]} material={mats.suit}>
            <capsuleGeometry args={[0.06, 0.22, 4, 10]} />
          </mesh>
        </group>
        <group ref={armR} position={[0.27, 0.48, 0]}>
          <mesh castShadow position={[0, -0.14, 0]} material={mats.suit}>
            <capsuleGeometry args={[0.06, 0.22, 4, 10]} />
          </mesh>
        </group>

        <group position={[0, 0.78, 0]}>
          <mesh castShadow material={mats.skin}>
            <sphereGeometry args={[0.14, 18, 14]} />
          </mesh>
          <mesh castShadow position={[0, 0.03, 0]} material={mats.dark}>
            <sphereGeometry args={[0.155, 18, 14]} />
          </mesh>
          <mesh position={[0, 0.02, 0.13]} rotation={[0.35, 0, 0]} material={mats.visor}>
            <boxGeometry args={[0.2, 0.07, 0.05]} />
          </mesh>
        </group>

        <group ref={legL} position={[-0.11, 0.08, 0]}>
          <mesh castShadow position={[0, -0.16, 0]} material={mats.dark}>
            <capsuleGeometry args={[0.075, 0.2, 4, 10]} />
          </mesh>
          <mesh castShadow position={[0, -0.3, 0.04]} material={mats.accent}>
            <boxGeometry args={[0.12, 0.08, 0.2]} />
          </mesh>
        </group>
        <group ref={legR} position={[0.11, 0.08, 0]}>
          <mesh castShadow position={[0, -0.16, 0]} material={mats.dark}>
            <capsuleGeometry args={[0.075, 0.2, 4, 10]} />
          </mesh>
          <mesh castShadow position={[0, -0.3, 0.04]} material={mats.accent}>
            <boxGeometry args={[0.12, 0.08, 0.2]} />
          </mesh>
        </group>
      </group>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
