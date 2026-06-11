"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GiftCard } from "./types";
import { RESTAURANT } from "@/data/restaurant";
import { broadcast, onBroadcast } from "./realtime";

export interface NewGiftCardInput {
  amountCents: number;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  message?: string;
  deliverAt?: string;
}

interface GiftCardsState {
  giftCards: GiftCard[];
  purchase: (input: NewGiftCardInput) => GiftCard;
  _replaceFromRemote: (cards: GiftCard[]) => void;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

let isApplyingRemote = false;

export const useGiftCards = create<GiftCardsState>()(
  persist(
    (set, get) => ({
      giftCards: [],

      purchase: (input) => {
        const card: GiftCard = {
          id: `gc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          code: generateCode(),
          restaurantSlug: RESTAURANT.slug,
          amountCents: input.amountCents,
          balanceCents: input.amountCents,
          recipientName: input.recipientName,
          recipientEmail: input.recipientEmail,
          senderName: input.senderName,
          senderEmail: input.senderEmail,
          message: input.message,
          deliverAt: input.deliverAt,
          status: "active",
          purchasedAt: Date.now(),
        };
        const giftCards = [card, ...get().giftCards];
        set({ giftCards });
        broadcast("giftCards", giftCards);

        const delivery = input.deliverAt
          ? `scheduled for ${input.deliverAt}`
          : "delivered immediately";
        console.log(
          `[GIFT CARD] ${input.senderName} → ${input.recipientEmail} · $${(input.amountCents / 100).toFixed(2)} (${delivery})`,
        );
        console.log(`[GIFT CARD] Code: ${card.code}`);
        console.log(
          `[GIFT CARD] Email to ${input.recipientEmail}: You received a $${(input.amountCents / 100).toFixed(2)} gift card from ${input.senderName}! Use code ${card.code} at checkout.`,
        );
        return card;
      },

      _replaceFromRemote: (giftCards) => {
        isApplyingRemote = true;
        set({ giftCards });
        isApplyingRemote = false;
      },
    }),
    { name: "anthonys-gift-cards-v1" },
  ),
);

if (typeof window !== "undefined") {
  onBroadcast((msg) => {
    if (msg.type === "giftCards" && !isApplyingRemote) {
      useGiftCards
        .getState()
        ._replaceFromRemote(msg.payload as GiftCard[]);
    }
  });
}
