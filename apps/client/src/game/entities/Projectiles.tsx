import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { world } from "../state/world";

function Bolt({ index }: { index: number }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const pr = world.projectiles[index];
    const g = group.current;
    if (!g) return;
    g.visible = pr.alive;
    if (!pr.alive) return;
    g.position.copy(pr.pos);
    const yaw = Math.atan2(pr.dir.x, pr.dir.z);
    g.rotation.set(0, yaw, 0);
    if (core.current) core.current.emissive.set(pr.color);
    if (glow.current) glow.current.color.set(pr.color);
  });

  return (
    <group ref={group} visible={false}>
      <mesh>
        <sphereGeometry args={[0.15, 12, 10]} />
        <meshStandardMaterial ref={core} color="#ffffff" emissive="#ffffff" emissiveIntensity={2.6} roughness={0.3} />
      </mesh>
      <mesh scale={[1.5, 1.5, 3.4]}>
        <sphereGeometry args={[0.15, 12, 10]} />
        <meshBasicMaterial ref={glow} color="#ffffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Projectiles() {
  const indices = useMemo(() => world.projectiles.map((_, i) => i), []);
  return (
    <group>
      {indices.map((i) => (
        <Bolt key={i} index={i} />
      ))}
    </group>
  );
}
