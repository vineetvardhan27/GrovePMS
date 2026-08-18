# Architecture.md
## Simple Hotel Management System — Phase 1 (Core PMS)

Companion document to `Hotel_PMS_PRD.md`. This defines the technical stack, app flow, and file/folder structure for a coding agent to build against.

---

## 1. Technical Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | React-based, deploys natively to Vercel |
| Styling | Tailwind CSS | Fast to build large-button, mobile-friendly UI per PRD's "simple design" requirement |
| Backend / DB | Supabase (Postgres) | Free tier; handles Auth, RLS, Realtime, Storage, Edge Functions |
| Auth | Supabase Auth (email/password) | Role resolved via `staff` table lookup post-login |
| Realtime sync | Supabase Realtime (Postgres changes) | Powers the live room chart |
| Server-side logic | Supabase Edge Functions (Deno/TypeScript) | Billing calc, double-booking check, cash report — never trust these to client-side JS |
| Hosting (frontend) | Vercel | Free tier, auto-deploys from GitHub |
| Hosting (backend) | Supabase Cloud | Free tier, no server for either party to manage |
| Version control | GitHub | Private repo |
| State/data fetching | Supabase JS client + React Server Components; `@supabase/ssr` for auth cookies | Avoids need for a separate API layer |

**Why no custom Node/Express API layer:** Supabase's RLS policies + Edge Functions replace what a traditional REST API would do. Adding a custom backend server would reintroduce a hosting cost and a process to maintain — directly against the project's "$0 to host" constraint.

---

## 2. High-Level App Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Staff Device (Browser)                 │
│         Next.js app — reception / owner / housekeeping       │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │  Supabase JS client
                            │  (auth session + queries)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Supabase Cloud                        │
│                                                                │
│  ┌──────────────┐   ┌───────────────┐   ┌──────────────────┐ │
│  │  Postgres DB  │   │  Row-Level     │   │  Realtime         │ │
│  │  (all tables) │◄──┤  Security      │   │  (rooms table     │ │
│  │               │   │  policies      │   │  change stream)   │ │
│  └──────┬───────┘   └───────────────┘   └────────┬──────────┘ │
│         │                                          │            │
│         │           ┌───────────────────┐          │            │
│         └──────────►│  Edge Functions    │◄─────────┘            │
│                     │  - calc_checkout_bill │                    │
│                     │  - check_double_booking│                   │
│                     │  - daily_cash_report │                     │
│                     └───────────────────┘                        │
│                                                                │
│  ┌──────────────┐          ┌──────────────┐                    │
│  │  Auth         │          │  Storage      │                    │
│  │  (staff login)│          │  (room photos)│                    │
│  └──────────────┘          └──────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │  live push on room status change
                            │
┌───────────────────────────┴───────────────────────────────────┐
│      Other connected devices (owner's phone, housekeeping     │
│      tablet) — see room chart update in real time              │
└─────────────────────────────────────────────────────────────┘
```

**Key flow: room status change**
1. Reception checks in a guest → client calls `check_double_booking()` Edge Function before insert.
2. Booking row inserted, room row updated (`status = 'occupied'`).
3. Postgres change fires on the `rooms` table.
4. Supabase Realtime pushes the change to every subscribed client.
5. Owner's phone and housekeeping tablet re-render the room chart instantly, no manual refresh.

**Key flow: checkout billing**
1. Reception clicks Check-Out.
2. Client calls `calculate_checkout_bill(booking_id)` Edge Function — server-side, so totals can't be tampered with from devtools.
3. Function reads booking + payments + hotel GST settings, returns final bill JSON.
4. Client renders bill, staff confirms → booking marked `checked_out`, room flips to `cleaning`.

---

## 3. Folder Structure

```
hotel-pms/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/                  # authenticated routes, role-gated
│   │   ├── layout.tsx                # shared nav, role-based menu
│   │   ├── dashboard/
│   │   │   └── page.tsx              # main dashboard boxes (6.1)
│   │   ├── rooms/
│   │   │   ├── page.tsx              # room chart (6.2)
│   │   │   └── [roomId]/
│   │   │       └── page.tsx          # room detail drawer/page
│   │   ├── bookings/
│   │   │   ├── page.tsx              # booking list
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # new booking form (6.3)
│   │   │   └── calendar/
│   │   │       └── page.tsx          # booking calendar (6.4)
│   │   ├── checkin/
│   │   │   └── [bookingId]/
│   │   │       └── page.tsx
│   │   ├── checkout/
│   │   │   └── [bookingId]/
│   │   │       └── page.tsx
│   │   ├── billing/
│   │   │   └── [bookingId]/
│   │   │       └── page.tsx          # bill view + GST toggle
│   │   ├── guests/
│   │   │   ├── page.tsx              # searchable guest DB (6.9)
│   │   │   └── [guestId]/
│   │   │       └── page.tsx          # guest history
│   │   ├── payments/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx              # daily/monthly reports (6.10)
│   │   └── settings/
│   │       ├── room-categories/
│   │       │   └── page.tsx
│   │       └── gst/
│   │           └── page.tsx          # configurable GST rate (7)
│   └── layout.tsx                    # root layout
│
├── components/
│   ├── ui/                           # buttons, cards, badges (shadcn-style)
│   ├── dashboard/
│   │   └── StatusBox.tsx
│   ├── rooms/
│   │   ├── RoomGrid.tsx              # color-coded room chart
│   │   └── RoomCard.tsx
│   ├── bookings/
│   │   ├── BookingForm.tsx
│   │   └── BookingCalendar.tsx
│   ├── billing/
│   │   └── BillSummary.tsx
│   └── shared/
│       ├── QuickActions.tsx          # dashboard quick-action buttons (6.11)
│       └── GlobalSearch.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # browser client
│   │   ├── server.ts                 # server component client
│   │   └── middleware.ts             # session refresh
│   ├── types/
│   │   └── database.types.ts         # generated from Supabase schema
│   └── utils/
│       ├── currency.ts
│       └── dates.ts
│
├── supabase/
│   ├── migrations/                   # SQL migration files (schema history)
│   │   ├── 0001_init_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   └── 0003_realtime_enable.sql
│   ├── functions/                    # Edge Functions (Deno)
│   │   ├── calculate-checkout-bill/
│   │   │   └── index.ts
│   │   ├── check-double-booking/
│   │   │   └── index.ts
│   │   └── daily-cash-report/
│   │       └── index.ts
│   └── seed.sql                      # sample data for local dev
│
├── middleware.ts                     # route protection by auth + role
├── .env.local                        # Supabase URL + anon key (never committed)
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 4. Role-Based Route Access

Enforced at two layers — not just the UI:

1. **Middleware (`middleware.ts`):** redirects unauthenticated users to `/login`; blocks routes not permitted for the logged-in staff role (e.g., housekeeping role hitting `/billing` redirects to `/dashboard`).
2. **Row-Level Security (Postgres):** the real security boundary. Even if a role somehow reaches a page, RLS policies prevent the underlying query from returning data they shouldn't see (e.g., housekeeping querying `payments` returns zero rows regardless of UI).

Never rely on hiding a UI element alone — RLS is the enforcement point.

---

## 5. Database Schema (Table Overview)

Full column-level spec to be maintained separately, but the relationships:

```
hotels (1) ──< room_categories (1) ──< rooms
hotels (1) ──< staff
hotels (1) ──< guests
rooms (1) ──< bookings >── (1) guests
bookings (1) ──< payments
```

Every table carries `hotel_id`, even though Phase 1 UI only supports one property — keeps multi-hotel support (Phase 5) a schema migration, not a rebuild.

---

## 6. Environment / Config

- `.env.local` holds `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only — the anon key is safe to expose client-side because RLS governs actual access.
- Service-role key (full DB bypass) used only inside Edge Functions, never shipped to the client bundle.
- GST rate and hotel-level settings stored in the `hotels.settings` JSONB column, editable via `/settings/gst` — not hard-coded anywhere in application code, per PRD section 11.

---

## 7. Deployment Flow

1. Push to GitHub `main` branch → Vercel auto-builds and deploys frontend.
2. Supabase migrations applied via Supabase CLI (`supabase db push`) — kept in version control under `supabase/migrations/`, not applied by clicking around the dashboard, so schema changes are reproducible.
3. Edge Functions deployed via `supabase functions deploy <name>`.
4. No manual server restarts, no SSH, no server patching — the entire deploy path is `git push`.

---

## 8. What's Deliberately Not in This Architecture

Per the PRD's non-goals: no restaurant/KOT tables, no inventory tables, no OTA webhook handlers, no payment gateway SDK. Adding these later means new tables + new routes under the same structure — not a rearchitecture, since `hotel_id`-scoped RLS and the Next.js App Router folder pattern extend cleanly.