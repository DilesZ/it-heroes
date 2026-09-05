import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { world, type Combatant } from "../state/world";
import { ensureDummies } from "../combat";

function DummyVisual({ c }: { c: Combatant }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);
  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.5, metalness: 0.5 }),
      dark: new THREE.MeshStandardMaterial({ color: "#0b1220", roughness: 0.5, metalness: 0.6 }),
    }),
    [c.color]
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.set(c.pos.x, 0, c.pos.z);
    const showScale = c.dead ? Math.max(0.01, 1 - c.deadT * 3) : 1;
    g.scale.setScalar(showScale * c.scale);
    g.position.y = c.dead ? 0 : Math.sin(world.time * 2 + c.bobPhase) * 0.05;
    if (core.current) {
      core.current.emissiveIntensity = c.dead ? 0 : 1.6 + c.hitFlash * 25;
    }
  });

  return (
    <group ref={group} position={[c.pos.x, 0, c.pos.z]}>
      <mesh castShadow position={[0, 0.75, 0]} material={mats.body}>
        <cylinderGeometry args={[0.42, 0.5, 1.1, 8]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} material={mats.dark}>
        <cylinderGeometry args={[0.44, 0.44, 0.16, 8]} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.445, 0.445, 0.1, 8]} />
        <meshStandardMaterial ref={core} color="#1a0b02" emissive={c.emissive} emissiveIntensity={1.6} />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]} material={mats.dark}>
        <sphereGeometry args={[0.26, 14, 12]} />
      </mesh>
      <mesh position={[0, 1.58, 0.2]}>
        <boxGeometry args={[0.3, 0.09, 0.08]} />
        <meshStandardMaterial color="#1a0b02" emissive={c.emissive} emissiveIntensity={1.4} />
      </mesh>
      <mesh castShadow position={[-0.55, 0.8, 0]} material={mats.dark}>
        <boxGeometry args={[0.14, 0.7, 0.14]} />
      </mesh>
      <mesh castShadow position={[0.55, 0.8, 0]} material={mats.dark}>
        <boxGeometry args={[0.14, 0.7, 0.14]} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.68, 24]} />
        <meshBasicMaterial color={c.emissive} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function Dummies() {
  const [, setTick] = useState(0);
  const last = useRef(-1);
  ensureDummies();
  useFrame(() => {
    if (world.dummyVersion !== last.current) {
      last.current = world.dummyVersion;
      setTick((t) => t + 1);
    }
  });
  const dummies = world.combatants.filter((c) => c.kind === "dummy");
  return (
    <group>
      {dummies.map((c) => (
        <DummyVisual key={c.id} c={c} />
      ))}
    </group>
  );
}
