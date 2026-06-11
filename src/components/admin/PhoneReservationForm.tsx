"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Check } from "lucide-react";
import { useReservations } from "@/lib/reservations";
import type { OccasionType, PartySizeOption } from "@/lib/types";

interface Props {
  onClose: () => void;
}

const TIME_SLOTS: string[] = [];
for (let h = 16; h <= 21; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 21 && m > 30) break;
    const hour = h > 12 ? h - 12 : h;
    const min = m === 0 ? "00" : String(m);
    TIME_SLOTS.push(`${hour}:${min} PM`);
  }
}

const PARTY_SIZES: PartySizeOption[] = ["1-2", "3-4", "5-6", "7-8", "9+"];

const OCCASIONS: { value: OccasionType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "anniversary", label: "Anniversary" },
  { value: "birthday", label: "Birthday" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
];

const today = () => new Date().toISOString().split("T")[0];

function validate(fields: {
  name: string;
  phone: string;
  partySize: string;
  date: string;
  time: string;
}) {
  const errs: Record<string, string> = {};
  if (!fields.name.trim()) errs.name = "Name is required";
  if (!/^\d{10}$/.test(fields.phone.replace(/\D/g, "")))
    errs.phone = "Enter a valid 10-digit US phone number";
  if (!fields.partySize) errs.partySize = "Select a party size";
  if (!fields.date) errs.date = "Select a date";
  if (!fields.time) errs.time = "Select a time";
  return errs;
}

export function PhoneReservationForm({ onClose }: Props) {
  const submit = useReservations((s) => s.submit);
  const approve = useReservations((s) => s.approve);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState<PartySizeOption | "">("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [occasion, setOccasion] = useState<OccasionType>("none");
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [savedName, setSavedName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate({ name, phone, partySize, date, time });
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const res = submit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.replace(/\D/g, ""),
      partySize: partySize as PartySizeOption,
      date,
      time,
      occasion,
      specialRequests: specialRequests.trim() || undefined,
      source: "phone",
    });
    approve(res.id);
    setSavedName(name.trim());
    setSaved(true);
  };

  const content = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <AnimatePresence>
        {saved ? (
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
              Reservation Saved
            </h3>
            <p className="mt-2 text-sm text-cream/60">
              {savedName}&rsquo;s table is confirmed.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-gold py-3 text-sm font-bold text-espresso"
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
                <Phone size={16} className="text-gold" />
                <h2 className="font-display text-lg font-bold text-cream">
                  New Phone Reservation
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
              id="phone-res-form"
              onSubmit={handleSubmit}
              className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
            >
              {/* Customer info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                    Customer Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((p) => { const n = { ...p }; delete n.name; return n; });
                    }}
                    placeholder="Full name"
                    className={`w-full rounded-lg border bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.name ? "border-crimson" : "border-gold/20"}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-crimson">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                    Phone *
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((p) => { const n = { ...p }; delete n.phone; return n; });
                    }}
                    placeholder="(555) 555-5555"
                    className={`w-full rounded-lg border bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.phone ? "border-crimson" : "border-gold/20"}`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-crimson">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full rounded-lg border border-gold/20 bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50"
                />
              </div>

              {/* Party size */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                  Party Size *
                </label>
                <div className="flex flex-wrap gap-2">
                  {PARTY_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setPartySize(sz);
                        setErrors((p) => { const n = { ...p }; delete n.partySize; return n; });
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        partySize === sz
                          ? "bg-gold text-espresso"
                          : "border border-gold/25 text-cream/60 hover:border-gold/50 hover:text-cream"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                {errors.partySize && (
                  <p className="mt-1 text-xs text-crimson">{errors.partySize}</p>
                )}
              </div>

              {/* Date + Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                    Date *
                  </label>
                  <input
                    type="date"
                    min={today()}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setErrors((p) => { const n = { ...p }; delete n.date; return n; });
                    }}
                    className={`w-full rounded-lg border bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.date ? "border-crimson" : "border-gold/20"}`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-crimson">{errors.date}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                    Time *
                  </label>
                  <select
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      setErrors((p) => { const n = { ...p }; delete n.time; return n; });
                    }}
                    className={`w-full rounded-lg border bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold/50 ${errors.time ? "border-crimson" : "border-gold/20"}`}
                  >
                    <option value="">Select time</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.time && (
                    <p className="mt-1 text-xs text-crimson">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                  Special Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value as OccasionType)}
                  className="w-full rounded-lg border border-gold/20 bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold/50"
                >
                  {OCCASIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special requests */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/50">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="High chair needed, window table preferred, allergy info…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gold/20 bg-charcoal/60 px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/50"
                />
              </div>
            </form>

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-gold/15 bg-espresso px-6 py-4">
              <button
                type="submit"
                form="phone-res-form"
                className="w-full rounded-full bg-crimson py-3.5 text-sm font-bold tracking-wide text-cream shadow-md transition-all hover:scale-[1.01] hover:bg-crimson-deep active:scale-95"
              >
                Save Reservation
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
