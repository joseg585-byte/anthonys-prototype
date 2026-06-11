"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Phone,
  ChevronDown,
} from "lucide-react";
import { MENU, MENU_BY_ID } from "@/data/menu";
import { CATEGORY_ORDER } from "@/lib/types";
import type { CartModifier, PaymentMethod } from "@/lib/types";
import { useOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { ModifierModal } from "@/components/ModifierModal";
import { RESTAURANT } from "@/data/restaurant";

// ── Local cart line for the phone form ─────────────────────────────────────
interface PhoneLine {
  key: string;
  itemId: string;
  name: string;
  basePriceCents: number;
  priceCents: number;
  modifiers: CartModifier[];
  specialRequests?: string;
  qty: number;
}

function phoneLineKey(itemId: string, modifiers: CartModifier[]): string {
  if (!modifiers.length) return itemId;
  return `${itemId}::${modifiers.map((m) => m.id).sort().join(",")}`;
}

const TIME_OPTIONS = [
  { label: "ASAP", value: "asap" },
  { label: "15 min", value: "15" },
  { label: "30 min", value: "30" },
  { label: "45 min", value: "45" },
  { label: "1 hr", value: "60" },
  { label: "Custom", value: "custom" },
];

const TIP_PRESETS = [
  { label: "15%", pct: 0.15 },
  { label: "20%", pct: 0.2 },
  { label: "25%", pct: 0.25 },
];

// ── Validation ──────────────────────────────────────────────────────────────
interface FormErrors {
  firstName?: string;
  phone?: string;
}

function validate(f: { firstName: string; phone: string }): FormErrors {
  const e: FormErrors = {};
  if (!f.firstName.trim()) e.firstName = "First name is required";
  if (f.phone.replace(/\D/g, "").length < 10)
    e.phone = "Enter a valid 10-digit phone number";
  return e;
}

// ── PhoneOrderForm ──────────────────────────────────────────────────────────
export function PhoneOrderForm({ onClose }: { onClose: () => void }) {
  // Customer
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Menu picker
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [modifierItem, setModifierItem] = useState<string | null>(null);

  // Local cart
  const [lines, setLines] = useState<PhoneLine[]>([]);

  // Order details
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [timeOption, setTimeOption] = useState("asap");
  const [customTime, setCustomTime] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("card-on-pickup");
  const [tipMode, setTipMode] = useState<"pct" | "custom">("pct");
  const [tipPct, setTipPct] = useState(0.2);
  const [tipCustom, setTipCustom] = useState("");

  // Validation
  const [submitted, setSubmitted] = useState(false);

  const placeOrder = useOrders((s) => s.placeOrder);

  // ── Computed ─────────────────────────────────────────────────────────────
  const subtotal = lines.reduce((n, l) => n + l.priceCents * l.qty, 0);
  const tax = Math.round(subtotal * RESTAURANT.taxRate);

  const tipCents = useMemo(() => {
    if (tipMode === "custom") {
      const v = parseFloat(tipCustom.replace(/[^0-9.]/g, ""));
      return isNaN(v) ? 0 : Math.round(v * 100);
    }
    return Math.round(subtotal * tipPct);
  }, [tipMode, tipCustom, subtotal, tipPct]);

  const total = subtotal + tax + tipCents;

  const formErrors = useMemo(
    () => (submitted ? validate({ firstName, phone }) : {}),
    [submitted, firstName, phone],
  );

  // ── Filtered menu ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MENU.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      const matchesCat =
        categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [search, categoryFilter]);

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const addToPhoneCart = (
    itemId: string,
    modifiers: CartModifier[],
    specialRequests: string,
    qty: number,
  ) => {
    const item = MENU_BY_ID[itemId];
    if (!item) return;
    const key = phoneLineKey(itemId, modifiers);
    const modSum = modifiers.reduce((n, m) => n + m.priceCents, 0);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [
        ...prev,
        {
          key,
          itemId,
          name: item.name,
          basePriceCents: item.priceCents,
          priceCents: item.priceCents + modSum,
          modifiers,
          specialRequests: specialRequests || undefined,
          qty,
        },
      ];
    });
    setModifierItem(null);
  };

  const removeLine = (key: string) =>
    setLines((prev) => prev.filter((l) => l.key !== key));

  const setLineQty = (key: string, qty: number) =>
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: Math.max(0, qty) } : l))
        .filter((l) => l.qty > 0),
    );

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setSubmitted(true);
    const errors = validate({ firstName, phone });
    if (Object.keys(errors).length > 0 || lines.length === 0) return;

    const pickupTime =
      timeOption === "asap"
        ? "ASAP"
        : timeOption === "custom"
          ? customTime
          : `~${timeOption} min`;

    placeOrder({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || `${firstName.toLowerCase()}.phone@anthonys.local`,
      phone: phone.trim(),
      notes: orderNotes.trim() || undefined,
      lines: lines.map((l) => ({
        key: l.key,
        itemId: l.itemId,
        name: l.name,
        basePriceCents: l.basePriceCents,
        priceCents: l.priceCents,
        modifiers: l.modifiers,
        specialRequests: l.specialRequests,
        qty: l.qty,
        image: MENU_BY_ID[l.itemId]?.image,
      })),
      subtotalCents: subtotal,
      source: "phone",
      orderType,
      deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
      pickupTime,
      paymentMethod,
      tipCents,
    });
    onClose();
  };

  const modItemObj = modifierItem ? MENU_BY_ID[modifierItem] : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[40] bg-charcoal/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
        className="fixed inset-y-0 right-0 z-[41] flex w-full flex-col bg-espresso shadow-2xl lg:w-[900px]"
        role="dialog"
        aria-modal="true"
        aria-label="New Phone Order"
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-gold/20 bg-charcoal px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-espresso">
              <Phone size={18} />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-cream">
                New Phone Order
              </p>
              <p className="text-xs text-cream/50">Staff entry — goes straight to the kitchen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 text-cream/60 transition-colors hover:border-crimson hover:text-crimson"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Left: form */}
          <div className="scroll-elegant flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* ── Customer ── */}
            <section>
              <h3 className="overline mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-gold/70">
                Customer
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First Name *"
                  value={firstName}
                  onChange={setFirstName}
                  error={formErrors.firstName}
                  placeholder="Maria"
                />
                <Field
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Russo"
                />
                <Field
                  label="Phone *"
                  value={phone}
                  onChange={setPhone}
                  error={formErrors.phone}
                  placeholder="(816) 555-0148"
                  type="tel"
                  className="col-span-2 sm:col-span-1"
                />
                <Field
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="maria@email.com"
                  type="email"
                  className="col-span-2 sm:col-span-1"
                />
              </div>
            </section>

            {/* ── Menu picker ── */}
            <section>
              <h3 className="overline mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-gold/70">
                Add Items
              </h3>

              {/* Search + category filter */}
              <div className="mb-3 flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search menu…"
                    className="w-full rounded-lg border border-gold/20 bg-charcoal/50 py-2 pl-9 pr-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none rounded-lg border border-gold/20 bg-charcoal/50 py-2 pl-3 pr-8 text-sm text-cream focus:border-gold focus:outline-none"
                  >
                    <option value="All">All</option>
                    {CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-cream/40"
                  />
                </div>
              </div>

              {/* Item grid */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const needsModal =
                        (item.modifiers?.length ?? 0) > 0 ||
                        item.allowsSpecialRequests;
                      if (needsModal) {
                        setModifierItem(item.id);
                      } else {
                        addToPhoneCart(item.id, [], "", 1);
                      }
                    }}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gold/15 bg-charcoal/40 px-3.5 py-2.5 text-left transition-all hover:border-gold/50 hover:bg-charcoal/70 active:scale-[0.98]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-cream/90">
                        {item.name}
                      </p>
                      <p className="text-xs text-cream/40">
                        {item.category}
                        {(item.modifiers?.length ?? 0) > 0 && (
                          <span className="ml-1.5 text-gold/60">
                            · customisable
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-semibold text-gold">
                      {formatPrice(item.priceCents)}
                    </span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-2 py-6 text-center text-sm text-cream/30">
                    No items match your search.
                  </p>
                )}
              </div>

              {submitted && lines.length === 0 && (
                <p className="mt-2 text-xs text-crimson">
                  Add at least one item to the order.
                </p>
              )}
            </section>

            {/* ── Order details ── */}
            <section>
              <h3 className="overline mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-gold/70">
                Order Details
              </h3>

              {/* Order type */}
              <div className="flex gap-3 mb-4">
                {(["pickup", "delivery"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold capitalize transition-all ${
                      orderType === t
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-gold/20 text-cream/50 hover:border-gold/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {orderType === "delivery" && (
                <div className="mb-4">
                  <Field
                    label="Delivery Address"
                    value={deliveryAddress}
                    onChange={setDeliveryAddress}
                    placeholder="Street address, apartment, city"
                  />
                </div>
              )}

              {/* Time selector */}
              <p className="overline mb-2 text-[0.62rem] text-cream/50">
                {orderType === "pickup" ? "Pickup Time" : "Delivery Time"}
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeOption(opt.value)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                      timeOption === opt.value
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-gold/20 text-cream/50 hover:border-gold/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {timeOption === "custom" && (
                <Field
                  label="Custom time"
                  value={customTime}
                  onChange={setCustomTime}
                  placeholder="e.g. 6:45 PM"
                />
              )}

              {/* Whole-order special requests */}
              <div className="mt-4">
                <label className="block">
                  <span className="overline text-[0.62rem] text-cream/50">
                    Order Notes
                  </span>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. call when ready, table near window, birthday celebration…"
                    rows={2}
                    className="mt-1.5 w-full rounded-lg border border-gold/20 bg-charcoal/50 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 resize-none focus:border-gold focus:outline-none"
                  />
                </label>
              </div>
            </section>

            {/* ── Payment ── */}
            <section>
              <h3 className="overline mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-gold/70">
                Payment
              </h3>

              <div className="space-y-2 mb-4">
                {(
                  [
                    { value: "card-on-pickup", label: "Will Pay on Pickup — Card" },
                    { value: "cash-on-pickup", label: "Will Pay on Pickup — Cash" },
                    { value: "paid-online",    label: "Already Paid (Online)" },
                  ] as { value: PaymentMethod; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                      paymentMethod === opt.value
                        ? "border-gold bg-gold/10 text-cream"
                        : "border-gold/20 text-cream/50 hover:border-gold/30"
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                        paymentMethod === opt.value
                          ? "border-gold bg-gold"
                          : "border-gold/40"
                      }`}
                    >
                      {paymentMethod === opt.value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-espresso" />
                      )}
                    </span>
                    {opt.label}
                  </button>
                ))}

                {/* Disabled: stored card */}
                <div className="relative flex items-center gap-3 rounded-lg border border-gold/10 px-4 py-3 opacity-40 cursor-not-allowed">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 border-gold/30" />
                  <span className="text-sm text-cream/50">
                    Charge Stored Card
                  </span>
                  <span className="ml-auto text-xs text-gold/50">Coming soon</span>
                </div>
              </div>

              {/* Tip */}
              <p className="overline mb-2 text-[0.62rem] text-cream/50">Tip</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {TIP_PRESETS.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => { setTipMode("pct"); setTipPct(t.pct); }}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                      tipMode === "pct" && tipPct === t.pct
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-gold/20 text-cream/50 hover:border-gold/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
                <button
                  onClick={() => setTipMode("custom")}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    tipMode === "custom"
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-gold/20 text-cream/50 hover:border-gold/40"
                  }`}
                >
                  Custom
                </button>
              </div>
              {tipMode === "custom" && (
                <Field
                  label="Tip amount ($)"
                  value={tipCustom}
                  onChange={setTipCustom}
                  placeholder="5.00"
                />
              )}
            </section>
          </div>

          {/* ── Right: cart summary ── */}
          <div className="flex shrink-0 flex-col border-t border-gold/15 bg-charcoal/60 lg:w-72 lg:border-t-0 lg:border-l">
            <div className="scroll-elegant flex-1 overflow-y-auto px-4 py-4">
              <p className="overline mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-gold/70">
                Order Summary
              </p>

              {lines.length === 0 ? (
                <p className="py-8 text-center text-sm text-cream/30">
                  No items yet — tap items from the menu to add them.
                </p>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li key={l.key} className="rounded-lg border border-gold/10 bg-espresso/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-cream/90">
                          {l.name}
                        </p>
                        <button
                          onClick={() => removeLine(l.key)}
                          className="text-cream/30 transition-colors hover:text-crimson"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {l.modifiers.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {l.modifiers.map((m) => (
                            <li key={m.id} className="text-xs text-gold/70">
                              + {m.name}
                              {m.priceCents > 0 && ` (+${formatPrice(m.priceCents)})`}
                            </li>
                          ))}
                        </ul>
                      )}
                      {l.specialRequests && (
                        <p className="mt-1 text-xs italic text-cream/40">
                          &ldquo;{l.specialRequests}&rdquo;
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-espresso/60">
                          <button
                            onClick={() => setLineQty(l.key, l.qty - 1)}
                            className="grid h-6 w-6 place-items-center rounded-full text-cream/50 transition-colors hover:text-crimson"
                          >
                            {l.qty === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
                          </button>
                          <span className="w-4 text-center text-xs font-bold text-cream">
                            {l.qty}
                          </span>
                          <button
                            onClick={() => setLineQty(l.key, l.qty + 1)}
                            className="grid h-6 w-6 place-items-center rounded-full text-cream/50 transition-colors hover:text-gold"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-cream/80">
                          {formatPrice(l.priceCents * l.qty)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Totals + submit */}
            <div className="shrink-0 border-t border-gold/15 px-4 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-cream/50">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-cream/50">
                  <dt>Tax</dt>
                  <dd>{formatPrice(tax)}</dd>
                </div>
                {tipCents > 0 && (
                  <div className="flex justify-between text-cream/50">
                    <dt>Tip</dt>
                    <dd>{formatPrice(tipCents)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-gold/15 pt-2">
                  <dt className="font-display text-xl font-bold text-gold">
                    Total
                  </dt>
                  <dd className="font-display text-xl font-bold text-gold">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>

              <button
                onClick={handleSubmit}
                className="mt-4 w-full rounded-full bg-crimson py-3.5 text-sm font-bold tracking-wide text-cream shadow-md transition-all duration-200 hover:scale-[1.01] hover:bg-crimson-deep active:scale-95"
              >
                Send to Kitchen
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modifier modal for selected item */}
      {modItemObj && (
        <ModifierModal
          item={modItemObj}
          onClose={() => setModifierItem(null)}
          onAdd={(mods, sr, qty) =>
            addToPhoneCart(modItemObj.id, mods, sr, qty)
          }
        />
      )}
    </>
  );
}

// ── Small field helper ──────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="overline text-[0.62rem] text-cream/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-lg border bg-charcoal/50 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/25 focus:outline-none transition-colors ${
          error
            ? "border-crimson/60 bg-crimson/10"
            : "border-gold/20 focus:border-gold"
        }`}
      />
      {error && (
        <span className="mt-1 block text-xs text-crimson">{error}</span>
      )}
    </label>
  );
}
