"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronDown, User, LogOut, Calendar, Gift } from "lucide-react";
import { Brand } from "./Brand";
import { useCart, cartCount } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useHasMounted } from "@/lib/useHasMounted";
import { RESTAURANT } from "@/data/restaurant";

const NAV = [
  { label: "Menu", href: "/#menu" },
  { label: "Reserve", href: "/reserve" },
  { label: "Gift Cards", href: "/gift-cards" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const mounted = useHasMounted();
  const count = mounted ? cartCount(lines) : 0;

  const profile = useAuth((s) => s.profile);
  const openModal = useAuth((s) => s.openModal);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group relative text-sm font-medium tracking-wide text-cream/85 transition-colors hover:text-gold"
            >
              {n.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {/* Auth button */}
          {mounted && profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="hidden items-center gap-1.5 rounded-full border border-gold/40 px-4 py-2 text-sm font-medium text-cream/90 transition-colors hover:border-gold hover:text-gold sm:inline-flex"
              >
                <User size={14} />
                Hello, {profile.firstName}
                <ChevronDown
                  size={13}
                  className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-gold/20 bg-espresso shadow-xl">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-cream/80 transition-colors hover:bg-gold/10 hover:text-gold"
                  >
                    <User size={14} />
                    My Account
                  </Link>
                  <Link
                    href="/reserve"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-cream/80 transition-colors hover:bg-gold/10 hover:text-gold"
                  >
                    <Calendar size={14} />
                    My Reservations
                  </Link>
                  <Link
                    href="/gift-cards"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-cream/80 transition-colors hover:bg-gold/10 hover:text-gold"
                  >
                    <Gift size={14} />
                    Gift Cards
                  </Link>
                  <div className="border-t border-gold/15">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-cream/60 transition-colors hover:bg-crimson/10 hover:text-crimson"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { if (mounted) openModal(); }}
              className="hidden rounded-full border border-gold/40 px-4 py-2 text-sm font-medium text-cream/90 transition-colors hover:border-gold hover:text-gold sm:inline-block"
            >
              Sign In
            </button>
          )}

          <Link
            href={RESTAURANT.phoneHref}
            className="hidden rounded-full border border-gold/40 px-4 py-2 text-sm font-medium text-cream/90 transition-colors hover:border-gold hover:text-gold sm:inline-block"
          >
            {RESTAURANT.phone}
          </Link>

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
