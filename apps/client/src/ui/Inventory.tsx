import { useTranslation } from "react-i18next";
import { SLOTS, type EquipSlot, type ItemInstance, type StatKey } from "@it-heroes/shared";
import { useInventory, defOfItem } from "../state/inventoryStore";
import { itemColor, itemName, itemStats } from "../game/loot";
import { world } from "../game/state/world";

const SLOT_GLYPH: Record<string, string> = {
  cpu: "▣",
  ram: "≡",
  gpu: "◫",
  keyboard: "⌨",
  chip: "◈",
};

const STAT_SHORT: Record<StatKey, string> = {
  attack: "ATK",
  magic: "MAG",
  defense: "DEF",
  speed: "SPD",
  crit: "CRI",
  maxHealth: "HP",
  maxMana: "MP",
};

function ItemCard({ item, onClick, selected }: { item: ItemInstance; onClick: () => void; selected?: boolean }) {
  const def = defOfItem(item);
  const color = itemColor(item);
  return (
    <button
      onClick={onClick}
      className="relative flex w-full items-center gap-2 rounded border bg-black/50 px-2 py-1.5 text-left transition-transform hover:-translate-y-px"
      style={{
        borderColor: selected ? color : `${color}55`,
        boxShadow: selected ? `0 0 12px ${color}66` : undefined,
      }}
    >
      <span className="text-xl leading-none" style={{ color }}>
        {SLOT_GLYPH[def.icon] ?? "▤"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold leading-tight" style={{ color }}>
          {itemName(item)}
        </span>
        <span className="block text-[10px] leading-tight text-slate-500">
          {compactStats(item)}
        </span>
      </span>
    </button>
  );
}

function compactStats(item: ItemInstance): string {
  const stats = itemStats(item);
  return (Object.entries(stats) as [StatKey, number][])
    .map(([k, v]) => `+${v} ${STAT_SHORT[k]}`)
    .join("  ");
}

function Detail({ item, equipped }: { item: ItemInstance; equipped: boolean }) {
  const { t } = useTranslation();
  const equip = useInventory((s) => s.equip);
  const unequip = useInventory((s) => s.unequip);
  const def = defOfItem(item);
  const color = itemColor(item);
  const stats = itemStats(item);
  return (
    <div className="rounded border bg-black/60 p-3" style={{ borderColor: `${color}66` }}>
      <div className="font-display text-sm font-bold tracking-wider" style={{ color }}>
        {itemName(item)}
      </div>
      <div className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">
        {t(`rarity.${def.rarity}`)} · {t(`slots.${def.slot}`)}
      </div>
      <div className="flex flex-col gap-1">
        {(Object.entries(stats) as [StatKey, number][]).map(([k, v]) => (
          <div key={k} className="flex justify-between text-[13px]">
            <span className="text-slate-400">{t(`stat.${k}`)}</span>
            <span className="font-bold text-emerald-300">+{v}</span>
          </div>
        ))}
      </div>
      {equipped ? (
        <button
          onClick={() => unequip(def.slot)}
          className="btn-tech mt-3 w-full rounded px-3 py-1.5 text-xs font-bold tracking-widest text-slate-200"
        >
          {t("inv.unequip")}
        </button>
      ) : (
        <button
          onClick={() => equip(item.uid)}
          className="btn-tech mt-3 w-full rounded px-3 py-1.5 text-xs font-bold tracking-widest text-cyan-100"
        >
          {t("inv.equip")}
        </button>
      )}
    </div>
  );
}

export default function Inventory() {
  const { t } = useTranslation();
  const items = useInventory((s) => s.items);
  const equipped = useInventory((s) => s.equipped);
  const gold = useInventory((s) => s.gold);
  const selectedUid = useInventory((s) => s.selectedUid);
  const select = useInventory((s) => s.select);
  const unequip = useInventory((s) => s.unequip);
  const setInvOpen = useInventory((s) => s.setInvOpen);

  const selected = items.find((i) => i.uid === selectedUid) ?? null;
  const p = world.player;

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="panel flex max-h-full w-[720px] max-w-full flex-col gap-3 overflow-hidden rounded-lg p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black tracking-[0.2em] text-cyan-200">
            {t("inv.title")}
          </h2>
          <div className="flex items-center gap-3">
            <span className="rounded border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
              {gold} G
            </span>
            <button onClick={() => setInvOpen(false)} className="btn-tech rounded px-3 py-1 text-xs tracking-widest text-slate-300">
              {t("inv.close")}
            </button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] gap-3">
          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1">
            <h3 className="text-[11px] font-bold tracking-[0.25em] text-slate-500">{t("inv.equipment")}</h3>
            {SLOTS.map((slot: EquipSlot) => {
              const it = equipped[slot];
              return (
                <div key={slot}>
                  <div className="mb-0.5 text-[10px] uppercase tracking-widest text-slate-600">
                    {t(`slots.${slot}`)}
                  </div>
                  {it ? (
                    <ItemCard item={it} onClick={() => unequip(slot)} />
                  ) : (
                    <div className="rounded border border-dashed border-slate-700/60 px-2 py-2 text-[11px] text-slate-600">
                      —
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-1 rounded border border-slate-700/50 bg-black/40 p-2 text-[11px] leading-relaxed text-slate-400">
              <div className="mb-1 font-bold tracking-widest text-slate-500">{t("inv.stats")}</div>
              <div>ATK {Math.round(world.player.attackBonus)} · MAG {Math.round(world.player.magicBonus)}</div>
              <div>DEF {Math.round(p.defense)} · CRI {Math.round(p.critBonus * 100)}%</div>
            </div>
          </div>
          <div className="flex min-h-0 flex-col gap-2">
            <h3 className="text-[11px] font-bold tracking-[0.25em] text-slate-500">
              {t("inv.bag")} ({items.length})
            </h3>
            <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pr-1">
              {items.length === 0 && (
                <p className="col-span-2 py-6 text-center text-sm text-slate-500">{t("inv.empty")}</p>
              )}
              {items.map((it) => (
                <ItemCard key={it.uid} item={it} selected={it.uid === selectedUid} onClick={() => select(it.uid)} />
              ))}
            </div>
            {selected && <Detail item={selected} equipped={false} />}
          </div>
        </div>
      </div>
    </div>
  );
}
