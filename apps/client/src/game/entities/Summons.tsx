import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { world } from "../state/world";
import { aliveCombatants } from "../combat";

const tmpV = new THREE.Vector3();

export function Turrets() {
  const [, setTick] = useState(0);
  const last = useRef(-1);
  useFrame(() => {
    if (world.turretVersion !== last.current) {
      last.current = world.turretVersion;
      setTick((t) => t + 1);
    }
  });
  const turrets = world.turrets;
  return (
    <group>
      {turrets.map((t) => (
        <TurretVisual key={t.id} id={t.id} />
      ))}
    </group>
  );
}

function TurretVisual({ id }: { id: number }) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = world.turrets.find((x) => x.id === id);
    const g = group.current;
    if (!g || !t) return;
    g.position.copy(t.pos);
    let best: number | null = null;
    let bestDist = 13;
    for (const c of aliveCombatants()) {
      const d = tmpV.copy(c.pos).sub(t.pos).setY(0).length();
      if (d < bestDist) {
        bestDist = d;
        best = c.id;
      }
    }
    if (head.current) {
      if (best !== null) {
        const c = aliveCombatants().find((x) => x.id === best);
        if (c) head.current.rotation.y = Math.atan2(c.pos.x - t.pos.x, c.pos.z - t.pos.z);
      } else {
        head.current.rotation.y += 0.02;
      }
    }
  });

  return (
    <group ref={group}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.16, 0.3, 0.7, 6]} />
        <meshStandardMaterial color="#1e2433" roughness={0.4} metalness={0.7} />
      </mesh>
      <group ref={head} position={[0, 0.85, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.24, 0.4]} />
          <meshStandardMaterial color="#2a3350" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#0a0a12" emissive="#a78bfa" emissiveIntensity={2.5} />
        </mesh>
        <pointLight color="#a78bfa" intensity={8} distance={7} />
      </group>
    </group>
  );
}

export function Traps() {
  const [, setTick] = useState(0);
  const last = useRef(-1);
  useFrame(() => {
    if (world.trapVersion !== last.current) {
      last.current = world.trapVersion;
      setTick((t) => t + 1);
    }
  });
  return (
    <group>
      {world.traps.map((t) => (
        <TrapVisual key={t.id} id={t.id} />
      ))}
    </group>
  );
}

function TrapVisual({ id }: { id: number }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const t = world.traps.find((x) => x.id === id);
    const g = group.current;
    if (!g || !t) {
      if (g) g.visible = false;
      return;
    }
    g.visible = true;
    g.position.set(t.pos.x, 0.06, t.pos.z);
    const pulse = 0.5 + Math.sin(world.time * 6) * 0.2;
    g.scale.setScalar(pulse * 2.6);
    if (mat.current) mat.current.opacity = 0.45 + Math.sin(world.time * 6) * 0.15;
  });

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.5, 24]} />
        <meshBasicMaterial
          ref={mat}
          color="#10b981"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#10b981" intensity={6} distance={6} position={[0, 0.5, 0]} />
    </group>
  );
}
