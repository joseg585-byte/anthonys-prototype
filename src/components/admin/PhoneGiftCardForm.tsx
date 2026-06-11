"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Check, Copy } from "lucide-react";
import { useGiftCards } from "@/lib/giftCards";
import { formatPrice } from "@/lib/format";

interface Props {
  onClose: () => void;
}

const PRESET_AMOUNTS = [2500, 5000, 10000]; // cents
const PRESET_LABELS = ["$25", "$50", "$100"];

const PAYMENT_METHODS = [
  { id: "card-phone", label: "Card on Phone (will charge after call)" },
  { id: "cash-person", label: "Cash in Person" },
  { id: "card-person", label: "Card in Person" },
  { id: "paid", label: "Already Paid" },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];

const today = () => new Date().toISOString().split("T")[0];

function validate(fields: {
  buyerName: string;
  buyerPhone: string;
  recipientName: string;
  recipientEmail: string;
  amountCents: number;
  customAmount: string;
  isCustom: boolean;
}) {
  const errs: Record<string, string> = {};
  if (!fields.buyerName.trim()) errs.buyerName = "Buyer name is required";
  if (!/^\d{10}$/.test(fields.buyerPhone.replace(/\D/g, "")))
    errs.buyerPhone = "Enter a valid 10-digit US phone number";
  if (!fields.recipientName.trim())
    errs.recipientName = "Recipient name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.recipientEmail.trim()))
    errs.recipientEmail = "Enter a valid email address";
  if (fields.isCustom) {
    const n = Number(fields.customAmount);
    if (!n || n < 10 || n > 500)
      errs.amount = "Custom amount must be $10–$500";
  }
  return errs;
}

export function PhoneGiftCardForm({ onClose }: Props) {
  const purchase = useGiftCards((s) => s.purchase);

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"immediate" | "scheduled">(
    "immediate",
  );
  const [deliverAt, setDeliverAt] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card-phone");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedCard, setSavedCard] = useState<{ code: string; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const amountCents = isCustom
    ? Math.round(Number(customAmount) * 100)
    : (selectedPreset ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate({
      buyerName,
      buyerPhone,
      recipientName,
      recipientEmail,
      amountCents,
      customAmount,
      isCustom,
    });
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const card = purchase({
      amountCents,
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim(),
      senderName: buyerName.trim(),
      senderEmail: buyerEmail.trim(),
      message: message.trim() || undefined,
      deliverAt:
        deliveryMode === "scheduled" && deliverAt ? deliverAt : undefined,
      source: "phone",
    });
    setSavedCard({ code: card.code, amount: card.amountCents });
  };

  const copyCode = () => {
    if (!savedCard) return;
    navigator.clipboard.writeText(savedCard.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {savedCard ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-sm rounded-2xl bg-espresso p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-basil/20">
              <Check size={28} className="text-basil" />
            </div>
            <h3 className="font-display text-xl font-bold text-cream">
              Gift Card Created
            </h3>
            <p className="mt-1 text-sm text-cream/60">
              {formatPrice(savedCard.amount)} card for {recipientName}
            </p>

            <div className="mt-5 rounded-xl border border-gold/30 bg-charcoal/60 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cream/40">
                Card Code
              </p>
              <p className="font-mono text-lg font-bold tracking-[0.15em] text-gold">
                {savedCard.code}
              </p>
            </div>

            <button
              onClick={copyCode}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-xs font-semibold text-cream/70 transition-colors hover:border-gold hover:text-gold"
            >
              <Copy size={13} />
              {copied ? "Copied!" : "Copy code"}
            </button>

            <p className="mt-4 text-xs text-cream/40">
              Receipt email sent to {recipientEmail}
            </p>

            <button
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-gold py-3 text-sm font-bold text-espresso"
            >
              Done
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="mx-4 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-espresso shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gold/15 px-6 py-4">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-gold" />
                <h2 className="font-display text-lg font-bold text-cream">
                  New Phone Gift Card
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-cream/40 transition-colors hover:bg-charcoal/50 hover:text-cream"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <form
              id="phone-gc-form"
              onSubmit={handleSubmit}
              className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
            >
              {/* Buyer info */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold/60">
                  Buyer
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Buyer Name *
                    </label>
                    <input
                      value={buyerName}
                      onChange={(e) => {
                        setBuyerName(e.target.value);
                        setErrors((p) => { const n = { ...p }; delete n.buyerName; return n; });
                      }}
                      placeholder="Full name"
                      className={`w-full rounded-lg border bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.buyerName ? "border-crimson" : "border-gold/20"}`}
                    />
                    {errors.buyerName && (
                      <p className="mt-1 text-xs text-crimson">{errors.buyerName}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Buyer Phone *
                    </label>
                    <input
                      value={buyerPhone}
                      onChange={(e) => {
                        setBuyerPhone(e.target.value);
                        setErrors((p) => { const n = { ...p }; delete n.buyerPhone; return n; });
                      }}
                      placeholder="(555) 555-5555"
                      className={`w-full rounded-lg border bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.buyerPhone ? "border-crimson" : "border-gold/20"}`}
                    />
                    {errors.buyerPhone && (
                      <p className="mt-1 text-xs text-crimson">{errors.buyerPhone}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                    Buyer Email (for receipt)
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="buyer@email.com"
                    className="w-full rounded-lg border border-gold/20 bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50"
                  />
                </div>
              </div>

              {/* Recipient info */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold/60">
                  Recipient
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Recipient Name *
                    </label>
                    <input
                      value={recipientName}
                      onChange={(e) => {
                        setRecipientName(e.target.value);
                        setErrors((p) => { const n = { ...p }; delete n.recipientName; return n; });
                      }}
                      placeholder="Full name"
                      className={`w-full rounded-lg border bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.recipientName ? "border-crimson" : "border-gold/20"}`}
                    />
                    {errors.recipientName && (
                      <p className="mt-1 text-xs text-crimson">{errors.recipientName}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => {
                        setRecipientEmail(e.target.value);
                        setErrors((p) => { const n = { ...p }; delete n.recipientEmail; return n; });
                      }}
                      placeholder="recipient@email.com"
                      className={`w-full rounded-lg border bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.recipientEmail ? "border-crimson" : "border-gold/20"}`}
                    />
                    {errors.recipientEmail && (
                      <p className="mt-1 text-xs text-crimson">{errors.recipientEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold/60">
                  Amount
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AMOUNTS.map((amt, i) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(amt);
                        setIsCustom(false);
                        setErrors((p) => { const n = { ...p }; delete n.amount; return n; });
                      }}
                      className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                        !isCustom && selectedPreset === amt
                          ? "bg-gold text-espresso"
                          : "border border-gold/25 text-cream/60 hover:border-gold/50 hover:text-cream"
                      }`}
                    >
                      {PRESET_LABELS[i]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustom(true);
                      setSelectedPreset(null);
                    }}
                    className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                      isCustom
                        ? "bg-gold text-espresso"
                        : "border border-gold/25 text-cream/60 hover:border-gold/50 hover:text-cream"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {isCustom && (
                  <div className="mt-3">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-cream/50">
                        $
                      </span>
                      <input
                        type="number"
                        min={10}
                        max={500}
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setErrors((p) => { const n = { ...p }; delete n.amount; return n; });
                        }}
                        placeholder="10–500"
                        className={`w-full rounded-lg border bg-charcoal/60 py-2.5 pl-8 pr-3.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.amount ? "border-crimson" : "border-gold/20"}`}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-xs text-crimson">{errors.amount}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                  Custom Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Happy birthday! Enjoy a wonderful dinner…"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gold/20 bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50"
                />
              </div>

              {/* Delivery */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold/60">
                  Delivery
                </p>
                <div className="space-y-2">
                  {(["immediate", "scheduled"] as const).map((mode) => (
                    <label
                      key={mode}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                        deliveryMode === mode
                          ? "border-gold/50 bg-gold/10"
                          : "border-gold/15 hover:border-gold/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={mode}
                        checked={deliveryMode === mode}
                        onChange={() => setDeliveryMode(mode)}
                        className="accent-gold"
                      />
                      <span className="text-sm text-cream">
                        {mode === "immediate"
                          ? "Send immediately"
                          : "Schedule for date"}
                      </span>
                    </label>
                  ))}
                </div>
                {deliveryMode === "scheduled" && (
                  <input
                    type="date"
                    min={today()}
                    value={deliverAt}
                    onChange={(e) => setDeliverAt(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-gold/20 bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold/50"
                  />
                )}
              </div>

              {/* Payment method */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold/60">
                  Payment Method
                </p>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                        paymentMethod === pm.id
                          ? "border-gold/50 bg-gold/10"
                          : "border-gold/15 hover:border-gold/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.id}
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="accent-gold"
                      />
                      <span className="text-sm text-cream">{pm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-gold/15 bg-espresso px-6 py-4">
              <button
                type="submit"
                form="phone-gc-form"
                className="w-full rounded-full bg-crimson py-3.5 text-sm font-bold tracking-wide text-cream shadow-md transition-all hover:scale-[1.01] hover:bg-crimson-deep active:scale-95"
              >
                Create Gift Card
                {amountCents > 0 && ` — ${formatPrice(amountCents)}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
