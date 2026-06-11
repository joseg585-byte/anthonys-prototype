"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
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

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          onClick={(e) => e.stopPropagation()}
          className="flex w-full max-w-lg flex-col rounded-t-2xl bg-parchment shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
          style={{ maxHeight: "85vh" }}
          role="dialog"
          aria-modal="true"
          aria-label={`Customise ${item.name}`}
        >
          {/* Header — non-scrollable */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gold/15 px-5 pb-3 pt-5">
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold leading-snug text-espresso">
                {item.name}
              </h2>
              {item.description && (
                <p className="mt-0.5 line-clamp-2 text-sm text-espresso-soft/70">
                  {item.description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-espresso-soft/50 transition-colors hover:bg-cream-deep hover:text-espresso"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body — modifier groups + special requests */}
          <div className="scroll-elegant flex-1 space-y-5 overflow-y-auto px-5 py-4">
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
                              <svg viewBox="0 0 10 8" fill="none" className="h-3 w-3">
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
                          className={`shrink-0 text-sm font-semibold ${
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
                  className="focus-gold w-full resize-none rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Footer — qty stepper + single Add to Order button */}
          <div className="shrink-0 border-t border-gold/15 bg-parchment/95 px-5 py-4 backdrop-blur">
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
              <p className="text-xs text-espresso-soft/55">
                {formatPrice(unitTotal)} × {qty}
              </p>
            </div>

            <button
              onClick={handleAdd}
              className="w-full rounded-full bg-gold py-3.5 text-sm font-bold tracking-wide text-espresso shadow-md transition-all duration-200 hover:scale-[1.01] hover:bg-gold-light active:scale-95"
            >
              Add to Order — {formatPrice(lineTotal)}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
