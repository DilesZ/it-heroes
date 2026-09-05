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

  const isBoss = c.defId === "bsod_lord";
  const barY = isBoss ? 4.6 : 1.5 * c.scale + 0.9;

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
        {c.defId === "bsod_lord" && <BossBody body={mats.body} dark={mats.dark} core={core} emissive={c.emissive} />}
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
        <TelegraphRing color={c.emissive} radius={5.5} progress={1 - c.aiT / 1.0} />
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
