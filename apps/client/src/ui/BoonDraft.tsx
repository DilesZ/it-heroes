import { useTranslation } from "react-i18next";
import { BOONS } from "@it-heroes/shared";
import { useProgression } from "../state/progressionStore";
import { sfx } from "../game/audio";
import SkillIcon from "./SkillIcon";

export default function BoonDraft() {
  const { t } = useTranslation();
  const draftOpen = useProgression((s) => s.draftOpen);
  const draftOptions = useProgression((s) => s.draftOptions);
  const pickBoon = useProgression((s) => s.pickBoon);
  if (!draftOpen) return null;
  const options = draftOptions
    .map((id) => BOONS.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-violet-950/60 p-4 backdrop-blur-[2px]">
      <div className="flex max-w-full flex-col items-center gap-5">
        <div className="text-center">
          <h2 className="font-display text-3xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-fuchsia-200 to-violet-400 drop-shadow-[0_0_22px_rgba(192,132,252,0.6)]">
            {t("boon.title")}
          </h2>
          <p className="mt-1 text-sm tracking-[0.3em] text-violet-200/70">{t("boon.sub")}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {options.map((b) =>
            b ? (
              <button
                key={b.id}
                onClick={() => {
                  sfx.click();
                  pickBoon(b.id);
                }}
                className="panel group flex w-[200px] flex-col items-center gap-2 p-5 transition-transform hover:-translate-y-1.5"
                style={{ borderColor: `${b.color}88` }}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: b.color,
                    background: `${b.color}18`,
                    boxShadow: `0 0 22px ${b.color}55`,
                  }}
                >
                  <SkillIcon icon={b.icon} color={b.color} size={30} />
                </span>
                <span className="font-display text-sm font-bold tracking-wider" style={{ color: b.color }}>
                  {t(b.nameKey)}
                </span>
                <span className="text-center text-[13px] leading-snug text-slate-300">{t(b.descKey)}</span>
              </button>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
