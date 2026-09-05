import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { SKILLS, type ClassId } from "@it-heroes/shared";
import HubScene from "./world/HubScene";
import Player from "./entities/Player";
import Dummies from "./entities/Dummies";
import Projectiles from "./entities/Projectiles";
import Particles from "./entities/Particles";
import FloatingTexts from "./entities/FloatingTexts";
import { Slashes, Blasts } from "./entities/Fx";
import { Turrets, Traps } from "./entities/Summons";
import CombatSystem from "./systems/CombatSystem";
import EnemySystem from "./systems/EnemySystem";
import Enemies from "./entities/Enemies";
import Hud from "../ui/Hud";
import { initInput } from "./input";
import { world } from "./state/world";
import { useHud } from "../state/hudStore";
import { useUi } from "../state/uiStore";

export default function Game() {
  const container = useRef<HTMLDivElement>(null);
  const setScreen = useUi((s) => s.setScreen);

  useEffect(() => {
    if (container.current) return initInput(container.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") setScreen("menu");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setScreen]);

  return (
    <div ref={container} className="relative h-full w-full">
      <Canvas
        orthographic
        camera={{ position: [18, 22, 18], zoom: 42, near: 0.1, far: 200 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#070b16"]} />
        <fog attach="fog" args={["#070b16", 30, 85]} />
        <Suspense fallback={null}>
          <CameraRig />
          <CombatSystem />
          <EnemySystem />
          <HubScene />
          <Player />
          <Dummies />
          <Enemies />
          <Projectiles />
          <Particles />
          <Slashes />
          <Blasts />
          <Turrets />
          <Traps />
          <FloatingTexts />
          <HudSync />
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={0.9}
              luminanceThreshold={0.35}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.18} darkness={0.75} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <Hud />
    </div>
  );
}

const camOffset = new THREE.Vector3(18, 22, 18);
const lookTarget = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const shakeVec = new THREE.Vector3();

function CameraRig() {
  const { camera } = useThree();
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = world.player.pos;
    tmpTarget.set(p.x, p.y + 0.8, p.z);
    camera.position.lerp(tmpTarget.clone().add(camOffset), 1 - Math.exp(-6 * dt));
    lookTarget.lerp(tmpTarget, 1 - Math.exp(-8 * dt));
    if (world.shake > 0.001) {
      const t = state.clock.elapsedTime * 60;
      const s = world.shake * 0.5;
      shakeVec.set(
        Math.sin(t * 1.3) * s,
        Math.sin(t * 1.7 + 2) * s * 0.6,
        Math.cos(t * 1.1) * s
      );
    } else {
      shakeVec.set(0, 0, 0);
    }
    camera.position.add(shakeVec);
    camera.lookAt(lookTarget);
  });
  return null;
}

function classSkills(classId: ClassId) {
  return SKILLS.filter((s) => s.classId === classId);
}

function HudSync() {
  const acc = useRef(0);
  const setVitals = useHud((s) => s.setVitals);
  const setCds = useHud((s) => s.setCds);
  const setDead = useHud((s) => s.setDead);
  const setBoss = useHud((s) => s.setBoss);
  const classId = useUi((s) => s.classId);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 0.1) return;
    acc.current = 0;
    const p = world.player;
    setVitals(p.health, p.mana, p.stamina);
    setDead(!p.alive);
    const boss = world.combatants.find((c) => c.kind === "enemy" && c.defId === "bsod_lord");
    if (boss && (boss.aiState !== "sleep" || boss.dead)) {
      setBoss(Math.max(0, boss.hp / boss.maxHp), "enemies.bsod_lord");
    } else {
      setBoss(-1, "");
    }
    const skills = classSkills(classId);
    setCds(
      skills[0] ? p.cd.basic / Math.max(0.01, skills[0].cooldown) : 0,
      skills[1] ? p.cd.s1 / Math.max(0.01, skills[1].cooldown) : 0,
      skills[2] ? p.cd.s2 / Math.max(0.01, skills[2].cooldown) : 0,
      p.shield > 0,
      p.hasteT > 0
    );
  });
  return null;
}
