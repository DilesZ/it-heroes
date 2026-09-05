import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import HubScene from "./world/HubScene";
import Player from "./entities/Player";
import Hud from "../ui/Hud";
import { initInput } from "./input";
import { world } from "./state/world";
import { useHud } from "../state/hudStore";
import { PLAYER_BASE } from "@it-heroes/shared";

export default function Game() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) return initInput(container.current);
  }, []);

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
          <HubScene />
          <Player />
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

function CameraRig() {
  const { camera } = useThree();
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = world.player.pos;
    tmpTarget.set(p.x, p.y + 0.8, p.z);
    camera.position.lerp(tmpTarget.clone().add(camOffset), 1 - Math.exp(-6 * dt));
    lookTarget.lerp(tmpTarget, 1 - Math.exp(-8 * dt));
    camera.lookAt(lookTarget);
  });
  return null;
}

const tmpTarget = new THREE.Vector3();

function HudSync() {
  const acc = useRef(0);
  const setVitals = useHud((s) => s.setVitals);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 0.1) return;
    acc.current = 0;
    const p = world.player;
    setVitals(p.health, p.mana, p.stamina);
  });
  return null;
}
