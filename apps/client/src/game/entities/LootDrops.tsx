import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { world } from "../state/world";
import { itemColor } from "../loot";

function DropVisual({ id }: { id: number }) {
  const group = useRef<THREE.Group>(null);
  const chip = useRef<THREE.Mesh>(null);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const d = world.drops.find((x) => x.id === id);
    const g = group.current;
    if (!g || !d) {
      if (g) g.visible = false;
      return;
    }
    g.visible = true;
    g.position.set(d.pos.x, 0, d.pos.z);
    if (d.life < 5) g.visible = Math.sin(world.time * 10) > -0.3;
    if (chip.current) {
      chip.current.position.y = 0.45 + Math.sin(world.time * 3 + id) * 0.12;
      chip.current.rotation.y = world.time * 2 + id;
    }
    if (beamMat.current) beamMat.current.opacity = 0.22 + Math.sin(world.time * 3 + id) * 0.08;
  });

  const drop = world.drops.find((x) => x.id === id);
  const color = drop ? itemColor(drop.item) : "#b8c2cc";

  return (
    <group ref={group}>
      <mesh ref={chip} position={[0, 0.45, 0]}>
        <boxGeometry args={[0.34, 0.22, 0.34]} />
        <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={1.8} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.14, 0.3, 2.1, 8, 1, true]} />
        <meshBasicMaterial
          ref={beamMat}
          color={color}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.42, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function LootDrops() {
  const [, setTick] = useState(0);
  const last = useRef(-1);
  useFrame(() => {
    if (world.dropVersion !== last.current) {
      last.current = world.dropVersion;
      setTick((t) => t + 1);
    }
  });
  return (
    <group>
      {world.drops.map((d) => (
        <DropVisual key={d.id} id={d.id} />
      ))}
    </group>
  );
}
