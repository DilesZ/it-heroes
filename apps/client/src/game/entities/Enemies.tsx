import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
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

function EnemyVisual({ c }: { c: Combatant }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);
  const barFg = useRef<THREE.Mesh>(null);

  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.45, metalness: 0.55 }),
      dark: new THREE.MeshStandardMaterial({ color: "#0a0f1c", roughness: 0.5, metalness: 0.6 }),
    }),
    [c.color]
  );

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
      inner.current.position.x = glitch * 0.04;
      const squash = telegraph ? 1.12 : 1;
      inner.current.scale.set(squash, telegraph ? 0.92 : 1, squash);
      inner.current.position.y =
        c.defId === "spyware"
          ? 0.5 + Math.sin(world.time * 3 + c.bobPhase) * 0.15
          : Math.abs(Math.sin(world.time * (c.aiState === "chase" ? 9 : 4) + c.bobPhase)) * 0.08;
    }
    if (core.current) {
      const base = c.aiState === "sleep" ? 0.25 : 1.7;
      core.current.emissiveIntensity = c.dead ? 0 : base + c.hitFlash * 22 + (telegraph ? 1.6 : 0);
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
        {c.defId === "bug" && <BugBody body={mats.body} dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "trojan" && <TrojanBody body={mats.body} dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "spyware" && <SpywareBody dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "worm" && <WormBody body={mats.body} dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "rootkit" && <RootkitBody dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "botnet" && <BotnetBody dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "firewall" && <FirewallBody body={mats.body} dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "bsod_lord" && <BossBody body={mats.body} dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "worm_queen" && <QueenBody body={mats.body} dark={mats.dark} core={core} emissive={c.emissive} />}
        {c.defId === "mainframe" && <MainframeBody body={mats.body} dark={mats.dark} core={core} emissive={c.emissive} />}
      </group>
      <Billboard position={[0, barY, 0]}>
        <mesh>
          <planeGeometry args={[0.95, 0.11]} />
          <meshBasicMaterial color="#05070d" transparent opacity={0.85} depthWrite={false} />
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

type BodyProps = {
  body: THREE.Material;
  dark: THREE.Material;
  core: React.Ref<THREE.MeshStandardMaterial>;
  emissive: string;
};

function BugBody({ body, dark, core, emissive }: BodyProps) {
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
      <mesh castShadow position={[0, 0.42, 0]} material={body}>
        <sphereGeometry args={[0.42, 12, 10]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} scale={[1.02, 0.55, 1.02]}>
        <sphereGeometry args={[0.42, 12, 10]} />
        <meshStandardMaterial ref={core} color="#1a0505" emissive={emissive} emissiveIntensity={1.7} />
      </mesh>
      <mesh castShadow position={[0, 0.62, 0.28]} material={dark}>
        <sphereGeometry args={[0.2, 10, 8]} />
      </mesh>
      <mesh position={[-0.09, 0.66, 0.44]}>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshBasicMaterial color={emissive} toneMapped={false} />
      </mesh>
      <mesh position={[0.09, 0.66, 0.44]}>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshBasicMaterial color={emissive} toneMapped={false} />
      </mesh>
      <group ref={legs}>
        {[-0.3, 0, 0.3].map((z, i) => (
          <group key={i}>
            <mesh castShadow position={[-0.45, 0.22, z]} rotation={[0, 0, 0.5]} material={dark}>
              <boxGeometry args={[0.3, 0.07, 0.07]} />
            </mesh>
            <mesh castShadow position={[0.45, 0.22, z]} rotation={[0, 0, -0.5]} material={dark}>
              <boxGeometry args={[0.3, 0.07, 0.07]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function TrojanBody({ body, dark, core, emissive }: BodyProps) {
  return (
    <group>
      <mesh castShadow position={[0, 0.85, 0]} rotation={[0.06, 0.15, 0]} material={body}>
        <boxGeometry args={[0.85, 1.5, 0.7]} />
      </mesh>
      <mesh position={[0, 0.85, 0.36]} material={dark}>
        <boxGeometry args={[0.6, 1.1, 0.04]} />
      </mesh>
      <mesh position={[0, 0.85, 0.38]}>
        <boxGeometry args={[0.45, 0.08, 0.03]} />
        <meshStandardMaterial ref={core} color="#1a0b02" emissive={emissive} emissiveIntensity={1.7} />
      </mesh>
      <mesh position={[0, 1.15, 0.38]}>
        <boxGeometry args={[0.45, 0.08, 0.03]} />
        <meshStandardMaterial color="#1a0b02" emissive={emissive} emissiveIntensity={1.2} />
      </mesh>
      <mesh castShadow position={[0, 1.85, 0]} material={dark}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
      </mesh>
      <mesh position={[-0.13, 1.88, 0.24]}>
        <boxGeometry args={[0.11, 0.07, 0.04]} />
        <meshBasicMaterial color={emissive} toneMapped={false} />
      </mesh>
      <mesh position={[0.13, 1.88, 0.24]}>
        <boxGeometry args={[0.11, 0.07, 0.04]} />
        <meshBasicMaterial color={emissive} toneMapped={false} />
      </mesh>
      <mesh castShadow position={[-0.6, 1.3, 0]} rotation={[0, 0, 0.4]} material={dark}>
        <boxGeometry args={[0.16, 1.1, 0.16]} />
      </mesh>
      <mesh castShadow position={[0.6, 1.3, 0]} rotation={[0, 0, -0.4]} material={dark}>
        <boxGeometry args={[0.16, 1.1, 0.16]} />
      </mesh>
      <mesh castShadow position={[-0.28, 0.2, 0]} material={dark}>
        <boxGeometry args={[0.24, 0.4, 0.3]} />
      </mesh>
      <mesh castShadow position={[0.28, 0.2, 0]} material={dark}>
        <boxGeometry args={[0.24, 0.4, 0.3]} />
      </mesh>
    </group>
  );
}

function SpywareBody({ dark, core, emissive }: { dark: THREE.Material; core: React.Ref<THREE.MeshStandardMaterial>; emissive: string }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ring.current) ring.current.rotation.z = world.time * 1.8;
  });
  return (
    <group position={[0, 1.1, 0]}>
      <mesh castShadow material={dark}>
        <octahedronGeometry args={[0.42]} />
      </mesh>
      <mesh scale={0.62}>
        <octahedronGeometry args={[0.42]} />
        <meshStandardMaterial ref={core} color="#02110f" emissive={emissive} emissiveIntensity={1.9} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.62, 0.035, 8, 32]} />
        <meshStandardMaterial color="#0a0f1c" emissive={emissive} emissiveIntensity={1.4} />
      </mesh>
      <pointLight color={emissive} intensity={7} distance={8} />
    </group>
  );
}

function BossBody({ body, dark, core, emissive }: BodyProps) {
  return (
    <group>
      <mesh castShadow position={[0, 1.9, 0]} material={body}>
        <boxGeometry args={[2.3, 2.9, 0.7]} />
      </mesh>
      <mesh position={[0, 1.9, 0.37]} material={dark}>
        <planeGeometry args={[1.9, 2.5]} />
      </mesh>
      <mesh position={[0, 1.9, 0.38]}>
        <planeGeometry args={[1.7, 2.3]} />
        <meshStandardMaterial ref={core} color="#020a18" emissive={emissive} emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[-0.45, 2.3, 0.4]}>
        <planeGeometry args={[0.42, 0.28]} />
        <meshBasicMaterial color="#dbeafe" toneMapped={false} />
      </mesh>
      <mesh position={[0.45, 2.3, 0.4]}>
        <planeGeometry args={[0.42, 0.28]} />
        <meshBasicMaterial color="#dbeafe" toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.45, 0.4]} rotation={[0.25, 0, 0]}>
        <planeGeometry args={[0.9, 0.12]} />
        <meshBasicMaterial color="#dbeafe" toneMapped={false} />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <mesh key={i} castShadow position={[x, 3.6, 0]} material={dark}>
          <coneGeometry args={[0.14, 0.55, 4]} />
        </mesh>
      ))}
      <mesh castShadow position={[-1.45, 1.1, 0]} material={dark}>
        <boxGeometry args={[0.5, 2.2, 0.5]} />
      </mesh>
      <mesh castShadow position={[1.45, 1.1, 0]} material={dark}>
        <boxGeometry args={[0.5, 2.2, 0.5]} />
      </mesh>
      <mesh castShadow position={[-0.8, 0.3, 0]} material={dark}>
        <boxGeometry args={[0.7, 0.6, 0.9]} />
      </mesh>
      <mesh castShadow position={[0.8, 0.3, 0]} material={dark}>
        <boxGeometry args={[0.7, 0.6, 0.9]} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.65, 40]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.4} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color={emissive} intensity={30} distance={18} position={[0, 2.5, 1]} />
    </group>
  );
}

function WormBody({ body, dark, core, emissive }: BodyProps) {
  return (
    <group>
      {[-0.7, -0.15, 0.4].map((z, i) => (
        <mesh key={i} castShadow position={[0, 0.42 - i * 0.04, z]} material={i === 2 ? dark : body}>
          <sphereGeometry args={[0.42 - i * 0.07, 12, 10]} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0.4]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial ref={core} color="#0c1a05" emissive={emissive} emissiveIntensity={1.7} />
      </mesh>
      <mesh position={[-0.14, 0.52, 0.72]}>
        <coneGeometry args={[0.07, 0.3, 6]} />
        <meshBasicMaterial color={emissive} toneMapped={false} />
      </mesh>
      <mesh position={[0.14, 0.52, 0.72]}>
        <coneGeometry args={[0.07, 0.3, 6]} />
        <meshBasicMaterial color={emissive} toneMapped={false} />
      </mesh>
      {[0.3, 0.9, 1.5].map((a, i) => (
        <mesh key={i} castShadow position={[Math.sin(a) * 0.55, 0.25, -Math.cos(a) * 0.2 - 0.2]} rotation={[0, 0, 0.6]} material={dark}>
          <boxGeometry args={[0.34, 0.07, 0.07]} />
        </mesh>
      ))}
    </group>
  );
}

function RootkitBody({ dark, core, emissive }: { dark: THREE.Material; core: React.Ref<THREE.MeshStandardMaterial>; emissive: string }) {
  const blades = useRef<THREE.Group>(null);
  useFrame(() => {
    if (blades.current) blades.current.rotation.y = world.time * 4;
  });
  return (
    <group>
      <mesh castShadow position={[0, 0.75, 0]}>
        <coneGeometry args={[0.34, 1.1, 6]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial ref={core} color="#0a0a20" emissive={emissive} emissiveIntensity={2.2} />
      </mesh>
      <group ref={blades} position={[0, 0.45, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} castShadow position={[Math.cos((i / 3) * Math.PI * 2) * 0.5, 0, Math.sin((i / 3) * Math.PI * 2) * 0.5]} rotation={[0, -(i / 3) * Math.PI * 2, 0.5]} material={dark}>
            <boxGeometry args={[0.5, 0.06, 0.12]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function BotnetBody({ dark, core, emissive }: { dark: THREE.Material; core: React.Ref<THREE.MeshStandardMaterial>; emissive: string }) {
  return (
    <group position={[0, 0.55 + Math.sin(world.time * 5) * 0.06, 0]}>
      <mesh castShadow material={dark}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
      </mesh>
      <mesh scale={0.6}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial ref={core} color="#171204" emissive={emissive} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 5]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshBasicMaterial color={emissive} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FirewallBody({ body, dark, core, emissive }: BodyProps) {
  return (
    <group>
      <mesh castShadow position={[0, 1.1, 0]} rotation={[0.05, 0.1, 0.04]} material={body}>
        <boxGeometry args={[1.2, 2.1, 0.4]} />
      </mesh>
      {[0.5, 1.1, 1.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0.22]}>
          <boxGeometry args={[0.95, 0.1, 0.03]} />
          <meshStandardMaterial ref={i === 1 ? core : undefined} color="#1c0713" emissive={emissive} emissiveIntensity={1.6} />
        </mesh>
      ))}
      <mesh castShadow position={[-0.75, 0.5, 0]} material={dark}>
        <boxGeometry args={[0.25, 1, 0.35]} />
      </mesh>
      <mesh castShadow position={[0.75, 0.5, 0]} material={dark}>
        <boxGeometry args={[0.25, 1, 0.35]} />
      </mesh>
      <mesh castShadow position={[0, 2.35, 0]} material={dark}>
        <coneGeometry args={[0.3, 0.5, 4]} />
      </mesh>
    </group>
  );
}

function QueenBody({ body, dark, core, emissive }: BodyProps) {
  const sacs = useRef<THREE.Group>(null);
  useFrame(() => {
    if (sacs.current) sacs.current.scale.setScalar(1 + Math.sin(world.time * 2.4) * 0.06);
  });
  return (
    <group>
      {[-1.5, -0.6, 0.3].map((z, i) => (
        <mesh key={i} castShadow position={[0, 0.85 - i * 0.08, z]} material={i === 2 ? dark : body}>
          <sphereGeometry args={[0.85 - i * 0.12, 14, 12]} />
        </mesh>
      ))}
      <group ref={sacs} position={[0, 1.5, -0.9]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.45, 0, 0]}>
            <sphereGeometry args={[0.3, 10, 8]} />
            <meshStandardMaterial color="#2c3a08" emissive={emissive} emissiveIntensity={0.9} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.95, 0.3]}>
        <sphereGeometry args={[0.6, 14, 12]} />
        <meshStandardMaterial ref={core} color="#16210a" emissive={emissive} emissiveIntensity={1.5} />
      </mesh>
      {[-0.5, -0.17, 0.17, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 0.75]} rotation={[0.5, 0, 0]}>
          <coneGeometry args={[0.12, 0.6, 5]} />
          <meshStandardMaterial color="#0f1804" emissive={emissive} emissiveIntensity={1.4} />
        </mesh>
      ))}
      <mesh position={[-0.3, 1.0, 1.05]}>
        <sphereGeometry args={[0.11, 8, 6]} />
        <meshBasicMaterial color="#fef08a" toneMapped={false} />
      </mesh>
      <mesh position={[0.3, 1.0, 1.05]}>
        <sphereGeometry args={[0.11, 8, 6]} />
        <meshBasicMaterial color="#fef08a" toneMapped={false} />
      </mesh>
      <pointLight color={emissive} intensity={24} distance={20} position={[0, 2, 0]} />
    </group>
  );
}

function MainframeBody({ body, dark, core, emissive }: BodyProps) {
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
      <mesh castShadow position={[0, 2.6, 0]} material={body}>
        <cylinderGeometry args={[1.1, 1.5, 5.2, 8]} />
      </mesh>
      {[1.2, 2.6, 4.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[1.32, 1.32, 0.28, 8]} />
          <meshStandardMaterial ref={i === 1 ? core : undefined} color="#160310" emissive={emissive} emissiveIntensity={1.7} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 5.6, 0]} material={dark}>
        <sphereGeometry args={[0.7, 14, 12]} />
      </mesh>
      <mesh position={[0, 5.6, 0.55]}>
        <boxGeometry args={[0.7, 0.2, 0.1]} />
        <meshBasicMaterial color="#fdf4ff" toneMapped={false} />
      </mesh>
      <group ref={rings} position={[0, 2.6, 0]}>
        {[1.9, 2.4].map((r, i) => (
          <mesh key={i}>
            <torusGeometry args={[r, 0.07, 8, 40]} />
            <meshStandardMaterial color="#160310" emissive={emissive} emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} castShadow position={[Math.cos((i / 4) * Math.PI * 2) * 1.9, 0.5, Math.sin((i / 4) * Math.PI * 2) * 1.9]} material={dark}>
          <boxGeometry args={[0.5, 1, 0.5]} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.2, 48]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.45} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color={emissive} intensity={40} distance={26} position={[0, 3.5, 0]} />
    </group>
  );
}
