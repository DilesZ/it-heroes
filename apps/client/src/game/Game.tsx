import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Cloud, Environment, Lightformer, Sky } from "@react-three/drei";
import * as THREE from "three";
import { SKILLS, type ClassId } from "@it-heroes/shared";
import HubScene from "./world/HubScene";
import Biomes from "./world/Biomes";
import Player from "./entities/Player";
import Dummies from "./entities/Dummies";
import Projectiles from "./entities/Projectiles";
import Particles from "./entities/Particles";
import FloatingTexts from "./entities/FloatingTexts";
import { Slashes, Blasts, Beams } from "./entities/Fx";
import { Turrets, Traps } from "./entities/Summons";
import CombatSystem from "./systems/CombatSystem";
import EnemySystem from "./systems/EnemySystem";
import LootSystem from "./systems/LootSystem";
import NpcSystem from "./systems/NpcSystem";
import Enemies from "./entities/Enemies";
import LootDrops from "./entities/LootDrops";
import Npcs from "./entities/Npcs";
import Inventory from "../ui/Inventory";
import SkillTree from "../ui/SkillTree";
import Forge from "../ui/Forge";
import PauseMenu from "../ui/PauseMenu";
import BoonDraft from "../ui/BoonDraft";
import Dialog from "../ui/Dialog";
import Hud from "../ui/Hud";
import { initInput } from "./input";
import { world } from "./state/world";
import { useHud } from "../state/hudStore";
import { useUi } from "../state/uiStore";
import { useInventory } from "../state/inventoryStore";
import { useProgression } from "../state/progressionStore";
import { useQuests } from "../state/questStore";
import { useSettings } from "../state/settingsStore";
import { saveGame } from "../state/save";
import { setCombatMusic } from "./audio";

export default function Game() {
  const container = useRef<HTMLDivElement>(null);
  const setScreen = useUi((s) => s.setScreen);
  const invOpen = useInventory((s) => s.invOpen);
  const treeOpen = useProgression((s) => s.treeOpen);
  const forgeOpen = useInventory((s) => s.forgeOpen);
  const paused = useUi((s) => s.paused);
  const quality = useSettings((s) => s.quality);

  useEffect(() => {
    if (container.current) return initInput(container.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        const prog = useProgression.getState();
        const inv = useInventory.getState();
        const ui = useUi.getState();
        if (prog.draftOpen) return;
        if (inv.forgeOpen) inv.setForgeOpen(false);
        else if (prog.treeOpen) prog.setTreeOpen(false);
        else if (inv.invOpen) inv.setInvOpen(false);
        else if (useQuests.getState().dialogNpc) return;
        else ui.setPaused(!ui.paused);
      }
      if (e.code === "KeyI" || e.code === "Tab") {
        const inv = useInventory.getState();
        inv.setInvOpen(!inv.invOpen);
      }
      if (e.code === "KeyK") {
        const prog = useProgression.getState();
        prog.setTreeOpen(!prog.treeOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setScreen]);

  return (
    <div ref={container} className="relative h-full w-full">
      <Canvas
        key={quality}
        orthographic
        camera={{ position: [18, 22, 18], zoom: 42, near: 0.1, far: 200 }}
        shadows={quality !== "low"}
        dpr={quality === "high" ? [1, 2] : 1}
        gl={{ antialias: quality !== "low", powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#6fb3ec"]} />
        <fog attach="fog" args={["#8fb4dd", 34, 95]} />
        <Suspense fallback={null}>
          <DaylightRig />
          <CameraRig />
          <CombatSystem />
          <EnemySystem />
          <LootSystem />
          <NpcSystem />
          <HubScene />
          <Biomes />
          <Player />
          <Dummies />
          <Enemies />
          <Npcs />
          <LootDrops />
          <Projectiles />
          <Particles />
          <Slashes />
          <Blasts />
          <Beams />
          <Turrets />
          <Traps />
          <FloatingTexts />
          <HudSync />
          {quality !== "low" && (
            <EffectComposer multisampling={quality === "high" ? 4 : 0}>
              <Bloom
                intensity={0.45}
                luminanceThreshold={0.62}
                luminanceSmoothing={0.25}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.28} darkness={0.42} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
      <Hud />
      {invOpen && <Inventory />}
      {treeOpen && <SkillTree />}
      {forgeOpen && <Forge />}
      {paused && <PauseMenu />}
      <BoonDraft />
      <Dialog />
    </div>
  );
}

const camOffset = new THREE.Vector3(18, 22, 18);
const lookTarget = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const shakeVec = new THREE.Vector3();

function DaylightRig() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = 1.0;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);
  return (
    <group>
      <hemisphereLight args={["#cfe8ff", "#8a7f70", 0.55]} />
      <directionalLight
        position={[16, 26, 10]}
        intensity={1.25}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
        shadow-bias={-0.0003}
        shadow-normalBias={0.4}
      />
      <directionalLight position={[-14, 10, -18]} intensity={0.35} color="#bcd6ff" />
      <Sky distance={4000} sunPosition={[60, 42, 20]} turbidity={6} rayleigh={1.2} />
      <Cloud position={[0, 44, -150]} speed={0.25} opacity={0.65} segments={14} bounds={[90, 6, 30]} color="#ffffff" />
      <Cloud position={[-40, 48, -220]} speed={0.18} opacity={0.6} segments={12} bounds={[70, 5, 30]} color="#f2e9ff" />
      <Environment resolution={64}>
        <Lightformer intensity={0.9} position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 12, 1]} color="#e8f4ff" />
        <Lightformer intensity={0.4} position={[-6, 3, -2]} rotation={[0, Math.PI / 2, 0]} scale={[10, 4, 1]} color="#cfe0ff" />
        <Lightformer intensity={0.4} position={[6, 3, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 4, 1]} color="#ffe9d2" />
      </Environment>
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();
  const shakeOn = useSettings((s) => s.shake);
  const ortho = camera as THREE.OrthographicCamera;
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = world.player.pos;
    tmpTarget.set(p.x, p.y + 0.8, p.z);
    camera.position.lerp(tmpTarget.clone().add(camOffset), 1 - Math.exp(-6 * dt));
    lookTarget.lerp(tmpTarget, 1 - Math.exp(-8 * dt));
    const targetZoom = 42 - world.zoomPunch * 7;
    if (Math.abs(ortho.zoom - targetZoom) > 0.01) {
      ortho.zoom += (targetZoom - ortho.zoom) * (1 - Math.exp(-5 * dt));
      ortho.updateProjectionMatrix();
    }
    if (shakeOn && world.shake > 0.001) {
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
  const list = SKILLS.filter((s) => s.classId === classId);
  const by = (slot: "basic" | "s1" | "s2" | "sp") => list.find((s) => s.slot === slot);
  return [by("basic"), by("s1"), by("s2"), by("sp")];
}

function comboMultUi(): number {
  const n = world.comboN;
  if (n >= 50) return 1.5;
  if (n >= 25) return 1.25;
  if (n >= 10) return 1.1;
  return 1;
}

function HudSync() {
  const acc = useRef(0);
  const saveAcc = useRef(0);
  const setVitals = useHud((s) => s.setVitals);
  const setCds = useHud((s) => s.setCds);
  const setDead = useHud((s) => s.setDead);
  const setBoss = useHud((s) => s.setBoss);
  const setHurt = useHud((s) => s.setHurt);
  const setCombo = useHud((s) => s.setCombo);
  const classId = useUi((s) => s.classId);
  useFrame((_, dt) => {
    acc.current += dt;
    saveAcc.current += dt;
    if (saveAcc.current > 30) {
      saveAcc.current = 0;
      saveGame();
    }
    if (acc.current < 0.1) return;
    acc.current = 0;
    const p = world.player;
    setVitals(p.health, p.mana, p.stamina);
    setDead(!p.alive);
    setHurt(world.time - world.hurtT < 0.35);
    const inCombat = world.combatants.some((c) => c.kind === "enemy" && !c.dead);
    setCombatMusic(inCombat);
    const bossDefs: Record<string, string> = {
      bsod_lord: "enemies.bsod_lord",
      worm_queen: "enemies.worm_queen",
      mainframe: "enemies.mainframe",
    };
    let shown = false;
    for (const c of world.combatants) {
      if (c.kind !== "enemy" || !c.defId || !(c.defId in bossDefs)) continue;
      if (c.aiState === "sleep") continue;
      setBoss(Math.max(0, c.hp / c.maxHp), bossDefs[c.defId]);
      shown = true;
      break;
    }
    if (!shown) setBoss(-1, "");
    setCombo(world.comboN, comboMultUi());
    const skills = classSkills(classId);
    setCds(
      skills[0] ? p.cd.basic / Math.max(0.01, skills[0].cooldown) : 0,
      skills[1] ? p.cd.s1 / Math.max(0.01, skills[1].cooldown) : 0,
      skills[2] ? p.cd.s2 / Math.max(0.01, skills[2].cooldown) : 0,
      skills[3] ? p.cd.sp / Math.max(0.01, skills[3].cooldown) : 0,
      p.shield > 0,
      p.hasteT > 0
    );
  });
  return null;
}
