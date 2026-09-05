import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { world } from "../state/world";

function FloatSlot({ index }: { index: number }) {
  const group = useRef<THREE.Group>(null);
  const div = useRef<HTMLDivElement>(null);
  const shown = useRef(false);

  useFrame(() => {
    const f = world.floats[index];
    const g = group.current;
    const d = div.current;
    if (!g || !d) return;
    if (!f.alive) {
      if (shown.current) {
        shown.current = false;
        d.style.display = "none";
      }
      return;
    }
    shown.current = true;
    d.style.display = "block";
    d.textContent = f.text;
    d.style.color = f.color;
    const k = 1 - f.t / f.dur;
    d.style.opacity = `${Math.min(1, k * 2)}`;
    d.style.fontSize = f.big ? "30px" : "20px";
    g.position.copy(f.pos);
  });

  return (
    <group ref={group} position={[0, -100, 0]}>
      <Html center zIndexRange={[50, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={div}
          className="font-display font-black whitespace-nowrap"
          style={{
            display: "none",
            textShadow: "0 0 8px rgba(0,0,0,0.9), 0 2px 2px #000, -1px 0 0 #000, 1px 0 0 #000, 0 -1px 0 #000",
            letterSpacing: "0.05em",
          }}
        />
      </Html>
    </group>
  );
}

export default function FloatingTexts() {
  return (
    <group>
      {world.floats.map((_, i) => (
        <FloatSlot key={i} index={i} />
      ))}
    </group>
  );
}
