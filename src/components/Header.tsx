"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Brand } from "./Brand";
import { useCart, cartCount } from "@/lib/store";
import { useHasMounted } from "@/lib/useHasMounted";
import { RESTAURANT } from "@/data/restaurant";

const NAV = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#heritage" },
  { label: "Visit", href: "#visit" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const mounted = useHasMounted();
  const count = mounted ? cartCount(lines) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-gold/15 bg-espresso/92 backdrop-blur-md shadow-lg shadow-black/20"
          : "border-b border-transparent bg-gradient-to-b from-black/45 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <Brand variant="light" />

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="group relative text-sm font-medium tracking-wide text-cream/85 transition-colors hover:text-gold"
            >
              {n.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={RESTAURANT.phoneHref}
            className="hidden rounded-full border border-gold/40 px-4 py-2 text-sm font-medium text-cream/90 transition-colors hover:border-gold hover:text-gold sm:inline-block"
          >
            Reserve
          </a>
          <button
            onClick={openCart}
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-espresso shadow-md transition-transform duration-200 hover:scale-[1.03] hover:bg-gold-light active:scale-95"
          >
            <ShoppingBag size={17} strokeWidth={2.2} />
            <span className="hidden sm:inline">Order</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-crimson px-1 text-[0.7rem] font-bold text-cream">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
