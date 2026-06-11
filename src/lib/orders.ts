"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Order,
  OrderStatus,
  OrderSource,
  PaymentMethod,
  CartLine,
  CartModifier,
} from "./types";
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
  source?: OrderSource;
  orderType?: "pickup" | "delivery";
  deliveryAddress?: string;
  pickupTime?: string;
  paymentMethod?: PaymentMethod;
  tipCents?: number;
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

function noMods(): CartModifier[] {
  return [];
}

function demoOrders(): Order[] {
  const now = Date.now();
  const mk = (
    seq: number,
    minsAgo: number,
    status: OrderStatus,
    first: string,
    last: string,
    source: OrderSource,
    paymentMethod: PaymentMethod,
    items: Order["items"],
    notes?: string,
  ): Order => {
    const subtotal = items.reduce((n, i) => n + i.priceCents * i.qty, 0);
    const tax = Math.round(subtotal * RESTAURANT.taxRate);
    return {
      id: `demo-${seq}`,
      shortCode: ticketCode(seq),
      restaurantSlug: RESTAURANT.slug,
      status,
      source,
      customerFirstName: first,
      customerLastName: last,
      email: `${first.toLowerCase()}@example.com`,
      phone: "(816) 555-0148",
      items,
      subtotalCents: subtotal,
      taxCents: tax,
      tipCents: 0,
      totalCents: subtotal + tax,
      notes,
      orderType: "pickup",
      paymentMethod,
      createdAt: now - minsAgo * 60_000,
    };
  };

  return [
    mk(1, 11, "preparing", "Maria", "Russo", "online", "paid-online", [
      { name: "Chicken Spiedini", qty: 1, priceCents: 2550, modifiers: noMods() },
      {
        name: "Pasta Jerri Jean",
        qty: 1,
        priceCents: 2650,
        modifiers: [{ id: "add-chicken", name: "Add Chicken", priceCents: 650 }],
        specialRequests: "extra sauce please",
      },
      { name: "Tiramisu", qty: 2, priceCents: 750, modifiers: noMods() },
    ]),
    mk(2, 4, "received", "David", "Klein", "phone", "card-on-pickup", [
      {
        name: "Lasagna",
        qty: 1,
        priceCents: 2400,
        modifiers: [
          { id: "add-sausage", name: "Add Sausage", priceCents: 500 },
        ],
      },
      { name: "House Salad", qty: 1, priceCents: 650, modifiers: noMods() },
    ],
    "No garlic on the salad — allergic"),
    mk(3, 1, "received", "Theresa", "Marino", "online", "paid-online", [
      { name: "Pasta Puttanesca", qty: 1, priceCents: 2900, modifiers: noMods() },
      { name: "Linguine with Clam Sauce", qty: 1, priceCents: 2200, modifiers: noMods() },
      { name: "Cannoli (2)", qty: 1, priceCents: 750, modifiers: noMods() },
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
        if (get().seeded || get().orders.length > 0) return;
        set({ orders: demoOrders(), seeded: true, ticketSeq: 3 });
      },
      placeOrder: (input) => {
        const seq = get().ticketSeq + 1;
        const items = input.lines.map((l) => ({
          name: l.name,
          qty: l.qty,
          priceCents: l.priceCents,
          modifiers: l.modifiers,
          specialRequests: l.specialRequests,
        }));
        const tip = input.tipCents ?? 0;
        const tax = Math.round(input.subtotalCents * RESTAURANT.taxRate);
        const order: Order = {
          id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          shortCode: ticketCode(seq),
          restaurantSlug: RESTAURANT.slug,
          status: "received",
          source: input.source ?? "online",
          customerFirstName: input.firstName,
          customerLastName: input.lastName,
          email: input.email,
          phone: input.phone,
          notes: input.notes,
          items,
          subtotalCents: input.subtotalCents,
          taxCents: tax,
          tipCents: tip,
          totalCents: input.subtotalCents + tax + tip,
          orderType: input.orderType ?? "pickup",
          deliveryAddress: input.deliveryAddress,
          pickupTime: input.pickupTime,
          paymentMethod: input.paymentMethod ?? "paid-online",
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
    { name: "anthonys-orders-v2" },
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
    case "received":  return "New";
    case "preparing": return "In the Kitchen";
    case "ready":     return "Ready for Pickup";
    case "completed": return "Completed";
  }
}
