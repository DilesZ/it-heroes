import { useRef, useState, type Ref } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Ball, Box, Caps, Cyl, Eyes } from "../art/kit";
import { world, type Combatant } from "../state/world";

export default function Enemies() {
  const [, setTick] = useState(0);
  const last = useRef(-1);
  useFrame(() => {
    if (world.enemyVersion !== last.current) {
      last.current = world.enemyVersion;
      setTick((t) => t + 1);
    }
  });
  const enemies = world.combatants.filter((c) => c.kind === "enemy");
  return (
    <group>
      {enemies.map((c) => (
        <EnemyVisual key={c.id} c={c} />
      ))}
    </group>
  );
}

type Core = Ref<THREE.MeshStandardMaterial>;

function EnemyVisual({ c }: { c: Combatant }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);
  const barFg = useRef<THREE.Mesh>(null);

  const isBoss = c.defId === "bsod_lord" || c.defId === "worm_queen" || c.defId === "mainframe";
  const barY = c.defId === "mainframe" ? 6.4 : isBoss ? 4.6 : 1.5 * c.scale + 0.9;

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.set(c.pos.x, 0, c.pos.z);
    const showScale = c.dead ? Math.max(0.01, 1 - c.deadT * 2.2) : 1;
    g.scale.setScalar(showScale * c.scale);

    const dx = world.player.pos.x - c.pos.x;
    const dz = world.player.pos.z - c.pos.z;
    g.rotation.y = Math.atan2(dx, dz);

    const telegraph = c.aiState === "windup" || c.aiState === "slamTel";
    const glitch =
      Math.sin(world.time * 37 + c.id * 3.1) * 0.5 + Math.sin(world.time * 61 + c.id) * 0.5;
    if (inner.current) {
      inner.current.position.x = glitch * 0.03;
      const squash = telegraph ? 1.1 : 1;
      inner.current.scale.set(squash, telegraph ? 0.94 : 1, squash);
      inner.current.position.y =
        c.defId === "spyware"
          ? 0.5 + Math.sin(world.time * 3 + c.bobPhase) * 0.15
          : Math.abs(Math.sin(world.time * (c.aiState === "chase" ? 9 : 4) + c.bobPhase)) * 0.08;
    }
    if (core.current) {
      const base = c.aiState === "sleep" ? 0.2 : 1.0;
      core.current.emissiveIntensity = c.dead ? 0 : base + c.hitFlash * 12 + (telegraph ? 1.0 : 0);
    }
    if (barFg.current) {
      const frac = Math.max(0, c.hp / c.maxHp);
      barFg.current.scale.x = Math.max(0.001, frac);
      barFg.current.position.x = -(1 - frac) * 0.45;
      barFg.current.visible = !c.dead && frac < 1;
    }
  });

  return (
    <group ref={group} position={[c.pos.x, 0, c.pos.z]}>
      <group ref={inner}>
        {c.defId === "bug" && <BugBody core={core} emissive={c.emissive} />}
        {c.defId === "trojan" && <TrojanBody core={core} emissive={c.emissive} />}
        {c.defId === "spyware" && <SpywareBody core={core} emissive={c.emissive} />}
        {c.defId === "worm" && <WormBody core={core} emissive={c.emissive} />}
        {c.defId === "rootkit" && <RootkitBody core={core} emissive={c.emissive} />}
        {c.defId === "botnet" && <BotnetBody core={core} emissive={c.emissive} />}
        {c.defId === "firewall" && <FirewallBody core={core} emissive={c.emissive} />}
        {c.defId === "bsod_lord" && <BossBody core={core} emissive={c.emissive} />}
        {c.defId === "worm_queen" && <QueenBody core={core} emissive={c.emissive} />}
        {c.defId === "mainframe" && <MainframeBody core={core} emissive={c.emissive} />}
      </group>
      <Billboard position={[0, barY, 0]}>
        <mesh>
          <planeGeometry args={[0.95, 0.11]} />
          <meshBasicMaterial color="#232838" transparent opacity={0.85} depthWrite={false} />
        </mesh>
        <mesh ref={barFg} position={[0, 0, 0.001]}>
          <planeGeometry args={[0.9, 0.07]} />
          <meshBasicMaterial color={c.emissive} toneMapped={false} />
        </mesh>
      </Billboard>
      {c.aiState === "slamTel" && (
        <TelegraphRing color={c.emissive} radius={c.defId === "mainframe" ? 6.5 : c.defId === "worm_queen" ? 4.5 : 5.5} progress={1 - c.aiT / 1.0} />
      )}
    </group>
  );
}

function TelegraphRing({ color, radius, progress }: { color: string; radius: number; progress: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      const r = 0.5 + progress * radius;
      ref.current.scale.set(r, r, r);
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.85, 1, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

function BugBody({ core, emissive }: { core: Core; emissive: string }) {
  const legs = useRef<THREE.Group>(null);
  useFrame(() => {
    if (legs.current) {
      legs.current.children.forEach((leg, i) => {
        leg.rotation.x = Math.sin(world.time * 14 + i * 1.05) * 0.5;
      });
    }
  });
  return (
    <group>
      <Ball p={[0, 0.5, 0]} r={0.46} color="#ff8a7a" detail={1} />
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.47, 12, 8]} />
        <meshStandardMaterial ref={core} color="#c2503f" emissive={emissive} emissiveIntensity={1} roughness={0.6} />
      </mesh>
      <Ball p={[0, 0.62, 0.32]} r={0.3} color="#ffd9d2" detail={2} />
      <Eyes p={[0, 0.66, 0.56]} s={0.9} angry />
      <group ref={legs}>
        {[-0.28, 0.02, 0.3].map((z, i) => (
          <group key={i}>
            <Caps p={[-0.5, 0.26, z]} r={0.06} len={0.2} color="#7a3b32" />
            <Caps p={[0.5, 0.26, z]} r={0.06} len={0.2} color="#7a3b32" />
          </group>
        ))}
      </group>
    </group>
  );
}

function TrojanBody({ core, emissive }: { core: Core; emissive: string }) {
  return (
    <group>
      <Box p={[0, 0.85, 0]} s={[0.95, 1.45, 0.8]} color="#ffb066" radius={0.22} />
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.97, 0.3, 0.82]} />
        <meshStandardMaterial ref={core} color="#b45a1e" emissive={emissive} emissiveIntensity={1} roughness={0.6} />
      </mesh>
      <Ball p={[0, 1.75, 0]} r={0.4} color="#ffd9ad" detail={2} />
      <Eyes p={[0, 1.78, 0.33]} s={1} angry />
      <mesh position={[-0.28, 2.05, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.1, 0.35, 6]} />
        <meshStandardMaterial color="#7a3b12" roughness={0.7} />
      </mesh>
      <mesh position={[0.28, 2.05, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.1, 0.35, 6]} />
        <meshStandardMaterial color="#7a3b12" roughness={0.7} />
      </mesh>
      <Caps p={[-0.62, 0.9, 0]} r={0.11} len={0.4} color="#e08a3c" />
      <Caps p={[0.62, 0.9, 0]} r={0.11} len={0.4} color="#e08a3c" />
      <Caps p={[-0.25, 0.2, 0]} r={0.12} len={0.15} color="#7a3b12" />
      <Caps p={[0.25, 0.2, 0]} r={0.12} len={0.15} color="#7a3b12" />
    </group>
  );
}

function SpywareBody({ core, emissive }: { core: Core; emissive: string }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ring.current) ring.current.rotation.z = world.time * 1.8;
  });
  return (
    <group position={[0, 1.1, 0]}>
      <mesh castShadow>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#9ff0e2" roughness={0.4} flatShading />
      </mesh>
      <mesh scale={0.55}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial ref={core} color="#0b3b35" emissive={emissive} emissiveIntensity={1} roughness={0.4} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.68, 0.06, 8, 24]} />
        <meshStandardMaterial color="#e6fffa" emissive={emissive} emissiveIntensity={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.05, 0.4]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.05, 0.52]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshBasicMaterial color="#123b36" />
      </mesh>
      <pointLight color={emissive} intensity={5} distance={8} />
    </group>
  );
}

function WormBody({ core, emissive }: { core: Core; emissive: string }) {
  return (
    <group>
      {[-0.65, -0.1, 0.42].map((z, i) => (
        <Ball key={i} p={[0, 0.46 - i * 0.03, z]} r={0.44 - i * 0.06} color={i === 2 ? "#8fe07a" : "#6fca5c"} detail={1} />
      ))}
      <mesh position={[0, 0.52, 0.42]}>
        <sphereGeometry args={[0.32, 12, 10]} />
        <meshStandardMaterial ref={core} color="#3f7d33" emissive={emissive} emissiveIntensity={1} roughness={0.6} />
      </mesh>
      <Eyes p={[0, 0.56, 0.68]} s={0.85} angry />
      <mesh position={[-0.16, 0.5, 0.72]} rotation={[1.2, 0, 0]}>
        <coneGeometry args={[0.07, 0.28, 6]} />
        <meshStandardMaterial color="#e8f7e2" roughness={0.6} />
      </mesh>
      <mesh position={[0.16, 0.5, 0.72]} rotation={[1.2, 0, 0]}>
        <coneGeometry args={[0.07, 0.28, 6]} />
        <meshStandardMaterial color="#e8f7e2" roughness={0.6} />
      </mesh>
    </group>
  );
}

function RootkitBody({ core, emissive }: { core: Core; emissive: string }) {
  const blades = useRef<THREE.Group>(null);
  useFrame(() => {
    if (blades.current) blades.current.rotation.y = world.time * 4;
  });
  return (
    <group>
      <Cyl p={[0, 0.6, 0]} rt={0.18} rb={0.4} h={0.9} color="#8f9bff" seg={8} />
      <Ball p={[0, 1.15, 0]} r={0.24} color="#e3e6ff" detail={2} />
      <Eyes p={[0, 1.17, 0.19]} s={0.8} angry />
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.25, 12, 10]} />
        <meshStandardMaterial ref={core} color="#2c3491" emissive={emissive} emissiveIntensity={1} roughness={0.5} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <group ref={blades} position={[0, 0.32, 0]}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            p={[Math.cos((i / 3) * Math.PI * 2) * 0.5, 0, Math.sin((i / 3) * Math.PI * 2) * 0.5]}
            s={[0.5, 0.08, 0.14]}
            color="#c6cbff"
          />
        ))}
      </group>
    </group>
  );
}

function BotnetBody({ core, emissive }: { core: Core; emissive: string }) {
  return (
    <group position={[0, 0.55 + Math.sin(world.time * 5) * 0.06, 0]}>
      <Box p={[0, 0, 0]} s={[0.46, 0.46, 0.46]} color="#ffe066" radius={0.12} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.48, 0.18, 0.48]} />
        <meshStandardMaterial ref={core} color="#8a6d1a" emissive={emissive} emissiveIntensity={1} roughness={0.5} />
      </mesh>
      <Eyes p={[0, 0.05, 0.2]} s={0.75} angry />
      <Cyl p={[0, 0.34, 0]} rt={0.02} rb={0.02} h={0.24} color="#8a94ad" outline={false} />
      <Ball p={[0, 0.48, 0]} r={0.05} color={emissive} emissive={emissive} ei={2} outline={false} />
    </group>
  );
}

function FirewallBody({ core, emissive }: { core: Core; emissive: string }) {
  return (
    <group>
      <Box p={[0, 1.05, 0]} s={[1.15, 2.0, 0.45]} color="#ff9dc4" radius={0.16} />
      {[0.6, 1.15, 1.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0.24]}>
          <boxGeometry args={[0.9, 0.12, 0.03]} />
          <meshStandardMaterial ref={i === 1 ? core : undefined} color="#7d2148" emissive={emissive} emissiveIntensity={1} roughness={0.5} />
        </mesh>
      ))}
      <Eyes p={[0, 1.95, 0.2]} s={0.9} angry />
      <Caps p={[-0.72, 0.5, 0]} r={0.11} len={0.4} color="#e06ba0" />
      <Caps p={[0.72, 0.5, 0]} r={0.11} len={0.4} color="#e06ba0" />
      <mesh position={[0, 2.3, 0]}>
        <coneGeometry args={[0.28, 0.45, 4]} />
        <meshStandardMaterial color="#c44a86" roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

function BossBody({ core, emissive }: { core: Core; emissive: string }) {
  return (
    <group>
      <Box p={[0, 1.9, 0]} s={[2.3, 2.9, 0.8]} color="#7db8f7" radius={0.3} />
      <Box p={[0, 1.9, 0.32]} s={[1.9, 2.4, 0.12]} color="#e8f2ff" radius={0.08} outline={false} />
      <mesh position={[0, 1.9, 0.4]}>
        <planeGeometry args={[1.7, 2.2]} />
        <meshStandardMaterial ref={core} color="#123a75" emissive={emissive} emissiveIntensity={0.9} roughness={0.4} />
      </mesh>
      <Eyes p={[-0.42, 2.35, 0.42]} s={1.15} angry />
      <Eyes p={[0.42, 2.35, 0.42]} s={1.15} angry />
      <mesh position={[0, 1.35, 0.42]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.3, 0.07, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#dbeafe" />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 3.6, 0]}>
          <coneGeometry args={[0.15, 0.55, 4]} />
          <meshStandardMaterial color="#3f6fb5" roughness={0.6} flatShading />
        </mesh>
      ))}
      <Caps p={[-1.5, 1.1, 0]} r={0.22} len={1.2} color="#5d94dd" />
      <Caps p={[1.5, 1.1, 0]} r={0.22} len={1.2} color="#5d94dd" />
      <Caps p={[-0.8, 0.3, 0]} r={0.28} len={0.2} color="#3f6fb5" />
      <Caps p={[0.8, 0.3, 0]} r={0.28} len={0.2} color="#3f6fb5" />
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.65, 40]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.5} />
      </mesh>
      <pointLight color={emissive} intensity={16} distance={18} position={[0, 2.5, 1]} />
    </group>
  );
}

function QueenBody({ core, emissive }: { core: Core; emissive: string }) {
  const sacs = useRef<THREE.Group>(null);
  useFrame(() => {
    if (sacs.current) sacs.current.scale.setScalar(1 + Math.sin(world.time * 2.4) * 0.06);
  });
  return (
    <group>
      {[-1.5, -0.6, 0.3].map((z, i) => (
        <Ball key={i} p={[0, 0.9 - i * 0.06, z]} r={0.88 - i * 0.1} color={i === 2 ? "#a5e08f" : "#7ecb66"} detail={1} />
      ))}
      <group ref={sacs} position={[0, 1.6, -0.9]}>
        {[0, 1, 2].map((i) => (
          <Ball key={i} p={[(i - 1) * 0.48, 0, 0]} r={0.3} color="#d9f2b6" emissive={emissive} ei={0.5} />
        ))}
      </group>
      <mesh position={[0, 1.0, 0.3]}>
        <sphereGeometry args={[0.62, 14, 12]} />
        <meshStandardMaterial ref={core} color="#4a7d33" emissive={emissive} emissiveIntensity={0.9} roughness={0.6} />
      </mesh>
      <Eyes p={[-0.3, 1.05, 0.82]} s={1.05} angry />
      <Eyes p={[0.3, 1.05, 0.82]} s={1.05} angry />
      {[-0.55, -0.18, 0.18, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 1.75, 0.6]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.13, 0.6, 5]} />
          <meshStandardMaterial color="#f2b134" roughness={0.55} flatShading />
        </mesh>
      ))}
      <pointLight color={emissive} intensity={14} distance={20} position={[0, 2, 0]} />
    </group>
  );
}

function MainframeBody({ core, emissive }: { core: Core; emissive: string }) {
  const rings = useRef<THREE.Group>(null);
  useFrame(() => {
    if (rings.current) {
      rings.current.rotation.y = world.time * 0.7;
      rings.current.children.forEach((r, i) => {
        r.rotation.x = Math.PI / 2 + Math.sin(world.time * 0.8 + i) * 0.15;
      });
    }
  });
  return (
    <group>
      <Cyl p={[0, 2.6, 0]} rt={1.1} rb={1.5} h={5.2} color="#c9a6f2" seg={10} />
      {[1.2, 2.6, 4.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[1.34, 1.34, 0.3, 10]} />
          <meshStandardMaterial ref={i === 1 ? core : undefined} color="#4b2170" emissive={emissive} emissiveIntensity={0.9} roughness={0.5} />
        </mesh>
      ))}
      <Ball p={[0, 5.7, 0]} r={0.72} color="#f4ecff" detail={2} />
      <mesh position={[0, 5.72, 0.6]}>
        <sphereGeometry args={[0.34, 12, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 5.72, 0.82]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshBasicMaterial color="#3b1470" />
      </mesh>
      <group ref={rings} position={[0, 2.6, 0]}>
        {[1.9, 2.4].map((r, i) => (
          <mesh key={i}>
            <torusGeometry args={[r, 0.09, 8, 40]} />
            <meshStandardMaterial color="#e9defc" emissive={emissive} emissiveIntensity={0.9} roughness={0.4} />
          </mesh>
        ))}
      </group>
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          p={[Math.cos((i / 4) * Math.PI * 2) * 1.9, 0.5, Math.sin((i / 4) * Math.PI * 2) * 1.9]}
          s={[0.55, 1, 0.55]}
          color="#8a5fc0"
          radius={0.12}
        />
      ))}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.2, 48]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.5} />
      </mesh>
      <pointLight color={emissive} intensity={22} distance={26} position={[0, 3.5, 0]} />
    </group>
  );
}
