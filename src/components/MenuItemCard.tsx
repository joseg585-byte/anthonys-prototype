"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Leaf, Sprout } from "lucide-react";
import type { MenuItem, MenuAddon } from "@/lib/types";
import { formatPrice, formatAddon } from "@/lib/format";
import { useCart } from "@/lib/store";
import { useMenuAvail } from "@/lib/menuStore";
import { SmartImage } from "./SmartImage";

function DietTags({ item }: { item: MenuItem }) {
  if (!item.tags?.length) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      {item.tags.includes("vegan") ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-basil/12 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-basil">
          <Sprout size={11} /> Vegan
        </span>
      ) : item.tags.includes("vegetarian") ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-basil/12 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-basil">
          <Leaf size={11} /> Veg
        </span>
      ) : null}
    </span>
  );
}

function AddControl({ item }: { item: MenuItem }) {
  const add = useCart((s) => s.add);
  const available = useMenuAvail((s) => s.isAvailable(item.id));
  const [addon, setAddon] = useState<MenuAddon | undefined>(undefined);
  const [justAdded, setJustAdded] = useState(false);

  if (!available) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-crimson/30 bg-crimson/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-crimson">
        86 · Sold Out
      </span>
    );
  }

  const handleAdd = () => {
    add(item, addon);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1100);
  };

  return (
    <div className="flex items-center gap-2">
      {item.addons?.length ? (
        <select
          aria-label={`Add-on for ${item.name}`}
          value={addon?.label ?? ""}
          onChange={(e) =>
            setAddon(
              item.addons?.find((a) => a.label === e.target.value) ?? undefined,
            )
          }
          className="focus-gold max-w-[8.5rem] truncate rounded-full border border-gold/30 bg-cream px-3 py-1.5 text-xs text-espresso/80 transition-colors"
        >
          <option value="">No add-on</option>
          {item.addons.map((a) => (
            <option key={a.label} value={a.label}>
              {a.label} {formatAddon(a.priceCents)}
            </option>
          ))}
        </select>
      ) : null}
      <button
        onClick={handleAdd}
        aria-label={`Add ${item.name} to order`}
        className={`group/btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-90 ${
          justAdded
            ? "bg-basil text-cream"
            : "bg-crimson text-cream hover:bg-crimson-deep"
        }`}
      >
        {justAdded ? (
          <>
            <Check size={14} /> Added
          </>
        ) : (
          <>
            <Plus size={14} className="transition-transform group-hover/btn:rotate-90" />
            Add
          </>
        )}
      </button>
    </div>
  );
}

export function MenuItemCard({ item }: { item: MenuItem }) {
  const available = useMenuAvail((s) => s.isAvailable(item.id));

  // ----- Photo card -----
  if (item.image) {
    return (
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className={`group relative flex flex-col overflow-hidden rounded-xl border border-gold/20 bg-cream shadow-soft transition-shadow duration-300 hover:shadow-lift ${
          !available ? "opacity-70" : ""
        }`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <SmartImage
            src={item.image}
            alt={item.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            imgClassName="transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/35 via-transparent to-transparent" />
          {item.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-espresso shadow">
              Signature
            </span>
          )}
          <span className="absolute bottom-3 right-3 rounded-full bg-espresso/85 px-3 py-1 font-display text-sm font-semibold text-gold backdrop-blur-sm">
            {formatPrice(item.priceCents)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl font-semibold leading-snug text-espresso">
              {item.name}
            </h3>
            <DietTags item={item} />
          </div>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-espresso-soft/80">
            {item.description}
          </p>
          <div className="mt-4 flex items-center justify-end">
            <AddControl item={item} />
          </div>
        </div>
      </motion.article>
    );
  }

  // ----- Engraved typographic card -----
  return (
    <article
      className={`group relative flex flex-col rounded-lg border border-gold/25 bg-cream/60 p-5 transition-all duration-300 hover:border-gold/60 hover:bg-cream hover:shadow-soft ${
        !available ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-baseline gap-3">
        <h3 className="font-serif text-2xl font-semibold italic leading-tight text-espresso">
          {item.name}
        </h3>
        <span
          aria-hidden
          className="mb-1 h-px flex-1 self-end bg-gradient-to-r from-gold/40 to-transparent transition-colors group-hover:from-gold/70"
        />
        <span className="font-display text-lg font-semibold text-crimson">
          {formatPrice(item.priceCents)}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-espresso-soft/75">
        {item.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <DietTags item={item} />
        <div className="ml-auto">
          <AddControl item={item} />
        </div>
      </div>
    </article>
  );
}
