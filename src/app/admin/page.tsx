"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MonitorPlay, ListChecks, ArrowUpRight, LogOut } from "lucide-react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { KDS } from "@/components/admin/KDS";
import { MenuManager } from "@/components/admin/MenuManager";
import { useChime } from "@/lib/useChime";

type Tab = "kds" | "menu";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("kds");
  const [soundOn, setSoundOn] = useState(true);
  const { chime, unlock } = useChime();

  useEffect(() => {
    setUnlocked(sessionStorage.getItem("anthonys-admin") === "1");
    setChecked(true);
  }, []);

  if (!checked) return <div className="min-h-screen bg-charcoal" />;

  if (!unlocked) {
    return (
      <AdminLogin
        onUnlock={() => {
          unlock(); // unlock WebAudio within the user gesture
          setUnlocked(true);
        }}
      />
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof MonitorPlay }[] = [
    { id: "kds", label: "Kitchen Display", icon: MonitorPlay },
    { id: "menu", label: "Menu Management", icon: ListChecks },
  ];

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <header className="sticky top-0 z-30 border-b border-gold/15 bg-espresso/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-crimson-deep font-display font-bold text-gold">
              A
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-none">
                Command Center
              </p>
              <p className="text-xs text-cream/50">Anthony&rsquo;s on Grand</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-full bg-charcoal/70 p-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                >
                  {isActive && (
                    <motion.span
                      layoutId="admin-tab"
                      className="absolute inset-0 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 360, damping: 32 }}
                    />
                  )}
                  <span
                    className={`relative z-10 inline-flex items-center gap-2 ${
                      isActive ? "text-espresso" : "text-cream/70"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1 rounded-full border border-gold/30 px-3.5 py-2 text-xs font-medium text-cream/80 transition-colors hover:border-gold hover:text-gold sm:inline-flex"
            >
              View site <ArrowUpRight size={13} />
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem("anthonys-admin");
                setUnlocked(false);
              }}
              aria-label="Sign out"
              className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 text-cream/70 transition-colors hover:border-crimson hover:text-crimson"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7">
        {tab === "kds" ? (
          <KDS
            chime={chime}
            soundOn={soundOn}
            onToggleSound={() => setSoundOn((v) => !v)}
          />
        ) : (
          <MenuManager />
        )}
      </main>
    </div>
  );
}
