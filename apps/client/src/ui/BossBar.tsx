import { useTranslation } from "react-i18next";
import { useHud } from "../state/hudStore";

export default function BossBar() {
  const { t } = useTranslation();
  const bossFrac = useHud((s) => s.bossFrac);
  const bossNameKey = useHud((s) => s.bossNameKey);
  if (bossFrac < 0) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-4 w-[420px] max-w-[80vw] -translate-x-1/2">
      <div className="mb-1 text-center font-display text-sm font-bold tracking-[0.3em] text-blue-200 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
        {t(bossNameKey)}
      </div>
      <div className="h-3.5 overflow-hidden rounded-sm border border-blue-400/50 bg-black/70 shadow-[0_0_16px_rgba(59,130,246,0.4)]">
        <div
          className="h-full transition-[width] duration-200"
          style={{
            width: `${Math.max(0, bossFrac * 100)}%`,
            background: "linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)",
          }}
        />
      </div>
    </div>
  );
}
