"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, CartModifier, MenuItem } from "./types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: MenuItem, modifiers: CartModifier[], specialRequests?: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export function lineKey(itemId: string, modifiers: CartModifier[]): string {
  if (!modifiers.length) return itemId;
  return `${itemId}::${modifiers.map((m) => m.id).sort().join(",")}`;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (item, modifiers, specialRequests, qty = 1) =>
        set((s) => {
          const key = lineKey(item.id, modifiers);
          const existing = s.lines.find((l) => l.key === key);
          if (existing) {
            return {
              isOpen: true,
              lines: s.lines.map((l) =>
                l.key === key ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          const modSum = modifiers.reduce((n, m) => n + m.priceCents, 0);
          const newLine: CartLine = {
            key,
            itemId: item.id,
            name: item.name,
            basePriceCents: item.priceCents,
            priceCents: item.priceCents + modSum,
            modifiers,
            specialRequests: specialRequests || undefined,
            qty,
            image: item.image,
          };
          return { isOpen: true, lines: [...s.lines, newLine] };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.key === key ? { ...l, qty: Math.max(0, qty) } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (key) =>
        set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "anthonys-cart-v2",
    },
  ),
);

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.priceCents * l.qty, 0);
}
