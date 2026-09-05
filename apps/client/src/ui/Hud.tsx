import { useTranslation } from "react-i18next";
import { useUi } from "../state/uiStore";
import { CLASSES, GAME_NAME, VERSION } from "@it-heroes/shared";

export default function Hud() {
  const { t } = useTranslation();
  const classId = useUi((s) => s.classId);
  const setScreen = useUi((s) => s.setScreen);

  return (
    <div className="pointer-events-none absolute inset-0">
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
