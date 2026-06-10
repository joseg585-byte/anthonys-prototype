"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, MenuItem, MenuAddon } from "./types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: MenuItem, addon?: MenuAddon, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

// A cart line is keyed by item + chosen add-on so "Lasagna" and
// "Lasagna + Sausage" stack independently.
export function lineKey(itemId: string, addonLabel?: string): string {
  return addonLabel ? `${itemId}::${addonLabel}` : itemId;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (item, addon, qty = 1) =>
        set((s) => {
          const key = lineKey(item.id, addon?.label);
          const existing = s.lines.find(
            (l) => lineKey(l.itemId, l.addonLabel) === key,
          );
          if (existing) {
            return {
              isOpen: true,
              lines: s.lines.map((l) =>
                lineKey(l.itemId, l.addonLabel) === key
                  ? { ...l, qty: l.qty + qty }
                  : l,
              ),
            };
          }
          const newLine: CartLine = {
            itemId: item.id,
            name: item.name,
            priceCents: item.priceCents + (addon?.priceCents ?? 0),
            addonLabel: addon?.label,
            qty,
            image: item.image,
          };
          return { isOpen: true, lines: [...s.lines, newLine] };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) =>
              lineKey(l.itemId, l.addonLabel) === key
                ? { ...l, qty: Math.max(0, qty) }
                : l,
            )
            .filter((l) => l.qty > 0),
        })),
      remove: (key) =>
        set((s) => ({
          lines: s.lines.filter(
            (l) => lineKey(l.itemId, l.addonLabel) !== key,
          ),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "anthonys-cart" },
  ),
);

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.priceCents * l.qty, 0);
}
