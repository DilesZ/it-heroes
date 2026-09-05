import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { world } from "../state/world";

function SlashFx({ index }: { index: number }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const matHot = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const s = world.slashes[index];
    const g = group.current;
    if (!g) return;
    g.visible = s.t > 0;
    if (s.t <= 0) return;
    const prog = 1 - s.t;
    g.position.set(s.pos.x, 0.9, s.pos.z);
    g.rotation.y = s.facing - 1.05;
    const r = s.radius * (0.5 + prog * 0.7);
    g.scale.set(r, r, r);
    if (mat.current) {
      mat.current.opacity = s.t * 0.85;
      mat.current.color.set(s.color);
    }
    if (matHot.current) matHot.current.opacity = s.t * s.t * 0.95;
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 1, 20, 1, 0, 2.1]} />
        <meshBasicMaterial
          ref={mat}
          color="#ffffff"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} scale={0.62}>
        <ringGeometry args={[0.55, 1, 16, 1, 0.25, 1.6]} />
        <meshBasicMaterial
          ref={matHot}
          color="#ffffff"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function BlastFx({ index }: { index: number }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const b = world.blasts[index];
    const g = group.current;
    if (!g) return;
    g.visible = b.t > 0;
    if (b.t <= 0) return;
    const prog = 1 - b.t;
    g.position.set(b.pos.x, 0.16, b.pos.z);
    const r = 0.4 + prog * b.radius;
    g.scale.set(r, r, r);
    if (mat.current) {
      mat.current.opacity = b.t * 0.9;
      mat.current.color.set(b.color);
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 1, 40]} />
        <meshBasicMaterial
          ref={mat}
          color="#ffffff"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function Slashes() {
  return (
    <group>
      {world.slashes.map((_, i) => (
        <SlashFx key={i} index={i} />
      ))}
    </group>
  );
}

export function Blasts() {
  return (
    <group>
      {world.blasts.map((_, i) => (
        <BlastFx key={i} index={i} />
      ))}
    </group>
  );
}

function BeamFx({ index }: { index: number }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const matHot = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const b = world.beams[index];
    const g = group.current;
    if (!g) return;
    g.visible = b.t > 0;
    if (b.t <= 0) return;
    g.position.set(
      b.pos.x + Math.sin(b.facing) * b.len * 0.5,
      1.0,
      b.pos.z + Math.cos(b.facing) * b.len * 0.5
    );
    g.rotation.y = b.facing;
    g.scale.set(1, 1, b.len);
    if (mat.current) {
      mat.current.opacity = b.t * 0.7;
      mat.current.color.set(b.color);
    }
    if (matHot.current) matHot.current.opacity = b.t * b.t;
  });

  return (
    <group ref={group} visible={false}>
      <mesh>
        <boxGeometry args={[1.6, 1.1, 1]} />
        <meshBasicMaterial
          ref={mat}
          color="#ffffff"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[0.55, 1.25, 1]} />
        <meshBasicMaterial
          ref={matHot}
          color="#ffffff"
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function Beams() {
  return (
    <group>
      {world.beams.map((_, i) => (
        <BeamFx key={i} index={i} />
      ))}
    </group>
  );
}
