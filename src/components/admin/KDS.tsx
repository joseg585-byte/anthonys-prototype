"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  ChevronRight,
  Volume2,
  VolumeX,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { useOrders, statusLabel } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, timeAgo, clockTime } from "@/lib/format";

const LANES: { status: OrderStatus; accent: string; ring: string }[] = [
  { status: "received", accent: "border-l-crimson", ring: "bg-crimson" },
  { status: "preparing", accent: "border-l-gold-deep", ring: "bg-gold-deep" },
  { status: "ready", accent: "border-l-basil", ring: "bg-basil" },
];

const ADVANCE_LABEL: Record<OrderStatus, string> = {
  received: "Start Cooking",
  preparing: "Mark Ready",
  ready: "Picked Up",
  completed: "Done",
};

function SourceBadge({ source }: { source: Order["source"] }) {
  if (source === "phone") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-gold">
        <Phone size={9} />
        PHONE
      </span>
    );
  }
  return (
    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-blue-300">
      ONLINE
    </span>
  );
}

function DeliveryBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-violet-300">
      🚗 DELIVERY
    </span>
  );
}

function PaymentBadge({ method }: { method: Order["paymentMethod"] }) {
  const isPaid = method === "paid-online";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest ${
        isPaid
          ? "bg-basil/25 text-basil"
          : "bg-gold/15 text-gold-deep"
      }`}
    >
      {isPaid ? "✓ PAID" : "PAY ON PICKUP"}
    </span>
  );
}

function OrderCard({
  order,
  isNew,
  onAdvance,
}: {
  order: Order;
  isNew: boolean;
  onAdvance: (id: string) => void;
}) {
  const lane = LANES.find((l) => l.status === order.status);

  // Safe fallbacks for demo orders that may predate the new fields
  const source = order.source ?? "online";
  const paymentMethod = order.paymentMethod ?? "paid-online";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      className={`rounded-lg border border-gold/15 border-l-4 bg-espresso/70 p-4 shadow-lg ${
        lane?.accent
      } ${isNew ? "pulse-ring" : ""}`}
    >
      {/* ── Card header ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold leading-none text-gold">
            {order.shortCode}
          </p>
          <p className="mt-1 text-sm font-medium text-cream/90">
            {order.customerFirstName} {order.customerLastName}
          </p>
          {source === "phone" && (
            <p className="mt-0.5 text-xs text-cream/50">{order.phone}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="text-right text-xs text-cream/55">
            <p className="flex items-center justify-end gap-1">
              <Clock size={11} /> {clockTime(order.createdAt)}
            </p>
            <p className="mt-0.5">{timeAgo(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            <SourceBadge source={source} />
            <PaymentBadge method={paymentMethod} />
            {order.orderType === "delivery" && <DeliveryBadge />}
          </div>
        </div>
      </div>

      {/* ── Line items ── */}
      <ul className="my-3 space-y-2 border-y border-gold/10 py-3">
        {order.items.map((it, i) => (
          <li key={i} className="text-sm">
            <div className="flex items-baseline gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-crimson/25 text-xs font-bold text-cream">
                {it.qty}
              </span>
              <span className="flex-1 font-medium text-cream/90">{it.name}</span>
            </div>

            {/* Modifiers — red italic for kitchen visibility */}
            {(it.modifiers ?? []).length > 0 && (
              <ul className="ml-7 mt-0.5 space-y-0.5">
                {it.modifiers.map((m) => (
                  <li
                    key={m.id}
                    className="text-xs font-medium italic text-crimson/90"
                  >
                    + {m.name}
                    {m.priceCents > 0 && (
                      <span className="ml-1 not-italic text-cream/40">
                        (+{formatPrice(m.priceCents)})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Per-item special request */}
            {it.specialRequests && (
              <p className="ml-7 mt-0.5 text-xs italic text-crimson/80">
                &ldquo;{it.specialRequests}&rdquo;
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* ── Whole-order notes callout ── */}
      {order.notes && (
        <div className="mb-3 rounded-md border border-gold/25 bg-gold/10 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold/80">
            Order note
          </p>
          <p className="mt-0.5 text-xs text-cream/80">{order.notes}</p>
        </div>
      )}

      {/* ── Pickup / delivery info ── */}
      {(order.orderType === "delivery" || order.pickupTime) && (
        <div className="mb-3 text-xs text-cream/50">
          {order.orderType === "delivery" ? (
            <span>
              Delivery
              {order.deliveryAddress && ` → ${order.deliveryAddress}`}
            </span>
          ) : (
            order.pickupTime && <span>Pickup: {order.pickupTime}</span>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-cream/50">
          {formatPrice(order.totalCents)}
        </span>
        <button
          onClick={() => onAdvance(order.id)}
          className="inline-flex items-center gap-1 rounded-full bg-gold px-3.5 py-1.5 text-xs font-bold text-espresso transition-all hover:bg-gold-light active:scale-95"
        >
          {order.status === "ready" && order.orderType === "delivery"
            ? "Driver Arrived"
            : ADVANCE_LABEL[order.status]}
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.article>
  );
}

export function KDS({
  chime,
  soundOn,
  onToggleSound,
}: {
  chime: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  const orders = useOrders((s) => s.orders);
  const advance = useOrders((s) => s.advance);
  const seedIfEmpty = useOrders((s) => s.seedIfEmpty);
  const [, setTick] = useState(0);
  const knownIds = useRef<Set<string> | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    seedIfEmpty();
  }, [seedIfEmpty]);

  // live "x minutes ago" refresh
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, []);

  // detect newly arrived orders → chime + highlight
  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));
    if (knownIds.current === null) {
      knownIds.current = currentIds;
      return;
    }
    const fresh = orders.filter(
      (o) => !knownIds.current!.has(o.id) && o.status === "received",
    );
    if (fresh.length > 0) {
      if (soundOn) chime();
      setNewIds((prev) => {
        const next = new Set(prev);
        fresh.forEach((o) => next.add(o.id));
        return next;
      });
      fresh.forEach((o) =>
        setTimeout(
          () =>
            setNewIds((prev) => {
              const next = new Set(prev);
              next.delete(o.id);
              return next;
            }),
          6000,
        ),
      );
    }
    knownIds.current = currentIds;
  }, [orders, chime, soundOn]);

  const active = orders.filter((o) => o.status !== "completed");
  const completed = orders.filter((o) => o.status === "completed");

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-cream">
            Kitchen Display
          </h2>
          <p className="text-sm text-cream/55">
            {active.length} active ticket{active.length === 1 ? "" : "s"} ·
            live
          </p>
        </div>
        <button
          onClick={onToggleSound}
          className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3.5 py-2 text-xs font-medium text-cream/80 transition-colors hover:border-gold hover:text-gold"
        >
          {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          {soundOn ? "Sound on" : "Muted"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {LANES.map((lane) => {
          const laneOrders = active
            .filter((o) => o.status === lane.status)
            .sort((a, b) => a.createdAt - b.createdAt);
          return (
            <div key={lane.status} className="rounded-xl bg-charcoal/50 p-3">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={`h-2.5 w-2.5 rounded-full ${lane.ring}`} />
                <h3 className="font-semibold tracking-wide text-cream">
                  {statusLabel(lane.status)}
                </h3>
                <span className="ml-auto rounded-full bg-espresso px-2 py-0.5 text-xs font-bold text-cream/70">
                  {laneOrders.length}
                </span>
              </div>
              <div className="scroll-elegant flex max-h-[calc(100vh-15rem)] flex-col gap-3 overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {laneOrders.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      isNew={newIds.has(o.id)}
                      onAdvance={advance}
                    />
                  ))}
                </AnimatePresence>
                {laneOrders.length === 0 && (
                  <p className="px-2 py-8 text-center text-sm text-cream/30">
                    No tickets
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {completed.length > 0 && (
        <div className="mt-6 flex items-center gap-2 text-sm text-cream/45">
          <CheckCircle2 size={15} className="text-basil" />
          {completed.length} order{completed.length === 1 ? "" : "s"} completed
          today
        </div>
      )}
    </div>
  );
}
