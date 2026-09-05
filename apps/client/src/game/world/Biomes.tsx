import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BIOMES } from "@it-heroes/shared";
import { world, zoneOf } from "../state/world";

function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scatter(
  seed: number,
  count: number,
  cx: number,
  cz: number,
  rMin: number,
  rMax: number
): [number, number][] {
  const rand = seeded(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = rMin + rand() * (rMax - rMin);
    pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
  }
  return pts;
}

export default function Biomes() {
  return (
    <group>
      <mesh position={[0, -0.012, -90]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[30, 40]} />
        <meshStandardMaterial color={BIOMES.cables.groundColor} roughness={0.9} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.012, -175]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[32, 40]} />
        <meshStandardMaterial color={BIOMES.cloud.groundColor} roughness={0.9} metalness={0.15} />
      </mesh>
      <CableForest />
      <CloudField />
      <Corridor z0={-38} z1={-60} />
      <Corridor z0={-120} z1={-142} />
      <ZoneAtmosphere />
    </group>
  );
}

function CableTree({ x, z, seed }: { x: number; z: number; seed: number }) {
  const rand = useMemo(() => seeded(seed), [seed]);
  const cables = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const a = (i / 4) * Math.PI * 2 + rand() * 0.8;
        const len = 2.5 + rand() * 2;
        const pts = [
          new THREE.Vector3(0, 4.5 + rand(), 0),
          new THREE.Vector3(Math.cos(a) * len * 0.5, 2.6 + rand(), Math.sin(a) * len * 0.5),
          new THREE.Vector3(Math.cos(a) * len, 0.05, Math.sin(a) * len),
        ];
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.05, 5);
      }),
    [rand]
  );
  const h = 4.2 + (seed % 10) * 0.15;
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.34, h, 7]} />
        <meshStandardMaterial color="#14231a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, h + 0.25, 0]}>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshStandardMaterial color="#0a2013" emissive="#4ade80" emissiveIntensity={1.2} />
      </mesh>
      {cables.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color="#0a2013" emissive={i % 2 ? "#4ade80" : "#22d3ee"} emissiveIntensity={1.5} />
        </mesh>
      ))}
      <pointLight color="#4ade80" intensity={5} distance={9} position={[0, 3, 0]} />
    </group>
  );
}

function CableForest() {
  const trees = useMemo(() => scatter(1234, 15, 0, -90, 8, 28), []);
  return (
    <group>
      {trees.map(([x, z], i) => (
        <CableTree key={i} x={x} z={z} seed={100 + i * 7} />
      ))}
    </group>
  );
}

function Crystal({ x, z, seed }: { x: number; z: number; seed: number }) {
  const ref = useRef<THREE.Group>(null);
  const rand = useMemo(() => seeded(seed), [seed]);
  const s = 0.7 + rand() * 1.1;
  const y = 0.8 + rand() * 1.6;
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.y = y + Math.sin(world.time * 1.2 + seed) * 0.35;
    ref.current.rotation.y = world.time * (0.3 + (seed % 5) * 0.08);
  });
  return (
    <group ref={ref} position={[x, y, z]}>
      <mesh castShadow scale={[s, s * 1.8, s]}>
        <octahedronGeometry args={[0.8]} />
        <meshStandardMaterial color="#1d1030" emissive="#c084fc" emissiveIntensity={1.1} roughness={0.25} metalness={0.4} />
      </mesh>
      <mesh position={[0, -y + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4 * s, 0.55 * s, 20]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.4} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CloudField() {
  const crystals = useMemo(() => scatter(777, 16, 0, -175, 9, 30), []);
  return (
    <group>
      {crystals.map(([x, z], i) => (
        <Crystal key={i} x={x} z={z} seed={50 + i * 13} />
      ))}
      <pointLight color="#c084fc" intensity={40} distance={40} position={[0, 6, -175]} />
    </group>
  );
}

function Corridor({ z0, z1 }: { z0: number; z1: number }) {
  const len = Math.abs(z1 - z0);
  const zc = (z0 + z1) / 2;
  return (
    <group position={[0, 0, zc]}>
      {[-7.5, 7.5].map((x, i) => (
        <mesh key={i} castShadow receiveShadow position={[x, 2, 0]}>
          <boxGeometry args={[2.4, 4, len]} />
          <meshStandardMaterial color="#0d1626" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(len / 6) }, (_, i) => {
        const z = -len / 2 + 3 + i * 6;
        return (
          <group key={i} position={[0, 4.2, z]}>
            <mesh>
              <boxGeometry args={[13, 0.25, 1.2]} />
              <meshStandardMaterial color="#0b1220" emissive="#22d3ee" emissiveIntensity={1.6} />
            </mesh>
            <pointLight color="#22d3ee" intensity={10} distance={12} position={[0, -1, 0]} />
          </group>
        );
      })}
    </group>
  );
}

const fogTarget = new THREE.Color();
const bgTarget = new THREE.Color();

function ZoneAtmosphere() {
  const { scene } = useThree();
  const fog = scene.fog as THREE.Fog | null;
  useFrame((_, rawDt) => {
    if (!fog) return;
    const dt = Math.min(rawDt, 0.05);
    const p = world.player.pos;
    const zone = zoneOf(p.x, p.z);
    const key = zone === "cables" ? "cables" : zone === "cloud" ? "cloud" : "servers";
    const b = BIOMES[key as keyof typeof BIOMES] ?? BIOMES.servers;
    fogTarget.set(b.fogColor);
    bgTarget.set(b.fogColor).multiplyScalar(0.55);
    fog.color.lerp(fogTarget, 1 - Math.exp(-2 * dt));
    if (scene.background instanceof THREE.Color) scene.background.lerp(bgTarget, 1 - Math.exp(-2 * dt));
  });
  return null;
}
