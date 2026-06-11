"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerProfile } from "./types";

interface AuthState {
  profile: CustomerProfile | null;
  modalOpen: boolean;

  openModal: () => void;
  closeModal: () => void;

  // returns true if no existing profile for that email (new user)
  checkIsNewUser: (email: string) => boolean;

  // create profile + log magic link to console
  sendMagicLink: (
    email: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ) => void;

  // demo shortcut: auto-verify the pending email
  verifyDemo: (email: string) => void;

  logout: () => void;
  updateProfile: (updates: Partial<CustomerProfile>) => void;
  addAddress: (address: string) => void;
  removeAddress: (address: string) => void;
  toggleFavorite: (itemId: string) => void;
}

function genId(): string {
  return `cust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildMagicLink(email: string): string {
  const token = `demo-${Date.now()}`;
  const base =
    typeof window !== "undefined" ? window.location.origin : "https://anthonys.demo";
  return `${base}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      profile: null,
      modalOpen: false,

      openModal: () => set({ modalOpen: true }),
      closeModal: () => set({ modalOpen: false }),

      checkIsNewUser: (email) => {
        const p = get().profile;
        return !p || p.email.toLowerCase() !== email.trim().toLowerCase();
      },

      sendMagicLink: (email, firstName, lastName, phone) => {
        const link = buildMagicLink(email);
        console.log(`[MAGIC LINK] Sign-in link for ${email}:`);
        console.log(`  ${link}`);
        console.log(
          `  (Set RESEND_API_KEY in Vercel to send real emails via Resend)`,
        );

        // If we have name info, create / update the profile now
        const existing = get().profile;
        const isSameUser =
          existing &&
          existing.email.toLowerCase() === email.trim().toLowerCase();

        if (!isSameUser && firstName) {
          const newProfile: CustomerProfile = {
            id: genId(),
            firstName: firstName.trim(),
            lastName: (lastName ?? "").trim(),
            email: email.trim().toLowerCase(),
            phone: (phone ?? "").trim(),
            savedAddresses: [],
            favoriteItemIds: [],
            createdAt: Date.now(),
          };
          set({ profile: newProfile });
        }
      },

      verifyDemo: (email) => {
        const existing = get().profile;
        const isSameUser =
          existing &&
          existing.email.toLowerCase() === email.trim().toLowerCase();

        if (!isSameUser) {
          // Minimal guest profile if no signup data was collected
          const profile: CustomerProfile = {
            id: genId(),
            firstName: "Guest",
            lastName: "",
            email: email.trim().toLowerCase(),
            phone: "",
            savedAddresses: [],
            favoriteItemIds: [],
            createdAt: Date.now(),
          };
          set({ profile, modalOpen: false });
        } else {
          set({ modalOpen: false });
        }
      },

      logout: () => set({ profile: null }),

      updateProfile: (updates) => {
        const p = get().profile;
        if (!p) return;
        set({ profile: { ...p, ...updates } });
      },

      addAddress: (address) => {
        const p = get().profile;
        if (!p || p.savedAddresses.includes(address)) return;
        set({ profile: { ...p, savedAddresses: [...p.savedAddresses, address] } });
      },

      removeAddress: (address) => {
        const p = get().profile;
        if (!p) return;
        set({
          profile: {
            ...p,
            savedAddresses: p.savedAddresses.filter((a) => a !== address),
          },
        });
      },

      toggleFavorite: (itemId) => {
        const p = get().profile;
        if (!p) return;
        const isFav = p.favoriteItemIds.includes(itemId);
        set({
          profile: {
            ...p,
            favoriteItemIds: isFav
              ? p.favoriteItemIds.filter((id) => id !== itemId)
              : [...p.favoriteItemIds, itemId],
          },
        });
      },
    }),
    {
      name: "anthonys-auth-v1",
      // only persist the profile, not UI state
      partialize: (s) => ({ profile: s.profile }),
    },
  ),
);
