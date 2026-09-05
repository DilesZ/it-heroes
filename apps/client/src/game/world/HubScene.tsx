import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Ball, Box, Cyl } from "../art/kit";
import { BRIGHT } from "../art/palette";

const ACCENTS = ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"];

function Plaza() {
  const patches = useMemo(() => {
    const pts: { x: number; z: number; r: number; c: string }[] = [];
    let seed = 42;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2;
      const r = 9 + rand() * 27;
      pts.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        r: 1.2 + rand() * 2.4,
        c: rand() > 0.5 ? "#a9bcdfff" : "#9fb2d8ff",
      });
    }
    return pts;
  }, []);
  return (
    <group>
      <mesh receiveShadow position={[0, -0.03, -70]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[170, 330]} />
        <meshStandardMaterial color={BRIGHT.hubGround} roughness={0.95} metalness={0} />
      </mesh>
      {[14, 22, 30].map((r, i) => (
        <mesh key={i} position={[0, 0.005, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.55, r, 48]} />
          <meshBasicMaterial color={BRIGHT.hubRing} transparent opacity={0.55} />
        </mesh>
      ))}
      {patches.map((pt, i) => (
        <mesh key={i} position={[pt.x, 0.004, pt.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[pt.r, 20]} />
          <meshBasicMaterial color={pt.c} transparent opacity={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.004, -48]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 22]} />
        <meshBasicMaterial color={BRIGHT.hubPath} transparent opacity={0.8} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-2.2 + (i % 2) * 4.4, 0.006, -41 - Math.floor(i / 2) * 6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 0.7]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function ServerBuilding({ p, accent, h = 4 }: { p: [number, number, number]; accent: string; h?: number }) {
  const winLights = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (winLights.current) {
      winLights.current.emissiveIntensity = 1.1 + Math.sin(clock.elapsedTime * 2 + p[0]) * 0.35;
    }
  });
  return (
    <group position={p}>
      <Box s={[3.2, h, 2.6]} p={[0, h / 2, 0]} color="#eef3fd" radius={0.18} />
      <Box s={[3.4, 0.5, 2.8]} p={[0, h + 0.2, 0]} color={accent} radius={0.12} />
      {[0.9, 1.7, 2.5].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 1.31]}>
            <planeGeometry args={[2.4, 0.42]} />
            <meshStandardMaterial ref={i === 1 ? winLights : undefined} color="#223148" emissive={accent} emissiveIntensity={1.1} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <Box s={[0.9, 1.5, 0.15]} p={[0, 0.75, 1.32]} color={BRIGHT.dark} radius={0.05} outline={false} />
      <Cyl p={[1.1, h + 0.75, 0.5]} rt={0.16} rb={0.16} h={0.7} color="#c7d3ea" />
      <Ball p={[1.1, h + 1.15, 0.5]} r={0.14} color={accent} emissive={accent} ei={2} outline={false} />
    </group>
  );
}

function Campus() {
  const spots: { p: [number, number, number]; accent: string; h: number }[] = [
    { p: [-15, 0, -12], accent: "#22d3ee", h: 4.2 },
    { p: [-10.5, 0, -12], accent: "#a78bfa", h: 3.2 },
    { p: [15, 0, -12], accent: "#34d399", h: 4.2 },
    { p: [10.5, 0, -12], accent: "#f472b6", h: 3.2 },
    { p: [-19, 0, 0], accent: "#22d3ee", h: 3.6 },
    { p: [19, 0, 0], accent: "#fbbf24", h: 3.6 },
    { p: [-16, 0, 12], accent: "#a78bfa", h: 3 },
    { p: [16, 0, 12], accent: "#34d399", h: 3 },
  ];
  return (
    <group>
      {spots.map((s, i) => (
        <ServerBuilding key={i} p={s.p} accent={s.accent} h={s.h} />
      ))}
    </group>
  );
}

function Monument() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (matRef.current) matRef.current.emissiveIntensity = 1.8 + Math.sin(t * 2.4) * 0.6;
    if (ringA.current) ringA.current.rotation.y = t * 0.5;
    if (ringB.current) ringB.current.rotation.y = -t * 0.35;
  });
  return (
    <group position={[0, 0, -6]}>
      <Cyl p={[0, 0.35, 0]} rt={2.2} rb={2.6} h={0.7} color="#dfe8fa" />
      <Cyl p={[0, 1.8, 0]} rt={0.8} rb={1.1} h={2.4} color="#f4f8ff" />
      <Ball p={[0, 3.6, 0]} r={0.85} color="#bff3ff" emissive="#22d3ee" ei={1.6} detail={2} />
      <mesh ref={ringA} position={[0, 3.6, 0]} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[1.6, 0.12, 10, 40]} />
        <meshStandardMaterial ref={matRef} color="#0e7490" emissive="#22d3ee" emissiveIntensity={1.8} roughness={0.3} />
      </mesh>
      <mesh ref={ringB} position={[0, 3.6, 0]} rotation={[Math.PI / 1.8, 0.4, 0]}>
        <torusGeometry args={[2.1, 0.09, 10, 44]} />
        <meshStandardMaterial color="#6d28d9" emissive="#a78bfa" emissiveIntensity={1.6} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 4, 0]} intensity={26} color="#7dd3fc" distance={24} />
    </group>
  );
}

function DataBalloons() {
  const groupRef = useRef<THREE.Group>(null);
  const items = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        angle: (i / 12) * Math.PI * 2,
        radius: 6 + (i % 4) * 2.4,
        y: 2.4 + (i % 4) * 1.1,
        color: ACCENTS[i % ACCENTS.length],
      })),
    []
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    groupRef.current?.children.forEach((child, i) => {
      const it = items[i];
      child.position.set(
        Math.cos(t * 0.22 + it.angle) * it.radius,
        it.y + Math.sin(t * 0.7 + i * 1.3) * 0.4,
        Math.sin(t * 0.22 + it.angle) * it.radius
      );
    });
  });
  return (
    <group ref={groupRef}>
      {items.map((it, i) => (
        <Float key={i} speed={2.2} rotationIntensity={0.3} floatIntensity={0.8}>
          <Ball p={[0, 0, 0]} r={0.32} color="#ffffff" emissive={it.color} ei={1.4} />
        </Float>
      ))}
    </group>
  );
}

export default function HubScene() {
  return (
    <group>
      <Plaza />
      <Campus />
      <Monument />
      <DataBalloons />
      <Sparkles count={70} scale={[60, 9, 60]} position={[0, 5, -10]} size={3} speed={0.3} color="#ffffff" opacity={0.6} />
    </group>
  );
}
