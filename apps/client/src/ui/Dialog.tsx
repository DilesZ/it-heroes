import { useTranslation } from "react-i18next";
import { ENEMIES } from "@it-heroes/shared";
import { useQuests,
  activeMainQuest,
  activeSideQuests,
  isTurnable,
  questDef,
} from "../state/questStore";
import { useInventory } from "../state/inventoryStore";
import { NPCS } from "../game/entities/Npcs";

const ENEMY_NAME: Record<string, string> = Object.fromEntries(ENEMIES.map((d) => [d.id, d.nameKey]));

function ChiefBody() {
  const { t } = useTranslation();
  const started = useQuests((s) => s.started);
  const done = useQuests((s) => s.done);
  const progress = useQuests((s) => s.progress);
  const start = useQuests((s) => s.start);
  const complete = useQuests((s) => s.complete);
  const setDialog = useQuests((s) => s.setDialog);

  if (!started.includes("q_boot")) {
    return (
      <>
        <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.chief.greet")}</p>
        <DialogButton label={t("dialog.accept")} onClick={() => start("q_boot")} primary />
        <DialogQuest id="q_boot" />
      </>
    );
  }
  const active = activeMainQuest({ started, done });
  if (!active) {
    return (
      <>
        <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.chief.end")}</p>
        <DialogButton label={t("dialog.leave")} onClick={() => setDialog(null)} />
      </>
    );
  }
  if (isTurnable({ progress }, active)) {
    return (
      <>
        <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.chief.turnin")}</p>
        <DialogQuest id={active.id} done />
        <DialogButton
          label={`${t("dialog.turnin")} (+${active.rewardXp} XP, +${active.rewardGold} G)`}
          onClick={() => complete(active.id)}
          primary
        />
      </>
    );
  }
  return (
    <>
      <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.chief.progress")}</p>
      <DialogQuest id={active.id} />
      <DialogButton label={t("dialog.leave")} onClick={() => setDialog(null)} />
    </>
  );
}

function InternBody() {
  const { t } = useTranslation();
  const started = useQuests((s) => s.started);
  const done = useQuests((s) => s.done);
  const progress = useQuests((s) => s.progress);
  const start = useQuests((s) => s.start);
  const complete = useQuests((s) => s.complete);
  const setDialog = useQuests((s) => s.setDialog);
  const q = questDef("q_scrap")!;

  if (!started.includes("q_scrap")) {
    return (
      <>
        <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.intern.greet")}</p>
        <DialogButton label={t("dialog.accept")} onClick={() => start("q_scrap")} primary />
        <DialogQuest id="q_scrap" />
      </>
    );
  }
  if (!done.includes("q_scrap") && isTurnable({ progress }, q)) {
    return (
      <>
        <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.intern.turnin")}</p>
        <DialogQuest id="q_scrap" done />
        <DialogButton
          label={`${t("dialog.turnin")} (+${q.rewardXp} XP, +${q.rewardGold} G)`}
          onClick={() => complete("q_scrap")}
          primary
        />
      </>
    );
  }
  if (!done.includes("q_scrap")) {
    return (
      <>
        <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.intern.progress")}</p>
        <DialogQuest id="q_scrap" />
        <DialogButton label={t("dialog.leave")} onClick={() => setDialog(null)} />
      </>
    );
  }
  return (
    <>
      <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.intern.end")}</p>
      <DialogButton label={t("dialog.leave")} onClick={() => setDialog(null)} />
    </>
  );
}

function DialogQuest({ id, done }: { id: string; done?: boolean }) {
  const { t } = useTranslation();
  const progress = useQuests((s) => s.progress);
  const q = questDef(id);
  if (!q) return null;
  const prog = progress[id] ?? 0;
  return (
    <div
      className="rounded border border-amber-400/30 bg-amber-500/5 px-3 py-2"
    >
      <div className={`text-sm font-bold tracking-wide ${done ? "text-emerald-300" : "text-amber-200"}`}>
        {done ? "✓ " : ""}{t(q.nameKey)}
      </div>
      <div className="text-[13px] text-slate-400">
        {t(q.descKey)} ({Math.min(prog, q.objective.count)}/{q.objective.count})
      </div>
    </div>
  );
}

function DialogButton({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  const setDialog = useQuests((s) => s.setDialog);
  return (
    <div className="flex gap-2">
      <button
        onClick={onClick}
        className={`btn-tech flex-1 rounded px-4 py-2 font-display text-sm font-bold tracking-widest ${
          primary ? "text-cyan-100" : "text-slate-300"
        }`}
      >
        {label}
      </button>
      {!primary && null}
      {primary && (
        <button onClick={() => setDialog(null)} className="btn-tech rounded px-4 py-2 text-xs tracking-widest text-slate-400">
          ×
        </button>
      )}
    </div>
  );
}

export default function Dialog() {
  const { t } = useTranslation();
  const dialogNpc = useQuests((s) => s.dialogNpc);
  if (!dialogNpc) return null;
  const npc = NPCS.find((n) => n.id === dialogNpc);
  if (!npc) return null;
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-24 z-40 mx-auto w-[520px] max-w-[92vw]">
      <div className="panel rounded-lg p-5">
        <h3 className="font-display text-base font-bold tracking-[0.2em]" style={{ color: npc.color }}>
          {t(npc.nameKey)}
        </h3>
        <div className="mt-3 flex flex-col gap-3">
          {dialogNpc === "npc_chief" && <ChiefBody />}
          {dialogNpc === "npc_intern" && <InternBody />}
          {dialogNpc === "npc_bot" && <BotBody />}
          {dialogNpc === "npc_forge" && <ForgeBody />}
        </div>
      </div>
    </div>
  );
}

function BotBody() {
  const { t } = useTranslation();
  const setDialog = useQuests((s) => s.setDialog);
  return (
    <>
      <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.bot.greet")}</p>
      <DialogButton label={t("dialog.leave")} onClick={() => setDialog(null)} />
    </>
  );
}

function ForgeBody() {
  const { t } = useTranslation();
  const setDialog = useQuests((s) => s.setDialog);
  const setForgeOpen = useInventory((s) => s.setForgeOpen);
  return (
    <>
      <p className="text-[15px] leading-relaxed text-slate-300">{t("npc.forge.greet")}</p>
      <DialogButton
        label={t("dialog.forge")}
        primary
        onClick={() => {
          setDialog(null);
          setForgeOpen(true);
        }}
      />
    </>
  );
}

export function objectiveText(q: { objective: { kind: string; target: string; count: number }; nameKey: string }, prog: number, t: (k: string) => string): string {
  const o = q.objective;
  if (o.kind === "talk") return t(q.nameKey);
  if (o.kind === "collect") return `${t("items.scrap")}: ${Math.min(prog, o.count)}/${o.count}`;
  const target = ENEMY_NAME[o.target] ? t(ENEMY_NAME[o.target]) : o.target;
  return `${target}: ${Math.min(prog, o.count)}/${o.count}`;
}

export function QuestTracker() {
  const { t } = useTranslation();
  const started = useQuests((s) => s.started);
  const done = useQuests((s) => s.done);
  const progress = useQuests((s) => s.progress);
  const active = activeMainQuest({ started, done });
  const sides = activeSideQuests({ started, done });
  if (!active && sides.length === 0) return null;
  return (
    <div className="pointer-events-none absolute left-4 top-[70px] flex w-[240px] flex-col gap-1.5">
      {active && (
        <div className="rounded panel px-3 py-2">
          <div className="text-[12px] font-bold tracking-wide text-amber-200">{t(active.nameKey)}</div>
          <div className="text-[11px] text-slate-400">
            {objectiveText(active, progress[active.id] ?? 0, t)}
          </div>
        </div>
      )}
      {sides.map((q) => (
        <div key={q.id} className="rounded panel px-3 py-1.5 opacity-80">
          <div className="text-[11px] font-bold tracking-wide text-slate-300">{t(q.nameKey)}</div>
          <div className="text-[10px] text-slate-500">
            {objectiveText(q, progress[q.id] ?? 0, t)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Toasts() {
  const { t } = useTranslation();
  const toasts = useQuests((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute bottom-28 right-4 z-40 flex flex-col items-end gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="panel rounded px-4 py-2 text-sm font-bold tracking-wide text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.3)]">
          ✓ {t(toast.textKey)}
          {toast.param && <span className="ml-2 text-slate-300">{t(questDef(toast.param)?.nameKey ?? "")}</span>}
        </div>
      ))}
    </div>
  );
}
