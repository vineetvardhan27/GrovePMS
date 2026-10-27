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
  Scale,
  Receipt,
  Check,
  Clock,
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
import GroveButton from '@/components/shared/GroveButton';
import { createClient } from '@/lib/supabase/client';
import { HeroDashboardSkeleton } from './HeroDashboardMock';
import { OperationalTimelineSkeleton } from './OperationalTimeline';
import { DashboardShowcaseSkeleton } from './DashboardShowcaseInteractive';
import MultiPropertyArchitecture from './MultiPropertyArchitecture';
import HotelPropertyShowcase from './HotelPropertyShowcase';

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
    href: '/features/room-management',
  },
  {
    icon: ClipboardList,
    name: 'Reservations',
    desc: 'Centralized booking engine with date search, room availability, and guest profile linking.',
    href: '/features/reservations',
  },
  {
    icon: BedDouble,
    name: 'Room Management',
    desc: 'Room categories, floor plans, status tracking, maintenance logs, and rate management.',
    href: '/features/room-management',
  },
  {
    icon: Users,
    name: 'Guest Management',
    desc: 'Guest profiles, ID records, stay history, preferences, and communication logs.',
    href: '/features/guest-management',
  },
  {
    icon: CreditCard,
    name: 'Billing & Folios',
    desc: 'Consolidated guest ledgers, room charges, advance deposits, and automated GST invoicing.',
    href: '/features/billing-and-payments',
  },
  {
    icon: Wallet,
    name: 'Payments',
    desc: 'Multi-mode collection — Cash, UPI, Card — with split payments and receipt generation.',
    href: '/features/billing-and-payments',
  },
  {
    icon: UtensilsCrossed,
    name: 'F&B Operations',
    desc: 'KOT generation, table orders, room charge posting, walk-in dining, and menu sync.',
    href: '/hotel-management-software',
  },
  {
    icon: PartyPopper,
    name: 'Banquet & Events',
    desc: 'Hall bookings, decor packages, catering, stage lighting, and standalone event invoicing.',
    href: '/hotel-management-software',
  },
  {
    icon: Sparkles,
    name: 'Housekeeping',
    desc: 'Room turnaround tracking — dirty, in-progress, inspected, out-of-order — in real time.',
    href: '/features/room-management',
  },
  {
    icon: Warehouse,
    name: 'Inventory',
    desc: 'Stock management, purchase orders, consumption tracking, and low-stock alerts.',
    href: '/features/inventory-management',
  },
  {
    icon: BarChart3,
    name: 'Reports & Analytics',
    desc: 'ADR, RevPAR, occupancy analytics, shift handovers, and monthly GST return exports.',
    href: '/features/reports',
  },
  {
    icon: Settings,
    name: 'Hotel Settings',
    desc: 'Tax configuration, staff management, property details, room categories, and access control.',
    href: '/security',
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
 * CASE STUDY PROPERTY DATA
 * ══════════════════════════════════════════════ */
const caseStudyProperty = {
  statusTag: 'Live',
  typeTag: 'Boutique Hotel',
  locationTag: 'Gangtok, Sikkim',
  title: 'Hotel Greenery View',
  description: 'One platform for reservations, billing, housekeeping and dining.',
  sectionLabel: 'Active modules',
  modules: [
    'Front Desk',
    'Guest Billing',
    'Housekeeping',
    'F&B & KOT',
    'Owner Reports',
  ],
  ctaLabel: 'View Grove PMS',
};

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
      }).catch(() => { });
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
  const pricingSection = useInView();
  const complianceSection = useInView();
  const aboutSection = useInView();
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
            <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-5 sm:mb-6 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-brand-forest/80" />
              <span>Grove PMS — Unified Property Management</span>
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn inView={hero.inView} delay={80} direction="up" distance={16}>
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
              Hotel Property Management Software
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
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <GroveButton
                href={isAuthenticated ? '/dashboard' : '/register-hotel'}
                variant="primary"
                size="lg"
                withArrow
                className="w-full sm:w-auto"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </GroveButton>
              {!isAuthenticated && (
                <GroveButton
                  href="/login"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sign In
                </GroveButton>
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
              const cardContent = (
                <FloatingCard
                  hoverY={-4}
                  className="grove-glass-card p-5 sm:p-6 rounded-2xl cursor-pointer group flex flex-col items-start h-full"
                >
                  <div className="w-10 h-10 bg-brand-forest text-white rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-ink mt-3.5 flex items-center justify-between w-full">
                    <span>{mod.name}</span>
                    {mod.href && (
                      <ArrowRight className="w-3.5 h-3.5 text-brand-forest opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed mt-1.5">{mod.desc}</p>
                </FloatingCard>
              );

              return (
                <StaggerItem key={mod.name} index={i}>
                  {mod.href ? (
                    <Link
                      href={mod.href}
                      className="block h-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-forest rounded-2xl"
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    cardContent
                  )}
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Section Call to Action */}
          <div className="mt-10 sm:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <GroveButton href="/hotel-management-software" variant="primary" withArrow>
              Explore Full Platform Architecture
            </GroveButton>
            <GroveButton href="/register-hotel" variant="secondary">
              Start Free Trial
            </GroveButton>
          </div>
        </div>
      </section>

      {/* ───────────── 5. PMS WORKFLOW — Responsive Timeline ───────────── */}
      <section ref={workflowSection.ref} className="py-16 sm:py-24" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={workflowSection.inView} delay={0}>
              <h2 className="text-[clamp(1.75rem,3.2vw+0.6rem,2.5rem)] font-serif font-bold text-brand-forest leading-[1.18] tracking-tight">
                One Platform.
                <br />
                <span className="text-brand-forest-light">Every Operation Connected.</span>
              </h2>
            </FadeIn>
            <FadeIn inView={workflowSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2.5 max-w-xl mx-auto leading-relaxed">
                From the moment a reservation is made to the final report, every step flows through one
                system.
              </p>
            </FadeIn>
          </div>

          {/* Interactive Connected Operations Flow & Upgraded Audit-Trail Badge */}
          <OperationalTimeline inView={workflowSection.inView} />

          {/* Section Call to Action */}
          <div className="mt-10 sm:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <GroveButton href="/register-hotel" variant="primary" withArrow>
              Start Connected Operations
            </GroveButton>
            <GroveButton href="/contact" variant="secondary">
              Schedule Property Walkthrough
            </GroveButton>
          </div>
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
            <FadeIn inView={dashboardShowcase.inView} delay={0} direction="up" distance={16}>
              <h2 className="text-[clamp(1.5rem,3.2vw+0.6rem,2.25rem)] font-serif font-bold text-brand-forest leading-tight tracking-tight">
                See Your Property at a Glance.
              </h2>
            </FadeIn>
            <FadeIn inView={dashboardShowcase.inView} delay={90} direction="up" distance={14}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2.5 max-w-xl mx-auto leading-relaxed">
                Real-time operational intelligence — occupancy, revenue, arrivals, room status, pending
                payments, and booking activity — all on one dashboard.
              </p>
            </FadeIn>
          </div>

          {/* Heavy Animated Charts & Metric Counters (Dynamically Imported) */}
          <DashboardShowcaseInteractive inView={dashboardShowcase.inView} />

          {/* Section Call to Action */}
          <div className="mt-10 sm:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <GroveButton href="/register-hotel" variant="primary" withArrow>
              Access Live Control Centre
            </GroveButton>
            <GroveButton href="/#multi-tenant-architecture" variant="secondary">
              Explore Tenant Isolation Architecture
            </GroveButton>
          </div>

          {/* Fallback for JavaScript-disabled environments */}
          <noscript>
            <div className="mt-4 bg-brand-sand/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border-subtle">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                  { label: 'Occupancy', val: '78%' },
                  { label: "Today's Revenue", val: '₹86K' },
                  { label: 'Arrivals', val: '18' },
                  { label: 'Departures', val: '6' },
                  { label: 'Pending Payments', val: '3' },
                  { label: 'Available Rooms', val: '12' },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-xl p-3 border border-border-subtle">
                    <span className="text-[10px] uppercase font-bold text-ink-muted block">{item.label}</span>
                    <div className="text-xl font-serif font-bold text-brand-forest mt-0.5">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </noscript>
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

          {/* Section Call to Action */}
          <div className="mt-10 sm:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <GroveButton href="/register-hotel" variant="primary" withArrow>
              Provision Hotel Workspace
            </GroveButton>
            <GroveButton href="/security" variant="secondary" withArrow>
              Review Data Protection Architecture
            </GroveButton>
          </div>
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
              <div className="grove-glass-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-brand-forest text-xs font-semibold mb-3 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-forest/80" />
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
                    className="grove-glass-card p-5 sm:p-6 rounded-2xl h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-3 shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif font-bold text-base text-ink mb-1">{card.title}</h3>
                      <p className="text-xs text-ink-muted leading-relaxed">{card.desc}</p>
                    </div>
                  </FloatingCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="mt-10 sm:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <GroveButton href="/security" variant="primary" withArrow>
              Read Complete Security Architecture
            </GroveButton>
            <GroveButton href="/compliance" variant="secondary">
              View Operational Compliance Standards
            </GroveButton>
          </div>
        </div>
      </section>

      {/* ───────────── 9. CUSTOMER CASE STUDY (Hotel Greenery View) ───────────── */}
      <section ref={customerExample.ref} className="py-20 sm:py-28 relative overflow-hidden" id="live-properties">
        {/* Soft atmospheric radial glow behind the showcase */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(31, 61, 58, 0.045) 0%, rgba(46, 90, 84, 0.015) 50%, transparent 80%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <FadeIn inView={customerExample.inView} delay={0} direction="up" distance={12}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/6 border border-brand-forest/15 text-brand-forest text-[11px] font-semibold uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Built for Real Hotel Operations</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-bold text-brand-forest tracking-tight leading-[1.15]">
                Powering Live Properties Today.
              </h2>
            </FadeIn>
            <FadeIn inView={customerExample.inView} delay={60} direction="up" distance={12}>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-ink-muted leading-relaxed">
                Real hospitality teams. Real daily operations. One connected platform.
              </p>
            </FadeIn>
          </div>

          {/* Premium Customer Showcase Card */}
          <FadeIn inView={customerExample.inView} delay={120} direction="up" distance={16}>
            <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-border-subtle/80 shadow-[0_16px_40px_-15px_rgba(31,61,58,0.07)] overflow-hidden transition-all duration-300 hover:shadow-[0_24px_50px_-15px_rgba(31,61,58,0.11)]">
              {/* Top: 2-Column Property Presentation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Left Column: Property Identity & Context */}
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-4 sm:space-y-5">
                  {/* Live status badge & property tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {caseStudyProperty.statusTag}
                    </span>
                    <span className="text-[11px] font-medium text-ink-muted/90 bg-brand-sand/70 px-2.5 py-1 rounded-full border border-border-subtle/50">
                      {caseStudyProperty.typeTag}
                    </span>
                    <span className="text-[11px] font-medium text-ink-muted/90 bg-brand-sand/70 px-2.5 py-1 rounded-full border border-border-subtle/50">
                      {caseStudyProperty.locationTag}
                    </span>
                  </div>

                  {/* Hotel Title */}
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-forest tracking-tight">
                    {caseStudyProperty.title}
                  </h3>

                  {/* Refined Concise Description */}
                  <p className="text-sm sm:text-[15px] text-ink-muted leading-relaxed">
                    {caseStudyProperty.description}
                  </p>

                  {/* Thin Subtle Divider */}
                  <div className="h-px bg-border-subtle/50 w-full" aria-hidden="true" />

                  {/* Neatly Arranged Pill-Shaped Modules Badges */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-forest/65">
                      {caseStudyProperty.sectionLabel}
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {caseStudyProperty.modules.map((module) => (
                        <span
                          key={module}
                          className="inline-flex items-center text-[10.5px] sm:text-[11px] font-medium text-brand-forest/90 bg-[#F6F3ED] border border-[#E7E2D6] px-2.5 py-0.5 rounded-full transition-colors hover:bg-[#EFECE3]"
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Upgraded Premium Emerald Button CTA */}
                  <div className="pt-1 sm:pt-2">
                    <Link
                      href="/#features"
                      className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-forest text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md hover:bg-brand-forest-light hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <span>{caseStudyProperty.ctaLabel}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-emerald-300" />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Visual Property Panel with Authentic Hotel Photograph */}
                <HotelPropertyShowcase className="lg:col-span-5" />
              </div>

              {/* Bottom Shelf: Visually Integrated Statistics Row */}
              <div className="border-t border-border-subtle/80 bg-brand-sand/35 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle/80">
                {/* Metric 1: 19 Rooms */}
                <div className="p-5 sm:p-6 lg:p-7 flex items-center gap-4 group transition-colors hover:bg-white/60">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-border-subtle/80 shadow-2xs flex items-center justify-center text-brand-forest group-hover:scale-105 transition-transform duration-200 shrink-0">
                    <BedDouble className="w-6 h-6 text-brand-forest" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight tabular-nums">
                        19
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest/60">
                        Units
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-ink-muted block mt-0.5">
                      Rooms Managed Live
                    </span>
                  </div>
                </div>

                {/* Metric 2: 4 Staff Roles */}
                <div className="p-5 sm:p-6 lg:p-7 flex items-center gap-4 group transition-colors hover:bg-white/60">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-border-subtle/80 shadow-2xs flex items-center justify-center text-brand-forest group-hover:scale-105 transition-transform duration-200 shrink-0">
                    <Users className="w-6 h-6 text-brand-forest" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight tabular-nums">
                        4
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest/60">
                        Tiers
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-ink-muted block mt-0.5">
                      Active Staff Roles
                    </span>
                  </div>
                </div>

                {/* Metric 3: 12 Modules */}
                <div className="p-5 sm:p-6 lg:p-7 flex items-center gap-4 group transition-colors hover:bg-white/60">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-border-subtle/80 shadow-2xs flex items-center justify-center text-brand-forest group-hover:scale-105 transition-transform duration-200 shrink-0">
                    <Layers className="w-6 h-6 text-brand-forest" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight tabular-nums">
                        12
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest/60">
                        Integrated
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-ink-muted block mt-0.5">
                      Modules in Daily Use
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 10. PRICING & IMPLEMENTATION SECTION ───────────── */}
      <section ref={pricingSection.ref} className="py-20 sm:py-28 bg-white border-y border-border-subtle relative overflow-hidden" id="pricing">
        {/* Subtle architectural grid texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 grove-grid-texture"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <FadeIn inView={pricingSection.inView} delay={0} direction="up" distance={12}>
              <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-3 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                <span>Transparent Hospitality Pricing</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-bold text-brand-forest tracking-tight leading-[1.15]">
                Simple, Predictable Pricing.
              </h2>
            </FadeIn>
            <FadeIn inView={pricingSection.inView} delay={60} direction="up" distance={12}>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-ink-muted leading-relaxed">
                No percentage cuts of hotel revenue, no surprise booking commissions. Complete software plus white-glove onboarding.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch max-w-5xl mx-auto">
            {/* Card 1: Featured Monthly Subscription */}
            <FadeIn
              inView={pricingSection.inView}
              delay={100}
              direction="up"
              distance={16}
              className="lg:col-span-7 flex"
            >
              <div className="grove-glass-card w-full rounded-[28px] p-6 sm:p-8 lg:p-9 border-2 border-brand-forest/25 relative flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_-12px_rgba(31,61,58,0.12)]">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      All-Inclusive Platform
                    </span>
                    <span className="text-[11px] font-semibold text-status-green bg-status-green/10 px-2.5 py-0.5 rounded-full border border-status-green/20">
                      Zero Commission
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-forest">
                    Grove Operating System
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                    Full-stack PMS for independent hotels, boutique properties, homestays, and guesthouses.
                  </p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-serif font-bold text-4xl sm:text-5xl text-brand-forest tabular-nums">
                      ₹999
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-ink-muted">
                      / month per hotel
                    </span>
                  </div>

                  <ul className="mt-6 sm:mt-7 space-y-2.5 text-xs sm:text-sm text-ink">
                    {[
                      'Complete Front Desk Matrix & Room Availability',
                      'Guest Folios, Split Billing & Indian GST Invoicing',
                      'Housekeeping Real-Time Turnaround Management',
                      'Restaurant & Bar Table Orders with KOT Printing',
                      'Banquet Event Packages & Booking Advance Tracking',
                      'Owner Daily Summary & Monthly GSTR Tax Reports',
                      'Role-Based Staff Access (Owner, Manager, Reception, Housekeeping)',
                      'Continuous Cloud Backups & Tenant Isolation (RLS)',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-status-green/15 text-status-green flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border-subtle/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
                    Get Started with Grove
                  </GroveButton>
                  <span className="text-xs text-ink-muted">No credit card required to explore</span>
                </div>
              </div>
            </FadeIn>

            {/* Card 2: White-Glove Onboarding Support */}
            <FadeIn
              inView={pricingSection.inView}
              delay={160}
              direction="up"
              distance={16}
              className="lg:col-span-5 flex"
            >
              <div className="grove-glass-card w-full rounded-[28px] p-6 sm:p-8 border border-border-subtle/90 flex flex-col justify-between bg-white/70">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sand border border-border-subtle text-brand-forest text-[11px] font-bold uppercase tracking-wider">
                      Turnkey Setup
                    </span>
                    <span className="text-[11px] font-mono text-ink-muted font-medium">48-72h Go-Live</span>
                  </div>

                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-brand-forest">
                    White-Glove Implementation
                  </h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    We configure your entire property setup so your front desk and management teams are confident from day one.
                  </p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-serif font-bold text-3xl sm:text-4xl text-brand-forest tabular-nums">
                      ₹10,000
                    </span>
                    <span className="text-xs font-semibold text-ink-muted">
                      one-time setup
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs sm:text-[13px] text-ink-muted">
                    {[
                      'Room inventory & floor mapping',
                      'Tariff slabs, seasons & extra amenity rules',
                      'GSTIN, SAC codes & invoice letterhead branding',
                      'Staff role provisioning & permission setup',
                      'Migration of current guest and booking records',
                      'Live interactive training session for front desk team',
                      'Dedicated WhatsApp & phone onboarding specialist',
                    ].map((step) => (
                      <li key={step} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-brand-forest/10 text-brand-forest flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-border-subtle/70">
                  <GroveButton href="/pricing" variant="secondary" size="md" withArrow className="w-full">
                    View Full Pricing & FAQs
                  </GroveButton>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ───────────── 11. COMPLIANCE & RESPONSIBLE OPERATIONS ───────────── */}
      <section ref={complianceSection.ref} className="py-20 sm:py-28 relative overflow-hidden" id="compliance">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <FadeIn inView={complianceSection.inView} delay={0} direction="up" distance={12}>
              <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-3 shadow-2xs">
                <Scale className="w-3.5 h-3.5 text-brand-forest/80" />
                <span>Operational Compliance</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-bold text-brand-forest tracking-tight leading-[1.15]">
                Built for Responsible Hospitality Operations.
              </h2>
            </FadeIn>
            <FadeIn inView={complianceSection.inView} delay={60} direction="up" distance={12}>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-ink-muted leading-relaxed">
                Standardized workflows for tax compliance, verifiable guest registers, and immutable shift audit trails.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Receipt,
                title: 'GST Invoicing & Tax Ledgers',
                desc: 'Automated CGST, SGST, and IGST computations, SAC classification, sequential numbering, and monthly GSTR summary exports.',
                link: '/compliance',
              },
              {
                icon: Users,
                title: 'Digital Guest Registration',
                desc: 'Structured guest profiles with photo ID verification, check-in timestamps, and municipal guest register logs.',
                link: '/compliance',
              },
              {
                icon: ShieldCheck,
                title: 'Staff Roles & Shift Audits',
                desc: 'Role-based access permissions, immutable shift handover logs, void tracking, and database-level tenant isolation.',
                link: '/compliance',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.title} inView={complianceSection.inView} delay={100 + idx * 60} direction="up" distance={16}>
                  <div className="grove-glass-card rounded-2xl p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-4 shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif font-bold text-lg text-brand-forest mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border-subtle/50">
                      <Link
                        href={item.link}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light group transition-colors"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <div className="mt-10 sm:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <GroveButton href="/compliance" variant="primary" withArrow>
              Explore Compliance Standards
            </GroveButton>
            <GroveButton href="/contact" variant="secondary">
              Contact Regulatory Team
            </GroveButton>
          </div>
        </div>
      </section>

      {/* ───────────── 12. ABOUT & MISSION SPOTLIGHT ───────────── */}
      <section ref={aboutSection.ref} className="py-16 sm:py-24 bg-white border-y border-border-subtle relative overflow-hidden" id="about">
        {/* Subtle architectural grid texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 grove-grid-texture"
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn inView={aboutSection.inView} delay={0} direction="up" distance={16}>
            <div className="grove-glass-panel rounded-[32px] p-8 sm:p-12 lg:p-14 border border-white/90 shadow-[0_20px_50px_-15px_rgba(31,61,58,0.08)] relative overflow-hidden">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/6 border border-brand-forest/15 text-brand-forest text-[11px] font-semibold uppercase tracking-widest mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-brand-forest" />
                  <span>About Grove</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-brand-forest tracking-tight leading-snug">
                  Technology Crafted to Bring Calm to Hotel Operations.
                </h2>
                <p className="mt-4 text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Traditional hospitality software is often fragmented across separate point solutions — paper registers, legacy desktop programs, and disconnected spreadsheets. Grove was created to unify every operational department into one intuitive, cloud-connected operating system.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <GroveButton href="/about" variant="primary" withArrow>
                    Read Our Story & Philosophy
                  </GroveButton>
                  <GroveButton href="/contact" variant="secondary">
                    Talk with Our Team
                  </GroveButton>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 13. FAQ SECTION ───────────── */}
      <section ref={faqSection.ref} className="py-16 sm:py-24 relative overflow-hidden" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={faqSection.inView} delay={0}>
              <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-3 shadow-2xs">
                <HelpCircle className="w-3.5 h-3.5 text-brand-forest/80" />
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
                  <div className="grove-glass-card rounded-2xl overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-brand-forest hover:text-brand-forest-light transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-forest' : ''
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

          <div className="mt-10 sm:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <GroveButton href="/faqs" variant="primary" withArrow>
              View Full Knowledge Base & FAQs
            </GroveButton>
            <GroveButton href="/contact" variant="secondary">
              Contact Hospitality Support
            </GroveButton>
          </div>
        </div>
      </section>

      {/* ───────────── 14. FINAL CTA ───────────── */}
      <section ref={ctaSection.ref} className="py-12 sm:py-16 lg:py-20 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(31,61,58,0.035) 0%, transparent 65%)',
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn inView={ctaSection.inView} delay={0} direction="up" distance={16}>
            <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] p-7 sm:p-10 lg:p-12 text-center bg-gradient-to-b from-white/95 via-white/90 to-[#FAF6F0]/90 backdrop-blur-xl border border-white/85 shadow-[0_20px_50px_-15px_rgba(31,61,58,0.08),0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_24px_60px_-15px_rgba(31,61,58,0.11)]">
              {/* Delicate grid texture */}
              <div
                className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture opacity-30"
                aria-hidden="true"
              />

              {/* Soft ambient lighting */}
              <div
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/5 rounded-full blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#d4a373]/8 rounded-full blur-3xl"
                aria-hidden="true"
              />

              {/* Top hairline highlight for glassmorphism */}
              <div
                className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
                aria-hidden="true"
              />

              <div className="relative z-10">
                {/* Balanced 2-line headline */}
                <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] text-brand-forest tracking-tight leading-[1.2] max-w-2xl mx-auto">
                  Your Entire Property.
                  <br className="hidden sm:inline" />
                  <span className="block sm:inline sm:ml-2">One Powerful Platform.</span>
                </h2>

                {/* Subtitle */}
                <p className="mt-3 sm:mt-3.5 text-xs sm:text-sm md:text-[15px] text-ink-muted max-w-xl mx-auto leading-relaxed">
                  Manage reservations, front desk, guest billing, housekeeping, and restaurant operations—all in one seamless workspace.
                </p>

                {/* Single aligned CTA button row */}
                <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-md sm:max-w-none mx-auto">
                  <Link
                    href="/register-hotel"
                    className="cta-primary whitespace-nowrap inline-flex items-center justify-center text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-full font-medium text-white shadow-[0_8px_20px_-4px_rgba(22,61,55,0.25)] hover:shadow-[0_12px_24px_-4px_rgba(22,61,55,0.32)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group"
                  >
                    <span>Get Started Today</span>
                    <ArrowRight
                      className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1 text-emerald-300 shrink-0"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    href="/login"
                    className="cta-secondary whitespace-nowrap inline-flex items-center justify-center text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-full font-medium text-brand-forest transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Sign In to Existing Property</span>
                  </Link>
                </div>

                {/* Legal note closer to buttons */}
                <p className="text-[11px] text-ink-muted/70 mt-3 sm:mt-3.5 max-w-sm mx-auto leading-normal">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-brand-forest/90 font-medium hover:underline hover:text-brand-forest">
                    Terms of Service
                  </Link>{' '}
                  and acknowledge our{' '}
                  <Link href="/privacy-policy" className="text-brand-forest/90 font-medium hover:underline hover:text-brand-forest">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 12. SAAS FOOTER ───────────── */}
      <PublicFooter />
    </div>
  );
}
