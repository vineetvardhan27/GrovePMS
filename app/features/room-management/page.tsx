import type { Metadata } from 'next';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  BedDouble,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Layers,
  Wrench,
  Clock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Room Management & Front Desk Software',
  description:
    'Visual room matrix, room status tracking, floor layout oversight, and real-time housekeeping turnarounds for hotel front desk operators.',
  alternates: {
    canonical: '/features/room-management',
  },
  openGraph: {
    title: 'Hotel Room Management & Front Desk Software | Grove PMS',
    description:
      'Visual room matrix, room status tracking, floor layout oversight, and real-time housekeeping turnarounds for hotel front desk operators.',
    url: 'https://www.grovepms.me/features/room-management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Room Management & Front Desk Software | Grove PMS',
    description:
      'Visual room matrix, room status tracking, floor layout oversight, and real-time housekeeping turnarounds for hotel front desk operators.',
  },
};

export default function RoomManagementFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Room Management', item: '/features/room-management' },
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
            <span className="text-brand-forest font-semibold">Room Management</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-6 shadow-2xs">
            <BedDouble className="w-3.5 h-3.5" />
            <span>Interactive Room Matrix</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Hotel Room Management & Front Desk Software
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Give your reception and housekeeping teams complete real-time clarity. View room statuses across all floors, trigger express check-ins, record maintenance flags, and coordinate instant cleaning turnarounds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Explore Room Matrix
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Schedule Front Desk Demo
            </GroveButton>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="bg-white border-y border-border-subtle py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Operational Efficiency
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                Precision Control Over Every Room on Your Property
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Floor-by-Floor Architecture</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Organize rooms intuitively across floors, buildings, or cottages. Filter instantly by room type (Deluxe, Suite, Executive) or cleaning status.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Live Housekeeping States</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Clean & Available, Occupied Dirty, Cleaning In-Progress, or Out-of-Order. Reception sees cleaning updates the second housekeeping finishes inspection.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Maintenance & Blocking</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Place rooms out of inventory for scheduled plumbing, painting, or AC repairs with custom notes, ensuring they are excluded from available booking inventory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Links Navigation */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-xl text-brand-forest">Explore Other Grove PMS Modules</h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">Connect your room operations with billing, reservations, and inventory.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-forest">
              <Link href="/features/reservations" className="hover:underline flex items-center gap-1">
                <span>Reservations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/features/billing-and-payments" className="hover:underline flex items-center gap-1">
                <span>Billing & Folios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/features/inventory-management" className="hover:underline flex items-center gap-1">
                <span>Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
