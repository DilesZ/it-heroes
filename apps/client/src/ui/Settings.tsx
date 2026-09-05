import { useTranslation } from "react-i18next";
import { useSettings, type Quality } from "../state/settingsStore";
import { useUi } from "../state/uiStore";
import { sfx } from "../game/audio";

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-28 tracking-widest text-slate-400">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1 flex-1 cursor-pointer appearance-none rounded bg-slate-700 accent-cyan-400"
      />
      <span className="w-10 text-right text-slate-300">{Math.round(value * 100)}</span>
    </label>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const master = useSettings((s) => s.master);
  const music = useSettings((s) => s.music);
  const sfxV = useSettings((s) => s.sfx);
  const quality = useSettings((s) => s.quality);
  const shake = useSettings((s) => s.shake);
  const setMaster = useSettings((s) => s.setMaster);
  const setMusic = useSettings((s) => s.setMusic);
  const setSfx = useSettings((s) => s.setSfx);
  const setQuality = useSettings((s) => s.setQuality);
  const setShake = useSettings((s) => s.setShake);
  const lang = useUi((s) => s.lang);
  const setLang = useUi((s) => s.setLang);

  return (
    <div className="flex flex-col gap-3">
      <Slider label={t("settings.master")} value={master} onChange={(v) => { setMaster(v); sfx.click(); }} />
      <Slider label={t("settings.music")} value={music} onChange={setMusic} />
      <Slider label={t("settings.sfx")} value={sfxV} onChange={(v) => { setSfx(v); sfx.click(); }} />
      <div className="flex items-center gap-3 text-sm">
        <span className="w-28 tracking-widest text-slate-400">{t("settings.quality")}</span>
        <div className="flex flex-1 gap-1.5">
          {(["low", "med", "high"] as Quality[]).map((q) => (
            <button
              key={q}
              onClick={() => { setQuality(q); sfx.click(); }}
              className={`flex-1 rounded border px-2 py-1 text-[11px] font-bold tracking-widest ${
                quality === q
                  ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200"
                  : "border-slate-700 text-slate-500 hover:text-slate-300"
              }`}
            >
              {t(`settings.${q}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="w-28 tracking-widest text-slate-400">{t("settings.shake")}</span>
        <button
          onClick={() => { setShake(!shake); sfx.click(); }}
          className={`rounded border px-4 py-1 text-[11px] font-bold tracking-widest ${
            shake ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200" : "border-slate-700 text-slate-500"
          }`}
        >
          {shake ? "ON" : "OFF"}
        </button>
        <span className="w-28 tracking-widest text-slate-400">{t("menu.language")}</span>
        <div className="flex gap-1.5">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); sfx.click(); }}
              className={`rounded border px-2.5 py-1 text-[11px] font-bold uppercase ${
                lang === l ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200" : "border-slate-700 text-slate-500"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
