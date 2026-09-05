import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import { world } from "../state/world";
import { useQuests, activeMainQuest, isTurnable, questDef } from "../../state/questStore";

export type NpcDef = {
  id: string;
  nameKey: string;
  pos: [number, number, number];
  color: string;
  kind: "tech" | "bot";
};

export const NPCS: NpcDef[] = [
  { id: "npc_chief", nameKey: "npc.chief.name", pos: [3.5, 0, 3], color: "#f59e0b", kind: "tech" },
  { id: "npc_intern", nameKey: "npc.intern.name", pos: [-4.5, 0, 7.5], color: "#34d399", kind: "tech" },
  { id: "npc_bot", nameKey: "npc.bot.name", pos: [-2, 0, 12], color: "#94a3b8", kind: "bot" },
];

function Marker({ npcId }: { npcId: string }) {
  const { t } = useTranslation();
  const started = useQuests((s) => s.started);
  const done = useQuests((s) => s.done);
  const progress = useQuests((s) => s.progress);

  let symbol: string | null = null;
  let color = "#fbbf24";
  if (npcId === "npc_chief") {
    const active = activeMainQuest({ started, done });
    if (!started.includes("q_boot")) symbol = "!";
    else if (active && isTurnable({ progress }, active)) symbol = "!";
    else if (active) {
      symbol = "?";
      color = "#94a3b8";
    }
  }
  if (npcId === "npc_intern") {
    if (!started.includes("q_scrap")) symbol = "!";
    else if (!done.includes("q_scrap")) {
      const q = questDef("q_scrap")!;
      symbol = isTurnable({ progress }, q) ? "!" : "?";
      if (symbol === "?") color = "#94a3b8";
    }
  }

  if (!symbol) return null;
  return (
    <Html center position={[0, 2.6, 0]} zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
      <div
        className="font-display text-2xl font-black"
        style={{ color, textShadow: "0 0 10px rgba(0,0,0,0.9), 0 0 14px currentColor" }}
      >
        {symbol}
        <span className="sr-only">{t("dialog.interact")}</span>
      </div>
    </Html>
  );
}

function Prompt({ npcId }: { npcId: string }) {
  const { t } = useTranslation();
  const div = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const npc = NPCS.find((n) => n.id === npcId)!;
    const d = Math.hypot(world.player.pos.x - npc.pos[0], world.player.pos.z - npc.pos[2]);
    const show = d < 3.2 && world.player.alive && useQuests.getState().dialogNpc === null;
    if (div.current) div.current.style.display = show ? "block" : "none";
  });
  return (
    <Html center position={[0, 1.1, 1.2]} zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
      <div
        ref={div}
        className="rounded border border-cyan-400/60 bg-black/80 px-2 py-0.5 font-display text-[11px] font-bold tracking-widest text-cyan-200"
        style={{ display: "none" }}
      >
        [E] {t("dialog.interact")}
      </div>
    </Html>
  );
}

function TechNpc({ color }: { color: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!g.current) return;
    const dx = world.player.pos.x - g.current.position.x;
    const dz = world.player.pos.z - g.current.position.z;
    g.current.rotation.y = Math.atan2(dx, dz);
    g.current.position.y = Math.sin(world.time * 2) * 0.02;
  });
  return (
    <group ref={g}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.24, 0.5, 6, 12]} />
        <meshStandardMaterial color="#232f4a" roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.72, 0.2]}>
        <boxGeometry args={[0.24, 0.3, 0.05]} />
        <meshStandardMaterial color="#0b1220" emissive={color} emissiveIntensity={1.6} />
      </mesh>
      <mesh castShadow position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.17, 14, 12]} />
        <meshStandardMaterial color="#d9a06b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.17, 0.14]}>
        <boxGeometry args={[0.24, 0.08, 0.05]} />
        <meshStandardMaterial color="#04101c" emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh castShadow position={[-0.32, 0.6, 0]}>
        <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
        <meshStandardMaterial color="#1a2340" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.32, 0.6, 0]}>
        <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
        <meshStandardMaterial color="#1a2340" roughness={0.6} />
      </mesh>
    </group>
  );
}

function BotNpc({ color }: { color: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!g.current) return;
    g.current.rotation.y = world.time * 0.5;
    g.current.position.y = 0.12 + Math.sin(world.time * 3) * 0.05;
  });
  return (
    <group ref={g}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#2b3648" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.38, 0.26]}>
        <planeGeometry args={[0.3, 0.14]} />
        <meshStandardMaterial color="#04101c" emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#000" emissive="#f43f5e" emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

export default function Npcs() {
  return (
    <group>
      {NPCS.map((npc) => (
        <group key={npc.id} position={npc.pos}>
          {npc.kind === "tech" ? <TechNpc color={npc.color} /> : <BotNpc color={npc.color} />}
          <Marker npcId={npc.id} />
          <Prompt npcId={npc.id} />
        </group>
      ))}
    </group>
  );
}
