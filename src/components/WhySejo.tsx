"use client";

import { motion } from "framer-motion";
import { CircleDollarSign, Plug, Truck, MapPin } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const cards = [
  {
    icon: CircleDollarSign,
    headline: "No commissions, ever.",
    body: "DoorDash and Uber Eats take 20–30% per order. Your own ordering site means you keep 100% of every ticket. Restaurant rate stays restaurant rate.",
  },
  {
    icon: Plug,
    headline: "Connects to your existing Toast.",
    body: "No new POS. No extra tablet. Orders flow straight into the same system your kitchen already uses — compatible with Toast, Square, Clover, and most major systems.",
  },
  {
    icon: Truck,
    headline: "Use the drivers you already trust.",
    body: "The same DoorDash and Uber drivers handle delivery at a flat $8–10 per trip — not a percentage of the order. Direct integration with DoorDash Drive + Uber Direct.",
  },
  {
    icon: MapPin,
    headline: "Built different in KC.",
    body: "A SeJo Labs prototype. Pleasant Valley, MO. We build custom ordering experiences for independent restaurants — not cookie-cutter SaaS.",
  },
];

export function WhySejo() {
  return (
    <section className="relative overflow-hidden bg-crimson-deep py-20 sm:py-28">
      {/* Subtle radial warmth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(201,162,75,0.12),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="text-center"
        >
          <p className="ornament mx-auto text-gold">
            <span className="overline text-cream/80">Why order direct</span>
          </p>
          <h2 className="mt-5 font-display text-4xl font-bold text-cream sm:text-5xl">
            Your food. Your margins. Your system.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-cream/70">
            Third-party apps made ordering easy — then took a cut of everything.
            A direct ordering site gives it all back.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.headline}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.65, ease, delay: i * 0.08 }}
                className="flex flex-col gap-4 rounded-sm border border-gold/20 bg-crimson-ink/70 p-6 backdrop-blur-sm"
              >
                <div className="grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-gold/10">
                  <Icon size={22} className="text-gold" />
                </div>
                <h3 className="font-display text-xl font-semibold leading-snug text-cream">
                  {card.headline}
                </h3>
                <p className="text-sm leading-relaxed text-cream/70">
                  {card.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
