"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  Check,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useReservations } from "@/lib/reservations";
import type { Reservation, ReservationStatus } from "@/lib/types";

const STATUS_STYLES: Record<
  ReservationStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-gold/15", text: "text-gold-deep", label: "Pending" },
  confirmed: { bg: "bg-basil/15", text: "text-basil", label: "Confirmed" },
  declined: { bg: "bg-crimson/15", text: "text-crimson", label: "Declined" },
  "alternate-suggested": {
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    label: "Alt. Suggested",
  },
};

const TIME_SLOTS: string[] = [];
for (let h = 16; h <= 21; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 21 && m > 30) break;
    const hour = h > 12 ? h - 12 : h;
    const min = m === 0 ? "00" : String(m);
    TIME_SLOTS.push(`${hour}:${min} PM`);
  }
}

function formatDate(d: string) {
  if (!d) return d;
  const [y, mo, day] = d.split("-");
  return new Date(Number(y), Number(mo) - 1, Number(day)).toLocaleDateString(
    "en-US",
    { weekday: "short", month: "short", day: "numeric" },
  );
}

function ReservationRow({ r }: { r: Reservation }) {
  const approve = useReservations((s) => s.approve);
  const decline = useReservations((s) => s.decline);
  const suggestAlternate = useReservations((s) => s.suggestAlternate);

  const [expanded, setExpanded] = useState(false);
  const [altTime, setAltTime] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"idle" | "decline" | "alternate">("idle");

  const s = STATUS_STYLES[r.status];

  return (
    <motion.li
      layout
      className="rounded-xl border border-gold/15 bg-espresso/60 overflow-hidden"
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display font-bold text-cream">{r.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${s.bg} ${s.text}`}
            >
              {s.label}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream/60">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(r.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {r.time}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {r.partySize} guests
            </span>
          </div>
          <p className="mt-1 text-xs text-cream/50">{r.email} · {r.phone}</p>
          {r.occasion !== "none" && (
            <p className="mt-1 text-xs capitalize text-gold/70">
              Occasion: {r.occasion}
            </p>
          )}
          {r.suggestedTime && (
            <p className="mt-1 text-xs text-blue-300">
              Suggested time: {r.suggestedTime}
            </p>
          )}
          {r.adminNote && (
            <p className="mt-1 text-xs italic text-cream/45">
              Note: {r.adminNote}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {r.status === "pending" && (
            <div className="flex gap-1.5">
              <button
                onClick={() => approve(r.id)}
                title="Confirm"
                className="grid h-8 w-8 place-items-center rounded-full bg-basil/20 text-basil transition-colors hover:bg-basil/40"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setMode(mode === "alternate" ? "idle" : "alternate");
                  setExpanded(true);
                }}
                title="Suggest alternate time"
                className="grid h-8 w-8 place-items-center rounded-full bg-blue-500/20 text-blue-300 transition-colors hover:bg-blue-500/40"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => {
                  setMode(mode === "decline" ? "idle" : "decline");
                  setExpanded(true);
                }}
                title="Decline"
                className="grid h-8 w-8 place-items-center rounded-full bg-crimson/20 text-crimson transition-colors hover:bg-crimson/40"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-cream/40 transition-colors hover:text-cream/70"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gold/10"
          >
            <div className="p-4">
              {r.specialRequests && (
                <div className="mb-4 rounded-lg border border-gold/20 bg-gold/8 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold/60">
                    Special Requests
                  </p>
                  <p className="mt-1 text-xs text-cream/75">
                    {r.specialRequests}
                  </p>
                </div>
              )}

              {mode === "alternate" && r.status === "pending" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-blue-300">
                    Suggest Alternate Time
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={altTime}
                      onChange={(e) => setAltTime(e.target.value)}
                      className="rounded-lg border border-gold/25 bg-charcoal px-3 py-2 text-sm text-cream"
                    >
                      <option value="">Select time</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional note…"
                      className="rounded-lg border border-gold/25 bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-cream/30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!altTime) return;
                        suggestAlternate(r.id, altTime, note || undefined);
                        setMode("idle");
                        setExpanded(false);
                      }}
                      className="rounded-full bg-blue-500 px-4 py-1.5 text-xs font-bold text-white"
                    >
                      Send Suggestion
                    </button>
                    <button
                      onClick={() => setMode("idle")}
                      className="text-xs text-cream/50 underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {mode === "decline" && r.status === "pending" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-crimson">
                    Decline Reservation
                  </p>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Reason (optional)…"
                    className="w-full rounded-lg border border-crimson/30 bg-charcoal px-3 py-2 text-sm text-cream placeholder:text-cream/30"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        decline(r.id, note || undefined);
                        setMode("idle");
                        setExpanded(false);
                      }}
                      className="rounded-full bg-crimson px-4 py-1.5 text-xs font-bold text-cream"
                    >
                      Confirm Decline
                    </button>
                    <button
                      onClick={() => setMode("idle")}
                      className="text-xs text-cream/50 underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {mode === "idle" && !r.specialRequests && (
                <p className="text-xs text-cream/30">No special requests.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export function ReservationsManager() {
  const reservations = useReservations((s) => s.reservations);
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");

  const filtered =
    filter === "all"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  const counts = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    declined: reservations.filter((r) => r.status === "declined").length,
    "alternate-suggested": reservations.filter(
      (r) => r.status === "alternate-suggested",
    ).length,
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-cream">
            Reservations
          </h2>
          <p className="text-sm text-cream/55">
            {counts.pending} pending · {counts.confirmed} confirmed
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "alternate-suggested", label: "Alt. Suggested" },
            { id: "declined", label: "Declined" },
          ] as { id: typeof filter; label: string }[]
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === id
                ? "bg-gold text-espresso"
                : "border border-gold/25 text-cream/60 hover:border-gold/50"
            }`}
          >
            {label}
            {counts[id] > 0 && (
              <span className="ml-1.5 opacity-70">{counts[id]}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gold/15 bg-espresso/40 py-12 text-center">
          <Calendar size={32} className="mx-auto mb-3 text-gold/30" />
          <p className="text-sm text-cream/40">
            No reservations yet. They&rsquo;ll appear here when guests submit
            from the website.
          </p>
        </div>
      ) : (
        <motion.ul layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((r) => (
              <ReservationRow key={r.id} r={r} />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
