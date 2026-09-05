import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BRIGHT, BRIGHT_FOG } from "../art/palette";
import { Ball, Box, Cyl } from "../art/kit";
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
        <meshStandardMaterial color={BRIGHT.cablesGround} roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[0, -0.012, -175]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[32, 40]} />
        <meshStandardMaterial color={BRIGHT.cloudGround} roughness={0.95} metalness={0} />
      </mesh>
      <CableForest />
      <CloudField />
      <GroundDressing />
      <Corridor z0={-38} z1={-60} />
      <Corridor z0={-120} z1={-142} />
      <ZoneAtmosphere />
    </group>
  );
}

function GroundDressing() {
  const cablePatches = useMemo(() => scatter(555, 22, 0, -90, 6, 29), []);
  const cloudPatches = useMemo(() => scatter(999, 20, 0, -175, 6, 31), []);
  const flowers = useMemo(() => scatter(313, 18, 0, -90, 7, 28), []);
  return (
    <group>
      {cablePatches.map(([x, z], i) => (
        <mesh key={`c${i}`} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8 + (i % 5) * 0.35, 14]} />
          <meshBasicMaterial color={BRIGHT.cablesPatch} transparent opacity={0.55} />
        </mesh>
      ))}
      {cloudPatches.map(([x, z], i) => (
        <mesh key={`n${i}`} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9 + (i % 4) * 0.4, 14]} />
          <meshBasicMaterial color={i % 2 ? "#ffffff" : BRIGHT.cloudPatch} transparent opacity={0.5} />
        </mesh>
      ))}
      {flowers.map(([x, z], i) => (
        <group key={`f${i}`} position={[x, 0, z]}>
          <Cyl p={[0, 0.25, 0]} rt={0.04} rb={0.05} h={0.5} color="#3f9e58" outline={false} shadow={false} />
          <Ball p={[0, 0.58, 0]} r={0.16} color={["#ff8fb3", "#ffd166", "#ffffff", "#c084fc"][i % 4]} outline={false} shadow={false} />
        </group>
      ))}
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
  const h = 3.4 + (seed % 10) * 0.12;
  return (
    <group position={[x, 0, z]}>
      <Cyl p={[0, h / 2, 0]} rt={0.3} rb={0.45} h={h} color="#8a5a3b" seg={8} />
      <Ball p={[0, h + 0.5, 0]} r={1.15} color="#3fae62" detail={1} />
      <Ball p={[0.8, h + 0.1, 0.3]} r={0.7} color="#55c474" detail={1} />
      <Ball p={[-0.75, h + 0.15, -0.25]} r={0.65} color="#49b968" detail={1} />
      {cables.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color="#e8fff0" emissive={i % 2 ? "#4ade80" : "#22d3ee"} emissiveIntensity={0.9} roughness={0.4} />
        </mesh>
      ))}
      <pointLight color="#86efac" intensity={4} distance={9} position={[0, 3, 0]} />
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
        <meshStandardMaterial color="#e9defc" emissive="#a78bfa" emissiveIntensity={0.35} roughness={0.15} metalness={0.1} flatShading />
      </mesh>
      <mesh position={[0, -y + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4 * s, 0.55 * s, 20]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
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
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, len]} />
        <meshBasicMaterial color={BRIGHT.hubPath} transparent opacity={0.9} />
      </mesh>
      {Array.from({ length: Math.floor(len / 7) }, (_, i) => {
        const z = -len / 2 + 3.5 + i * 7;
        return (
          <group key={i} position={[0, 0, z]}>
            <mesh position={[0, 3.4, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[5.4, 0.45, 10, 24, Math.PI]} />
              <meshStandardMaterial color={BRIGHT.corridorWall} roughness={0.6} />
            </mesh>
            <mesh position={[0, 3.4, 0]}>
              <torusGeometry args={[5.4, 0.16, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#ffffff" emissive={BRIGHT.corridorTrim} emissiveIntensity={1.2} />
            </mesh>
            <pointLight color="#a5f3fc" intensity={8} distance={13} position={[0, 3, 0]} />
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
    fogTarget.set(BRIGHT_FOG[key]);
    bgTarget.set(BRIGHT_FOG[key]).multiplyScalar(0.82);
    fog.color.lerp(fogTarget, 1 - Math.exp(-2 * dt));
    if (scene.background instanceof THREE.Color) scene.background.lerp(bgTarget, 1 - Math.exp(-2 * dt));
  });
  return null;
}
