import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  CalendarCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Users,
  Search,
  RefreshCw,
  Sliders,
  Calendar,
} from 'lucide-react';

import ReservationsShowcase from '@/components/landing/features/ReservationsShowcase';
import FeatureFaqSection, { type FaqItem } from '@/components/landing/features/FeatureFaqSection';
import FeatureModuleNav from '@/components/landing/features/FeatureModuleNav';
import FeatureConversionBanner from '@/components/landing/features/FeatureConversionBanner';

export const metadata: Metadata = {
  title: 'Hotel Reservation Management System & Visual Tape Chart | Grove PMS',
  description:
    'Coordinate multi-day bookings, advance deposits, meal plans, and room availability with Grove PMS visual calendar and tape chart.',
  alternates: {
    canonical: '/features/reservations',
  },
  openGraph: {
    title: 'Hotel Reservation Management System & Visual Tape Chart | Grove PMS',
    description:
      'Coordinate multi-day bookings, advance deposits, meal plans, and room availability with Grove PMS visual calendar and tape chart.',
    url: 'https://www.grovepms.me/features/reservations',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Reservation Management System & Visual Tape Chart | Grove PMS',
    description:
      'Coordinate multi-day bookings, advance deposits, meal plans, and room availability with Grove PMS visual calendar and tape chart.',
  },
};

const reservationFaqs: FaqItem[] = [
  {
    question: 'How does Grove eliminate double bookings?',
    answer:
      'Grove locks room inventory instantly upon reservation creation. When a room is booked for specific dates, it is automatically blocked across the calendar matrix and tape chart, preventing receptionists or staff from double-allocating the same room.',
  },
  {
    question: 'Can we record partial advance deposits and multiple payment modes?',
    answer:
      'Yes. When taking a direct booking, you can record advance token amounts via UPI, bank transfer, card, or cash. Grove calculates the remaining balance and displays it clearly on the reservation card and arrival schedule.',
  },
  {
    question: 'How easy is it to extend a stay or change room allocation?',
    answer:
      'You can reallocate a guest to a different room or extend their departure date directly from the tape chart in one click. Grove automatically updates the room tariffs and folio charges accordingly.',
  },
  {
    question: 'Can we configure meal plans (EP, CP, MAP, AP)?',
    answer:
      'Yes. Grove supports standard hospitality meal plans: European Plan (Room Only), Continental Plan (Breakfast included), Modified American Plan (Breakfast + Dinner), and American Plan (All Meals). These automatically tag kitchen and restaurant folios.',
  },
];

export default function ReservationsFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Reservations', item: '/features/reservations' },
  ]);

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between relative overflow-x-hidden">
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
            <span className="text-brand-forest font-semibold">Reservations</span>
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
            <span>Grove PMS — Central Reservation Registry</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight max-w-4xl mx-auto leading-[1.10]">
            Smart Reservation Management.
            <br />
            Zero Double Bookings.
          </h1>

          <p className="mt-5 sm:mt-7 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Replace chaotic paper reservation registers and fragmented Excel sheets. Coordinate multi-day stays, track advance token deposits, manage stay extensions, and organize upcoming arrival manifests with effortless elegance.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request a Demo
            </GroveButton>
          </div>

          {/* Interactive Showcase Mockup */}
          <ReservationsShowcase />
        </section>

        {/* ── 4 CORE CAPABILITIES ASYMMETRICAL GRID ── */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
              Booking Engine Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black">
              Complete Control Over Every Guest Stay
            </h2>
            <p className="text-sm sm:text-base text-ink-muted mt-3">
              Designed specifically for independent boutique resorts, heritage properties, and homestays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Capability 1 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Interactive Tape Chart &amp; Visual Timeline
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                View your complete property occupancy across days, weeks, or months on a continuous tape chart. Drag or click any reservation block to inspect guest arrival times, meal plans, and booking sources.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Real-time color-coded stay blocks: Checked-in, Confirmed, Pending</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Instant identification of vacancies between multi-day stays</span>
                </li>
              </ul>
            </div>

            {/* Capability 2 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Advance Deposits &amp; Payment Ledger
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Never lose track of advance token payments. Record UPI receipts, card swipes, or bank transfers during booking, and Grove automatically deducts them from the guest&apos;s final checkout folio.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Auto-calculated balance dues for upcoming check-ins</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Digital advance deposit receipts ready to share on WhatsApp</span>
                </li>
              </ul>
            </div>

            {/* Capability 3 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Direct Booking &amp; Walk-in Capture
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Take direct walk-ins or telephone reservations in under 30 seconds. Fast guest name lookup instantly identifies repeat visitors and automatically fills their ID details and meal preferences.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Support for EP, CP, MAP, and AP hospitality meal plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Special guest notes (honeymoon, late checkout, dietary requests)</span>
                </li>
              </ul>
            </div>

            {/* Capability 4 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Flexible Room Swaps &amp; Stay Extensions
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Guests often wish to extend their stay or switch to a balcony cottage mid-visit. Grove handles room swaps seamlessly, recalculating daily rates and keeping all restaurant and amenity tabs consolidated.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>1-click date extension without voiding existing invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Immediate notification to housekeeping upon room upgrade</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CONNECTED OPERATIONS WORKFLOW ── */}
        <section className="py-16 sm:py-20 bg-white/60 border-y border-[#1C2D29]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Booking Lifecycle
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black">
                From First Inquiry to Checked-In Guest
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  01. CREATE
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Capture Inquiry</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Enter dates, guest count, and room preference. Inventory is immediately placed on hold.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  02. DEPOSIT
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Advance Payment</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Record advance deposit via UPI or card. Instant confirmation receipt sent to guest.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  03. BLOCK
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Tape Chart Lock</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Reservation appears on visual calendar. Zero possibility of duplicate bookings.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  04. ARRIVE
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Express Check-In</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Upon arrival, click &quot;Check-In&quot; to issue keys and activate the digital stay folio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <FeatureFaqSection moduleName="Reservations" faqs={reservationFaqs} />

        {/* ── CONVERSION BANNER ── */}
        <FeatureConversionBanner
          title="Take Total Control Over Your Property Bookings."
          subtitle="Upgrade your hotel with a fast, modern reservation management system that prevents double bookings and delights incoming guests."
          primaryCtaText="Start Free 14-Day Trial"
        />

        {/* ── MODULE NAVIGATION ── */}
        <FeatureModuleNav currentSlug="reservations" />
      </main>

      <PublicFooter />
    </div>
  );
}
