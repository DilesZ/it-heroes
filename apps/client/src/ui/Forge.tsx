import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RARITIES, RARITY_COLOR, type EquipSlot, type Rarity } from "@it-heroes/shared";
import { useInventory } from "../state/inventoryStore";
import { MAX_UPGRADE, craftCost, craftItem, upgradeCost, upgradeItem, slots } from "../game/forge";
import { itemColor, itemName } from "../game/loot";

export default function Forge() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"upgrade" | "craft">("upgrade");
  const [slot, setSlot] = useState<EquipSlot>("cpu");
  const [rarity, setRarity] = useState<Rarity>("rare");
  const [msg, setMsg] = useState<string | null>(null);
  const equipped = useInventory((s) => s.equipped);
  const gold = useInventory((s) => s.gold);
  const materials = useInventory((s) => s.materials);
  const setForgeOpen = useInventory((s) => s.setForgeOpen);

  const flash = (ok: boolean) => {
    setMsg(ok ? "✓" : t("forge.nomats"));
    setTimeout(() => setMsg(null), 1200);
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="panel flex max-h-full w-[560px] max-w-full flex-col gap-3 overflow-hidden rounded-lg p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black tracking-[0.2em] text-orange-200">
            {t("forge.title")}
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-amber-300">{gold} G</span>
            <span className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-cyan-300">◈ {materials.chip}</span>
            <span className="rounded border border-pink-400/40 bg-pink-500/10 px-2 py-1 text-pink-300">⬢ {materials.core}</span>
            <button onClick={() => setForgeOpen(false)} className="btn-tech rounded px-3 py-1 tracking-widest text-slate-300">×</button>
          </div>
        </div>
        <div className="flex gap-2">
          {(["upgrade", "craft"] as const).map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`flex-1 rounded border px-3 py-2 font-display text-sm font-bold tracking-widest transition-colors ${
                tab === tb
                  ? "border-orange-400/70 bg-orange-500/15 text-orange-200"
                  : "border-slate-700 text-slate-500 hover:text-slate-300"
              }`}
            >
              {t(`forge.${tb}`)}
            </button>
          ))}
        </div>
        {msg && <div className="text-center text-sm font-bold text-amber-300">{msg}</div>}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {tab === "upgrade" ? (
            <div className="flex flex-col gap-2">
              {slots().map((sl) => {
                const it = equipped[sl];
                if (!it) return null;
                const cost = upgradeCost(it);
                const maxed = it.upgrade >= MAX_UPGRADE;
                const afford = gold >= cost.gold && materials.chip >= cost.chip;
                return (
                  <div
                    key={sl}
                    className="flex items-center gap-2 rounded border bg-black/50 px-2 py-1.5"
                    style={{ borderColor: `${itemColor(it)}55` }}
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold" style={{ color: itemColor(it) }}>
                      {itemName(it)} <span className="text-amber-300">+{it.upgrade}</span>
                    </span>
                    {maxed ? (
                      <span className="text-[11px] tracking-widest text-slate-500">{t("forge.maxed")}</span>
                    ) : (
                      <button
                        onClick={() => flash(upgradeItem(it.uid))}
                        disabled={!afford}
                        className="btn-tech rounded px-3 py-1 text-[11px] font-bold tracking-wider text-orange-100 disabled:opacity-40"
                      >
                        +1 · {cost.gold}G + {cost.chip}◈
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {slots().map((sl) => (
                  <button
                    key={sl}
                    onClick={() => setSlot(sl)}
                    className={`rounded border px-2.5 py-1.5 text-[11px] font-bold tracking-wider ${
                      slot === sl ? "border-orange-400/70 bg-orange-500/15 text-orange-200" : "border-slate-700 text-slate-500"
                    }`}
                  >
                    {t(`slots.${sl}`)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RARITIES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRarity(r)}
                    className="rounded border px-2.5 py-1.5 text-[11px] font-bold tracking-wider"
                    style={{
                      borderColor: rarity === r ? RARITY_COLOR[r] : "#334155",
                      color: RARITY_COLOR[r],
                      background: rarity === r ? `${RARITY_COLOR[r]}18` : undefined,
                    }}
                  >
                    {t(`rarity.${r}`)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => flash(craftItem(slot, rarity))}
                className="btn-tech rounded px-4 py-2.5 font-display text-sm font-bold tracking-widest text-orange-100"
              >
                {t("forge.craft")} {t(`slots.${slot}`)} {t(`rarity.${rarity}`)} · {craftCost(rarity).gold}G + {craftCost(rarity).core}⬢
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
