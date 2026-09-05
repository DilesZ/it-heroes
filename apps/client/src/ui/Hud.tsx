import { useTranslation } from "react-i18next";
import { useUi } from "../state/uiStore";
import { useHud } from "../state/hudStore";
import SkillBar from "./SkillBar";
import BossBar from "./BossBar";
import { useInventory } from "../state/inventoryStore";
import { useProgression, MAX_LEVEL } from "../state/progressionStore";
import { CLASSES, GAME_NAME, VERSION, PLAYER_BASE, XP_CURVE } from "@it-heroes/shared";

function Bar({
  value,
  max,
  color,
  glow,
  height = 10,
}: {
  value: number;
  max: number;
  color: string;
  glow: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className="relative w-44 overflow-hidden rounded-sm border border-white/10 bg-black/60"
      style={{ height }}
    >
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${glow}` }}
      />
    </div>
  );
}

export default function Hud() {
  const { t } = useTranslation();
  const classId = useUi((s) => s.classId);
  const setScreen = useUi((s) => s.setScreen);
  const { hp, maxHp, mana, maxMana, stamina, maxStamina, dead } = useHud();
  const gold = useInventory((s) => s.gold);
  const bagCount = useInventory((s) => s.items.length);
  const setInvOpen = useInventory((s) => s.setInvOpen);
  const level = useProgression((s) => s.level);
  const xp = useProgression((s) => s.xp);
  const skillPoints = useProgression((s) => s.skillPoints);
  const setTreeOpen = useProgression((s) => s.setTreeOpen);
  const xpNeed = level >= MAX_LEVEL ? 1 : XP_CURVE(level);

  return (
    <div className="pointer-events-none absolute inset-0">
      <SkillBar />
      <BossBar />
      {dead && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/40 backdrop-blur-[1px]">
          <h2 className="font-display text-4xl font-black tracking-[0.25em] text-red-300 drop-shadow-[0_0_20px_rgba(244,63,94,0.7)]">
            {t("hud.defeated")}
          </h2>
          <p className="mt-3 text-sm tracking-widest text-red-200/70">{t("hud.respawn")}</p>
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-violet-400/50 bg-black/70 shadow-[0_0_14px_rgba(167,139,250,0.35)]">
          <span className="font-display text-base font-black leading-none text-violet-200">{level}</span>
          <span className="text-[8px] tracking-widest text-slate-500">LVL</span>
        </div>
        <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-10 text-right font-display text-[10px] font-bold tracking-widest text-rose-300">HP</span>
          <Bar value={hp} max={maxHp} color="linear-gradient(90deg,#f43f5e,#fb7185)" glow="rgba(244,63,94,0.5)" height={12} />
          <span className="w-16 text-xs text-slate-300">
            {Math.ceil(hp)}/{maxHp}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 text-right font-display text-[10px] font-bold tracking-widest text-sky-300">MP</span>
          <Bar value={mana} max={maxMana} color="linear-gradient(90deg,#0ea5e9,#38bdf8)" glow="rgba(14,165,233,0.5)" />
          <span className="w-16 text-xs text-slate-300">
            {Math.ceil(mana)}/{maxMana}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 text-right font-display text-[10px] font-bold tracking-widest text-amber-300">STA</span>
          <Bar value={stamina} max={maxStamina} color="linear-gradient(90deg,#f59e0b,#fbbf24)" glow="rgba(245,158,11,0.45)" />
          <span className="w-16 text-[10px] text-slate-500">SHIFT · dodge ({PLAYER_BASE.dodgeStaminaCost})</span>
        </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[5px] bg-black/70">
        <div
          className="h-full transition-[width] duration-200"
          style={{
            width: `${Math.min(100, (xp / xpNeed) * 100)}%`,
            background: "linear-gradient(90deg,#8b5cf6,#a78bfa,#e9d5ff)",
            boxShadow: "0 0 10px rgba(167,139,250,0.7)",
          }}
        />
      </div>

      <div className="absolute left-4 top-4 rounded panel px-4 py-2">
        <span className="font-display text-sm font-bold tracking-widest" style={{ color: CLASSES[classId].color }}>
          {t(CLASSES[classId].nameKey)}
        </span>
        <span className="ml-3 text-xs text-slate-500">{t("biomes.hub")}</span>
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          onClick={() => setTreeOpen(true)}
          className={`pointer-events-auto btn-tech relative rounded px-3 py-1.5 text-xs font-bold tracking-widest ${
            skillPoints > 0 ? "animate-pulse text-violet-200" : "text-slate-300"
          }`}
        >
          [K] {t("skills.tree")}
          {skillPoints > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[11px] font-black text-white">
              {skillPoints}
            </span>
          )}
        </button>
        <button
          onClick={() => setInvOpen(true)}
          className="pointer-events-auto btn-tech rounded px-3 py-1.5 text-xs font-bold tracking-widest text-amber-200"
        >
          [I] {t("hud.inventory")} ({bagCount})
        </button>
        <span className="rounded panel px-3 py-1.5 text-xs font-bold text-amber-300">{gold} G</span>
        <span className="rounded panel px-3 py-1.5 text-[10px] tracking-widest text-slate-500">
          {GAME_NAME} v{VERSION}
        </span>
        <button
          onClick={() => setScreen("menu")}
          className="pointer-events-auto btn-tech rounded px-3 py-1.5 text-xs tracking-widest text-slate-300"
        >
          ESC · {t("hud.toMenu")}
        </button>
      </div>
    </div>
  );
}
