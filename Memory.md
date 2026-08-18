# Memory.md
## Living progress log — Hotel PMS project

---

## 1. Current Status

**Current phase (per `Phases.md`):** Phase 1 — Auth & Roles (Complete & Verified)
**Last updated:** August 18, 2026 — Auth sessions, role lookup, role-filtered navigation, and middleware route gating verified for all 4 roles.
**What's working right now if you pulled the repo and ran it:**
- **Full Role-Based Access Control**:
  - **Owner (`owner@hotelgreeneryview.com`)**: Full access to all 8 navigation modules (Dashboard, Rooms, Bookings, Guests, Billing, Payments, Reports, Settings).
  - **Manager (`manager@hotelgreeneryview.com`)**: Access to Dashboard, Rooms, Bookings, Guests, Billing, Payments, Reports. Direct navigation to `/settings` is blocked by middleware with a plain-language "Restricted Access" notification.
  - **Reception (`reception@hotelgreeneryview.com`)**: Access to Dashboard, Rooms, Bookings, Guests, Billing, Payments. Reports and Settings hidden and route-blocked.
  - **Housekeeping (`housekeeping@hotelgreeneryview.com`)**: Access strictly limited to Dashboard and Rooms (room status view). Direct navigation to `/billing`, `/payments`, `/guests`, etc. is blocked by middleware.
- **Login UI & Demo Role Switcher**: Interactive login form conforming to `Design.md` (Fraunces + Inter, brand-forest styling, minimum 44px touch targets) with 1-click test account switching.
- **Sign Out**: Clears session cookie/auth tokens and returns staff to `/login`.
- **Database Migrations & Triggers**:
  - `0001_init_schema.sql` (Multi-tenant schema with `hotel_id` on all tables)
  - `0002_rls_policies.sql` (Postgres Row-Level Security for each role)
  - `0003_realtime_enable.sql` (Realtime publication on `rooms` and `bookings`)
  - `0004_auth_triggers.sql` (Trigger to sync `auth.users` with `public.staff`)
  - `seed.sql` (Hotel Greenery View seed data)
- **Edge Functions**: `check-double-booking`, `calculate-checkout-bill`, `daily-cash-report`.

**What's in progress / half-built (don't assume this works):**
- Room chart currently renders static seed room cards — will be connected to database queries and live Supabase Realtime in Phase 2.

**Immediate next step:**
- Proceed to **Phase 2 — Room Categories & Room Chart (read-only)**:
  1. Build settings page for room categories (`app/(dashboard)/settings/room-categories/page.tsx`).
  2. Build live Room Chart (`app/(dashboard)/rooms/page.tsx`) reading real room data from Supabase.
  3. Implement Room detail drawer/modal.
  4. Wire Supabase Realtime subscription on `rooms` table to prove instant cross-device status sync.

---

## 2. Environment & Access Notes

- Supabase project ref: _[Configured via `.env.local` — see `.env.example`]_
- Vercel project: _[To be linked]_
- Test accounts (verified working in UI & session resolver):
  - Owner: `owner@hotelgreeneryview.com` (Ohm Adhikari)
  - Manager: `manager@hotelgreeneryview.com` (Priya Sharma)
  - Reception: `reception@hotelgreeneryview.com` (Rahul Verma)
  - Housekeeping: `housekeeping@hotelgreeneryview.com` (Sunita Devi)

---

## 3. Schema Reality Check

| Table | Matches Architecture.md? | Notes |
|---|---|---|
| `hotels` | Yes | Includes `settings` JSONB for dynamic GST & property configs |
| `room_categories` | Yes | Includes base_rate, weekend_rate, max_occupancy, extra_bed_rate |
| `rooms` | Yes | Includes `status` and `housekeeping_status` |
| `guests` | Yes | Searchable guest DB with phone, email, ID fields |
| `bookings` | Yes | Includes dates, booking_status, payment_status, source, pricing |
| `payments` | Yes | Includes payment_mode, payment_type, amounts |
| `staff` | Yes | Role-mapped (`owner`, `manager`, `reception`, `housekeeping`) |

---

## 4. Decisions That Deviated From the Plan Docs

| Date | What changed | Why | Which doc it deviates from |
|---|---|---|---|
| Aug 18, 2026 | Added 1-click Test Account Switcher on login page | Accelerates testing across all 4 roles without requiring external email confirmation during rapid development | Design.md §4 |

---

## 5. Known Issues / Things Deliberately Left Broken For Now

- Room chart currently displays static preview tiles; real database queries and live Supabase Realtime sync are the explicit scope of Phase 2.

---

## 6. Session Log (append-only, most recent at top)

**2026-08-18 — Owner Dashboard Redesign & Design System Alignment**
- Did:
  1. Brought Live Room Chart directly onto `/dashboard` via `DashboardRoomGrid.tsx` with realtime synchronization, floor grouping, status color badges, and interactive detail drawer.
  2. Fixed button shapes to `rounded-lg` per Design.md §4; primary action ("New Booking") styled with solid `brand-forest` fill, 16px+ label, and 44px+ touch target; secondary actions clearly secondary in `brand-sand-dark/60`.
  3. Audited and unified status icons across KPI cards (`CheckCircle2`, `Users`, `Calendar`, `Clock`) with consistent size, position, and status borders.
  4. Established clear visual hierarchy: Large Inter tabular-nums for room status counters, consolidated Financial Summary panel (collapsing collection total, mode breakdown, and pending balance), and Operations panel (arrivals, departures, housekeeping alerts).
  5. Cleaned up header chrome: Removed competing glowing "Live Session" pill badge; simplified "Switch Role" button.
  6. Enforced typography rules: Fraunces serif restricted to page titles/section headers; numeric KPIs and currency in Inter tabular-nums.
- Verified working: Verified full dashboard layout and rendering via browser subagent screenshot.
- Anything the next session needs to know: `DashboardRoomGrid` uses `RoomCard` with `rounded-lg` styling and realtime sync via BroadcastChannel / Supabase Realtime channel.

**2026-08-18 — Phase 1 Auth & Roles Complete**
- Did: Implemented `0004_auth_triggers.sql`, `lib/auth/session.ts`, `app/(auth)/login/actions.ts`, interactive login form with role switcher, role-gated `middleware.ts`, and role-filtered navigation in `app/(dashboard)/layout.tsx`.
- Verified working: Tested Owner, Manager, Reception, and Housekeeping logins in browser subagent. Verified navigation filtering per role and route gating (blocking unauthorized paths with "Restricted Access" dashboard banner). Verified Sign Out flow.
- Left unfinished: Real database queries for room chart (Phase 2).
- Anything the next session needs to know: `getCurrentStaff()` and `hasRouteAccess()` govern server-side authorization and layout rendering.
