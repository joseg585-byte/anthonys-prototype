"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus, CartLine } from "./types";
import { RESTAURANT } from "@/data/restaurant";
import { broadcast, onBroadcast } from "./realtime";

interface NewOrderInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  lines: CartLine[];
  subtotalCents: number;
}

interface OrdersState {
  orders: Order[];
  seeded: boolean;
  ticketSeq: number;
  placeOrder: (input: NewOrderInput) => Order;
  advance: (id: string) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  seedIfEmpty: () => void;
  _replaceFromRemote: (orders: Order[]) => void;
}

const STATUS_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "completed",
];

export function nextStatus(s: OrderStatus): OrderStatus {
  const i = STATUS_FLOW.indexOf(s);
  return STATUS_FLOW[Math.min(i + 1, STATUS_FLOW.length - 1)];
}

let isApplyingRemote = false;

function ticketCode(seq: number): string {
  return `A-${String(200 + seq).padStart(3, "0")}`;
}

// A few in-flight tickets so the kitchen display looks alive on first open.
function demoOrders(): Order[] {
  const now = Date.now();
  const mk = (
    seq: number,
    minsAgo: number,
    status: OrderStatus,
    first: string,
    last: string,
    items: Order["items"],
  ): Order => {
    const subtotal = items.reduce((n, i) => n + i.priceCents * i.qty, 0);
    const tax = Math.round(subtotal * RESTAURANT.taxRate);
    return {
      id: `demo-${seq}`,
      shortCode: ticketCode(seq),
      restaurantSlug: RESTAURANT.slug,
      status,
      customerFirstName: first,
      customerLastName: last,
      email: `${first.toLowerCase()}@example.com`,
      phone: "(816) 555-0148",
      items,
      subtotalCents: subtotal,
      taxCents: tax,
      totalCents: subtotal + tax,
      createdAt: now - minsAgo * 60_000,
    };
  };
  return [
    mk(1, 11, "preparing", "Maria", "Russo", [
      { name: "Chicken Spiedini", qty: 1, priceCents: 2550 },
      { name: "Pasta Jerri Jean", qty: 1, priceCents: 2000, addonLabel: "Add Chicken" },
      { name: "Tiramisu", qty: 2, priceCents: 750 },
    ]),
    mk(2, 4, "received", "David", "Klein", [
      { name: "Lasagna", qty: 1, priceCents: 1900, addonLabel: "Add Sausage" },
      { name: "House Salad", qty: 1, priceCents: 650 },
    ]),
    mk(3, 1, "received", "Theresa", "Marino", [
      { name: "Pasta Puttanesca", qty: 1, priceCents: 2900 },
      { name: "Linguine with Clam Sauce", qty: 1, priceCents: 2200 },
      { name: "Cannoli (2)", qty: 1, priceCents: 750 },
    ]),
  ];
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      seeded: false,
      ticketSeq: 3,
      seedIfEmpty: () => {
        // Only populate demo tickets on a truly empty board — never clobber
        // real orders a guest may have already placed.
        if (get().seeded || get().orders.length > 0) return;
        set({ orders: demoOrders(), seeded: true, ticketSeq: 3 });
      },
      placeOrder: (input) => {
        const seq = get().ticketSeq + 1;
        const items = input.lines.map((l) => ({
          name: l.name,
          qty: l.qty,
          priceCents: l.priceCents,
          addonLabel: l.addonLabel,
        }));
        const tax = Math.round(input.subtotalCents * RESTAURANT.taxRate);
        const order: Order = {
          id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          shortCode: ticketCode(seq),
          restaurantSlug: RESTAURANT.slug,
          status: "received",
          customerFirstName: input.firstName,
          customerLastName: input.lastName,
          email: input.email,
          phone: input.phone,
          notes: input.notes,
          items,
          subtotalCents: input.subtotalCents,
          taxCents: tax,
          totalCents: input.subtotalCents + tax,
          createdAt: Date.now(),
        };
        const orders = [order, ...get().orders];
        set({ orders, ticketSeq: seq });
        broadcast("orders", orders);
        return order;
      },
      advance: (id) => {
        const orders = get().orders.map((o) =>
          o.id === id ? { ...o, status: nextStatus(o.status) } : o,
        );
        set({ orders });
        broadcast("orders", orders);
      },
      setStatus: (id, status) => {
        const orders = get().orders.map((o) =>
          o.id === id ? { ...o, status } : o,
        );
        set({ orders });
        broadcast("orders", orders);
      },
      _replaceFromRemote: (orders) => {
        isApplyingRemote = true;
        set({ orders });
        isApplyingRemote = false;
      },
    }),
    { name: "anthonys-orders" },
  ),
);

// Wire cross-tab sync once, on the client.
if (typeof window !== "undefined") {
  onBroadcast((msg) => {
    if (msg.type === "orders" && !isApplyingRemote) {
      useOrders.getState()._replaceFromRemote(msg.payload as Order[]);
    }
  });
}

export function statusLabel(s: OrderStatus): string {
  switch (s) {
    case "received":
      return "New";
    case "preparing":
      return "In the Kitchen";
    case "ready":
      return "Ready for Pickup";
    case "completed":
      return "Completed";
  }
}
