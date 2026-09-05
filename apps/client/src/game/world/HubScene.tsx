import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const ACCENTS = ["#22d3ee", "#a78bfa", "#34d399", "#f472b6"];

export default function HubScene() {
  return (
    <group>
      <ambientLight intensity={0.35} color="#334155" />
      <directionalLight
        position={[12, 18, 8]}
        intensity={1.4}
        color="#cfe8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-14, 4, -10]} intensity={60} color="#22d3ee" distance={30} />
      <pointLight position={[14, 4, 12]} intensity={60} color="#a78bfa" distance={30} />

      <Floor />
      <ServerRacks />
      <CorePillar />
      <FloatingData />
      <Sparkles count={90} scale={[50, 8, 50]} position={[0, 4, 0]} size={2.5} speed={0.25} color="#67e8f9" opacity={0.55} />
    </group>
  );
}

function Floor() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.02, -70]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[170, 320]} />
        <meshStandardMaterial color="#0a1120" roughness={0.85} metalness={0.2} />
      </mesh>
      <Grid
        position={[0, 0.01, -70]}
        args={[170, 320]}
        cellSize={0.9}
        cellThickness={0.5}
        cellColor="#16324f"
        sectionSize={4.5}
        sectionThickness={1.1}
        sectionColor="#22d3ee"
        fadeDistance={70}
        fadeStrength={1.6}
        infiniteGrid
      />
    </group>
  );
}

function ServerRack({ position, accent }: { position: [number, number, number]; accent: string }) {
  const lightsRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (lightsRef.current) {
      lightsRef.current.emissiveIntensity = 1.2 + Math.sin(t * 3 + position[0] * 0.7) * 0.8;
    }
  });
  return (
    <group position={position} castShadow>
      <mesh castShadow receiveShadow position={[0, 1.6, 0]}>
        <boxGeometry args={[1.6, 3.2, 1.1]} />
        <meshStandardMaterial color="#111c30" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.6, 0.56]}>
        <planeGeometry args={[1.3, 2.9]} />
        <meshStandardMaterial ref={lightsRef} color="#050a14" emissive={accent} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function ServerRacks() {
  const racks = useMemo(() => {
    const list: { pos: [number, number, number]; accent: string }[] = [];
    for (let i = 0; i < 4; i++) {
      const z = -14 - i * 3.4;
      list.push({ pos: [-16 + (i % 2) * 3.4, 0, z], accent: i % 2 ? "#22d3ee" : "#34d399" });
      list.push({ pos: [-11 + (i % 2) * 3.4, 0, z], accent: "#a78bfa" });
      list.push({ pos: [16 - (i % 2) * 3.4, 0, z], accent: "#22d3ee" });
      list.push({ pos: [11 - (i % 2) * 3.4, 0, z], accent: "#f472b6" });
    }
    for (let i = 0; i < 3; i++) {
      const x = -18 - i * 3.4;
      list.push({ pos: [x, 0, -2 + (i % 2) * 3.4], accent: "#22d3ee" });
      list.push({ pos: [-x, 0, -2 + (i % 2) * 3.4], accent: "#34d399" });
      list.push({ pos: [x, 0, 8 + (i % 2) * 3.4], accent: "#a78bfa" });
      list.push({ pos: [-x, 0, 8 + (i % 2) * 3.4], accent: "#22d3ee" });
    }
    return list;
  }, []);
  return (
    <group>
      {racks.map((r, i) => (
        <ServerRack key={i} position={r.pos} accent={r.accent} />
      ))}
    </group>
  );
}

function CorePillar() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (matRef.current) {
      matRef.current.emissiveIntensity = 2 + Math.sin(t * 2.2) * 0.9;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.4;
      ringRef.current.position.y = 2.6 + Math.sin(t * 1.1) * 0.25;
    }
  });
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.9, 1.2, 4.4, 8]} />
        <meshStandardMaterial color="#0d1626" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[1.25, 1.25, 0.5, 8]} />
        <meshStandardMaterial ref={matRef} color="#0a2530" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ringRef} position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.05, 8, 48]} />
        <meshStandardMaterial color="#0a2530" emissive="#a78bfa" emissiveIntensity={2.4} />
      </mesh>
      <pointLight position={[0, 3.5, 0]} intensity={50} color="#22d3ee" distance={22} />
    </group>
  );
}

function FloatingData() {
  const groupRef = useRef<THREE.Group>(null);
  const items = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        angle: (i / 16) * Math.PI * 2,
        radius: 5.5 + (i % 4) * 2.1,
        y: 1.2 + (i % 5) * 0.9,
        size: 0.16 + (i % 3) * 0.07,
        speed: 0.25 + (i % 4) * 0.09,
        color: ACCENTS[i % ACCENTS.length],
      })),
    []
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    groupRef.current?.children.forEach((child, i) => {
      const it = items[i];
      child.position.set(
        Math.cos(t * it.speed + it.angle) * it.radius,
        it.y + Math.sin(t * 0.8 + i) * 0.35,
        Math.sin(t * it.speed + it.angle) * it.radius
      );
      child.rotation.x = t * 0.9 + i;
      child.rotation.y = t * 0.6 + i;
    });
  });
  return (
    <group ref={groupRef}>
      {items.map((it, i) => (
        <mesh key={i}>
          <boxGeometry args={[it.size, it.size, it.size]} />
          <meshStandardMaterial color="#04101c" emissive={it.color} emissiveIntensity={2.2} />
        </mesh>
      ))}
    </group>
  );
}
