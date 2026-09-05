import { useTranslation } from "react-i18next";
import { useUi } from "../state/uiStore";
import { useHud } from "../state/hudStore";
import SkillBar from "./SkillBar";
import BossBar from "./BossBar";
import { CLASSES, GAME_NAME, VERSION, PLAYER_BASE } from "@it-heroes/shared";

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
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
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

      <div className="absolute left-4 top-4 rounded panel px-4 py-2">
        <span className="font-display text-sm font-bold tracking-widest" style={{ color: CLASSES[classId].color }}>
          {t(CLASSES[classId].nameKey)}
        </span>
        <span className="ml-3 text-xs text-slate-500">{t("biomes.hub")}</span>
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-2">
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
