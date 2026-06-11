"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Check,
  Trash2,
} from "lucide-react";
import { useCart, cartSubtotal, cartCount } from "@/lib/store";
import { useOrders } from "@/lib/orders";
import { useHasMounted } from "@/lib/useHasMounted";
import { formatPrice } from "@/lib/format";
import { RESTAURANT } from "@/data/restaurant";
import type { Order } from "@/lib/types";

type Step = "cart" | "checkout" | "success";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): FieldErrors {
  const e: FieldErrors = {};
  if (!f.firstName.trim()) e.firstName = "We'll need a first name";
  if (!f.lastName.trim()) e.lastName = "And a last name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Enter a valid email";
  if (f.phone.replace(/\D/g, "").length < 10)
    e.phone = "Enter a 10-digit phone";
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
  const mounted = useHasMounted();

  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  const subtotal = mounted ? cartSubtotal(lines) : 0;
  const tax = Math.round(subtotal * RESTAURANT.taxRate);
  const total = subtotal + tax;
  const count = mounted ? cartCount(lines) : 0;
  const errors = useMemo(() => validate(form), [form]);

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
    const order = placeOrder({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      lines,
      subtotalCents: subtotal,
      source: "online",
      orderType: "pickup",
      paymentMethod: "paid-online",
    });
    setPlaced(order);
    clear();
    setStep("success");
  };

  const resetAndClose = () => {
    close();
    setTimeout(() => {
      setStep("cart");
      setForm({ firstName: "", lastName: "", email: "", phone: "" });
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
                  {step === "checkout" && "Guest Checkout"}
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

            {/* CART STEP */}
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
                    <ul className="flex-1 divide-y divide-gold/12 px-5">
                      {lines.map((l) => (
                        <li key={l.key} className="flex gap-3 py-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-base font-semibold text-espresso">
                              {l.name}
                            </p>
                            {/* Selected modifiers */}
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
                            {/* Special requests */}
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
                      tax={tax}
                      total={total}
                      cta="Proceed to Checkout"
                      onCta={() => setStep("checkout")}
                    />
                  </>
                )}
              </div>
            )}

            {/* CHECKOUT STEP */}
            {step === "checkout" && (
              <div className="flex flex-1 flex-col">
                <div className="flex-1 space-y-4 px-5 py-6">
                  <p className="text-sm text-espresso-soft/75">
                    Almost there — tell us who&rsquo;s picking up. We&rsquo;ll
                    text you the moment it&rsquo;s ready.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {field("firstName", "First Name", "text", "Maria")}
                    {field("lastName", "Last Name", "text", "Russo")}
                  </div>
                  {field("email", "Email", "email", "maria@email.com")}
                  {field("phone", "Phone", "tel", "(816) 555-0148")}

                  <div className="rounded-lg border border-gold/20 bg-cream/60 p-4">
                    <p className="overline mb-2 text-[0.6rem] text-espresso-soft/60">
                      Order Summary
                    </p>
                    <ul className="space-y-1 text-sm text-espresso-soft/80">
                      {lines.map((l) => (
                        <li key={l.key} className="flex justify-between gap-2">
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
                  tax={tax}
                  total={total}
                  cta="Place Order"
                  onCta={handlePlace}
                />
              </div>
            )}

            {/* SUCCESS STEP */}
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
                <p className="mt-2 max-w-xs text-sm text-espresso-soft/75">
                  Your order is in the kitchen. We&rsquo;ll text{" "}
                  <span className="font-medium text-espresso">{placed.phone}</span>{" "}
                  when it&rsquo;s ready for pickup.
                </p>

                <div className="mt-6 w-full rounded-xl border border-gold/25 bg-cream p-5">
                  <p className="overline text-[0.6rem] text-espresso-soft/60">
                    Pickup Ticket
                  </p>
                  <p className="mt-1 font-display text-4xl font-bold tracking-wide text-crimson">
                    {placed.shortCode}
                  </p>
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
  tax,
  total,
  cta,
  onCta,
}: {
  subtotal: number;
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
