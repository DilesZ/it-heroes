import { Suspense, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import HubScene from "./world/HubScene";
import Hud from "../ui/Hud";

export default function Game() {
  return (
    <div className="relative h-full w-full">
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

function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.8, 0));
  useFrame(() => {
    camera.lookAt(target.current);
  });
  return null;
}
