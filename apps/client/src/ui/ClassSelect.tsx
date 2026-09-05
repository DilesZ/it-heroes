import { useTranslation } from "react-i18next";
import { useUi } from "../state/uiStore";
import { CLASSES, CLASS_IDS, type ClassId } from "@it-heroes/shared";

export default function ClassSelect() {
  const { t } = useTranslation();
  const setScreen = useUi((s) => s.setScreen);
  const classId = useUi((s) => s.classId);
  const setClass = useUi((s) => s.setClass);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.06),transparent_65%)]" />
      <div className="relative z-10 flex items-center gap-4">
        <button
          onClick={() => setScreen("menu")}
          className="btn-tech rounded px-4 py-2 text-sm tracking-widest text-slate-300"
        >
          ← {t("menu.back")}
        </button>
        <h2 className="font-display text-3xl font-bold tracking-[0.2em] text-cyan-200">
          {t("menu.classSelect")}
        </h2>
      </div>
      <div className="relative z-10 flex flex-wrap justify-center gap-6 px-6">
        {CLASS_IDS.map((id) => (
          <ClassCard
            key={id}
            id={id}
            selected={classId === id}
            onSelect={() => setClass(id)}
            name={t(CLASSES[id].nameKey)}
            desc={t(CLASSES[id].descKey)}
            color={CLASSES[id].color}
          />
        ))}
      </div>
      <button
        onClick={() => setScreen("game")}
        className="btn-tech relative z-10 rounded px-12 py-4 font-display text-xl font-black tracking-[0.25em] text-cyan-100"
      >
        {t("menu.start")}
      </button>
    </div>
  );
}

function ClassCard({
  id,
  selected,
  onSelect,
  name,
  desc,
  color,
}: {
  id: ClassId;
  selected: boolean;
  onSelect: () => void;
  name: string;
  desc: string;
  color: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`scanlines relative w-[240px] rounded-lg p-6 text-left transition-all duration-150 ${
        selected ? "scale-[1.03]" : "opacity-80 hover:opacity-100"
      } panel`}
      style={{
        borderColor: selected ? color : undefined,
        boxShadow: selected ? `0 0 30px ${color}55, inset 0 0 20px ${color}18` : undefined,
      }}
    >
      <div
        className="mx-auto mb-5 h-20 w-20 rounded-lg"
        style={{
          background: `linear-gradient(160deg, ${color}33, ${color}0d)`,
          border: `1px solid ${color}66`,
          boxShadow: `0 0 24px ${color}44`,
        }}
      >
        <ClassGlyph id={id} color={color} />
      </div>
      <h3 className="font-display text-xl font-bold tracking-widest" style={{ color }}>
        {name}
      </h3>
      <p className="mt-2 text-sm leading-snug text-slate-400">{desc}</p>
      {selected && (
        <span
          className="absolute right-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold tracking-widest"
          style={{ background: `${color}22`, color }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

function ClassGlyph({ id, color }: { id: ClassId; color: string }) {
  if (id === "helpdesk")
    return (
      <svg viewBox="0 0 48 48" className="h-full w-full p-3" fill="none" stroke={color} strokeWidth="2.4">
        <path d="M8 40 L24 8 L40 40" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 30 H34" strokeLinecap="round" />
        <rect x="30" y="28" width="12" height="9" rx="1.5" fill={color} fillOpacity="0.25" />
      </svg>
    );
  if (id === "devops")
    return (
      <svg viewBox="0 0 48 48" className="h-full w-full p-3" fill="none" stroke={color} strokeWidth="2.4">
        <rect x="10" y="6" width="28" height="36" rx="3" fill={color} fillOpacity="0.12" />
        <path d="M16 16 L12 20 L16 24" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 16 L36 20 L32 24" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M27 14 L21 30" strokeLinecap="round" />
        <path d="M16 36 H32" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full p-3" fill="none" stroke={color} strokeWidth="2.4">
      <path d="M14 10 Q34 20 38 36" strokeLinecap="round" />
      <path d="M14 10 Q10 24 22 40" strokeLinecap="round" />
      <circle cx="38" cy="36" r="3" fill={color} fillOpacity="0.3" />
      <path d="M22 40 L18 34 M22 40 L28 38" strokeLinecap="round" />
    </svg>
  );
}
