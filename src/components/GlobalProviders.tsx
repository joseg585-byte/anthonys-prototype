"use client";

import { AuthModal } from "./AuthModal";

// Renders global overlays that need to live at the root of every page.
// Imported in layout.tsx (server component) via a client boundary.
export function GlobalProviders() {
  return <AuthModal />;
}
