"use client";

import { motion } from "framer-motion";
import { SmartImage } from "./SmartImage";
import { RESTAURANT } from "@/data/restaurant";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeritageSection() {
  return (
    <section
      id="heritage"
      className="relative overflow-hidden bg-espresso py-24 text-cream sm:py-32"
    >
      {/* faint parchment texture via radial highlights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_85%_0%,rgba(201,162,75,0.10),transparent)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        {/* Vintage Grand Avenue imagery */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-gold/25 shadow-2xl">
            <SmartImage
              src="/images/ambient/heritage-grand-arch.jpg"
              alt="Historic Grand Avenue, Kansas City"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 to-transparent" />
          </div>
          {/* Inset present-day sign, overlapping */}
          <div className="absolute -bottom-8 -right-4 hidden h-40 w-56 overflow-hidden rounded-sm border-4 border-espresso shadow-xl sm:block">
            <SmartImage
              src="/images/ambient/exterior-sign.jpg"
              alt="Anthony's signage on Grand Boulevard"
              sizes="240px"
            />
          </div>
          <span className="absolute -left-3 -top-3 grid h-20 w-20 place-items-center rounded-full border border-gold/50 bg-crimson-deep text-center shadow-xl">
            <span className="font-display text-2xl font-bold leading-none text-gold">
              {RESTAURANT.yearsOfLegacy}
              <span className="block text-[0.55rem] font-medium tracking-widest text-cream/70">
                YEARS
              </span>
            </span>
          </span>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          <p className="ornament text-gold">
            <span className="overline">Benvenuti</span>
          </p>
          <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Honoring {RESTAURANT.yearsOfLegacy} years on Grand Avenue
          </h2>
          <div className="mt-6 space-y-4 text-cream/80">
            <p className="text-lg leading-relaxed">
              Since {RESTAURANT.foundedYear}, Anthony&rsquo;s has been a fixture
              in the heart of downtown Kansas City — an intimate room of warm
              light, Italian murals, and recipes passed down through the family.
            </p>
            <p className="leading-relaxed">
              Combine that atmosphere with amazing home-cooked, authentic
              Italian food, and you have the recipe for an unforgettable
              experience. Whether you&rsquo;re gathering old friends or making
              new ones, our cozy hospitality is meant to make you feel right at
              home.
            </p>
            <p className="font-serif text-xl italic text-gold-light">
              &ldquo;{RESTAURANT.italianTagline}&rdquo; —{" "}
              {RESTAURANT.italianTaglineEn}.
            </p>
          </div>

          <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-gold/20 pt-7">
            {[
              { n: `${RESTAURANT.foundedYear}`, l: "Established" },
              { n: "100%", l: "Home-cooked" },
              { n: "Grand Blvd", l: "Downtown KC" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl font-bold text-gold">
                  {s.n}
                </dt>
                <dd className="overline mt-1 text-[0.6rem] text-cream/60">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
