# Phases.md
## Build order for the coding agent

Companion to `Hotel_PMS_PRD.md`, `Architecture.md`, and `Rules.md`. This document is scoped **inside** PRD Phase 1 (Core PMS) only — it breaks that single phase into buildable steps so the agent works on one thing at a time instead of attempting the whole app in one pass.

**Rule for the agent: do not start a phase until the previous phase's "Done when" criteria are met.** If asked to jump ahead, flag that the prior phase isn't verified complete rather than proceeding.

---

### Phase 0 — Project Scaffolding & Supabase Setup
**Goal:** Empty but correctly wired project — nothing user-facing yet.

- Initialize Next.js 14 (App Router, TypeScript, Tailwind).
- Create Supabase project; connect via `.env.local`.
- Set up folder structure exactly as defined in `Architecture.md` §3.
- Write first migration (`0001_init_schema.sql`) with all Phase 1 tables from PRD §8: `hotels`, `room_categories`, `rooms`, `guests`, `bookings`, `payments`, `staff`.
- Enable RLS on every table immediately (even if policies are permissive placeholders at this exact step — see Phase 1 below for real policies).
- Push to GitHub, connect repo to Vercel, confirm a blank deploy succeeds.

**Done when:** `npm run dev` runs locally, Supabase tables exist and are visible in the Supabase dashboard, and a blank page deploys successfully to Vercel.

---

### Phase 1 — Auth & Roles
**Goal:** Staff can log in and see only what their role permits. Nothing else works yet — this is deliberately boring.

- Supabase Auth (email/password) wired up.
- `staff` table populated with role per user (owner/manager/reception/housekeeping).
- Login page (`app/(auth)/login/page.tsx`).
- Middleware (`middleware.ts`) redirects unauthenticated users to `/login` and blocks routes by role per Architecture.md §4.
- Real RLS policies written per table per Rules.md §2 — no permissive placeholders left over from Phase 0.
- Empty authenticated shell: sidebar nav (per PRD §38, trimmed to Phase 1 items only: Dashboard, Rooms, Bookings, Guests, Billing, Payments, Reports, Settings) with placeholder pages that just say "Coming in Phase X."

**Done when:** Four test accounts (one per role) can log in, each sees only the nav items their role permits, and manually querying any table as a housekeeping-role session via the Supabase client returns only what Rules.md §2 permits — verify this in the Supabase SQL editor with RLS simulated, not just by trusting the UI.

---

### Phase 2 — Room Categories & Room Chart (read-only)
**Goal:** The single most important screen (PRD §3) exists and shows real data, but nothing can be edited yet.

- Settings page to create/edit room categories (PRD §6.5).
- Seed a handful of real rooms against those categories.
- Room chart page (`app/(dashboard)/rooms/page.tsx`) — color-coded grid, statuses hardcoded via direct DB edits for now (no UI to change status yet).
- Room detail view on click (guest info will be empty/placeholder until Phase 3 exists).
- Wire up Supabase Realtime subscription on the `rooms` table — this is the one thing in this phase that must be proven working, since everything later depends on it.

**Done when:** Two browser windows (or two devices) logged in simultaneously both show a room's color change within ~1 second when its status is edited directly in the Supabase dashboard. This proves realtime sync before any booking logic is layered on top.

---

### Phase 3 — Bookings & Guests
**Goal:** A booking can be created and shows up correctly on the room chart and calendar.

- Guest database: create/search guests (PRD §6.9).
- New booking form (PRD §6.3) — guest info, dates, room, rate, advance, source.
- `check-double-booking` Edge Function written and called before every booking insert (Rules.md §2 — server-side, non-negotiable).
- Booking calendar view (PRD §6.4).
- Room chart now reflects real booking-driven statuses (reserved/arriving today) instead of manually edited ones from Phase 2.

**Done when:** Attempting to book an already-booked room for overlapping dates is rejected with a plain-language error (Rules.md §3), and a successful booking appears correctly colored on both the room chart and calendar without a page refresh.

---

### Phase 4 — Check-In / Check-Out & Billing
**Goal:** The full guest lifecycle works end to end, including money.

- Check-in flow (PRD §6.6): confirm booking → room flips to Occupied.
- Check-out flow (PRD §6.6): triggers `calculate-checkout-bill` Edge Function (Rules.md §2 — must be server-side).
- GST / Non-GST toggle at bill generation (PRD §6.7), reading the rate from `hotels.settings`, never hardcoded (Rules.md §1, §2).
- Payment recording (PRD §6.8) — cash/UPI/bank/card modes.
- Room flips to Cleaning Required on checkout; manual "mark clean" action flips it back to Available (full housekeeping workflow is Phase 2 of the PRD, not this document — this is just the minimum toggle needed to complete the room lifecycle).

**Done when:** A full cycle — book a room, check in, record a partial payment, check out, generate both a GST and a Non-GST bill for the same booking type — produces mathematically correct totals every time, verified against manually calculated expected values, not just "the UI shows a number."

---

### Phase 5 — Dashboard & Reports
**Goal:** The owner's view of the whole operation, built last because it depends on real data existing from Phases 2–4.

- Main dashboard (PRD §6.1): live counts for available/occupied/booked rooms, today's arrivals/check-outs, today's collection, pending payments.
- Quick action buttons (PRD §6.11) wired to their respective flows already built in Phases 3–4.
- Daily cash report Edge Function (`daily-cash-report`) and report page (PRD §6.10).
- Monthly report: occupancy %, ADR, RevPAR, revenue, expenses, profit/loss.

**Done when:** The owner can log in on a phone browser and, without asking reception anything verbally, correctly state how many rooms are occupied, what today's collection is, and what's outstanding — cross-checked against the actual DB state.

---

### Phase 6 — Hardening Pass (before calling Phase 1 "done")
**Goal:** Close the gaps that got deliberately deferred while building the happy path.

- Error handling audit against Rules.md §3 — every write operation has a visible failure state.
- Offline/flaky-wifi behavior on all write flows (booking, check-in, payment).
- RLS policy audit — re-verify every table's policy against Rules.md §2, not just at Phase 1 (auth) but with real data now in place.
- Manual test checklist from Rules.md §7 run in full.
- Remove any placeholder/test data seeded during Phases 0–5.

**Done when:** Everything in Rules.md §7's manual test checklist passes, and there is no remaining hardcoded value that should have come from `hotels.settings`.

