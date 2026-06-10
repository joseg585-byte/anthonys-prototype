"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ChefHat } from "lucide-react";
import { Brand } from "@/components/Brand";

// Stub passcode gate for the prototype demo. Production swaps this for
// Supabase Auth (admin@kcanthonysongrand.com) — see README. The demo passcode
// is configurable via NEXT_PUBLIC_ADMIN_PASSCODE, default below.
const PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "anthony78";

export function AdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === PASSCODE) {
      sessionStorage.setItem("anthonys-admin", "1");
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-charcoal px-6 text-cream">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-2xl border border-gold/20 bg-espresso/80 p-8 shadow-2xl backdrop-blur"
      >
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-crimson-deep text-gold">
            <ChefHat size={26} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">
            Command Center
          </h1>
          <p className="mt-1 text-sm text-cream/60">
            Kitchen display & menu management
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-3">
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60"
            />
            <input
              type="password"
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              placeholder="Staff passcode"
              className={`focus-gold w-full rounded-lg border bg-charcoal/60 py-3 pl-10 pr-3 text-sm text-cream placeholder:text-cream/35 ${
                error ? "border-crimson" : "border-gold/25"
              }`}
            />
          </div>
          {error && (
            <p className="text-xs text-gold-light">
              That passcode doesn&rsquo;t match. Try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-gold py-3 text-sm font-bold text-espresso transition-colors hover:bg-gold-light"
          >
            Enter
          </button>
        </form>

        <div className="mt-7 flex items-center justify-center border-t border-gold/10 pt-5">
          <Brand variant="light" href="/" />
        </div>
      </motion.div>
    </div>
  );
}
