"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useReservations } from "@/lib/reservations";
import { useAuth } from "@/lib/auth";
import type { OccasionType, PartySizeOption, Reservation } from "@/lib/types";

// ── Time slots ───────────────────────────────────────────────────────────────

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  // 4:00 PM → 9:30 PM in 15-min increments
  for (let h = 16; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 21 && m > 30) break;
      const hour = h > 12 ? h - 12 : h;
      const suffix = h >= 12 ? "PM" : "AM";
      const min = m === 0 ? "00" : String(m);
      slots.push(`${hour}:${min} ${suffix}`);
    }
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

const PARTY_SIZES: PartySizeOption[] = [
  "1-2",
  "3-4",
  "5-6",
  "7-8",
  "9+",
];

const OCCASIONS: { value: OccasionType; label: string }[] = [
  { value: "none", label: "No special occasion" },
  { value: "anniversary", label: "Anniversary" },
  { value: "birthday", label: "Birthday" },
  { value: "business", label: "Business Dining" },
  { value: "other", label: "Other" },
];

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Form ──────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  phone: string;
  partySize: PartySizeOption;
  date: string;
  time: string;
  occasion: OccasionType;
  specialRequests: string;
}

type FieldKey = "name" | "email" | "phone" | "date" | "time";
type FormErrors = Partial<Record<FieldKey, string>>;

function validate(f: FormState): FormErrors {
  const e: FormErrors = {};
  if (!f.name.trim()) e.name = "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Enter a valid email";
  if (f.phone.replace(/\D/g, "").length < 10)
    e.phone = "Enter a 10-digit phone";
  if (!f.date) e.date = "Select a date";
  if (!f.time) e.time = "Select a time";
  return e;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReservePage() {
  const profile = useAuth((s) => s.profile);
  const submit = useReservations((s) => s.submit);

  const [form, setForm] = useState<FormState>({
    name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    partySize: "1-2",
    date: "",
    time: "",
    occasion: "none",
    specialRequests: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [placed, setPlaced] = useState<Reservation | null>(null);

  const errors = useMemo(() => validate(form), [form]);

  const up = (field: keyof FormState) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const blur = (field: string) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const showErr = (field: FieldKey) =>
    (touched[field] || submitted) ? errors[field] : undefined;

  const handleSubmit = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    const r = submit({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      partySize: form.partySize,
      date: form.date,
      time: form.time,
      occasion: form.occasion,
      specialRequests: form.specialRequests.trim() || undefined,
      customerId: profile?.id,
    });
    setPlaced(r);
  };

  const formatDate = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString(
      "en-US",
      { weekday: "long", month: "long", day: "numeric" },
    );
  };

  return (
    <>
      <Header />

      {/* ── Page bg ── */}
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
              <span className="grid h-10 w-10 place-items-center rounded-full bg-crimson-deep font-display text-base font-bold text-gold">
                A
              </span>
              <div>
                <h1 className="font-display text-3xl font-bold text-espresso">
                  Reserve a Table
                </h1>
                <p className="text-sm text-espresso-soft/70">
                  Anthony&rsquo;s Restaurant &amp; Lounge · Kansas City
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {placed ? (
              // ── Success ──
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gold/25 bg-cream p-8 text-center shadow-sm"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="inline-grid h-16 w-16 place-items-center rounded-full bg-basil/15 text-basil"
                >
                  <CheckCircle size={32} />
                </motion.span>
                <h2 className="mt-5 font-display text-2xl font-bold text-espresso">
                  Request Received!
                </h2>
                <p className="mt-2 text-sm text-espresso-soft/75">
                  We&rsquo;ll review your request and send a confirmation to{" "}
                  <span className="font-medium text-espresso">{placed.email}</span>.
                  Typically within a few hours.
                </p>

                <div className="mt-6 rounded-xl border border-gold/20 bg-cream-deep p-5 text-left">
                  <p className="overline mb-3 text-[0.6rem] text-espresso-soft/50">
                    Reservation Details
                  </p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-espresso-soft/60">Guest</dt>
                      <dd className="font-medium text-espresso">{placed.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-espresso-soft/60">Party</dt>
                      <dd className="font-medium text-espresso">
                        {placed.partySize} guests
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-espresso-soft/60">Date</dt>
                      <dd className="font-medium text-espresso">
                        {formatDate(placed.date)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-espresso-soft/60">Time</dt>
                      <dd className="font-medium text-espresso">{placed.time}</dd>
                    </div>
                    {placed.occasion !== "none" && (
                      <div className="flex justify-between">
                        <dt className="text-espresso-soft/60">Occasion</dt>
                        <dd className="font-medium capitalize text-espresso">
                          {placed.occasion}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    href="/"
                    className="flex-1 rounded-full border border-gold/30 py-3 text-sm font-medium text-espresso-soft transition-colors hover:border-gold hover:text-espresso"
                  >
                    Back to Menu
                  </Link>
                  <button
                    onClick={() => {
                      setPlaced(null);
                      setSubmitted(false);
                      setTouched({});
                    }}
                    className="flex-1 rounded-full bg-crimson py-3 text-sm font-semibold text-cream transition-colors hover:bg-crimson-deep"
                  >
                    Make Another
                  </button>
                </div>
              </motion.div>
            ) : (
              // ── Form ──
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gold/20 bg-cream p-7 shadow-sm"
              >
                <div className="space-y-5">
                  {/* Party size */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                      <Users size={12} />
                      Party Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PARTY_SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => up("partySize")(size)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                            form.partySize === size
                              ? "border-crimson bg-crimson text-cream"
                              : "border-gold/30 text-espresso-soft/70 hover:border-crimson/50 hover:text-espresso"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                        <Calendar size={12} />
                        Date
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        min={todayStr()}
                        onChange={(e) => up("date")(e.target.value)}
                        onBlur={() => blur("date")}
                        className={`focus-gold w-full rounded-lg border bg-cream/70 px-3.5 py-2.5 text-sm text-espresso ${
                          showErr("date") ? "border-crimson/50" : "border-gold/25"
                        }`}
                      />
                      {showErr("date") && (
                        <p className="mt-1 text-xs text-crimson">
                          {showErr("date")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                        <Clock size={12} />
                        Time
                      </label>
                      <select
                        value={form.time}
                        onChange={(e) => up("time")(e.target.value)}
                        onBlur={() => blur("time")}
                        className={`focus-gold w-full rounded-lg border bg-cream/70 px-3.5 py-2.5 text-sm text-espresso ${
                          showErr("time") ? "border-crimson/50" : "border-gold/25"
                        }`}
                      >
                        <option value="">Select time</option>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {showErr("time") && (
                        <p className="mt-1 text-xs text-crimson">
                          {showErr("time")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                      Contact Info
                    </p>
                    <div className="space-y-3">
                      <label className="block">
                        <div className="relative">
                          <input
                            type="text"
                            value={form.name}
                            placeholder="Full name"
                            onChange={(e) => up("name")(e.target.value)}
                            onBlur={() => blur("name")}
                            className={`focus-gold w-full rounded-lg border bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40 ${
                              showErr("name") ? "border-crimson/50" : "border-gold/25"
                            }`}
                          />
                        </div>
                        {showErr("name") && (
                          <p className="mt-1 text-xs text-crimson">
                            {showErr("name")}
                          </p>
                        )}
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <div className="relative">
                            <Mail
                              size={13}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-soft/40"
                            />
                            <input
                              type="email"
                              value={form.email}
                              placeholder="Email"
                              onChange={(e) => up("email")(e.target.value)}
                              onBlur={() => blur("email")}
                              className={`focus-gold w-full rounded-lg border bg-cream/70 py-2.5 pl-9 pr-3 text-sm text-espresso placeholder:text-espresso-soft/40 ${
                                showErr("email") ? "border-crimson/50" : "border-gold/25"
                              }`}
                            />
                          </div>
                          {showErr("email") && (
                            <p className="mt-1 text-xs text-crimson">
                              {showErr("email")}
                            </p>
                          )}
                        </label>

                        <label className="block">
                          <div className="relative">
                            <Phone
                              size={13}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-soft/40"
                            />
                            <input
                              type="tel"
                              value={form.phone}
                              placeholder="Phone"
                              onChange={(e) => up("phone")(e.target.value)}
                              onBlur={() => blur("phone")}
                              className={`focus-gold w-full rounded-lg border bg-cream/70 py-2.5 pl-9 pr-3 text-sm text-espresso placeholder:text-espresso-soft/40 ${
                                showErr("phone") ? "border-crimson/50" : "border-gold/25"
                              }`}
                            />
                          </div>
                          {showErr("phone") && (
                            <p className="mt-1 text-xs text-crimson">
                              {showErr("phone")}
                            </p>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="block">
                      <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                        Special Occasion
                      </span>
                      <select
                        value={form.occasion}
                        onChange={(e) =>
                          up("occasion")(e.target.value as OccasionType)
                        }
                        className="focus-gold w-full rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso"
                      >
                        {OCCASIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* Special requests */}
                  <div>
                    <label className="block">
                      <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-widest text-espresso-soft/60">
                        Special Requests
                      </span>
                      <textarea
                        value={form.specialRequests}
                        onChange={(e) => up("specialRequests")(e.target.value)}
                        placeholder="Dietary restrictions, seating preferences, anything we should know…"
                        rows={3}
                        className="focus-gold w-full resize-none rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40"
                      />
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full rounded-full bg-crimson py-3.5 text-sm font-bold tracking-wide text-cream shadow-sm transition-all hover:bg-crimson-deep hover:scale-[1.01] active:scale-95"
                  >
                    Request Reservation
                  </button>

                  <p className="text-center text-xs text-espresso-soft/50">
                    Reservations are confirmed by the restaurant within a few
                    hours. For immediate assistance call{" "}
                    <a
                      href="tel:+18162214088"
                      className="text-gold-deep underline"
                    >
                      (816) 221-4088
                    </a>
                    .
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
