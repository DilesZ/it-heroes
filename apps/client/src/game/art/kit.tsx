import { useMemo, type ReactNode } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { INK } from "./palette";

let gradientMap: THREE.DataTexture | null = null;

export function getGradientMap(): THREE.DataTexture {
  if (!gradientMap) {
    const data = new Uint8Array([110, 170, 255]);
    gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
  }
  return gradientMap;
}

const matCache = new Map<string, THREE.MeshToonMaterial>();

export function toon(color: string, emissive?: string, emissiveIntensity?: number, flat = true): THREE.MeshToonMaterial {
  const key = `${color}|${emissive ?? ""}|${emissiveIntensity ?? 0}|${flat ? 1 : 0}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({
      color,
      gradientMap: getGradientMap(),
      ...(emissive ? { emissive, emissiveIntensity: emissiveIntensity ?? 1 } : {}),
    });
    (m as unknown as { flatShading: boolean }).flatShading = flat;
    m.needsUpdate = true;
    matCache.set(key, m);
  }
  return m;
}

type Common = {
  p?: [number, number, number];
  color?: string;
  emissive?: string;
  ei?: number;
  outline?: boolean | string;
  oScale?: number;
  shadow?: boolean;
  flat?: boolean;
};

function Hull({ children, color, oScale }: { children: ReactNode; color: string; oScale: number }) {
  return (
    <mesh scale={oScale}>
      <meshBasicMaterial color={color} side={THREE.BackSide} />
      {children}
    </mesh>
  );
}

function outlineColor(outline: boolean | string | undefined): string | null {
  if (!outline) return null;
  return typeof outline === "string" ? outline : INK;
}

export function Ball({
  p = [0, 0, 0],
  r = 0.5,
  color = "#ffffff",
  emissive,
  ei,
  outline = true,
  oScale = 1.07,
  shadow = true,
  flat = true,
  detail = 1,
}: Common & { r?: number; detail?: number }) {
  const geo = useMemo(() => <sphereGeometry args={[r, 14, 12]} />, [r]);
  const oc = outlineColor(outline);
  return (
    <group position={p}>
      <mesh castShadow={shadow} material={toon(color, emissive, ei, flat)}>
        {geo}
      </mesh>
      {oc && (
        <Hull color={oc} oScale={oScale}>
          <sphereGeometry args={[r, detail === 1 ? 7 : 14, detail === 1 ? 6 : 12]} />
        </Hull>
      )}
    </group>
  );
}

export function Box({
  p = [0, 0, 0],
  s = [1, 1, 1],
  color = "#ffffff",
  emissive,
  ei,
  outline = true,
  oScale = 1.06,
  shadow = true,
  radius = 0.06,
}: Common & { s?: [number, number, number]; radius?: number }) {
  const oc = outlineColor(outline);
  const mat = toon(color, emissive, ei);
  return (
    <group position={p}>
      <RoundedBox args={s} radius={radius} castShadow={shadow} material={mat} />
      {oc && (
        <RoundedBox args={[s[0] * oScale, s[1] * oScale, s[2] * oScale]} radius={radius * oScale}>
          <meshBasicMaterial color={oc} side={THREE.BackSide} />
        </RoundedBox>
      )}
    </group>
  );
}

export function Cyl({
  p = [0, 0, 0],
  rt = 0.5,
  rb,
  h = 1,
  seg = 10,
  color = "#ffffff",
  emissive,
  ei,
  outline = true,
  oScale = 1.07,
  shadow = true,
}: Common & { rt?: number; rb?: number; h?: number; seg?: number }) {
  const bottom = rb ?? rt;
  const oc = outlineColor(outline);
  return (
    <group position={p}>
      <mesh castShadow={shadow} material={toon(color, emissive, ei)}>
        <cylinderGeometry args={[rt, bottom, h, seg]} />
      </mesh>
      {oc && (
        <Hull color={oc} oScale={oScale}>
          <cylinderGeometry args={[rt, bottom, h, seg]} />
        </Hull>
      )}
    </group>
  );
}

export function Caps({
  p = [0, 0, 0],
  r = 0.2,
  len = 0.3,
  color = "#ffffff",
  emissive,
  ei,
  outline = true,
  oScale = 1.08,
  shadow = true,
}: Common & { r?: number; len?: number }) {
  const oc = outlineColor(outline);
  return (
    <group position={p}>
      <mesh castShadow={shadow} material={toon(color, emissive, ei)}>
        <capsuleGeometry args={[r, len, 6, 12]} />
      </mesh>
      {oc && (
        <Hull color={oc} oScale={oScale}>
          <capsuleGeometry args={[r, len, 4, 8]} />
        </Hull>
      )}
    </group>
  );
}

export function Eyes({
  p = [0, 0, 0],
  s = 1,
  gap = 0.16,
  angry = false,
}: {
  p?: [number, number, number];
  s?: number;
  gap?: number;
  angry?: boolean;
}) {
  const white = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffffff" }),
    []
  );
  const pupil = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#1c2233" }),
    []
  );
  return (
    <group position={p} scale={s}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * gap, 0, 0]}>
          <mesh material={white}>
            <sphereGeometry args={[0.085, 12, 10]} />
          </mesh>
          <mesh position={[0, -0.01, 0.062]} material={pupil}>
            <sphereGeometry args={[0.042, 10, 8]} />
          </mesh>
          {angry && (
            <mesh position={[side * 0.03, 0.1, 0.03]} rotation={[0, 0, side * -0.5]}>
              <boxGeometry args={[0.14, 0.035, 0.03]} />
              <meshBasicMaterial color="#1c2233" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
