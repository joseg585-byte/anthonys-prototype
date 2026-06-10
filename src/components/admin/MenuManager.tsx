"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MENU } from "@/data/menu";
import { CATEGORY_ORDER } from "@/lib/types";
import { useMenuAvail } from "@/lib/menuStore";
import { formatPrice } from "@/lib/format";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${
        on ? "bg-basil" : "bg-crimson/70"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-cream shadow transition-transform duration-300 ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function MenuManager() {
  const unavailable = useMenuAvail((s) => s.unavailable);
  const toggle = useMenuAvail((s) => s.toggle);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q),
    );
  }, [query]);

  const eightySixCount = Object.keys(unavailable).length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-cream">
            Menu Management
          </h2>
          <p className="text-sm text-cream/55">
            {MENU.length} dishes ·{" "}
            <span className={eightySixCount ? "text-gold" : ""}>
              {eightySixCount} marked 86
            </span>{" "}
            · changes go live instantly
          </p>
        </div>
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream/40"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className="focus-gold w-56 rounded-full border border-gold/25 bg-charcoal/60 py-2 pl-9 pr-3 text-sm text-cream placeholder:text-cream/35"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gold/15 bg-espresso/60">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gold/15 text-xs uppercase tracking-wider text-cream/50">
              <th className="px-4 py-3 font-medium">Dish</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Category
              </th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Available</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORY_ORDER.map((cat) => {
              const rows = filtered.filter((m) => m.category === cat);
              if (rows.length === 0) return null;
              return rows.map((item, idx) => {
                const available = !unavailable[item.id];
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gold/8 transition-colors hover:bg-gold/5 ${
                      !available ? "opacity-55" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-cream">
                          {item.name}
                        </span>
                        {item.featured && (
                          <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-gold">
                            Signature
                          </span>
                        )}
                      </div>
                      {idx === 0 && (
                        <span className="mt-0.5 block text-[0.6rem] uppercase tracking-widest text-gold/50 sm:hidden">
                          {cat}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-cream/60 sm:table-cell">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-cream/90">
                      {formatPrice(item.priceCents)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`hidden text-xs font-medium sm:inline ${
                            available ? "text-basil" : "text-crimson"
                          }`}
                        >
                          {available ? "On menu" : "86’d"}
                        </span>
                        <Toggle on={available} onClick={() => toggle(item.id)} />
                      </div>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
