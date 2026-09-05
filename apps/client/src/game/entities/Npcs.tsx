import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import { Ball, Box, Caps, Cyl, Eyes } from "../art/kit";
import { BRIGHT } from "../art/palette";
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
  { id: "npc_forge", nameKey: "npc.forge.name", pos: [7.5, 0, -1.5], color: "#fb923c", kind: "tech" },
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
      <Caps p={[0, 0.3, 0]} r={0.2} len={0.16} color="#e8eefc" />
      <Box p={[0, 0.32, 0.18]} s={[0.18, 0.2, 0.05]} color={color} radius={0.02} />
      <Caps p={[-0.26, 0.32, 0]} r={0.06} len={0.14} color="#dbe4f7" />
      <Caps p={[0.26, 0.32, 0]} r={0.06} len={0.14} color="#dbe4f7" />
      <Ball p={[0, 0.92, 0]} r={0.26} color={BRIGHT.skin} detail={2} />
      <Eyes p={[0, 0.92, 0.225]} s={0.95} />
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.275, 14, 10, 0, Math.PI * 2, 0, 1.1]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
      <Caps p={[-0.11, 0.08, 0]} r={0.08} len={0.08} color="#3b4763" />
      <Caps p={[0.11, 0.08, 0]} r={0.08} len={0.08} color="#3b4763" />
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
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
      <Ball p={[0, 0.42, 0]} r={0.32} color="#e8eefc" detail={2} />
      <Eyes p={[0, 0.46, 0.26]} s={0.9} />
      <Cyl p={[0, 0.78, 0]} rt={0.03} rb={0.03} h={0.3} color="#8a94ad" outline={false} />
      <Ball p={[0, 0.95, 0]} r={0.06} color="#f43f5e" emissive="#f43f5e" ei={2} outline={false} />
      <Cyl p={[0, 0.1, 0]} rt={0.2} rb={0.26} h={0.14} color="#8a94ad" />
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
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
