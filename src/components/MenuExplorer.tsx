"use client";

import { useEffect, useRef, useState } from "react";
import { MENU } from "@/data/menu";
import { CATEGORY_ORDER, type Category, type MenuItem } from "@/lib/types";
import { MenuItemCard } from "./MenuItemCard";

const CATEGORY_NOTE: Record<Category, string> = {
  Appetizers: "To begin — small plates made for sharing",
  "Soup & Salad": "Served with bread and butter",
  Pasta: "Served with salad, bread and butter",
  Specialties: "Served with salad, shell pasta, bread and butter",
  Desserts: "The sweet finish — made in-house",
};

function slug(c: Category) {
  return c.toLowerCase().replace(/[^a-z]+/g, "-");
}

function SectionHeader({ category }: { category: Category }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="font-display text-4xl font-bold text-espresso sm:text-5xl">
        {category}
      </h2>
      <p className="ornament mx-auto mt-4 text-gold">
        <span className="font-serif text-base italic text-espresso-soft/70">
          {CATEGORY_NOTE[category]}
        </span>
      </p>
    </div>
  );
}

export function MenuExplorer() {
  const [active, setActive] = useState<Category>(CATEGORY_ORDER[0]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.getAttribute("data-cat") as Category);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.2, 0.5] },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="menu" className="bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="overline text-gold-deep">The Menu</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-espresso sm:text-4xl">
            La Migliore Cucina Italiana
          </h2>
        </div>
      </div>

      {/* Sticky category nav */}
      <nav className="sticky top-[4.75rem] z-30 mt-8 border-y border-gold/15 bg-parchment/85 backdrop-blur-md">
        <div className="scroll-elegant mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-6 py-3">
          {CATEGORY_ORDER.map((c) => (
            <a
              key={c}
              href={`#cat-${slug(c)}`}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === c
                  ? "bg-crimson text-cream shadow-sm"
                  : "text-espresso-soft/70 hover:bg-cream-deep hover:text-espresso"
              }`}
            >
              {c}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-24 px-6 pt-16">
        {CATEGORY_ORDER.map((category) => {
          const items = MENU.filter((m) => m.category === category).sort(
            (a, b) => a.sortOrder - b.sortOrder,
          );
          const withPhoto = items.filter((i) => i.image);
          const textOnly = items.filter((i) => !i.image);
          return (
            <section
              key={category}
              id={`cat-${slug(category)}`}
              data-cat={category}
              ref={(el) => {
                sectionRefs.current[category] = el;
              }}
              className="scroll-mt-32"
            >
              <SectionHeader category={category} />

              {withPhoto.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {withPhoto.map((item: MenuItem) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}

              {textOnly.length > 0 && (
                <div
                  className={`grid gap-4 sm:grid-cols-2 ${
                    withPhoto.length > 0 ? "mt-6" : ""
                  }`}
                >
                  {textOnly.map((item: MenuItem) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
