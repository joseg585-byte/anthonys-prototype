"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import type { MenuItem, CartModifier } from "@/lib/types";
import { formatPrice } from "@/lib/format";

interface Props {
  item: MenuItem;
  onClose: () => void;
  onAdd: (modifiers: CartModifier[], specialRequests: string, qty: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  "add-on": "Add-ons",
  substitution: "Substitutions",
  preparation: "Preparation",
};

export function ModifierModal({ item, onClose, onAdd }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [specialRequests, setSpecialRequests] = useState("");
  const [qty, setQty] = useState(1);

  const modifiers = item.modifiers ?? [];

  const grouped = useMemo(() => {
    const map = new Map<string, typeof modifiers>();
    for (const m of modifiers) {
      const cat = m.category ?? "add-on";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(m);
    }
    // Enforce display order: add-on → substitution → preparation
    const order = ["add-on", "substitution", "preparation"];
    return order.flatMap((cat) => {
      const items = map.get(cat);
      return items ? [{ cat, items }] : [];
    });
  }, [modifiers]);

  const modifierTotal = useMemo(() => {
    return modifiers
      .filter((m) => selected.has(m.id))
      .reduce((n, m) => n + m.priceCents, 0);
  }, [modifiers, selected]);

  const unitTotal = item.priceCents + modifierTotal;
  const lineTotal = unitTotal * qty;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const chosenModifiers = modifiers
      .filter((m) => selected.has(m.id))
      .map(({ id, name, priceCents }) => ({ id, name, priceCents }));
    onAdd(chosenModifiers, specialRequests.trim(), qty);
    onClose();
  };

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-charcoal/60 backdrop-blur-sm"
        />

        {/* Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-[71] mx-auto max-w-lg rounded-t-2xl bg-parchment shadow-2xl sm:bottom-auto sm:top-1/2 sm:mx-4 sm:max-w-lg sm:rounded-2xl sm:-translate-y-1/2"
          role="dialog"
          aria-modal="true"
          aria-label={`Customise ${item.name}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-gold/15">
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold leading-snug text-espresso">
                {item.name}
              </h2>
              {item.description && (
                <p className="mt-0.5 text-sm text-espresso-soft/70 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="mt-0.5 shrink-0 grid h-8 w-8 place-items-center rounded-full text-espresso-soft/50 transition-colors hover:bg-cream-deep hover:text-espresso"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="scroll-elegant max-h-[58vh] overflow-y-auto px-5 py-4 space-y-5 sm:max-h-[55vh]">
            {/* Modifier groups */}
            {grouped.map(({ cat, items: mods }) => (
              <div key={cat}>
                <p className="overline mb-2.5 text-[0.62rem] font-bold uppercase tracking-widest text-espresso-soft/55">
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
                <div className="space-y-2">
                  {mods.map((mod) => {
                    const isOn = selected.has(mod.id);
                    return (
                      <button
                        key={mod.id}
                        onClick={() => toggle(mod.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150 ${
                          isOn
                            ? "border-gold bg-gold/10 shadow-sm"
                            : "border-gold/20 bg-cream/60 hover:border-gold/50 hover:bg-cream"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors ${
                              isOn
                                ? "border-gold-deep bg-gold-deep text-cream"
                                : "border-gold/40 bg-transparent"
                            }`}
                          >
                            {isOn && (
                              <svg viewBox="0 0 10 8" fill="none" className="w-3 h-3">
                                <path
                                  d="M1 4l2.5 2.5L9 1"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span className="text-sm font-medium text-espresso">
                            {mod.name}
                          </span>
                        </span>
                        <span
                          className={`text-sm font-semibold shrink-0 ${
                            mod.priceCents > 0 ? "text-gold-deep" : "text-espresso-soft/50"
                          }`}
                        >
                          {mod.priceCents > 0 ? `+${formatPrice(mod.priceCents)}` : "Free"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Special requests */}
            {item.allowsSpecialRequests && (
              <div>
                <p className="overline mb-2 text-[0.62rem] font-bold uppercase tracking-widest text-espresso-soft/55">
                  Special Requests
                </p>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. extra crispy, sauce on the side, no salt"
                  rows={2}
                  className="focus-gold w-full rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40 resize-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gold/15 bg-parchment/95 px-5 py-4 backdrop-blur">
            {/* Qty stepper + total */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-cream">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-9 w-9 place-items-center rounded-full text-espresso-soft transition-colors hover:text-crimson"
                >
                  <Minus size={16} />
                </button>
                <span className="w-7 text-center text-base font-bold text-espresso">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="grid h-9 w-9 place-items-center rounded-full text-espresso-soft transition-colors hover:text-crimson"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-espresso-soft/55">
                  {formatPrice(unitTotal)} × {qty}
                </p>
                <p className="font-display text-xl font-bold text-espresso">
                  {formatPrice(lineTotal)}
                </p>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full rounded-full bg-gold py-3.5 text-sm font-bold tracking-wide text-espresso shadow-md transition-all duration-200 hover:scale-[1.01] hover:bg-gold-light active:scale-95"
            >
              Add to Order — {formatPrice(lineTotal)}
            </button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
