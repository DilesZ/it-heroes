import { useTranslation } from "react-i18next";
import { SKILL_NODES, type SkillNodeDef } from "@it-heroes/shared";
import { useProgression } from "../state/progressionStore";
import { useUi } from "../state/uiStore";
import { sfx } from "../game/audio";

const GLYPHS: Record<string, string> = {
  slash: "/",
  slam: "◎",
  shield: "⬟",
  bolt: "≋",
  nova: "✸",
  turret: "⌖",
  arrow: "➤",
  trap: "⬔",
  burst: "✚",
};

function NodeCard({ node, rank, points, level }: { node: SkillNodeDef; rank: number; points: number; level: number }) {
  const { t } = useTranslation();
  const spendPoint = useProgression((s) => s.spendPoint);
  const maxed = rank >= node.maxRank;
  const locked = level < node.reqLevel;
  const afford = points > 0 && !maxed && !locked;
  return (
    <button
      onClick={() => {
        if (spendPoint(node.id)) sfx.click();
      }}
      disabled={!afford}
      className="relative flex items-center gap-2 rounded border bg-black/50 px-2 py-1.5 text-left transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:hover:translate-y-0"
      style={{
        borderColor: maxed ? node.color : locked ? "#334155" : `${node.color}55`,
        boxShadow: maxed ? `0 0 12px ${node.color}55` : undefined,
        opacity: locked ? 0.45 : 1,
      }}
      title={t(node.descKey)}
    >
      <span className="text-xl font-black leading-none" style={{ color: locked ? "#475569" : node.color }}>
        {GLYPHS[node.icon] ?? "?"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold leading-tight text-slate-200">
          {t(node.nameKey)}
        </span>
        <span className="block text-[10px] leading-tight text-slate-500">
          {locked ? `${t("skills.req")} ${node.reqLevel}` : maxed ? t("skills.maxed") : t(node.descKey)}
        </span>
        <span className="mt-0.5 flex gap-0.5">
          {Array.from({ length: node.maxRank }, (_, i) => (
            <span
              key={i}
              className="h-1.5 w-4 rounded-sm"
              style={{ background: i < rank ? node.color : "#1e293b" }}
            />
          ))}
        </span>
      </span>
    </button>
  );
}

export default function SkillTree() {
  const { t } = useTranslation();
  const classId = useUi((s) => s.classId);
  const level = useProgression((s) => s.level);
  const skillPoints = useProgression((s) => s.skillPoints);
  const ranks = useProgression((s) => s.ranks);
  const setTreeOpen = useProgression((s) => s.setTreeOpen);
  const nodes = SKILL_NODES.filter((n) => n.classId === classId);
  const upgrades = nodes.filter((n) => n.target);
  const passives = nodes.filter((n) => !n.target);

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="panel flex max-h-full w-[640px] max-w-full flex-col gap-3 overflow-hidden rounded-lg p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black tracking-[0.2em] text-violet-200">
            {t("skills.tree")}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">
              {t("hud.level")} {level}
            </span>
            <span
              className={`rounded border px-3 py-1 text-sm font-bold ${
                skillPoints > 0
                  ? "animate-pulse border-violet-400/60 bg-violet-500/15 text-violet-200"
                  : "border-slate-700 text-slate-500"
              }`}
            >
              {skillPoints} {t("skills.points")}
            </span>
            <button onClick={() => setTreeOpen(false)} className="btn-tech rounded px-3 py-1 text-xs tracking-widest text-slate-300">
              {t("inv.close").replace("[I]", "[K]")}
            </button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            {upgrades.map((n) => (
              <NodeCard key={n.id} node={n} rank={ranks[n.id] ?? 0} points={skillPoints} level={level} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {passives.map((n) => (
              <NodeCard key={n.id} node={n} rank={ranks[n.id] ?? 0} points={skillPoints} level={level} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
