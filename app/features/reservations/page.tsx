import type { Metadata } from 'next';
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
  Search,
  Users,
  CreditCard,
  BedDouble,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Reservation Management System',
  description:
    'Centralize guest bookings, check room availability, manage check-in dates, and eliminate double bookings with the Grove PMS reservation management software.',
  alternates: {
    canonical: '/features/reservations',
  },
  openGraph: {
    title: 'Hotel Reservation Management System | Grove PMS',
    description:
      'Centralize guest bookings, check room availability, manage check-in dates, and eliminate double bookings with the Grove PMS reservation management software.',
    url: 'https://www.grovepms.me/features/reservations',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Reservation Management System | Grove PMS',
    description:
      'Centralize guest bookings, check room availability, manage check-in dates, and eliminate double bookings with the Grove PMS reservation management software.',
  },
};

export default function ReservationsFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Reservations', item: '/features/reservations' },
  ]);

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <JsonLd data={breadcrumbSchema} />
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20">
        {/* Breadcrumb Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5">
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

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-6 shadow-2xs">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Central Reservation Registry</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Hotel Reservation Management System
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Eliminate double bookings and manual spreadsheet registers. Coordinate room inventory, advance deposits, stay extensions, and arrival schedules with an intuitive, unified booking engine.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Managing Bookings
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request a Demo
            </GroveButton>
          </div>
        </section>

        {/* Feature Breakdown */}
        <section className="bg-white border-y border-border-subtle py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Unified Booking Intelligence
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                Complete Oversight Across Every Stage of a Reservation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Debounced Real-Time Search</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Search across thousands of reservations by guest name, reservation code, room number, or phone number with sub-50ms search latency.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Automated Status Tracking</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Clear visual state progression: Confirmed, Checked In, Checked Out, and Cancelled. Easily move guests to new rooms or extend stay durations with one click.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Advance Deposit Tracking</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Record advance token amounts paid via UPI, bank transfer, or cash. Deposits automatically credit towards the guest’s final digital folio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Flow */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border-subtle shadow-xs">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest mb-6">
              How Grove Simplifies Hotel Reservations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-brand-sand/20 border border-border-subtle">
                <span className="font-bold text-brand-forest text-base block mb-1">1. Date & Room Check</span>
                Select check-in and check-out dates. Grove automatically calculates room night tariffs and displays vacant categories.
              </div>
              <div className="p-4 rounded-xl bg-brand-sand/20 border border-border-subtle">
                <span className="font-bold text-brand-forest text-base block mb-1">2. Guest Profile Link</span>
                Select an existing guest from your directory or create a new profile with government identity records.
              </div>
              <div className="p-4 rounded-xl bg-brand-sand/20 border border-border-subtle">
                <span className="font-bold text-brand-forest text-base block mb-1">3. Room Allocation</span>
                Assign an inspected, clean room number immediately or keep unassigned until day-of-arrival check-in.
              </div>
              <div className="p-4 rounded-xl bg-brand-sand/20 border border-border-subtle">
                <span className="font-bold text-brand-forest text-base block mb-1">4. Live Sync</span>
                The room instantly blocks off on the front desk matrix, preventing any chance of accidental double bookings.
              </div>
            </div>

            {/* Related Features Internal Links */}
            <div className="mt-10 pt-8 border-t border-border-subtle flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-semibold text-ink-muted">Related Hotel PMS Modules:</span>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-brand-forest">
                <Link href="/features/room-management" className="hover:underline flex items-center gap-1">
                  <span>Room Management</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link href="/features/guest-management" className="hover:underline flex items-center gap-1">
                  <span>Guest Directory</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link href="/features/billing-and-payments" className="hover:underline flex items-center gap-1">
                  <span>Billing & Folios</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-brand-forest text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-2xl font-serif font-bold">Ready to streamline your reservation desk?</h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1">Get started with Grove PMS in minutes. Zero hardware installation required.</p>
            </div>
            <Link
              href="/register-hotel"
              className="mt-4 sm:mt-0 px-6 py-3 rounded-xl bg-white text-brand-forest font-semibold text-xs sm:text-sm hover:bg-brand-sand transition-all inline-block shrink-0"
            >
              Start Free Trial →
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
