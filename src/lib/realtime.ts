"use client";

// Tiny cross-tab broadcast helper. Lets the customer page push live order
// events straight onto the kitchen display (KDS) and lets the admin's "86"
// toggles reflect on the menu instantly — all with zero backend, so the
// pitch demo works the moment `npm run dev` is running. (Supabase Realtime
// is the drop-in production upgrade; see supabaseClient.ts + README.)

const CHANNEL = "anthonys-sync";

type Listener = (msg: { type: string; payload: unknown }) => void;

let channel: BroadcastChannel | null = null;
const listeners = new Set<Listener>();

function ensureChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => {
      listeners.forEach((l) => l(e.data));
    };
  }
  return channel;
}

export function broadcast(type: string, payload: unknown): void {
  ensureChannel()?.postMessage({ type, payload });
}

export function onBroadcast(listener: Listener): () => void {
  ensureChannel();
  listeners.add(listener);
  return () => listeners.delete(listener);
}
