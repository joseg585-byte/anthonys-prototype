"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  ChefHat,
  Truck,
  Home,
  MapPin,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { useOrders } from "@/lib/orders";
import { useHasMounted } from "@/lib/useHasMounted";
import { formatPrice, clockTime } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STAGES: {
  status: OrderStatus;
  label: string;
  subLabel: string;
  icon: typeof Check;
}[] = [
  {
    status: "received",
    label: "Order Received",
    subLabel: "Kitchen has your order",
    icon: Check,
  },
  {
    status: "preparing",
    label: "Being Prepared",
    subLabel: "Chef is cooking your meal",
    icon: ChefHat,
  },
  {
    status: "ready",
    label: "Driver Picking Up",
    subLabel: "DoorDash driver on their way",
    icon: Truck,
  },
  {
    status: "completed",
    label: "Delivered!",
    subLabel: "Enjoy your meal",
    icon: Home,
  },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  received: 0,
  preparing: 1,
  ready: 2,
  completed: 3,
};

function PulsingDot() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-60" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-crimson" />
    </span>
  );
}

export default function TrackPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const mounted = useHasMounted();
  const orders = useOrders((s) => s.orders);
  const [, setTick] = useState(0);

  // Refresh timestamps every 15s
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
      </div>
    );
  }

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-parchment px-6 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-cream-deep text-gold-deep">
          <Truck size={28} />
        </div>
        <h1 className="font-display text-2xl font-bold text-espresso">
          Order not found
        </h1>
        <p className="text-sm text-espresso-soft/70">
          We couldn&rsquo;t find a delivery order with that ID.
        </p>
        <Link
          href="/"
          className="rounded-full bg-crimson px-6 py-2.5 text-sm font-semibold text-cream"
        >
          Back to Anthony&rsquo;s
        </Link>
      </div>
    );
  }

  const currentIdx = STATUS_INDEX[order.status];
  const isDelivery = order.orderType === "delivery";
  const eta = 35 - (currentIdx > 1 ? 10 * (currentIdx - 1) : 0);

  return (
    <div className="min-h-screen bg-parchment pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-gold/15 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-espresso-soft/60 transition-colors hover:text-espresso"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-crimson-deep font-display text-xs font-bold text-gold">
              A
            </span>
            <span className="font-display text-sm font-semibold text-espresso">
              Anthony&rsquo;s
            </span>
          </div>
          <p className="text-sm font-bold text-crimson">{order.shortCode}</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pt-8">
        {/* Hero status */}
        <motion.div
          key={order.status}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl bg-gradient-to-br from-crimson-deep to-espresso p-7 text-center shadow-lg"
        >
          <motion.div
            key={`icon-${order.status}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white/15"
          >
            {order.status === "completed" ? (
              <Check size={30} className="text-basil" />
            ) : order.status === "ready" ? (
              <Truck size={28} className="text-gold" />
            ) : order.status === "preparing" ? (
              <ChefHat size={28} className="text-gold" />
            ) : (
              <Check size={28} className="text-gold" />
            )}
          </motion.div>

          <h1 className="font-display text-2xl font-bold text-cream">
            {STAGES[currentIdx].label}
          </h1>
          <p className="mt-1 text-sm text-cream/70">
            {STAGES[currentIdx].subLabel}
          </p>

          {order.status !== "completed" && isDelivery && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <PulsingDot />
              <span className="text-sm font-medium text-cream/80">
                Estimated arrival: ~{eta} min
              </span>
            </div>
          )}

          {order.deliveryAddress && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-cream/60">
              <MapPin size={12} />
              {order.deliveryAddress}
            </div>
          )}
        </motion.div>

        {/* Progress steps */}
        <div className="mb-8 rounded-2xl border border-gold/20 bg-cream p-5 shadow-sm">
          <h2 className="mb-4 font-display text-base font-semibold text-espresso">
            Order Progress
          </h2>
          <div className="space-y-0">
            {STAGES.map((stage, i) => {
              const isDone = i < currentIdx;
              const isActive = i === currentIdx;
              const Icon = stage.icon;

              return (
                <div key={stage.status} className="flex gap-4">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-all ${
                        isDone
                          ? "border-basil bg-basil text-cream"
                          : isActive
                            ? "border-crimson bg-crimson text-cream"
                            : "border-gold/25 bg-cream-deep text-espresso-soft/30"
                      }`}
                    >
                      {isDone ? (
                        <Check size={16} strokeWidth={2.5} />
                      ) : (
                        <Icon size={15} />
                      )}
                    </div>
                    {i < STAGES.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 my-1 min-h-6 transition-colors ${
                          isDone ? "bg-basil" : "bg-gold/15"
                        }`}
                      />
                    )}
                  </div>

                  {/* Step text */}
                  <div className="pb-4 pt-1">
                    <p
                      className={`text-sm font-semibold ${
                        isActive
                          ? "text-crimson"
                          : isDone
                            ? "text-espresso"
                            : "text-espresso-soft/40"
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p
                      className={`text-xs ${
                        isActive || isDone
                          ? "text-espresso-soft/65"
                          : "text-espresso-soft/30"
                      }`}
                    >
                      {stage.subLabel}
                    </p>
                    {isActive && order.status !== "completed" && (
                      <div className="mt-1 flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: d * 0.3,
                            }}
                            className="h-1.5 w-1.5 rounded-full bg-crimson"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-2xl border border-gold/20 bg-cream p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-espresso">
              Your Order
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-espresso-soft/55">
              <Clock size={12} />
              Placed at {clockTime(order.createdAt)}
            </div>
          </div>
          <ul className="space-y-1.5">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-espresso-soft/75">
                  {item.qty}× {item.name}
                  {item.modifiers.length > 0 && (
                    <span className="ml-1 text-xs text-gold-deep">
                      (+{item.modifiers.map((m) => m.name).join(", ")})
                    </span>
                  )}
                </span>
                <span className="text-espresso-soft/75">
                  {formatPrice(item.priceCents * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-gold/15 pt-3 font-display font-bold text-espresso">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-espresso-soft/50">
            <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-blue-400">
              DoorDash Drive
            </span>
            Driver assigned · Tracking updates automatically
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-espresso-soft/45">
          Questions?{" "}
          <a href="tel:+18162214088" className="text-gold-deep underline">
            Call (816) 221-4088
          </a>
        </p>
      </div>
    </div>
  );
}
