# Anthony's Restaurant & Lounge — Digital Ordering Prototype

A production-grade concept demo by **SeJo Labs** for *Anthony's Restaurant &
Lounge* (701 Grand Blvd, Kansas City — "Italian Jewel on Grand Avenue," serving
since 1978).

A high-converting customer ordering experience **plus** a live kitchen
Command Center, built on real scraped menu data and Anthony's own food
photography.

---

## Quick start

```bash
cd sejo-prototype-anthonys
npm install
npm run dev
```

Open **http://localhost:3000**.

> Runs fully offline — no API keys, no database required. The menu is seeded
> locally and orders flow live to the kitchen display via the browser.

### The 60-second live demo

1. Open **http://localhost:3000** in one tab — browse the menu, add a few
   dishes, and place a guest-checkout order. You'll get a pickup ticket (e.g.
   `A-205`) and a "we'll text you" confirmation.
2. Open **http://localhost:3000/admin** in a *second* tab (passcode
   **`anthony78`**). The Kitchen Display lights up with live tickets.
3. Place another order in tab 1 → it **pops onto the kitchen display in real
   time with a chime**. Advance it through *Start Cooking → Mark Ready → Picked
   Up* and watch the cards animate between lanes.
4. Switch to **Menu Management** and flip a dish to "86" — it instantly shows
   *Sold Out* on the customer menu in tab 1.

*(Cross-tab realtime uses `BroadcastChannel`; keep both tabs in the same
browser. Supabase Realtime is the drop-in production upgrade — see below.)*

---

## What's inside

**Customer site (`/`)**
- Cinematic hero over Anthony's real dining-room photograph
- "48 years on Grand Avenue" heritage section with vintage KC imagery
- Full **36-item** dinner menu, grouped exactly as scraped, with sticky
  category nav + scrollspy
- Hybrid card system: **12 photo cards** (Anthony's own + 3 licensed) and
  elegant **engraved typographic cards** for the rest
- Frictionless Zustand cart with add-ons, animated slide-in drawer
- Guest checkout (first/last name, email, phone) with gentle inline validation

**Command Center (`/admin`)**
- **Kitchen Display System** — live order lanes, new-order chime, animated
  status flow, ticking timestamps
- **Menu Management** — full menu table with a working "86" toggle that updates
  the customer menu instantly

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Zustand · Framer Motion · lucide-react · `@supabase/supabase-js` (optional).

## Project layout

```
public/images/menu      # dish photos (Anthony's own + 3 Unsplash)
public/images/ambient   # hero interior, exterior sign, vintage heritage shots
src/data/menu.ts        # the full scraped menu (single source of truth)
src/data/restaurant.ts  # brand/tenant record
src/lib/                # cart, orders, menu-availability stores + realtime
src/components/         # customer UI
src/components/admin/   # Command Center UI
supabase-schema.sql     # multi-tenant schema + seed (optional backend)
```

---

## Going live with Supabase (optional)

The prototype is intentionally self-contained. To add a real multi-tenant
backend with persistence + server-side realtime:

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → paste `supabase-schema.sql` → Run.** This creates the
   `restaurants`, `menu_items`, `orders` tables (prices in cents, RLS policies)
   and seeds Anthony's full menu.
3. Copy your Project URL + anon key into `.env.local` (see `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
4. Create the admin user (**Authentication → Users**):
   `admin@kcanthonysongrand.com` — see `ADMIN_CREDENTIALS.md`.
5. Restart `npm run dev`. `src/lib/supabaseClient.ts` auto-detects the env vars;
   wire it into `orders.ts` / `menuStore.ts` to swap `BroadcastChannel` for
   Supabase Realtime.

## Roadmap (post-pitch)

- **Per-dish photography upgrade:** route Anthony's photos through the Adobe
  Firefly / Express image API (upscale, color-correct, unify lighting) and
  replace the typographic cards with enhanced plates. *(Not connected in this
  build — flagged during Phase 2.)*
- **Payments:** Stripe guest checkout.
- **SMS:** Twilio "order ready" texts.

---

© 2026 SeJo Labs LLC — prototype prepared for Anthony's Restaurant & Lounge.
