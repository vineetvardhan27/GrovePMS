# Product Requirements Document
## Simple Hotel Management System (Hotel Control Centre)
**Client:** Ohm Adhikari — Hotel Greenery View (hotelgreeneryview.com)
**Prepared by:** Vineet Vardhan
**Version:** 1.0 — Draft
**Date:** August 2026

---

## 1. Overview

A single-property hotel management dashboard covering rooms, bookings, guest check-in/out, billing, and payment tracking — designed to be usable by non-technical hotel staff after a 10–15 minute walkthrough. Built on a zero-cost-to-host stack (frontend on Vercel/Netlify, backend on Supabase free tier) so the client has no recurring infrastructure bill at current scale.

This PRD scopes **Phase 1 (Core PMS)** as the buildable MVP, with Phases 2–5 (from the client's original requirement doc) sequenced as future work, not committed deliverables.

## 2. Problem Statement

The hotel currently manages rooms, bookings, and payments manually or across disconnected tools. Staff need a single screen that shows room status, arrivals/departures, and payment status at a glance, without requiring accounting or ERP-level training.

## 3. Goals

- Reception can complete a walk-in check-in in under 1 minute.
- Owner can see occupancy, revenue, and pending payments from one dashboard, including on mobile.
- Room status updates in real time across all logged-in devices (reception desk, owner's phone, housekeeping tablet).
- Zero ongoing hosting cost at current single-property scale.
- New staff member can operate the system after a 10–15 minute demo, no training manual required.

## 4. Non-Goals (Explicitly Out of Scope for Phase 1)

- OTA channel manager integration (Booking.com, Agoda, MakeMyTrip, etc.) — separate scoped project per provider.
- Automated WhatsApp/SMS booking confirmations — stubbed as manual "copy message" button only.
- Restaurant POS, KOT/kitchen display, QR menu ordering.
- Inventory, purchase, and supplier management.
- Multi-hotel / multi-property support (schema will allow for it later; UI will not expose it).
- Payment gateway integration for online prepayment.
- Loyalty programs, guest reviews, payroll, employee attendance.

These are acknowledged in the client's original requirement doc as Phases 2–5 and will be scoped separately once Phase 1 is in daily use.

## 5. User Roles

| Role | Access |
|---|---|
| Owner | Full access: dashboard, reports, all modules |
| Manager | Bookings, rooms, reports (no staff/settings management) |
| Reception | Bookings, check-in/out, billing, guest database |
| Housekeeping | Room status (clean/dirty/inspected) only |

*(Kitchen/restaurant/store roles deferred to Phase 3 scope.)*

## 6. Core Features — Phase 1

### 6.1 Dashboard
- At-a-glance boxes: available/occupied/booked rooms, today's arrivals/check-outs, today's collection, pending payments, rooms needing cleaning.
- Mobile-responsive; owner can check status without a computer.

### 6.2 Room Chart
- Visual grid of rooms, color-coded by status (available / occupied / arriving today / reserved / cleaning / maintenance).
- Click a room → guest details, dates, rate, balance, payment status, housekeeping status.
- Status updates propagate live to all connected devices (Supabase Realtime).

### 6.3 Booking
- Booking form: guest info, dates, room, rate, advance payment, source (direct/walk-in/phone/WhatsApp/travel agent/other), remarks.
- Payment status auto-derived: fully paid / advance received / no payment / credit.
- System blocks overlapping bookings for the same room (double-booking prevention, enforced server-side).

### 6.4 Booking Calendar
- Date-based view of arrivals/check-outs/room occupancy, with today's arrivals and departures visually distinguished.

### 6.5 Room & Category Management
- Admin-configurable room categories (name, base/weekend/seasonal rate, max occupancy, extra bed rate, tax rate).
- Per-room status and metadata.

### 6.6 Check-In / Check-Out
- Check-in: confirm guest + room + dates → room status flips to Occupied.
- Check-out: system auto-calculates room charges + extras − advance = balance due; generates bill; room status flips to Cleaning Required.

### 6.7 Billing (GST & Non-GST)
- Single running bill per guest.
- Toggle GST / Non-GST invoice at generation time.
- GST rate stored as configurable setting, not hard-coded, so rate changes don't require a code change.
- Auto-calculated totals — no manual math for staff.

### 6.8 Payments
- Record payments by mode (cash/UPI/bank transfer/card/other).
- Payments roll up automatically into Today's Collection and the daily cash report.

### 6.9 Guest Database
- Auto-saved guest records; searchable by name, mobile, email, or booking ID.
- Shows guest's booking/payment history for repeat-guest recognition.

### 6.10 Reports (Owner)
- Daily: room revenue, other revenue, total collection, expenses, pending balance.
- Monthly: occupancy %, ADR, RevPAR, revenue, expenses, profit/loss.
- Daily cash report: opening cash + collections − expenses = closing cash.

### 6.11 Quick Actions
- One-click access from dashboard: New Booking, Walk-In, Check-In, Check-Out, Receive Payment, New Bill.

## 7. Technical Approach

| Layer | Choice | Cost |
|---|---|---|
| Frontend | React/Next.js on Vercel (or Netlify) | Free tier |
| Database + Auth | Supabase (Postgres, Row-Level Security, Auth) | Free tier |
| Realtime sync | Supabase Realtime on `rooms` table | Included free |
| File/photo storage | Supabase Storage | Free tier (small quota) |
| Server-side logic | Supabase Edge Functions (billing calc, double-booking check, daily cash report) | Free tier |
| Domain | Client's existing domain or free subdomain to start | ~$10–15/yr if custom domain needed |

**Why this stack:** No server for either party to provision or maintain. Free tiers comfortably cover a single 20–40 room property's daily read/write volume. Postgres (via Supabase) supports the SQL aggregation needed for occupancy/ADR/RevPAR reporting more naturally than a pure NoSQL option.

**Security-critical logic kept server-side (Edge Functions), not client-side:**
- Checkout bill calculation (prevents staff from altering totals via browser devtools).
- Double-booking prevention check.
- Daily cash report aggregation.

## 8. Data Model (Summary)

`hotels`, `room_categories`, `rooms`, `guests`, `bookings`, `payments`, `staff` — full schema with column types to be maintained as a separate technical spec, scoped multi-hotel-ready (hotel_id on every table) even though Phase 1 UI only exposes a single property.

## 9. Success Metrics

- Walk-in check-in completed in <1 minute in practice, not just in theory.
- Zero double-bookings in first 30 days of live use.
- Owner checks dashboard from mobile without needing reception to relay information verbally.
- $0 hosting spend through at least the first 6 months of live use at current occupancy volume.

## 10. Risks & Open Questions

- **Free tier ceiling:** Supabase/Firebase free tiers will need a paid upgrade if the property scales to multiple hotels or high transaction volume. Not a Phase 1 risk, but should be flagged to the client now so it isn't a surprise later.
- **Guest ID/document storage:** Section 35 of the client's original doc requests storing guest ID photos. Legal/compliance requirements (data protection, retention limits) need confirmation before this is built — treating as an open question, not committing to it in Phase 1 without that answer.
- **Ownership/hosting model:** Undecided whether this is a one-time build-and-handoff or an ongoing SaaS relationship with Vineet retaining infra access. Affects who "owns" the Supabase/Vercel accounts.
- **Concurrent room-status edits:** Two staff updating the same room simultaneously will resolve last-write-wins in v1. Acceptable for MVP; revisit if it causes real conflicts in practice.

## 11. Phasing (Beyond This PRD)

- **Phase 2:** Housekeeping workflow, maintenance requests, travel agent management, expenses.
- **Phase 3:** Restaurant POS, KOT, QR menu.
- **Phase 4:** OTA/channel manager integration, WhatsApp/SMS automation, payment gateway.
- **Phase 5:** Multi-hotel support, native mobile app, loyalty, payroll.

Each phase to be scoped and estimated separately once Phase 1 is live and in daily use.

## 12. Estimated Timeline (Phase 1 Only)

15–25 working days, solo build with AI-assisted coding, assuming stable scope and prompt client feedback on the room chart and booking flow early in the build.