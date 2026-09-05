import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUi } from "../state/uiStore";
import { saveGame } from "../state/save";
import { sfx } from "../game/audio";
import Settings from "./Settings";

export default function PauseMenu() {
  const { t } = useTranslation();
  const setPaused = useUi((s) => s.setPaused);
  const setScreen = useUi((s) => s.setScreen);
  const [showSettings, setShowSettings] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="panel flex w-[420px] max-w-full flex-col gap-2 rounded-lg p-8">
        <h2 className="mb-4 text-center font-display text-3xl font-black tracking-[0.25em] text-cyan-200">
          {t("hud.pause")}
        </h2>
        <button
          onClick={() => { sfx.click(); setPaused(false); }}
          className="btn-tech rounded px-6 py-3 font-display text-base font-bold tracking-widest text-cyan-100"
        >
          {t("hud.resume")}
        </button>
        <button
          onClick={() => { sfx.click(); setShowSettings(!showSettings); }}
          className="btn-tech rounded px-6 py-3 font-display text-base font-bold tracking-widest text-slate-200"
        >
          {t("menu.settings")}
        </button>
        {showSettings && (
          <div className="rounded border border-slate-700/60 bg-black/40 p-3">
            <Settings />
          </div>
        )}
        <button
          onClick={() => {
            const ok = saveGame();
            setSaved(ok);
            sfx.quest();
            setTimeout(() => setSaved(false), 2000);
          }}
          className="btn-tech rounded px-6 py-3 font-display text-base font-bold tracking-widest text-slate-200"
        >
          {saved ? `✓ ${t("pause.saved")}` : t("pause.save")}
        </button>
        <button
          onClick={() => { sfx.click(); setScreen("menu"); }}
          className="btn-tech rounded px-6 py-3 font-display text-base font-bold tracking-widest text-rose-200"
        >
          {t("hud.toMenu")}
        </button>
      </div>
    </div>
  );
}
