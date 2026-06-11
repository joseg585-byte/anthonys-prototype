"use client";

import { useState } from "react";
import { Gift, TrendingUp, Calendar, Search, Phone } from "lucide-react";
import { useGiftCards } from "@/lib/giftCards";
import { PhoneGiftCardForm } from "./PhoneGiftCardForm";
import { formatPrice, clockTime } from "@/lib/format";
import type { GiftCard, GiftCardStatus } from "@/lib/types";

const STATUS_STYLES: Record<GiftCardStatus, { bg: string; text: string }> = {
  active: { bg: "bg-basil/15", text: "text-basil" },
  used: { bg: "bg-espresso/50", text: "text-cream/50" },
  expired: { bg: "bg-crimson/15", text: "text-crimson/70" },
};

function GiftCardRow({ gc }: { gc: GiftCard }) {
  const s = STATUS_STYLES[gc.status];
  const pctUsed =
    gc.amountCents > 0
      ? Math.round(
          ((gc.amountCents - gc.balanceCents) / gc.amountCents) * 100,
        )
      : 0;

  return (
    <li className="rounded-xl border border-gold/15 bg-espresso/60 p-4">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-crimson-deep/40">
          <Gift size={18} className="text-gold" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm font-bold tracking-[0.1em] text-cream">
              {gc.code}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${s.bg} ${s.text}`}
            >
              {gc.status}
            </span>
            {gc.source === "phone" && (
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-gold">
                PHONE
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-cream/60">
            <span>
              To:{" "}
              <span className="text-cream/80">{gc.recipientName}</span>
            </span>
            <span>
              From:{" "}
              <span className="text-cream/80">{gc.senderName}</span>
            </span>
            <span className="truncate">{gc.recipientEmail}</span>
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {new Date(gc.purchasedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {" · "}
              {clockTime(gc.purchasedAt)}
            </span>
          </div>

          {gc.message && (
            <p className="mt-2 text-xs italic text-cream/40">
              &ldquo;{gc.message}&rdquo;
            </p>
          )}

          {/* Balance bar */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-cream/50">Balance</span>
              <span className="font-medium text-cream">
                {formatPrice(gc.balanceCents)}{" "}
                <span className="text-cream/40">
                  of {formatPrice(gc.amountCents)}
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${100 - pctUsed}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function GiftCardManager() {
  const giftCards = useGiftCards((s) => s.giftCards);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GiftCardStatus | "all">("all");
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  const totalRevenue = giftCards.reduce((n, gc) => n + gc.amountCents, 0);
  const totalOutstanding = giftCards
    .filter((gc) => gc.status === "active")
    .reduce((n, gc) => n + gc.balanceCents, 0);

  const filtered = giftCards.filter((gc) => {
    if (filter !== "all" && gc.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        gc.code.toLowerCase().includes(q) ||
        gc.recipientEmail.toLowerCase().includes(q) ||
        gc.recipientName.toLowerCase().includes(q) ||
        gc.senderName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-cream">
            Gift Cards
          </h2>
          <p className="text-sm text-cream/55">
            {giftCards.filter((gc) => gc.status === "active").length} active ·{" "}
            {giftCards.length} total
          </p>
        </div>
        <button
          onClick={() => setShowPhoneForm(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-bold text-espresso shadow-md transition-all hover:scale-[1.02] hover:bg-gold-light active:scale-95"
        >
          <Phone size={14} />
          + New Gift Card
        </button>
      </div>

      {showPhoneForm && (
        <PhoneGiftCardForm onClose={() => setShowPhoneForm(false)} />
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gold/15 bg-espresso/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cream/50">
            <TrendingUp size={12} />
            Total Sold
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-gold">
            {formatPrice(totalRevenue)}
          </p>
          <p className="text-xs text-cream/40">{giftCards.length} cards</p>
        </div>
        <div className="rounded-xl border border-gold/15 bg-espresso/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-cream/50">
            Outstanding
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-cream">
            {formatPrice(totalOutstanding)}
          </p>
          <p className="text-xs text-cream/40">Unredeemed balance</p>
        </div>
        <div className="rounded-xl border border-gold/15 bg-espresso/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-cream/50">
            Redeemed
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-basil">
            {formatPrice(totalRevenue - totalOutstanding)}
          </p>
          <p className="text-xs text-cream/40">Used in orders</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, or email…"
            className="w-full rounded-lg border border-gold/20 bg-espresso/60 py-2 pl-8 pr-4 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:ring-1 focus:ring-gold/40"
          />
        </div>
        <div className="flex gap-2">
          {(
            [
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "used", label: "Used" },
              { id: "expired", label: "Expired" },
            ] as { id: typeof filter; label: string }[]
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === id
                  ? "bg-gold text-espresso"
                  : "border border-gold/25 text-cream/60 hover:border-gold/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gold/15 bg-espresso/40 py-12 text-center">
          <Gift size={32} className="mx-auto mb-3 text-gold/30" />
          <p className="text-sm text-cream/40">
            {search || filter !== "all"
              ? "No cards match your filters."
              : "No gift cards sold yet. They'll appear here when customers purchase from the site."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((gc) => (
            <GiftCardRow key={gc.id} gc={gc} />
          ))}
        </ul>
      )}
    </div>
  );
}
