"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { RESTAURANT } from "@/data/restaurant";

const ease = [0.22, 1, 0.36, 1] as const;

const BADGES = [
  { text: "No customer service fees", vs: "vs Menufy" },
  { text: "Delivery on this site", vs: "vs leaving to DoorDash" },
  { text: "You own your customer data", vs: "vs Menufy owns it" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden">
      {/* Real interior photograph — warm dim dining room. */}
      <Image
        src="/images/ambient/hero-interior.jpg"
        alt="Inside Anthony's dining room"
        fill
        priority
        sizes="100vw"
        className="object-cover photo-treat"
      />
      {/* Cinematic legibility wash. */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/45 to-charcoal/88" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_15%,transparent,rgba(15,10,7,0.55))]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="ornament mx-auto text-gold"
        >
          <span className="overline text-cream/90">
            Kansas City · Since {RESTAURANT.foundedYear}
          </span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
          className="mt-6 font-display text-6xl font-bold leading-[0.95] text-cream sm:text-7xl md:text-8xl"
        >
          Anthony&rsquo;s
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.25 }}
          className="mt-3 font-serif text-2xl italic text-gold-light sm:text-3xl"
        >
          {RESTAURANT.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.38 }}
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-cream/80 sm:text-lg"
        >
          Order pickup or delivery. Reserve a table. Send a gift card. All in
          one place — no service fees, no third-party middlemen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.5 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="#menu"
            className="group inline-flex items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-semibold tracking-wide text-espresso shadow-lg transition-all duration-200 hover:scale-[1.03] hover:bg-gold-light"
          >
            Explore the Menu
          </a>
          <Link
            href="/reserve"
            className="inline-flex items-center justify-center rounded-full border border-cream/35 px-8 py-3.5 text-sm font-medium tracking-wide text-cream transition-all duration-200 hover:border-gold hover:text-gold"
          >
            Reserve a Table
          </Link>
        </motion.div>

        {/* Comparison strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.65 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {BADGES.map((b) => (
            <span
              key={b.text}
              className="inline-flex items-center gap-1.5 rounded-full border border-basil/40 bg-basil/10 px-3.5 py-1.5 text-xs font-medium text-cream/85 backdrop-blur-sm"
            >
              <span className="text-basil">✓</span>
              {b.text}
              <span className="text-cream/45">({b.vs})</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-cream/40 p-1">
          <motion.span
            animate={{ y: [0, 9, 0] }}
            transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-gold"
          />
        </div>
      </motion.div>
    </section>
  );
}
