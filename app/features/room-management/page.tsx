import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  BedDouble,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
  Wrench,
  Clock,
  ShieldCheck,
  Building2,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';

import RoomManagementShowcase from '@/components/landing/features/RoomManagementShowcase';
import FeatureFaqSection, { type FaqItem } from '@/components/landing/features/FeatureFaqSection';
import FeatureModuleNav from '@/components/landing/features/FeatureModuleNav';
import FeatureConversionBanner from '@/components/landing/features/FeatureConversionBanner';

export const metadata: Metadata = {
  title: 'Hotel Room Management & Interactive Front Desk Matrix | Grove PMS',
  description:
    'Real-time visual room matrix, floor-by-floor layout, automated housekeeping turnarounds, and instant maintenance blocking for boutique hotels and resorts.',
  alternates: {
    canonical: '/features/room-management',
  },
  openGraph: {
    title: 'Hotel Room Management & Interactive Front Desk Matrix | Grove PMS',
    description:
      'Real-time visual room matrix, floor-by-floor layout, automated housekeeping turnarounds, and instant maintenance blocking for boutique hotels and resorts.',
    url: 'https://www.grovepms.me/features/room-management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Room Management & Interactive Front Desk Matrix | Grove PMS',
    description:
      'Real-time visual room matrix, floor-by-floor layout, automated housekeeping turnarounds, and instant maintenance blocking for boutique hotels and resorts.',
  },
};

const roomFaqs: FaqItem[] = [
  {
    question: 'How does Grove synchronize room status between Reception and Housekeeping?',
    answer:
      'Whenever front desk checks in or checks out a guest, the room status updates instantly across all devices without page refreshes. Housekeeping staff can mark rooms as "Cleaning In-Progress" or "Clean & Inspected" directly from their mobile phones or tablets, giving reception immediate green-light availability.',
  },
  {
    question: 'Can we configure custom room categories and multi-building layouts?',
    answer:
      'Yes. Grove allows full customization of floors, wings, heritage cottages, and villas. You can set individual room base tariffs, extra bed charges, amenities, and default maximum occupancies for Deluxe Kings, Twin Suites, and Villas.',
  },
  {
    question: 'How does maintenance blocking (Out of Order) work?',
    answer:
      'If an AC, plumbing, or painting repair is needed, you can mark the room as Out-of-Order with custom maintenance notes and an expected restoration date. Grove automatically excludes these rooms from available sellable inventory so receptionists cannot accidentally assign them.',
  },
  {
    question: 'Is the room matrix fast on mobile phones and tablets?',
    answer:
      'Yes. The room matrix is engineered with responsive glassmorphic cards and touch-optimized controls. Whether your manager is walking the property with an iPad or reception is at a desktop terminal, all statuses load instantaneously.',
  },
];

export default function RoomManagementFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Room Management', item: '/features/room-management' },
  ]);

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between relative overflow-x-hidden">
      {/* Page-wide subtle architectural grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 grove-grid-texture opacity-85"
        aria-hidden="true"
      />
      <JsonLd data={breadcrumbSchema} />
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-12">
        {/* ── BREADCRUMB BAR ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5 font-medium">
            <Link href="/" className="hover:text-brand-forest transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/hotel-management-software" className="hover:text-brand-forest transition-colors">
              Features
            </Link>
            <span>/</span>
            <span className="text-brand-forest font-semibold">Room Management</span>
          </nav>
        </div>

        {/* ── HERO SECTION ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8 sm:pb-12">
          <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-5 sm:mb-6 shadow-2xs">
            <Image
              src="/Grove.png"
              alt="Grove Logo"
              width={16}
              height={16}
              className="w-4 h-4 object-contain shrink-0"
            />
            <span>Grove PMS — Interactive Front Desk Matrix</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight max-w-4xl mx-auto leading-[1.10]">
            Complete Room Clarity.
            <br />
            Across Every Floor and Wing.
          </h1>

          <p className="mt-5 sm:mt-7 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Eliminate walk-around room checks and chalkboard matrices. Monitor live floor plans, express guest check-ins, real-time housekeeping turnarounds, and maintenance flags on one responsive interface.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Schedule Front Desk Demo
            </GroveButton>
          </div>

          {/* Interactive Room Matrix Showcase Mockup */}
          <RoomManagementShowcase />
        </section>

        {/* ── 4 CORE CAPABILITIES ASYMMETRICAL GRID ── */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
              Operational Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black">
              Precision Engineering for Busy Front Desks
            </h2>
            <p className="text-sm sm:text-base text-ink-muted mt-3">
              Built from ground-up for front-office receptionists, executive housekeepers, and general managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Capability 1 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Floor-by-Floor Architectural Views
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Group rooms intuitively by floors, wings, private cottages, or executive villas. Filter in one click to view only Available, Occupied, or Cleaning rooms, minimizing front desk wait times during peak morning arrivals.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Customizable floor naming and wing grouping</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Configurable room types, tariffs, and extra bed policies</span>
                </li>
              </ul>
            </div>

            {/* Capability 2 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Instant Housekeeping Turnaround Sync
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Connect your housekeeping supervisors directly with front-desk reception. When a room is inspected and marked clean, it immediately updates to ready-to-sell across all front desk terminals without intercom calls.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Color-coded status pills: OCC (Red), AVL (Green), CLN (Amber)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Housekeeper assignment and timestamped inspection logs</span>
                </li>
              </ul>
            </div>

            {/* Capability 3 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Maintenance Blocking &amp; Out-of-Order Flags
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Take rooms temporarily offline for scheduled deep-cleaning, plumbing maintenance, or painting. Out-of-order rooms are mathematically excluded from available inventory, completely preventing accidental double-allocations.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Log engineering work orders with technician notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Automatic adjustment of sellable inventory and ADR statistics</span>
                </li>
              </ul>
            </div>

            {/* Capability 4 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                One-Click Folio &amp; Stay Inspection
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Clicking any room tile opens an instant contextual inspector showing the occupant name, stay dates, outstanding charges, food orders, and special guest preferences. No navigating between five separate menus.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Instant access to guest profile and WhatsApp confirmation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>1-click room upgrade or stay extension directly from matrix</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CONNECTED OPERATIONS WORKFLOW ── */}
        <section className="py-16 sm:py-20 landing-section-flow border-y border-[#1C2D29]/8 dark:border-[rgba(137,184,153,0.12)] relative overflow-hidden">
          {/* Soft hospitality ambient glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 70% 45% at 50% 25%, rgba(66, 201, 149, 0.065) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Operational Lifecycle
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black">
                How Rooms Flow Through Grove
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  01. ASSIGN
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Arrival &amp; Check-in</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Reception selects an inspected available room and confirms guest ID in seconds.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  02. OCCUPY
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Active Stay &amp; POS</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Tile turns red (OCC). Restaurant KOTs and amenities auto-post to the room folio.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  03. DEPART
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Checkout &amp; Dirty</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Upon bill settlement, the room shifts instantly to yellow (CLN) alerting housekeeping.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  04. INSPECT
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Inspected &amp; Ready</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Housekeeper confirms clean status on mobile; room turns green (AVL) for new guests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <FeatureFaqSection moduleName="Room Management" faqs={roomFaqs} />

        {/* ── CONVERSION BANNER ── */}
        <FeatureConversionBanner
          title="Empower Your Front Desk with Real-Time Room Visibility."
          subtitle="Join boutique hotels and independent resorts that use Grove PMS to eliminate room allocation errors, accelerate check-ins, and streamline housekeeping."
          primaryCtaText="Get Started with Grove PMS"
        />

        {/* ── MODULE NAVIGATION ── */}
        <FeatureModuleNav currentSlug="room-management" />
      </main>

      <PublicFooter />
    </div>
  );
}
