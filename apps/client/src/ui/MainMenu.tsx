import { useTranslation } from "react-i18next";
import { useUi } from "../state/uiStore";
import { GAME_NAME, VERSION } from "@it-heroes/shared";

export default function MainMenu() {
  const { t } = useTranslation();
  const setScreen = useUi((s) => s.setScreen);
  const lang = useUi((s) => s.lang);
  const setLang = useUi((s) => s.setLang);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <MenuBackdrop />
      <div className="scanlines relative z-10 flex w-[420px] max-w-[90vw] flex-col items-center gap-2 rounded-lg p-10 panel">
        <h1 className="font-display text-5xl font-black tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-cyan-500 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]">
          {t("game.title")}
        </h1>
        <p className="mb-8 text-sm tracking-widest text-slate-400">{t("game.subtitle")}</p>
        <button
          onClick={() => setScreen("classSelect")}
          className="btn-tech w-full rounded px-6 py-3 font-display text-lg font-bold tracking-widest text-cyan-100"
        >
          {t("menu.play")}
        </button>
        <button disabled className="btn-tech w-full rounded px-6 py-3 font-display text-lg font-bold tracking-widest text-cyan-100">
          {t("menu.settings")}
        </button>
        <button disabled className="btn-tech w-full rounded px-6 py-3 font-display text-lg font-bold tracking-widest text-cyan-100">
          {t("menu.credits")}
        </button>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <span>{t("menu.language")}:</span>
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded px-2 py-0.5 uppercase tracking-wider transition-colors ${
                lang === l
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <span className="mt-4 text-[10px] tracking-widest text-slate-600">
          {GAME_NAME} v{VERSION}
        </span>
      </div>
    </div>
  );
}

function MenuBackdrop() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.08),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
