"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Reservation,
  ReservationStatus,
  OccasionType,
  PartySizeOption,
} from "./types";
import { RESTAURANT } from "@/data/restaurant";
import { broadcast, onBroadcast } from "./realtime";

export interface NewReservationInput {
  name: string;
  email: string;
  phone: string;
  partySize: PartySizeOption;
  date: string;
  time: string;
  occasion: OccasionType;
  specialRequests?: string;
  customerId?: string;
}

interface ReservationsState {
  reservations: Reservation[];
  submit: (input: NewReservationInput) => Reservation;
  approve: (id: string) => void;
  decline: (id: string, note?: string) => void;
  suggestAlternate: (id: string, time: string, note?: string) => void;
  _replaceFromRemote: (reservations: Reservation[]) => void;
}

let isApplyingRemote = false;

export const useReservations = create<ReservationsState>()(
  persist(
    (set, get) => ({
      reservations: [],

      submit: (input) => {
        const reservation: Reservation = {
          id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          restaurantSlug: RESTAURANT.slug,
          status: "pending",
          name: input.name,
          email: input.email,
          phone: input.phone,
          partySize: input.partySize,
          date: input.date,
          time: input.time,
          occasion: input.occasion,
          specialRequests: input.specialRequests,
          customerId: input.customerId,
          createdAt: Date.now(),
        };
        const reservations = [reservation, ...get().reservations];
        set({ reservations });
        broadcast("reservations", reservations);
        console.log(
          `[RESERVATION] New request: ${input.name} · ${input.partySize} guests · ${input.date} at ${input.time}`,
        );
        return reservation;
      },

      approve: (id) => {
        const reservations = get().reservations.map((r) =>
          r.id === id
            ? ({ ...r, status: "confirmed" } as Reservation)
            : r,
        );
        set({ reservations });
        broadcast("reservations", reservations);
        const r = reservations.find((x) => x.id === id);
        if (r) {
          console.log(
            `[RESERVATION CONFIRMED] Email to ${r.email}: Your table for ${r.partySize} on ${r.date} at ${r.time} is confirmed!`,
          );
        }
      },

      decline: (id, note) => {
        const reservations = get().reservations.map((r) =>
          r.id === id
            ? ({
                ...r,
                status: "declined" as ReservationStatus,
                adminNote: note,
              } as Reservation)
            : r,
        );
        set({ reservations });
        broadcast("reservations", reservations);
      },

      suggestAlternate: (id, time, note) => {
        const reservations = get().reservations.map((r) =>
          r.id === id
            ? ({
                ...r,
                status: "alternate-suggested" as ReservationStatus,
                suggestedTime: time,
                adminNote: note,
              } as Reservation)
            : r,
        );
        set({ reservations });
        broadcast("reservations", reservations);
      },

      _replaceFromRemote: (reservations) => {
        isApplyingRemote = true;
        set({ reservations });
        isApplyingRemote = false;
      },
    }),
    { name: "anthonys-reservations-v1" },
  ),
);

if (typeof window !== "undefined") {
  onBroadcast((msg) => {
    if (msg.type === "reservations" && !isApplyingRemote) {
      useReservations
        .getState()
        ._replaceFromRemote(msg.payload as Reservation[]);
    }
  });
}
