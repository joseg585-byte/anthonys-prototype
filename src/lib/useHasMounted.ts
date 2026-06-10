"use client";

import { useEffect, useState } from "react";

// Guards client-only state (zustand-persisted cart/orders) against SSR
// hydration mismatches: render the neutral server value until mounted.
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
