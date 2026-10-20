'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Hotel,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  UtensilsCrossed,
  Sparkles,
  PartyPopper,
  BarChart3,
  Lock,
  ArrowRight,
  Building2,
  Users,
  BedDouble,
  ClipboardList,
  Wallet,
  Warehouse,
  Settings,
  KeyRound,
  MapPin,
  Crown,
  Activity,
  Layers,
  Globe,
  HelpCircle,
  ChevronDown,
  Database,
} from 'lucide-react';
import {
  useInView,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  FloatingCard,
} from './animations';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { createClient } from '@/lib/supabase/client';
import { HeroDashboardSkeleton } from './HeroDashboardMock';
import { OperationalTimelineSkeleton } from './OperationalTimeline';
import { DashboardShowcaseSkeleton } from './DashboardShowcaseInteractive';
import MultiPropertyArchitecture from './MultiPropertyArchitecture';

// Dynamically imported heavy interactive components (isolated from initial critical path)
const HeroDashboard = dynamic(() => import('./HeroDashboardMock'), {
  ssr: false,
  loading: () => <HeroDashboardSkeleton />,
});

const OperationalTimeline = dynamic(() => import('./OperationalTimeline'), {
  ssr: false,
  loading: () => <OperationalTimelineSkeleton />,
});

const DashboardShowcaseInteractive = dynamic(
  () => import('./DashboardShowcaseInteractive'),
  {
    ssr: false,
    loading: () => <DashboardShowcaseSkeleton />,
  }
);

/* ══════════════════════════════════════════════
 * BRAND IDENTITY
 * ══════════════════════════════════════════════ */
const PRODUCT_NAME = 'Grove';

/* ══════════════════════════════════════════════
 * MODULES DATA (Server-renderable SEO content)
 * ══════════════════════════════════════════════ */
const modules = [
  {
    icon: CalendarCheck,
    name: 'Front Desk',
    desc: 'Real-time room matrix, check-ins, identity verification, keycards, and express checkout.',
  },
  {
    icon: ClipboardList,
    name: 'Reservations',
    desc: 'Centralized booking engine with date search, room availability, and guest profile linking.',
  },
  {
    icon: BedDouble,
    name: 'Room Management',
    desc: 'Room categories, floor plans, status tracking, maintenance logs, and rate management.',
  },
  {
    icon: Users,
    name: 'Guest Management',
    desc: 'Guest profiles, ID records, stay history, preferences, and communication logs.',
  },
  {
    icon: CreditCard,
    name: 'Billing & Folios',
    desc: 'Consolidated guest ledgers, room charges, advance deposits, and automated GST invoicing.',
  },
  {
    icon: Wallet,
    name: 'Payments',
    desc: 'Multi-mode collection — Cash, UPI, Card — with split payments and receipt generation.',
  },
  {
    icon: UtensilsCrossed,
    name: 'F&B Operations',
    desc: 'KOT generation, table orders, room charge posting, walk-in dining, and menu sync.',
  },
  {
    icon: PartyPopper,
    name: 'Banquet & Events',
    desc: 'Hall bookings, decor packages, catering, stage lighting, and standalone event invoicing.',
  },
  {
    icon: Sparkles,
    name: 'Housekeeping',
    desc: 'Room turnaround tracking — dirty, in-progress, inspected, out-of-order — in real time.',
  },
  {
    icon: Warehouse,
    name: 'Inventory',
    desc: 'Stock management, purchase orders, consumption tracking, and low-stock alerts.',
  },
  {
    icon: BarChart3,
    name: 'Reports & Analytics',
    desc: 'ADR, RevPAR, occupancy analytics, shift handovers, and monthly GST return exports.',
  },
  {
    icon: Settings,
    name: 'Hotel Settings',
    desc: 'Tax configuration, staff management, property details, room categories, and access control.',
  },
];

/* ══════════════════════════════════════════════
 * FAQ DATA (Server-renderable SEO content)
 * ══════════════════════════════════════════════ */
const faqs = [
  {
    q: 'What is a hotel PMS?',
    a: 'A Property Management System (PMS) is the core operational software that hotels use to coordinate daily workflows — including room inventory, front desk check-ins, reservations, guest ledgers, billing, housekeeping status, and financial reporting.',
  },
  {
    q: 'What can Grove manage?',
    a: 'Grove manages front desk operations, reservations, room matrix, guest profiles, consolidated billing & folios, GST invoices, multi-mode payments (Cash, UPI, Card), restaurant & bar KOTs, banquet/event packages, housekeeping turnaround tracking, inventory consumption, and owner management reports.',
  },
  {
    q: 'Can multiple hotels use the platform?',
    a: 'Yes. Grove is a multi-tenant platform where multiple independent hotel properties operate concurrently. Each hotel has its own dedicated workspace, staff team, and configuration.',
  },
  {
    q: 'How does hotel data isolation work?',
    a: 'Data isolation is enforced at the database level using PostgreSQL Row-Level Security (RLS). Every query automatically scopes data to the authenticated staff member’s hotel_id, ensuring zero data crossover between different properties.',
  },
  {
    q: 'Can hotel owners create staff accounts?',
    a: 'Yes. The hotel owner provisions operational staff accounts directly from Settings → Staff / Users. Public registration for staff is disabled to maintain strict property access control.',
  },
  {
    q: 'What roles are supported?',
    a: 'Grove supports four distinct roles: Owner (full property configuration & reports), Manager (operational oversight & daily reporting), Reception (check-ins, check-outs, room matrix & folios), and Housekeeping (room turnaround & cleaning statuses).',
  },
  {
    q: 'Does the PMS support hotel billing and GST invoices?',
    a: 'Yes. Grove automatically calculates room tariffs, food charges, extra amenities, and applicable GST slabs (e.g. 12%, 18%). It produces sequential GST-compliant invoices with CGST/SGST/IGST breakdowns and provides monthly summaries for tax filing.',
  },
  {
    q: 'Does the PMS support F&B billing?',
    a: 'Yes. The Food & Beverage module handles table orders, Kitchen Order Tickets (KOT), room charge postings directly to guest folios, and standalone restaurant walk-in bills.',
  },
  {
    q: 'Does it include housekeeping?',
    a: 'Yes. Housekeeping staff can view and update room statuses in real-time — transitioning rooms between Dirty, In-Progress, Inspected, and Clean & Available.',
  },
  {
    q: 'Does it support banquet management?',
    a: 'Yes. The Banquet module handles hall bookings, catering packages, event decor, stage/audio charges, advance deposits, and dedicated event invoicing.',
  },
  {
    q: 'Can I register a new hotel?',
    a: 'Yes. New property owners can sign up via the Register Hotel flow to initialize their hotel property, configure room categories, and begin managing operations immediately.',
  },
  {
    q: 'How do I access my PMS account?',
    a: 'Staff and owners access their property via the Sign In portal using their verified email and password. The system automatically verifies your staff role and opens your hotel workspace.',
  },
];

/* ══════════════════════════════════════════════
 * MAIN LANDING PAGE CLIENT COMPONENT
 * ══════════════════════════════════════════════ */
export default function LandingPageClient({
  staffName: initialStaffName,
  staffRole: initialStaffRole,
}: {
  staffName?: string;
  staffRole?: string;
} = {}) {
  const [sessionUser, setSessionUser] = useState<boolean>(Boolean(initialStaffName));
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Background auth hydration for logged-in returning users
  useEffect(() => {
    if (initialStaffName) return;
    if (typeof document !== 'undefined' && (document.cookie.includes('-auth-token') || document.cookie.includes('sb-'))) {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSessionUser(true);
        }
      }).catch(() => {});
    }
  }, [initialStaffName]);

  const isAuthenticated = Boolean(initialStaffName || sessionUser);

  // Section in-view observers
  const hero = useInView();
  const productIntro = useInView();
  const modulesSection = useInView();
  const workflowSection = useInView();
  const dashboardShowcase = useInView();
  const multiTenant = useInView();
  const securityTrustSection = useInView();
  const customerExample = useInView();
  const faqSection = useInView();
  const ctaSection = useInView();

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 overflow-x-hidden relative">
      {/* Page-wide subtle architectural grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 grove-grid-texture"
        aria-hidden="true"
      />

      {/* ───────────── 1. STICKY NAVBAR ───────────── */}
      <PublicHeader staffName={initialStaffName} staffRole={initialStaffRole} />

      {/* ───────────── 2. HERO SECTION ───────────── */}
      <section ref={hero.ref} className="pt-24 sm:pt-32 pb-8 sm:pb-12 relative overflow-hidden" id="platform">
        {/* Subtle hospitality architectural background highlight */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 50% 25%, rgba(31, 61, 58, 0.035) 0%, transparent 68%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <FadeIn inView={hero.inView} delay={0} direction="up" distance={12}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-5 sm:mb-6">
              <Layers className="w-3.5 h-3.5" />
              <span>Unified Hospitality Platform</span>
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn inView={hero.inView} delay={80} direction="up" distance={16}>
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
              The Operating System
              <br />
              <span className="text-brand-forest-light">for Modern Hospitality.</span>
            </h1>
          </FadeIn>

          {/* Subheadline */}
          <FadeIn inView={hero.inView} delay={160} direction="up" distance={14}>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
              Manage rooms, reservations, guests, billing, F&B, banquet events, housekeeping, inventory,
              and reporting — from one connected platform.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn inView={hero.inView} delay={240} direction="up" distance={12}>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                href={isAuthenticated ? '/dashboard' : '/register-hotel'}
                className="w-full sm:w-auto bg-brand-forest text-white font-semibold px-7 py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm sm:base group transition-all duration-200 hover:bg-brand-forest-light"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-white text-ink font-semibold px-6 py-3.5 rounded-xl border border-border-subtle shadow-2xs flex items-center justify-center text-sm sm:text-base transition-all duration-200 hover:bg-brand-sand/50"
                >
                  Sign In
                </Link>
              )}
            </div>
          </FadeIn>

          {/* Heavy Hero Interactive Visualizer (Dynamically Imported) */}
          <HeroDashboard inView={hero.inView} />
        </div>
      </section>

      {/* ───────────── 3. PRODUCT INTRO ───────────── */}
      <section ref={productIntro.ref} className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn inView={productIntro.inView} delay={0} direction="up">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest max-w-3xl mx-auto leading-tight">
              Everything Your Property Needs.
              <br />
              <span className="text-brand-forest-light">One Connected System.</span>
            </h2>
          </FadeIn>
          <FadeIn inView={productIntro.inView} delay={100} direction="up">
            <p className="mt-3.5 sm:mt-5 text-sm sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
              A unified platform designed to connect every part of hotel operations — from the front desk to
              finance, housekeeping, food & beverage, banquets and management reporting.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 4. MODULES GRID ───────────── */}
      <section
        ref={modulesSection.ref}
        className="bg-white border-y border-border-subtle py-16 sm:py-24 relative overflow-hidden"
        id="features"
      >
        {/* Subtle architectural grid texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 grove-grid-texture"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={modulesSection.inView} delay={0}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                Comprehensive Hospitality Modules
              </h2>
            </FadeIn>
            <FadeIn inView={modulesSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                Twelve integrated modules engineered for boutique hotels, resorts, and premium
                hospitality properties.
              </p>
            </FadeIn>
          </div>

          <StaggerContainer
            inView={modulesSection.inView}
            baseDelay={120}
            staggerMs={50}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4"
          >
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <StaggerItem key={mod.name} index={i}>
                  <FloatingCard
                    hoverY={-4}
                    className="p-5 rounded-2xl bg-brand-sand/30 border border-border-subtle cursor-default group flex flex-col items-start h-full"
                  >
                    <div className="w-10 h-10 bg-brand-forest text-white rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-ink mt-3">{mod.name}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed mt-1.5">{mod.desc}</p>
                  </FloatingCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ───────────── 5. PMS WORKFLOW — Responsive Timeline ───────────── */}
      <section ref={workflowSection.ref} className="py-16 sm:py-20" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <FadeIn inView={workflowSection.inView} delay={0}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                One Platform.
                <br />
                <span className="text-brand-forest-light">Every Operation Connected.</span>
              </h2>
            </FadeIn>
            <FadeIn inView={workflowSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                From the moment a reservation is made to the final report, every step flows through one
                system.
              </p>
            </FadeIn>
          </div>

          {/* Heavy SVG Timeline (Dynamically Imported) */}
          <OperationalTimeline inView={workflowSection.inView} />

          <FadeIn inView={workflowSection.inView} delay={400} className="mt-6 sm:mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-xs font-semibold text-brand-forest">
              <Activity className="w-3.5 h-3.5" />
              <span>Every action creates a connected audit trail</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 6. DASHBOARD SHOWCASE & ANALYTICS ───────────── */}
      <section ref={dashboardShowcase.ref} className="bg-white border-y border-border-subtle py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle architectural grid texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 grove-grid-texture"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={dashboardShowcase.inView} delay={0}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                See Your Property at a Glance.
              </h2>
            </FadeIn>
            <FadeIn inView={dashboardShowcase.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                Real-time operational intelligence — occupancy, revenue, arrivals, room status, pending
                payments, and booking activity — all on one dashboard.
              </p>
            </FadeIn>
          </div>

          {/* Heavy Animated Charts & Metric Counters (Dynamically Imported) */}
          <DashboardShowcaseInteractive inView={dashboardShowcase.inView} />
        </div>
      </section>

      {/* ───────────── 7. MULTI-TENANT ARCHITECTURE ───────────── */}
      <section ref={multiTenant.ref} className="py-16 sm:py-24 overflow-hidden relative" id="multi-tenant-architecture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <FadeIn inView={multiTenant.inView} delay={0}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-brand-forest tracking-tight">
                Built for Multiple Properties.
                <br />
                <span className="text-brand-forest-light">Isolated by Design.</span>
              </h2>
            </FadeIn>
            <FadeIn inView={multiTenant.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2.5 max-w-xl mx-auto leading-relaxed">
                Every property operates in its own secure workspace. Hotel data, staff, bookings,
                billing, reports and settings remain strictly isolated through PostgreSQL Row-Level
                Security.
              </p>
            </FadeIn>
          </div>

          {/* Enhanced Multi-Property Architecture Interactive Diagram */}
          <MultiPropertyArchitecture inView={multiTenant.inView} />
        </div>
      </section>

      {/* ───────────── 8. SECURITY & DATA PROTECTION TRUST SECTION ───────────── */}
      <section ref={securityTrustSection.ref} className="bg-white border-y border-border-subtle py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle architectural grid texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 grove-grid-texture"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={securityTrustSection.inView} delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Trust & Reliability</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                Security & Data Protection
              </h2>
            </FadeIn>
            <FadeIn inView={securityTrustSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                Your hotel&apos;s operational data is separated by property and protected through
                authentication, role-based access controls and database-level tenant isolation.
              </p>
            </FadeIn>
          </div>

          <StaggerContainer
            inView={securityTrustSection.inView}
            baseDelay={120}
            staggerMs={80}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Database,
                title: 'Tenant Isolation',
                desc: 'Hotel data stays strictly separated by property via PostgreSQL Row-Level Security policies.',
              },
              {
                icon: KeyRound,
                title: 'Role-Based Access',
                desc: 'Each staff role (Owner, Manager, Reception, Housekeeping) receives strictly appropriate permissions.',
              },
              {
                icon: Lock,
                title: 'Secure Authentication',
                desc: 'Users authenticate through the PMS authentication system with digitally signed session tokens.',
              },
              {
                icon: Activity,
                title: 'Auditability',
                desc: 'Operational actions (check-ins, check-outs, room charges, payments) generate verifiable audit trails.',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <StaggerItem key={card.title} index={i}>
                  <FloatingCard
                    hoverY={-4}
                    className="p-5 rounded-2xl bg-brand-sand/30 border border-border-subtle h-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-3 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-ink mb-1">{card.title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed">{card.desc}</p>
                  </FloatingCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="text-center mt-8">
            <Link
              href="/security"
              className="text-xs font-semibold text-brand-forest hover:underline inline-flex items-center gap-1"
            >
              <span>Read complete security architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── 9. CUSTOMER CASE STUDY (Hotel Greenery View) ───────────── */}
      <section ref={customerExample.ref} className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <FadeIn inView={customerExample.inView} delay={0}>
              <span className="text-[11px] uppercase tracking-widest font-bold text-brand-forest/60">
                Built for Real Hotel Operations
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest mt-1.5">
                Powering Live Properties Today.
              </h2>
            </FadeIn>
          </div>

          <FadeIn
            inView={customerExample.inView}
            delay={120}
            scale={true}
            className="max-w-lg mx-auto bg-white rounded-3xl border border-border-subtle p-5 sm:p-8 text-center shadow-xs relative overflow-hidden"
          >
            {/* Subtle architectural grid texture */}
            <div
              className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-forest text-white flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                <Hotel className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-brand-forest">Hotel Greenery View</h3>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-xs sm:text-sm text-ink-muted">
                <MapPin className="w-3.5 h-3.5 text-brand-forest/70" />
                <span>Gangtok, Sikkim</span>
              </div>
              <p className="text-xs text-ink-muted mt-3 leading-relaxed max-w-sm mx-auto">
                A boutique hospitality property in the foothills of the Eastern Himalayas, running its
                complete operations — front desk, billing, housekeeping, F&B, and reporting — on {PRODUCT_NAME}.
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-border-subtle">
                <div>
                  <span className="text-base sm:text-lg font-serif font-bold text-brand-forest">19</span>
                  <span className="block text-[10px] text-ink-muted">Rooms</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-serif font-bold text-brand-forest">4</span>
                  <span className="block text-[10px] text-ink-muted">Staff Roles</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-serif font-bold text-brand-forest">12</span>
                  <span className="block text-[10px] text-ink-muted">Modules</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 10. FAQ SECTION ───────────── */}
      <section ref={faqSection.ref} className="bg-white border-y border-border-subtle py-16 sm:py-24 relative overflow-hidden" id="faqs">
        {/* Subtle architectural grid texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 grove-grid-texture"
          aria-hidden="true"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={faqSection.inView} delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                Got Questions? We Have Answers.
              </h2>
            </FadeIn>
            <FadeIn inView={faqSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                Everything you need to know about Grove&apos;s hotel PMS features, architecture, and onboarding.
              </p>
            </FadeIn>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <FadeIn key={faq.q} inView={faqSection.inView} delay={100 + i * 40}>
                  <div className="rounded-2xl border border-border-subtle bg-brand-sand/30 overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-brand-forest hover:text-brand-forest-light transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-brand-forest' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-ink-muted leading-relaxed border-t border-border-subtle/50 mt-1">
                        <p className="pt-3">{faq.a}</p>
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/faqs"
              className="text-xs font-semibold text-brand-forest hover:underline inline-flex items-center gap-1"
            >
              <span>View full knowledge base & FAQs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── 11. FINAL CTA ───────────── */}
      <section ref={ctaSection.ref} className="py-20 sm:py-28 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(31,61,58,0.04) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeIn inView={ctaSection.inView} delay={0}>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest max-w-2xl mx-auto leading-tight">
              Ready to Run Your Property
              <br />
              <span className="text-brand-forest-light">From One Platform?</span>
            </h2>
          </FadeIn>
          <FadeIn inView={ctaSection.inView} delay={80}>
            <p className="mt-3.5 text-xs sm:text-base text-ink-muted max-w-lg mx-auto">
              Bring reservations, operations, billing, housekeeping and reporting into one connected
              system.
            </p>
          </FadeIn>
          <FadeIn inView={ctaSection.inView} delay={160}>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                href="/register-hotel"
                className="w-full sm:w-auto bg-brand-forest text-white font-semibold px-8 py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm sm:text-base group transition-all duration-200 hover:bg-brand-forest-light"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white text-ink font-semibold px-7 py-3.5 rounded-xl border border-border-subtle shadow-2xs flex items-center justify-center text-sm sm:text-base transition-all duration-200 hover:bg-brand-sand/50"
              >
                Sign In
              </Link>
            </div>
          </FadeIn>

          {/* Legal Acknowledgement note */}
          <FadeIn inView={ctaSection.inView} delay={220}>
            <p className="text-[11px] text-ink-muted mt-4 max-w-sm mx-auto">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-brand-forest font-medium hover:underline">
                Terms of Service
              </Link>{' '}
              and acknowledge our{' '}
              <Link href="/privacy-policy" className="text-brand-forest font-medium hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 12. SAAS FOOTER ───────────── */}
      <PublicFooter />
    </div>
  );
}
