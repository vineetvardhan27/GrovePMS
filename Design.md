# Design.md
## Visual Design System — Simple Hotel Management System

Companion to `Architecture.md` (Tailwind CSS stack) and `Rules.md`. This document defines the actual tokens — not vibes — so an agent can implement consistently across every screen in `Phases.md` without re-deciding colors and type on each new page.

---

## 0. Design Brief (grounding this in the actual subject)

This is not a marketing site — it's an operational tool a receptionist glances at for two seconds between phone calls, on a desk monitor that's probably a few years old, sometimes on a cracked-screen Android phone at 11pm during a check-in rush. The single job of every screen here is: **make the current state of the hotel legible at a glance, and make the next action obvious and hard to mis-tap.**

That reframes what "distinctive" means for this brief. The signature isn't a hero animation — it's the **room chart itself**: a grid of large, unmistakably color-coded room tiles that reads correctly from three feet away. Everything else in this system is quiet in service of that one screen being immediately trustworthy.

Explicitly avoiding the generic AI-tool defaults: no cream-background-plus-terracotta-accent look, no near-black-with-neon-accent SaaS dashboard look. This needs to feel like it belongs in a hotel lobby, not a startup pitch deck — warm, a little hospitality-coded, but restrained enough not to compete with the status colors, which are doing the real work.

---

## 1. Color System

### 1.1 Brand / Neutral Palette

| Token | Hex | Use |
|---|---|---|
| `brand-forest` | `#1F3D3A` | Primary brand color — nav, headers, primary buttons |
| `brand-forest-light` | `#2E5A54` | Hover states, secondary emphasis |
| `brand-sand` | `#F6F2EC` | Page background — warm, not stark white, easy on eyes for long shifts |
| `brand-sand-dark` | `#EAE3D6` | Card backgrounds, subtle section separation |
| `ink` | `#22221F` | Primary text |
| `ink-muted` | `#5C5B54` | Secondary text, labels, captions |
| `border-subtle` | `#DDD5C6` | Dividers, card borders |

Rationale: deep forest green reads as "hospitality/grounded" without being literal (no leaf icons, no travel clichés), and pairs with a warm sand neutral rather than the stark-cream-plus-terracotta combination that's become an AI-tool tell. Forest green is also comfortably distinct from every status color below, so the brand chrome never gets confused with a room's status.

### 1.2 Status Colors — the load-bearing part of this system

The entire PMS depends on staff correctly reading room/payment/order status at a glance (PRD §3). These colors are **functional, not decorative** — never repurpose them elsewhere in the UI, and never introduce a new color for a new status without updating this table.

| Status | Color token | Hex | Used for |
|---|---|---|---|
| Available / Fully Paid / Clean | `status-green` | `#2E7D4F` | Room available, payment complete |
| Occupied | `status-red` | `#C4392B` | Room occupied |
| Arriving Today / Advance Received | `status-amber` | `#D68A2C` | Arriving today, partial payment |
| Reserved / Credit-Pay Later | `status-blue` | `#2B5C8A` | Future reservation, credit status |
| Cleaning Required | `status-orange` | `#D9662B` | Housekeeping needed |
| Maintenance / Blocked | `status-slate` | `#4A4A47` | Room out of service |
| No Payment | `status-red` | `#C4392B` | Reuses occupied-red intentionally — both mean "needs attention" |

**Critical accessibility rule:** color is never the *only* signal. Roughly 1 in 12 men have some form of color vision deficiency, and red/green is the single most common confusion — which is disastrous in a system where red=occupied and green=available sit right next to each other. Every status indicator must pair color with:
- A distinct **icon** (per the client's original spec's own emoji shorthand — translate to proper icon set, not literal emoji, in production: circle-check for available, door for occupied, clock for arriving, calendar for reserved, sparkles for cleaning, wrench for maintenance)
- A **text label**, always visible on the room detail view and available on hover/long-press on the grid tile itself

Do not ship a room chart where the only differentiator between two states is hue.

### 1.3 Semantic UI Colors (distinct from status colors above)

| Token | Hex | Use |
|---|---|---|
| `action-primary` | `brand-forest` (`#1F3D3A`) | Primary buttons (Save, Check In, Confirm) |
| `action-danger` | `#A6291D` | Destructive actions (Cancel Booking, Delete) — deliberately darker/more muted than `status-red` so it doesn't visually compete with room-status red |
| `feedback-success` | `#2E7D4F` | Toasts/confirmations — intentionally same as `status-green`, both mean "good" |
| `feedback-error` | `#A6291D` | Error toasts — same as `action-danger` |

---

## 2. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display / headings | **Fraunces** (variable, serif) | Used sparingly — page titles, dashboard section headers only. A serif with warmth and a bit of editorial character, avoiding the generic geometric-sans-for-everything look. Never used below 18px. |
| Body / UI | **Inter** | All body text, forms, buttons, table data. Chosen for legibility at small sizes on low-quality screens — this matters more here than typeface personality, given the actual devices this runs on. |
| Numeric / data | **Inter, tabular-nums** | All currency, room numbers, dates — `font-variant-numeric: tabular-nums` so columns of numbers in bills and reports align vertically. Non-negotiable for the billing screens (PRD §6.7). |

### Type Scale (Tailwind config values)

| Token | Size | Weight | Use |
|---|---|---|---|
| `text-display` | 32px / 2rem | 600 (Fraunces) | Dashboard page title |
| `text-h1` | 24px / 1.5rem | 600 (Fraunces) | Section headers (e.g. "Room Chart") |
| `text-h2` | 18px / 1.125rem | 600 (Inter) | Card titles, modal headers |
| `text-body` | 16px / 1rem | 400 (Inter) | Default body text, form labels |
| `text-body-lg` | 18px / 1.125rem | 400 (Inter) | Primary dashboard numbers (e.g. "12 Available") — larger because these need to be readable at a glance per PRD §37 |
| `text-caption` | 14px / 0.875rem | 400 (Inter) | Timestamps, secondary metadata |
| `text-tiny` | 12px / 0.75rem | 500 (Inter) | Badge labels, status chips |

**Minimum body text is 16px, not 14px.** This system will be read on phones by an owner who is not a designer and not necessarily young — do not shrink text to fit more on screen. Add scroll, don't shrink type.

---

## 3. Layout & Spacing

- Base spacing unit: **4px**, scaling in the standard Tailwind steps (4/8/12/16/24/32/48/64).
- Cards and containers: `rounded-lg` (8px radius) — soft enough to feel approachable, not so rounded it reads as a consumer app.
- Minimum touch target: **44×44px** for any tappable element (room tiles, quick-action buttons, nav items) — this is a tablet/phone-used-with-a-finger system per PRD §37/§42, not a mouse-only desktop app.
- Room chart tiles: minimum **80×80px** on desktop, minimum **64×64px** on mobile grid — must stay well above the 44px minimum since these are the highest-stakes tap targets in the app (an accidental tap shouldn't feel risky).

---

## 4. Component Patterns

- **Buttons:** Primary action = solid `brand-forest` fill, white text, 16px+ label, generous horizontal padding (24px+). Never rely on a ghost/outline button for a primary action like "Check In" or "Save Booking" — per PRD §37's "large buttons" requirement, primary actions should be visually unmissable.
- **Status badges:** pill-shaped, colored background at 15% opacity of the status color with full-opacity text/icon in that same color — keeps contrast high (WCAG AA minimum 4.5:1) while still being clearly tied to its status color.
- **Dashboard stat boxes (PRD §6.1):** large number in `text-body-lg` or bigger, label below in `text-caption`, colored left-border or icon matching status-color table where applicable (e.g., Pending Payments box gets a `status-amber` accent).
- **Forms:** one column, generous vertical spacing (not dense multi-column layouts) — matches the "minimum typing, dropdown menus over free text" principle in PRD §37. Labels always visible above the field, never placeholder-only labels (a placeholder that disappears on focus is a usability trap for a distracted receptionist mid-task).

---

## 5. Dark Mode

**Not built in Phase 1.** Flagging rather than skipping silently: night-shift reception staff may genuinely benefit from this later, but per `Rules.md` §4 scope discipline, it's not in PRD Phase 1 and shouldn't be built speculatively. If revisited, the forest/sand palette above should invert to a dark neutral (not pure black) background with the same status colors preserved exactly — status color meaning must never shift between light and dark mode.

---

## 6. Motion

Minimal and functional only:
- Room tile status change: brief (150–200ms) color cross-fade when Realtime pushes an update — this is the one place motion actually communicates something (that a change just happened live), not decoration.
- No page-load animations, no scroll-triggered reveals, no hover flourishes on the dashboard. This tool is opened dozens of times a day by people trying to get through a task quickly — motion that adds delay or feels performative works against the brief.
- Respect `prefers-reduced-motion` throughout.

---

## 7. What This Design Deliberately Is Not

- Not a "hotel brand" website — no hero imagery, no marketing copy, no lifestyle photography on core screens. Room category photos (PRD §6.5) are functional reference images only, sized as thumbnails, not full-bleed hero shots.
- Not maximalist or playful — the room chart's color-coding is already visually loud by necessity; everything surrounding it (nav, typography, chrome) stays quiet so the status colors keep their authority as the one thing in the UI that's always trustworthy.