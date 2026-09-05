import { useTranslation } from "react-i18next";
import { SKILLS, type ClassId } from "@it-heroes/shared";
import { useUi } from "../state/uiStore";
import { useHud } from "../state/hudStore";
import { world } from "../game/state/world";

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

function classSkills(classId: ClassId) {
  return SKILLS.filter((s) => s.classId === classId);
}

function Slot({
  skillId,
  hotkey,
  cdFrac,
}: {
  skillId: string;
  hotkey: string;
  cdFrac: number;
}) {
  const { t } = useTranslation();
  const skill = SKILLS.find((s) => s.id === skillId)!;
  const mana = world.player.mana;
  const noMana = mana < skill.manaCost;
  return (
    <div
      className="relative flex h-[68px] w-[68px] flex-col items-center justify-center overflow-hidden rounded-md border"
      style={{
        borderColor: noMana ? "rgba(248,113,113,0.4)" : `${skill.color}66`,
        background: "linear-gradient(160deg, rgba(14,22,44,0.92), rgba(9,14,30,0.96))",
        boxShadow: noMana ? undefined : `0 0 12px ${skill.color}22`,
      }}
      title={`${t(skill.nameKey)} — ${t(skill.descKey)}`}
    >
      <span className="text-2xl font-black leading-none" style={{ color: skill.color }}>
        {GLYPHS[skill.icon] ?? "?"}
      </span>
      <span className="mt-1 max-w-full truncate px-1 text-[9px] leading-none tracking-wider text-slate-400">
        {t(skill.nameKey)}
      </span>
      {skill.manaCost > 0 && (
        <span className={`text-[9px] leading-none ${noMana ? "text-rose-400" : "text-sky-400"}`}>
          {skill.manaCost} MP
        </span>
      )}
      <span className="absolute left-1 top-0.5 rounded bg-black/70 px-1 text-[10px] font-bold text-slate-300">
        {hotkey}
      </span>
      {cdFrac > 0.01 && (
        <div
          className="absolute inset-x-0 bottom-0 bg-black/75"
          style={{ height: `${Math.min(100, cdFrac * 100)}%` }}
        />
      )}
      {noMana && <div className="absolute inset-0 bg-rose-950/25" />}
    </div>
  );
}

export default function SkillBar() {
  const classId = useUi((s) => s.classId);
  const { cdBasic, cdS1, cdS2, shield, haste } = useHud();
  const skills = classSkills(classId);

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
      <div className="flex gap-2">
        {shield && (
          <span className="rounded border border-cyan-400/60 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold tracking-widest text-cyan-300">
            ⬟ sudo shield
          </span>
        )}
        {haste && (
          <span className="rounded border border-emerald-400/60 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold tracking-widest text-emerald-300">
            ✚ OVERCLOCK
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {skills[0] && <Slot skillId={skills[0].id} hotkey="LMB" cdFrac={cdBasic} />}
        {skills[1] && <Slot skillId={skills[1].id} hotkey="1" cdFrac={cdS1} />}
        {skills[2] && <Slot skillId={skills[2].id} hotkey="2" cdFrac={cdS2} />}
      </div>
    </div>
  );
}
