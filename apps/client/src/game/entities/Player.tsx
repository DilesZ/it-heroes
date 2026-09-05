import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PLAYER_BASE, CLASSES } from "@it-heroes/shared";
import { world, insideWorld } from "../state/world";
import { input } from "../input";
import { useUi } from "../../state/uiStore";
import { isPaused } from "../../state/progressionStore";
import { sfx } from "../audio";
import { Ball, Box, Caps, Eyes } from "../art/kit";
import { BRIGHT } from "../art/palette";

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

  useFrame((_, rawDt) => {
    if (isPaused()) return;
    const dt = Math.min(rawDt, 0.05) * world.timeScale;
    const p = world.player;

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
      p.alive &&
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
      sfx.dodge();
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
      tmpVec.copy(moveVec).multiplyScalar(PLAYER_BASE.speed * p.speedBonus * (p.alive ? 1 : 0));
      p.vel.lerp(tmpVec, 1 - Math.exp(-12 * dt));
      p.state = p.vel.lengthSq() > 0.3 ? "walk" : "idle";
    }

    p.pos.addScaledVector(p.vel, dt);
    if (!insideWorld(p.pos.x, p.pos.z)) {
      p.pos.addScaledVector(p.vel, -dt);
      p.vel.multiplyScalar(0.2);
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
    const targetTilt = p.alive ? 0 : -1.35;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetTilt, 1 - Math.exp(-6 * dt));

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
      b.position.y = 0.42 - Math.sin(prog * Math.PI) * 0.15;
      b.scale.set(1, 1 - Math.sin(prog * Math.PI) * 0.15, 1);
    } else {
      b.rotation.x = THREE.MathUtils.lerp(b.rotation.x, 0, 1 - Math.exp(-14 * dt));
      b.position.y = THREE.MathUtils.lerp(
        b.position.y,
        0.42 + Math.abs(Math.sin(walkT.current * 4.5)) * 0.05 * amp,
        1 - Math.exp(-20 * dt)
      );
      b.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={group} position={[world.player.pos.x, 0, world.player.pos.z]}>
      <group ref={body} position={[0, 0.42, 0]}>
        <Caps p={[0, 0.28, 0]} r={0.21} len={0.18} color={accent} />
        <Box p={[0, 0.3, 0.19]} s={[0.2, 0.24, 0.06]} color="#f6f9ff" radius={0.02} />
        <Box p={[0, 0.32, -0.2]} s={[0.3, 0.34, 0.12]} color="#3b4763" radius={0.04} />
        <Box p={[0, 0.32, -0.27]} s={[0.18, 0.05, 0.03]} color={accent} emissive={accent} ei={1.6} outline={false} />

        <group ref={armL} position={[-0.28, 0.4, 0]}>
          <Caps p={[0, -0.12, 0]} r={0.07} len={0.16} color={accent} />
          <Ball p={[0, -0.26, 0]} r={0.075} color={BRIGHT.skin} />
        </group>
        <group ref={armR} position={[0.28, 0.4, 0]}>
          <Caps p={[0, -0.12, 0]} r={0.07} len={0.16} color={accent} />
          <Ball p={[0, -0.26, 0]} r={0.075} color={BRIGHT.skin} />
        </group>

        <group position={[0, 0.78, 0]}>
          <Ball p={[0, 0, 0]} r={0.27} color={BRIGHT.skin} detail={2} />
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.285, 14, 10, 0, Math.PI * 2, 0, 1.25]} />
            <meshStandardMaterial color="#4a3b2c" roughness={0.9} flatShading />
          </mesh>
          <Eyes p={[0, 0.0, 0.235]} s={1} />
          <mesh position={[-0.22, 0.02, 0.12]} rotation={[0, 0.5, 0]}>
            <torusGeometry args={[0.14, 0.035, 8, 16]} />
            <meshStandardMaterial color={BRIGHT.dark} roughness={0.5} />
          </mesh>
          <mesh position={[0.22, 0.02, 0.12]} rotation={[0, -0.5, 0]}>
            <torusGeometry args={[0.14, 0.035, 8, 16]} />
            <meshStandardMaterial color={BRIGHT.dark} roughness={0.5} />
          </mesh>
          <mesh position={[0.3, -0.12, 0.1]} rotation={[0.4, 0, -0.35]}>
            <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
            <meshStandardMaterial color={BRIGHT.dark} roughness={0.5} />
          </mesh>
          <Ball p={[0.24, -0.2, 0.16]} r={0.045} color={accent} emissive={accent} ei={2} outline={false} />
        </group>

        <group ref={legL} position={[-0.12, 0.1, 0]}>
          <Caps p={[0, -0.1, 0]} r={0.085} len={0.1} color="#3b4763" />
          <Box p={[0, -0.22, 0.05]} s={[0.15, 0.1, 0.24]} color={accent} radius={0.04} />
        </group>
        <group ref={legR} position={[0.12, 0.1, 0]}>
          <Caps p={[0, -0.1, 0]} r={0.085} len={0.1} color="#3b4763" />
          <Box p={[0, -0.22, 0.05]} s={[0.15, 0.1, 0.24]} color={accent} radius={0.04} />
        </group>
      </group>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
