"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { broadcast, onBroadcast } from "./realtime";

// Tracks which items are "86'd" (out of stock). Admin toggles here flow live
// to the customer menu via BroadcastChannel. Default: everything available.
interface MenuAvailState {
  unavailable: Record<string, boolean>;
  isAvailable: (id: string) => boolean;
  toggle: (id: string) => void;
  set86: (id: string, on: boolean) => void;
  _replaceFromRemote: (map: Record<string, boolean>) => void;
}

let isApplyingRemote = false;

export const useMenuAvail = create<MenuAvailState>()(
  persist(
    (set, get) => ({
      unavailable: {},
      isAvailable: (id) => !get().unavailable[id],
      toggle: (id) => {
        const unavailable = { ...get().unavailable };
        if (unavailable[id]) delete unavailable[id];
        else unavailable[id] = true;
        set({ unavailable });
        broadcast("menu-avail", unavailable);
      },
      set86: (id, on) => {
        const unavailable = { ...get().unavailable };
        if (on) unavailable[id] = true;
        else delete unavailable[id];
        set({ unavailable });
        broadcast("menu-avail", unavailable);
      },
      _replaceFromRemote: (map) => {
        isApplyingRemote = true;
        set({ unavailable: map });
        isApplyingRemote = false;
      },
    }),
    { name: "anthonys-menu-avail" },
  ),
);

if (typeof window !== "undefined") {
  onBroadcast((msg) => {
    if (msg.type === "menu-avail" && !isApplyingRemote) {
      useMenuAvail
        .getState()
        ._replaceFromRemote(msg.payload as Record<string, boolean>);
    }
  });
}
