# Rules.md
## Guardrails for AI/coding agents working on the Hotel PMS project

Companion to `Hotel_PMS_PRD.md` and `Architecture.md`. Read both before writing code. This document exists so an agent working across many sessions doesn't drift from decisions already made — if a rule here conflicts with something that feels more convenient in the moment, the rule wins unless the user explicitly overrides it in that session.

---

## 1. Stack — Use / Avoid

**Use:**
- Next.js 14 App Router, TypeScript (not JavaScript — this project is typed end to end)
- Tailwind CSS for styling
- Supabase JS client (`@supabase/supabase-js`, `@supabase/ssr`) for all data access
- Supabase Edge Functions (Deno/TypeScript) for server-side logic
- date-fns for date math (not moment.js — unmaintained; not raw Date math for anything involving check-in/check-out ranges, which is error-prone)
- Zod for form/input validation

**Avoid — do not introduce without explicit sign-off:**
- No custom Express/Fastify/Node API server. The entire point of this architecture is zero servers to host. If a task seems to need one, stop and flag it rather than adding one.
- No Firebase. The project already chose Supabase (see Architecture.md §1) for SQL reporting reasons. Don't mix backends.
- No ORMs (Prisma, Drizzle) layered on top of Supabase unless explicitly requested — Supabase's generated types + query builder are sufficient at this scale and an ORM adds a migration-sync problem.
- No UI component libraries beyond Tailwind + shadcn/ui primitives already implied in Architecture.md. Don't pull in Material UI, Ant Design, Chakra, etc. — they fight Tailwind's utility approach and bloat bundle size for what needs to load fast on old hotel-desk computers.
- No new npm dependency for something that's a 10-line utility function. Check if it's genuinely needed before adding a package.
- No localStorage/sessionStorage for anything that needs to be visible across devices (this is the whole point of using Supabase Realtime — see Architecture.md §2). localStorage is fine only for pure UI preferences (e.g., sidebar collapsed state).

---

## 2. Security — Non-Negotiable

- **Never write business logic that trusts the client.** Checkout billing totals, GST calculation, and double-booking checks MUST run in Edge Functions, not in React components or client-side utility functions. If asked to "just calculate the bill in the frontend for now," push back — this is a documented architectural decision (Architecture.md §2), not a preference.
- **Never bypass Row-Level Security.** Do not write code that uses the Supabase service-role key outside of Edge Functions. The service-role key must never appear in any file under `app/`, `components/`, or `lib/` — only inside `supabase/functions/`.
- **Never hardcode the GST rate, tax logic, or hotel-specific business rules in application code.** These live in `hotels.settings` (JSONB) and are read at runtime. This was flagged as a specific requirement in both the client's original spec and the PRD — hardcoding it is a rule violation even if it "works for now."
- **Never log or expose guest PII** (ID numbers, documents) in console logs, error messages, or client-side error boundaries. Guest ID storage is flagged as an open compliance question in the PRD (§10) — treat any code touching `id_number` or ID documents as sensitive until that's resolved, and don't build features around it that assume it's fine.
- Every new table gets an RLS policy in the same migration that creates it. A table with RLS disabled or a permissive `true` policy is not acceptable to ship, even temporarily "to test faster" — write the real policy from the start.

---

## 3. Error Handling

- Every Supabase query and Edge Function call must handle the error case explicitly — no silent failures, no unhandled promise rejections. If a query can fail, the UI must show the staff member something (a toast, an inline message), not a blank screen or console-only error.
- User-facing error messages must be in plain language a receptionist would understand — never surface raw Postgres/Supabase error strings (e.g., "duplicate key value violates unique constraint") to staff. Translate known error codes into plain messages (e.g., "This room is already booked for those dates").
- Double-booking attempts, failed payments, and failed check-outs are expected user errors, not exceptional cases — handle them as normal flow (inline validation), not as crash states.
- Network/offline handling: hotel wifi is not guaranteed to be reliable. Writes (bookings, payments, check-ins) should show a clear pending/failed state rather than silently appearing to succeed and then not saving.

---

## 4. Scope Discipline

- This project is being built in phases (PRD §11). **Do not build Phase 2+ features "while you're in there"** — no restaurant tables, no inventory tables, no OTA webhook stubs, no WhatsApp API calls — even if they seem like small additions. Flag them as "this belongs in Phase 2/3/4" instead of building them.
- If a request implies a feature that isn't in the PRD (e.g., "add a loyalty points field to guests"), ask whether this is a scope change before adding it, rather than quietly extending the schema.
- Don't add "nice to have" UI polish (animations, extra dashboard widgets) at the expense of the core flows in PRD §6. Those flows working reliably matters more than visual extras at this stage.

---

## 5. Code Style & Structure

- Follow the folder structure in `Architecture.md` §3 exactly. Don't invent new top-level folders or reorganize without discussing it first — consistency matters more than any individual person's folder preference across a multi-session build.
- Server Components by default; only mark a component `'use client'` when it actually needs interactivity/state (form inputs, real-time subscriptions). Don't default everything to client components out of habit.
- Keep Supabase query logic in `lib/` helper functions, not scattered inline in every page component — this project already has real-time subscriptions and role-based queries that will need reuse.
- Migration files in `supabase/migrations/` are append-only history. Don't edit an already-applied migration — write a new one.

---

## 6. Communication Rules for the Agent

- **Give honest gap assessments, not reassurance.** If something in the PRD is ambiguous, hard to build within the free tier, or likely to break at scale, say so plainly rather than building a fragile version silently.
- **Don't overclaim what's been built.** "Booking form is done" should mean it validates, prevents double-booking, and writes to the DB — not that a form with the right fields exists. If only part of a feature is working, say which part.
- When multiple reasonable approaches exist (e.g., how to structure the room chart real-time subscription), present 2–3 options briefly rather than silently picking one and moving on, unless the choice is genuinely inconsequential.
- Output should be structured as clear instructions/diffs a coding agent or the developer can act on directly — not long inline code dumps in chat when a file edit is what's actually needed.
- If a task can't be done within the $0-hosting constraint (Architecture.md §1), say so explicitly rather than quietly adding a paid service.

---

## 7. Testing Expectations (Phase 1)

- No requirement for full test coverage at MVP stage — but the three Edge Functions (`calculate-checkout-bill`, `check-double-booking`, `daily-cash-report`) are financial/booking-integrity critical and should have at least basic unit tests covering the common cases (overlapping dates, GST on/off, partial payments) before being considered done.
- Manual test checklist before calling any core flow (PRD §6.3, 6.6, 6.7) "complete": can two staff accounts see the same room update in real time without a manual refresh?