"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Check,
  Trash2,
  Truck,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useCart, cartSubtotal, cartCount } from "@/lib/store";
import { useOrders } from "@/lib/orders";
import { useAuth } from "@/lib/auth";
import { useHasMounted } from "@/lib/useHasMounted";
import { formatPrice } from "@/lib/format";
import { RESTAURANT } from "@/data/restaurant";
import type { Order } from "@/lib/types";

const DELIVERY_FEE_CENTS = 499;

type Step = "cart" | "checkout" | "success";
type OrderMode = "pickup" | "delivery";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
}
type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState, mode: OrderMode): FieldErrors {
  const e: FieldErrors = {};
  if (!f.firstName.trim()) e.firstName = "We'll need a first name";
  if (!f.lastName.trim()) e.lastName = "And a last name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Enter a valid email";
  if (f.phone.replace(/\D/g, "").length < 10)
    e.phone = "Enter a 10-digit phone";
  if (mode === "delivery" && !f.deliveryAddress.trim())
    e.deliveryAddress = "Enter a delivery address";
  return e;
}

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const placeOrder = useOrders((s) => s.placeOrder);
  const profile = useAuth((s) => s.profile);
  const mounted = useHasMounted();

  const [step, setStep] = useState<Step>("cart");
  const [mode, setMode] = useState<OrderMode>("pickup");
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  // Pre-fill from profile when drawer opens
  useEffect(() => {
    if (isOpen && profile) {
      setForm((f) => ({
        ...f,
        firstName: f.firstName || profile.firstName,
        lastName: f.lastName || profile.lastName,
        email: f.email || profile.email,
        phone: f.phone || profile.phone,
        deliveryAddress:
          f.deliveryAddress ||
          (profile.savedAddresses.length > 0
            ? profile.savedAddresses[0]
            : ""),
      }));
    }
  }, [isOpen, profile]);

  const subtotal = mounted ? cartSubtotal(lines) : 0;
  const deliveryFee = mode === "delivery" ? DELIVERY_FEE_CENTS : 0;
  const tax = Math.round((subtotal + deliveryFee) * RESTAURANT.taxRate);
  const total = subtotal + deliveryFee + tax;
  const count = mounted ? cartCount(lines) : 0;
  const errors = useMemo(() => validate(form, mode), [form, mode]);

  // lock body scroll + Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const handlePlace = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    // Simulate DoorDash Drive driver assignment for delivery orders
    if (mode === "delivery") {
      const driverId = `DD-${Math.floor(Math.random() * 90000 + 10000)}`;
      console.log(
        `[DOORDASH DRIVE] Driver assigned: ${driverId} for delivery to ${form.deliveryAddress}`,
      );
    }

    const order = placeOrder({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      lines,
      subtotalCents: subtotal + deliveryFee,
      source: "online",
      orderType: mode,
      deliveryAddress:
        mode === "delivery" ? form.deliveryAddress.trim() : undefined,
      paymentMethod: "paid-online",
      driverAssigned: mode === "delivery",
    } as Parameters<typeof placeOrder>[0]);

    // Save new delivery address to profile
    if (mode === "delivery" && profile && form.deliveryAddress.trim()) {
      useAuth.getState().addAddress(form.deliveryAddress.trim());
    }

    setPlaced(order);
    clear();
    setStep("success");
  };

  const resetAndClose = () => {
    close();
    setTimeout(() => {
      setStep("cart");
      setMode("pickup");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        deliveryAddress: "",
      });
      setTouched({});
      setSubmitted(false);
      setPlaced(null);
    }, 350);
  };

  const field = (
    name: keyof FormState,
    label: string,
    type = "text",
    placeholder = "",
  ) => {
    const showErr = (touched[name] || submitted) && errors[name];
    return (
      <label className="block">
        <span className="overline text-[0.62rem] text-espresso-soft/70">
          {label}
        </span>
        <input
          type={type}
          value={form[name]}
          placeholder={placeholder}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          onBlur={() => setTouched({ ...touched, [name]: true })}
          className={`focus-gold mt-1.5 w-full rounded-lg border bg-cream/70 px-3.5 py-2.5 text-sm text-espresso transition-colors placeholder:text-espresso-soft/40 ${
            showErr ? "border-gold-deep bg-gold-light/10" : "border-gold/25"
          }`}
        />
        <AnimatePresence>
          {showErr && (
            <motion.span
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 block text-xs text-gold-deep"
            >
              {errors[name]}
            </motion.span>
          )}
        </AnimatePresence>
      </label>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-charcoal/55 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 38 }}
            className="scroll-elegant fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col overflow-y-auto bg-parchment shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gold/15 bg-crimson-deep px-5 py-4 text-cream">
              <div className="flex items-center gap-2.5">
                {step === "checkout" && (
                  <button
                    onClick={() => setStep("cart")}
                    aria-label="Back to cart"
                    className="-ml-1 rounded-full p-1 text-cream/80 transition-colors hover:text-gold"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 className="font-display text-xl font-semibold">
                  {step === "cart" && "Your Order"}
                  {step === "checkout" && "Checkout"}
                  {step === "success" && "Order Confirmed"}
                </h2>
              </div>
              <button
                onClick={resetAndClose}
                aria-label="Close"
                className="rounded-full p-1 text-cream/80 transition-colors hover:text-gold"
              >
                <X size={22} />
              </button>
            </div>

            {/* ── CART STEP ── */}
            {step === "cart" && (
              <div className="flex flex-1 flex-col">
                {count === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-20 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-deep text-gold-deep">
                      <ShoppingBag size={28} />
                    </span>
                    <p className="font-serif text-xl italic text-espresso-soft">
                      Your table awaits.
                    </p>
                    <p className="max-w-xs text-sm text-espresso-soft/70">
                      Add a few dishes from the menu and they&rsquo;ll appear
                      here.
                    </p>
                    <button
                      onClick={close}
                      className="mt-2 rounded-full bg-crimson px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-crimson-deep"
                    >
                      Browse the Menu
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Pickup / Delivery toggle */}
                    <div className="border-b border-gold/10 px-5 py-3">
                      <div className="flex overflow-hidden rounded-full border border-gold/25 bg-cream">
                        {(["pickup", "delivery"] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-2 text-xs font-semibold capitalize transition-all ${
                              mode === m
                                ? "bg-crimson text-cream"
                                : "text-espresso-soft/60 hover:text-espresso"
                            }`}
                          >
                            {m === "delivery" && (
                              <Truck
                                size={11}
                                className="mr-1 inline-block"
                              />
                            )}
                            {m}
                          </button>
                        ))}
                      </div>
                      {mode === "delivery" && (
                        <p className="mt-2 text-center text-xs text-espresso-soft/60">
                          Flat $4.99 delivery fee · Powered by DoorDash Drive
                        </p>
                      )}
                    </div>

                    <ul className="flex-1 divide-y divide-gold/12 px-5">
                      {lines.map((l) => (
                        <li key={l.key} className="flex gap-3 py-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-semibold text-espresso">
                              {l.name}
                            </p>
                            {l.modifiers.length > 0 && (
                              <ul className="mt-0.5 space-y-0.5">
                                {l.modifiers.map((m) => (
                                  <li
                                    key={m.id}
                                    className="flex items-baseline justify-between gap-2 text-xs text-gold-deep"
                                  >
                                    <span>+ {m.name}</span>
                                    {m.priceCents > 0 && (
                                      <span className="shrink-0">
                                        +{formatPrice(m.priceCents)}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {l.specialRequests && (
                              <p className="mt-1 text-xs italic text-espresso-soft/60">
                                &ldquo;{l.specialRequests}&rdquo;
                              </p>
                            )}
                            <p className="mt-1 text-sm text-espresso-soft/70">
                              {formatPrice(l.priceCents)} each
                            </p>
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-gold/30 bg-cream">
                              <button
                                onClick={() => setQty(l.key, l.qty - 1)}
                                aria-label="Decrease quantity"
                                className="grid h-7 w-7 place-items-center rounded-full text-espresso-soft transition-colors hover:text-crimson"
                              >
                                {l.qty === 1 ? (
                                  <Trash2 size={13} />
                                ) : (
                                  <Minus size={13} />
                                )}
                              </button>
                              <span className="w-5 text-center text-sm font-semibold text-espresso">
                                {l.qty}
                              </span>
                              <button
                                onClick={() => setQty(l.key, l.qty + 1)}
                                aria-label="Increase quantity"
                                className="grid h-7 w-7 place-items-center rounded-full text-espresso-soft transition-colors hover:text-crimson"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => remove(l.key)}
                              aria-label={`Remove ${l.name}`}
                              className="text-espresso-soft/40 transition-colors hover:text-crimson"
                            >
                              <X size={16} />
                            </button>
                            <span className="font-display text-base font-semibold text-espresso">
                              {formatPrice(l.priceCents * l.qty)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <CartFooter
                      subtotal={subtotal}
                      deliveryFee={deliveryFee}
                      tax={tax}
                      total={total}
                      cta="Proceed to Checkout"
                      onCta={() => setStep("checkout")}
                    />
                  </>
                )}
              </div>
            )}

            {/* ── CHECKOUT STEP ── */}
            {step === "checkout" && (
              <div className="flex flex-1 flex-col">
                <div className="flex-1 space-y-4 px-5 py-6">
                  <p className="text-sm text-espresso-soft/75">
                    {mode === "pickup"
                      ? "Almost there — tell us who's picking up."
                      : "Almost there — confirm your delivery details."}
                  </p>

                  {/* Order type reminder */}
                  <div
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                      mode === "delivery"
                        ? "bg-crimson/10 text-crimson"
                        : "bg-gold/10 text-gold-deep"
                    }`}
                  >
                    {mode === "delivery" ? (
                      <Truck size={14} />
                    ) : (
                      <ShoppingBag size={14} />
                    )}
                    {mode === "delivery"
                      ? "Delivery · $4.99 flat fee · ~35 min via DoorDash"
                      : "Pickup · Ready in ~20 min"}
                    <button
                      onClick={() => setStep("cart")}
                      className="ml-auto underline opacity-70"
                    >
                      Change
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {field("firstName", "First Name", "text", "Maria")}
                    {field("lastName", "Last Name", "text", "Russo")}
                  </div>
                  {field("email", "Email", "email", "maria@email.com")}
                  {field("phone", "Phone", "tel", "(816) 555-0148")}

                  {mode === "delivery" && (
                    <label className="block">
                      <span className="overline text-[0.62rem] text-espresso-soft/70">
                        Delivery Address
                      </span>
                      <div className="relative mt-1.5">
                        <MapPin
                          size={14}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-soft/40"
                        />
                        <input
                          type="text"
                          value={form.deliveryAddress}
                          placeholder="123 Main St, Kansas City, MO"
                          onChange={(e) =>
                            setForm({
                              ...form,
                              deliveryAddress: e.target.value,
                            })
                          }
                          onBlur={() =>
                            setTouched({ ...touched, deliveryAddress: true })
                          }
                          className={`focus-gold w-full rounded-lg border bg-cream/70 py-2.5 pl-10 pr-4 text-sm text-espresso placeholder:text-espresso-soft/40 ${
                            (touched.deliveryAddress || submitted) &&
                            errors.deliveryAddress
                              ? "border-gold-deep"
                              : "border-gold/25"
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {(touched.deliveryAddress || submitted) &&
                          errors.deliveryAddress && (
                            <motion.span
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-1 block text-xs text-gold-deep"
                            >
                              {errors.deliveryAddress}
                            </motion.span>
                          )}
                      </AnimatePresence>
                      {profile &&
                        profile.savedAddresses.length > 0 &&
                        !form.deliveryAddress && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {profile.savedAddresses
                              .slice(0, 3)
                              .map((addr) => (
                                <button
                                  key={addr}
                                  onClick={() =>
                                    setForm({
                                      ...form,
                                      deliveryAddress: addr,
                                    })
                                  }
                                  className="flex items-center gap-1 rounded-full border border-gold/25 bg-cream px-2.5 py-1 text-xs text-espresso-soft transition-colors hover:border-gold hover:text-espresso"
                                >
                                  <MapPin size={10} />
                                  {addr.slice(0, 28)}
                                  {addr.length > 28 ? "…" : ""}
                                </button>
                              ))}
                          </div>
                        )}
                    </label>
                  )}

                  <div className="rounded-lg border border-gold/20 bg-cream/60 p-4">
                    <p className="overline mb-2 text-[0.6rem] text-espresso-soft/60">
                      Order Summary
                    </p>
                    <ul className="space-y-1 text-sm text-espresso-soft/80">
                      {lines.map((l) => (
                        <li
                          key={l.key}
                          className="flex justify-between gap-2"
                        >
                          <span className="truncate">
                            {l.qty}× {l.name}
                            {l.modifiers.length > 0 &&
                              ` · ${l.modifiers.map((m) => m.name).join(", ")}`}
                          </span>
                          <span>{formatPrice(l.priceCents * l.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <CartFooter
                  subtotal={subtotal}
                  deliveryFee={deliveryFee}
                  tax={tax}
                  total={total}
                  cta="Place Order"
                  onCta={handlePlace}
                />
              </div>
            )}

            {/* ── SUCCESS STEP ── */}
            {step === "success" && placed && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-1 flex-col items-center px-6 py-12 text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                    delay: 0.1,
                  }}
                  className="grid h-20 w-20 place-items-center rounded-full bg-basil text-cream"
                >
                  <Check size={40} strokeWidth={2.5} />
                </motion.span>
                <h3 className="mt-6 font-display text-2xl font-bold text-espresso">
                  Grazie, {placed.customerFirstName}!
                </h3>

                {placed.orderType === "delivery" ? (
                  <div className="mt-3 space-y-2">
                    <p className="flex items-center justify-center gap-2 text-sm font-medium text-espresso">
                      <Truck size={15} className="text-crimson" />
                      Your DoorDash driver will arrive in ~35 min.
                    </p>
                    <Link
                      href={`/track/${placed.id}`}
                      onClick={resetAndClose}
                      className="inline-flex items-center gap-1.5 text-sm text-crimson underline underline-offset-2 hover:text-crimson-deep"
                    >
                      Live tracking
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                ) : (
                  <p className="mt-2 max-w-xs text-sm text-espresso-soft/75">
                    Your order is in the kitchen. We&rsquo;ll text{" "}
                    <span className="font-medium text-espresso">
                      {placed.phone}
                    </span>{" "}
                    when it&rsquo;s ready for pickup.
                  </p>
                )}

                <div className="mt-6 w-full rounded-xl border border-gold/25 bg-cream p-5">
                  <p className="overline text-[0.6rem] text-espresso-soft/60">
                    {placed.orderType === "delivery"
                      ? "Delivery Ticket"
                      : "Pickup Ticket"}
                  </p>
                  <p className="mt-1 font-display text-4xl font-bold tracking-wide text-crimson">
                    {placed.shortCode}
                  </p>
                  {placed.orderType === "delivery" && placed.deliveryAddress && (
                    <p className="mt-1 flex items-center justify-center gap-1 text-xs text-espresso-soft/70">
                      <MapPin size={11} />
                      {placed.deliveryAddress}
                    </p>
                  )}
                  <div className="mt-4 space-y-1.5 border-t border-gold/15 pt-4 text-left text-sm text-espresso-soft/80">
                    {placed.items.map((it, i) => (
                      <div key={i}>
                        <div className="flex justify-between gap-2">
                          <span className="truncate">
                            {it.qty}× {it.name}
                          </span>
                          <span>{formatPrice(it.priceCents * it.qty)}</span>
                        </div>
                        {it.modifiers.map((m) => (
                          <div
                            key={m.id}
                            className="ml-4 flex justify-between gap-2 text-xs text-gold-deep/80"
                          >
                            <span>+ {m.name}</span>
                            {m.priceCents > 0 && (
                              <span>+{formatPrice(m.priceCents)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gold/15 pt-2 font-display text-base font-semibold text-espresso">
                      <span>Total</span>
                      <span>{formatPrice(placed.totalCents)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetAndClose}
                  className="mt-7 w-full rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-crimson-deep"
                >
                  Done
                </button>
                <p className="mt-3 text-xs text-espresso-soft/55">
                  Watch it move live on the{" "}
                  <a href="/admin" className="text-gold-deep underline">
                    kitchen display
                  </a>
                  .
                </p>
              </motion.div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CartFooter({
  subtotal,
  deliveryFee,
  tax,
  total,
  cta,
  onCta,
}: {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="sticky bottom-0 border-t border-gold/15 bg-cream/95 px-5 py-4 backdrop-blur">
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between text-espresso-soft/75">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {deliveryFee > 0 && (
          <div className="flex justify-between text-espresso-soft/75">
            <dt className="flex items-center gap-1">
              <Truck size={12} />
              Delivery
            </dt>
            <dd>{formatPrice(deliveryFee)}</dd>
          </div>
        )}
        <div className="flex justify-between text-espresso-soft/75">
          <dt>Tax</dt>
          <dd>{formatPrice(tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-gold/15 pt-2 font-display text-lg font-bold text-espresso">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <button
        onClick={onCta}
        className="mt-4 w-full rounded-full bg-gold py-3.5 text-sm font-bold tracking-wide text-espresso shadow-md transition-all duration-200 hover:scale-[1.01] hover:bg-gold-light active:scale-95"
      >
        {cta}
      </button>
    </div>
  );
}
