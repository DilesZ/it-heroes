import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Ball, Box, Caps, Cyl, Eyes } from "../art/kit";
import { BRIGHT } from "../art/palette";
import { world, type Combatant } from "../state/world";
import { ensureDummies } from "../combat";

function DummyVisual({ c }: { c: Combatant }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.set(c.pos.x, 0, c.pos.z);
    const showScale = c.dead ? Math.max(0.01, 1 - c.deadT * 3) : 1;
    g.scale.setScalar(showScale * c.scale);
    g.position.y = c.dead ? 0 : Math.sin(world.time * 2 + c.bobPhase) * 0.05;
    if (core.current) {
      core.current.emissiveIntensity = c.dead ? 0 : 1.1 + c.hitFlash * 14;
    }
  });

  return (
    <group ref={group} position={[c.pos.x, 0, c.pos.z]}>
      <Cyl p={[0, 0.18, 0]} rt={0.4} rb={0.48} h={0.36} color="#8a94ad" />
      <Ball p={[0, 0.85, 0]} r={0.5} color="#f4b942" detail={1} />
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.51, 0.51, 0.2, 12]} />
        <meshStandardMaterial ref={core} color="#7a4a12" emissive={c.emissive} emissiveIntensity={1.1} roughness={0.5} />
      </mesh>
      <Ball p={[0, 1.32, 0]} r={0.3} color={BRIGHT.white} detail={2} />
      <Eyes p={[0, 1.34, 0.24]} s={0.95} angry />
      <Caps p={[-0.55, 0.6, 0]} r={0.09} len={0.3} color="#8a94ad" />
      <Caps p={[0.55, 0.6, 0]} r={0.09} len={0.3} color="#8a94ad" />
      <Box p={[0, 0.62, 0.52]} s={[0.34, 0.22, 0.1]} color={BRIGHT.dark} radius={0.04} />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.74, 24]} />
        <meshBasicMaterial color={c.emissive} transparent opacity={0.45} />
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
