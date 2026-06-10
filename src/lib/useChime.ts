"use client";

import { useCallback, useEffect, useRef } from "react";

// A warm two-note "ding-dong" kitchen chime synthesised with WebAudio —
// no audio asset to ship. Must be unlocked by a user gesture first (browsers
// block autoplay); the admin login click handles that.
export function useChime() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensure = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current?.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const unlock = useCallback(() => {
    ensure();
  }, [ensure]);

  const chime = useCallback(() => {
    const ctx = ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { f: 880, t: 0 },
      { f: 1174.7, t: 0.16 },
    ];
    notes.forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.18, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.55);
    });
  }, [ensure]);

  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
    };
  }, []);

  return { chime, unlock };
}
