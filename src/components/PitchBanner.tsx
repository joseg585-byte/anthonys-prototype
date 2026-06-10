"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const SESSION_KEY = "sejo-pitch-banner-dismissed";

export function PitchBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="relative z-50 bg-gold px-4 py-2.5 text-center text-sm font-medium text-espresso">
      <p>
        <strong>This is a free concept prototype built for Anthony&rsquo;s by SeJo Labs LLC.</strong>{" "}
        Get yours:{" "}
        <a
          href="https://sejolabs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-espresso-soft"
        >
          sejolabs.com
        </a>
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-espresso/10"
      >
        <X size={15} />
      </button>
    </div>
  );
}
