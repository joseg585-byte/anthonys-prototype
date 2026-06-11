"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  ArrowLeft,
  Check,
  CreditCard,
  Calendar,
  Mail,
  User,
  Sparkles,
  Lock,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useGiftCards } from "@/lib/giftCards";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import type { GiftCard } from "@/lib/types";

const DENOMINATIONS = [2500, 5000, 10000]; // cents

type DeliveryMode = "now" | "scheduled";

interface FormState {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  message: string;
  customAmount: string;
  deliveryMode: DeliveryMode;
  scheduleDate: string;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export default function GiftCardsPage() {
  const profile = useAuth((s) => s.profile);
  const purchase = useGiftCards((s) => s.purchase);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(5000);
  const [customMode, setCustomMode] = useState(false);
  const [form, setForm] = useState<FormState>({
    recipientName: "",
    recipientEmail: "",
    senderName: profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : "",
    senderEmail: profile?.email ?? "",
    message: "",
    customAmount: "",
    deliveryMode: "now",
    scheduleDate: "",
  });
  const [step, setStep] = useState<"config" | "payment" | "success">(
    "config",
  );
  const [submitted, setSubmitted] = useState(false);
  const [purchased, setPurchased] = useState<GiftCard | null>(null);

  const up = (field: keyof FormState) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const effectiveAmount = useMemo(() => {
    if (customMode) {
      const v = parseFloat(form.customAmount.replace(/[^0-9.]/g, ""));
      if (isNaN(v) || v < 10 || v > 500) return 0;
      return Math.round(v * 100);
    }
    return selectedAmount ?? 0;
  }, [customMode, form.customAmount, selectedAmount]);

  const configValid =
    effectiveAmount > 0 &&
    form.recipientName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail) &&
    form.senderName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail);

  const handleConfigNext = () => {
    setSubmitted(true);
    if (!configValid) return;
    setStep("payment");
    setSubmitted(false);
  };

  const handlePaymentComplete = () => {
    const card = purchase({
      amountCents: effectiveAmount,
      recipientName: form.recipientName.trim(),
      recipientEmail: form.recipientEmail.trim(),
      senderName: form.senderName.trim(),
      senderEmail: form.senderEmail.trim(),
      message: form.message.trim() || undefined,
      deliverAt:
        form.deliveryMode === "scheduled" ? form.scheduleDate : undefined,
    });
    setPurchased(card);
    setStep("success");
  };

  const fieldErr = (field: string, condition: boolean) =>
    submitted && !condition ? "Required" : undefined;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-parchment pt-24 pb-16">
        <div className="mx-auto max-w-lg px-5">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-espresso-soft/60 transition-colors hover:text-espresso"
            >
              <ArrowLeft size={14} />
              Back to site
            </Link>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-crimson-deep">
                <Gift size={20} className="text-gold" />
              </span>
              <div>
                <h1 className="font-display text-3xl font-bold text-espresso">
                  Gift Cards
                </h1>
                <p className="text-sm text-espresso-soft/70">
                  Share the Anthony&rsquo;s experience
                </p>
              </div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2">
            {(["config", "payment", "success"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold transition-colors ${
                    step === s
                      ? "bg-crimson text-cream"
                      : step === "success" ||
                          (step === "payment" && s === "config")
                        ? "bg-basil text-cream"
                        : "bg-cream-deep text-espresso-soft/50"
                  }`}
                >
                  {(step === "success" && s !== "success") ||
                  (step === "payment" && s === "config") ? (
                    <Check size={12} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-xs font-medium capitalize ${
                    step === s ? "text-espresso" : "text-espresso-soft/50"
                  }`}
                >
                  {s === "config"
                    ? "Customize"
                    : s === "payment"
                      ? "Payment"
                      : "Done"}
                </span>
                {i < 2 && (
                  <div className="h-px w-8 bg-gold/20" />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── STEP 1: Configure ── */}
            {step === "config" && (
              <motion.div
                key="config"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="rounded-2xl border border-gold/20 bg-cream p-7 shadow-sm"
              >
                <div className="space-y-6">
                  {/* Amount */}
                  <div>
                    <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                      Amount
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DENOMINATIONS.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            setSelectedAmount(amt);
                            setCustomMode(false);
                          }}
                          className={`rounded-full border px-5 py-2 font-display text-sm font-bold transition-all ${
                            !customMode && selectedAmount === amt
                              ? "border-crimson bg-crimson text-cream"
                              : "border-gold/30 text-espresso-soft/70 hover:border-crimson/50"
                          }`}
                        >
                          {formatPrice(amt)}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setCustomMode(true);
                          setSelectedAmount(null);
                        }}
                        className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                          customMode
                            ? "border-crimson bg-crimson text-cream"
                            : "border-gold/30 text-espresso-soft/70 hover:border-crimson/50"
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                    {customMode && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5">
                          <span className="text-sm font-bold text-espresso-soft/60">
                            $
                          </span>
                          <input
                            type="number"
                            value={form.customAmount}
                            onChange={(e) =>
                              up("customAmount")(e.target.value)
                            }
                            placeholder="Enter amount (10–500)"
                            min={10}
                            max={500}
                            className="flex-1 bg-transparent text-sm text-espresso outline-none placeholder:text-espresso-soft/40"
                          />
                        </div>
                        {submitted && effectiveAmount === 0 && (
                          <p className="mt-1 text-xs text-crimson">
                            Enter an amount between $10 and $500
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recipient */}
                  <div>
                    <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                      Recipient
                    </p>
                    <div className="space-y-3">
                      <label className="block">
                        <div className="relative">
                          <User
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-soft/40"
                          />
                          <input
                            type="text"
                            value={form.recipientName}
                            placeholder="Recipient's name"
                            onChange={(e) =>
                              up("recipientName")(e.target.value)
                            }
                            className={`focus-gold w-full rounded-lg border bg-cream/70 py-2.5 pl-9 pr-4 text-sm text-espresso placeholder:text-espresso-soft/40 ${
                              fieldErr(
                                "recipientName",
                                !!form.recipientName.trim(),
                              )
                                ? "border-crimson/50"
                                : "border-gold/25"
                            }`}
                          />
                        </div>
                        {fieldErr(
                          "recipientName",
                          !!form.recipientName.trim(),
                        ) && (
                          <p className="mt-1 text-xs text-crimson">Required</p>
                        )}
                      </label>
                      <label className="block">
                        <div className="relative">
                          <Mail
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-soft/40"
                          />
                          <input
                            type="email"
                            value={form.recipientEmail}
                            placeholder="Recipient's email"
                            onChange={(e) =>
                              up("recipientEmail")(e.target.value)
                            }
                            className={`focus-gold w-full rounded-lg border bg-cream/70 py-2.5 pl-9 pr-4 text-sm text-espresso placeholder:text-espresso-soft/40 ${
                              fieldErr(
                                "recipientEmail",
                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                  form.recipientEmail,
                                ),
                              )
                                ? "border-crimson/50"
                                : "border-gold/25"
                            }`}
                          />
                        </div>
                        {fieldErr(
                          "recipientEmail",
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                            form.recipientEmail,
                          ),
                        ) && (
                          <p className="mt-1 text-xs text-crimson">
                            Valid email required
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block">
                      <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                        Personal Message (optional)
                      </span>
                      <textarea
                        value={form.message}
                        onChange={(e) => up("message")(e.target.value)}
                        placeholder="Enjoy a special night at Anthony's — my treat!"
                        rows={3}
                        className="focus-gold w-full resize-none rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40"
                      />
                    </label>
                  </div>

                  {/* Sender */}
                  <div>
                    <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                      From
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <input
                          type="text"
                          value={form.senderName}
                          placeholder="Your name"
                          onChange={(e) => up("senderName")(e.target.value)}
                          className={`focus-gold w-full rounded-lg border bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40 ${
                            fieldErr("senderName", !!form.senderName.trim())
                              ? "border-crimson/50"
                              : "border-gold/25"
                          }`}
                        />
                        {fieldErr("senderName", !!form.senderName.trim()) && (
                          <p className="mt-1 text-xs text-crimson">Required</p>
                        )}
                      </label>
                      <label className="block">
                        <input
                          type="email"
                          value={form.senderEmail}
                          placeholder="Your email"
                          onChange={(e) => up("senderEmail")(e.target.value)}
                          className={`focus-gold w-full rounded-lg border bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40 ${
                            fieldErr(
                              "senderEmail",
                              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                form.senderEmail,
                              ),
                            )
                              ? "border-crimson/50"
                              : "border-gold/25"
                          }`}
                        />
                        {fieldErr(
                          "senderEmail",
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail),
                        ) && (
                          <p className="mt-1 text-xs text-crimson">
                            Valid email required
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div>
                    <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                      Delivery
                    </p>
                    <div className="flex gap-3">
                      {(
                        [
                          {
                            value: "now",
                            label: "Send immediately",
                            icon: Sparkles,
                          },
                          {
                            value: "scheduled",
                            label: "Schedule date",
                            icon: Calendar,
                          },
                        ] as const
                      ).map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => up("deliveryMode")(value)}
                          className={`flex flex-1 items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-all ${
                            form.deliveryMode === value
                              ? "border-crimson bg-crimson/8 text-espresso"
                              : "border-gold/25 text-espresso-soft/60 hover:border-gold/50"
                          }`}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                    {form.deliveryMode === "scheduled" && (
                      <input
                        type="date"
                        value={form.scheduleDate}
                        min={todayStr()}
                        onChange={(e) => up("scheduleDate")(e.target.value)}
                        className="focus-gold mt-3 w-full rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso"
                      />
                    )}
                  </div>

                  <button
                    onClick={handleConfigNext}
                    className="w-full rounded-full bg-crimson py-3.5 text-sm font-bold tracking-wide text-cream shadow-sm transition-all hover:bg-crimson-deep hover:scale-[1.01] active:scale-95"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Payment (stub UI) ── */}
            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="rounded-2xl border border-gold/20 bg-cream p-7 shadow-sm"
              >
                <div className="space-y-5">
                  <div className="rounded-xl border border-gold/20 bg-cream-deep p-4">
                    <p className="overline text-[0.6rem] text-espresso-soft/50">
                      Order Summary
                    </p>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-espresso-soft/75">
                        Gift Card for {form.recipientName}
                      </span>
                      <span className="font-display font-bold text-espresso">
                        {formatPrice(effectiveAmount)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-espresso-soft/55">
                      <span>To: {form.recipientEmail}</span>
                      <span>
                        {form.deliveryMode === "now"
                          ? "Delivers immediately"
                          : `Delivers ${form.scheduleDate}`}
                      </span>
                    </div>
                  </div>

                  {/* Stub card input */}
                  <div>
                    <p className="mb-3 flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                      <CreditCard size={12} />
                      Payment Details
                    </p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Card number"
                        maxLength={19}
                        className="focus-gold w-full rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM / YY"
                          maxLength={7}
                          className="focus-gold rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          maxLength={4}
                          className="focus-gold rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Name on card"
                        className="focus-gold w-full rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40"
                      />
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-espresso-soft/50">
                      <Lock size={11} />
                      Stripe payments — real integration post-pitch
                    </p>
                  </div>

                  <button
                    onClick={handlePaymentComplete}
                    className="w-full rounded-full bg-gold py-3.5 text-sm font-bold text-espresso shadow-sm transition-all hover:bg-gold-light hover:scale-[1.01] active:scale-95"
                  >
                    Complete Purchase · {formatPrice(effectiveAmount)}
                  </button>

                  <button
                    onClick={() => setStep("config")}
                    className="w-full text-center text-sm text-espresso-soft/60 underline"
                  >
                    ← Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === "success" && purchased && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gold/20 bg-cream p-8 text-center shadow-sm"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="inline-grid h-16 w-16 place-items-center rounded-full bg-basil/15 text-basil"
                >
                  <Gift size={32} />
                </motion.span>
                <h2 className="mt-5 font-display text-2xl font-bold text-espresso">
                  Gift Card Sent!
                </h2>
                <p className="mt-2 text-sm text-espresso-soft/70">
                  {purchased.recipientName} will receive their gift card at{" "}
                  <span className="font-medium text-espresso">
                    {purchased.recipientEmail}
                  </span>
                  .
                  {purchased.deliverAt
                    ? ` Scheduled for ${purchased.deliverAt}.`
                    : " Delivered immediately."}
                </p>

                {/* Gift card preview */}
                <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-crimson-deep to-espresso p-6 text-left shadow-lg">
                  <div className="absolute right-4 top-4 text-gold/20">
                    <Gift size={48} />
                  </div>
                  <p className="font-display text-xs font-semibold uppercase tracking-widest text-gold/70">
                    Anthony&rsquo;s Restaurant &amp; Lounge
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold text-cream">
                    {formatPrice(purchased.amountCents)}
                  </p>
                  <p className="mt-1 text-sm text-cream/60">
                    Gift Card
                  </p>
                  <div className="mt-4 rounded-lg bg-white/10 px-3 py-2">
                    <p className="font-mono text-lg font-bold tracking-[0.2em] text-cream">
                      {purchased.code}
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-cream/50">
                    For {purchased.recipientName} · From {purchased.senderName}
                  </p>
                </div>

                {purchased.message && (
                  <div className="mt-4 rounded-xl border border-gold/20 bg-cream-deep p-4 text-left">
                    <p className="text-xs font-medium text-espresso-soft/50">
                      Your message:
                    </p>
                    <p className="mt-1 text-sm italic text-espresso-soft/80">
                      &ldquo;{purchased.message}&rdquo;
                    </p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Link
                    href="/"
                    className="flex-1 rounded-full border border-gold/30 py-3 text-sm font-medium text-espresso-soft transition-colors hover:border-gold"
                  >
                    Back to Menu
                  </Link>
                  <button
                    onClick={() => {
                      setStep("config");
                      setPurchased(null);
                      setForm({
                        recipientName: "",
                        recipientEmail: "",
                        senderName: profile
                          ? `${profile.firstName} ${profile.lastName}`.trim()
                          : "",
                        senderEmail: profile?.email ?? "",
                        message: "",
                        customAmount: "",
                        deliveryMode: "now",
                        scheduleDate: "",
                      });
                    }}
                    className="flex-1 rounded-full bg-crimson py-3 text-sm font-semibold text-cream"
                  >
                    Send Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
