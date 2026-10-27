import type { Metadata } from 'next';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  Hotel,
  Layers,
  CalendarCheck,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Building2,
  Clock,
  Compass,
  FileSpreadsheet,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Property Management Software (PMS)',
  description:
    'Cloud-based hotel property management software built for independent hotels, boutique resorts, and operators. Unify front desk, reservations, billing, and reports.',
  alternates: {
    canonical: '/hotel-management-software',
  },
  openGraph: {
    title: 'Hotel Property Management Software (PMS) | Grove PMS',
    description:
      'Cloud-based hotel property management software built for independent hotels, boutique resorts, and operators. Unify front desk, reservations, billing, and reports.',
    url: 'https://www.grovepms.me/hotel-management-software',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Property Management Software (PMS) | Grove PMS',
    description:
      'Cloud-based hotel property management software built for independent hotels, boutique resorts, and operators. Unify front desk, reservations, billing, and reports.',
  },
};

export default function HotelManagementSoftwarePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Hotel Management Software', item: '/hotel-management-software' },
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
            <span className="text-brand-forest font-semibold">Hotel Management Software</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-6 shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
            <span>Complete Hotel PMS Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Modern Hotel Property Management Software
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Grove PMS replaces fragmented spreadsheets, disconnected POS terminals, and paper registers with an all-in-one cloud property management system tailored for boutique hotels, independent lodges, and multi-property hospitality groups.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/pricing" variant="secondary" size="lg" className="w-full sm:w-auto">
              View Transparent Pricing
            </GroveButton>
          </div>
        </section>

        {/* Core Operational Pillar Highlights */}
        <section className="bg-white border-y border-border-subtle py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Operational Foundation
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                Engineered for Every Corner of Your Property
              </h2>
              <p className="text-sm sm:text-base text-ink-muted mt-3">
                From real-time front desk room allocation to automated GST checkout folios and kitchen order tickets, discover how Grove brings operational calm to hoteliers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle hover:border-brand-forest/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-4">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Visual Front Desk & Matrix</h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                  Interactive multi-day calendar view displaying real-time room statuses, arrival checklists, guest identities, and express check-in workflows.
                </p>
                <Link
                  href="/features/room-management"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-4"
                >
                  <span>Explore Room Management</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle hover:border-brand-forest/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Automated Billing & Folios</h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                  Consolidated guest ledgers combining room tariffs, extra beds, restaurant KOTs, and amenities with automated GST tax invoices (CGST/SGST/IGST).
                </p>
                <Link
                  href="/features/billing-and-payments"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-4"
                >
                  <span>Explore Billing & Payments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle hover:border-brand-forest/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Live Housekeeping Matrix</h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                  Mobile-responsive cleaning turnaround queues. Floor teams update rooms through Dirty, In-Progress, Inspected, and Ready states instantaneously.
                </p>
                <Link
                  href="/features/reservations"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-4"
                >
                  <span>Explore Reservations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle hover:border-brand-forest/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Guest History & CRM</h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                  Permanent guest ledgers capturing government ID records, phone numbers, past stay dates, room preferences, and special dietary requests.
                </p>
                <Link
                  href="/features/guest-management"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-4"
                >
                  <span>Explore Guest Management</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle hover:border-brand-forest/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Manager Flash Reports</h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                  Real-time occupancy rates, RevPAR insights, daily collections by payment mode (Cash/Card/UPI), and month-end tax summary exports.
                </p>
                <Link
                  href="/features/reports"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-4"
                >
                  <span>Explore Operations Reports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle hover:border-brand-forest/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Enterprise Tenant Isolation</h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                  Every hotel operates in an isolated PostgreSQL partition enforced by Row-Level Security (RLS). Complete role-based access for Owners, Managers, and Staff.
                </p>
                <Link
                  href="/security"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light mt-4"
                >
                  <span>Read Security Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Cloud PMS over Legacy Software Section */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Why Independent Hoteliers Choose Grove
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest leading-tight">
                Say Goodbye to Clunky Legacy On-Premise Hotel Software
              </h2>
              <p className="text-sm sm:text-base text-ink-muted mt-4 leading-relaxed">
                Legacy property management systems require on-site Windows servers, expensive annual maintenance contracts, and endless manual backups. Grove PMS runs 100% in your browser on desktop, tablet, and mobile with zero server maintenance.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-status-green shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-ink">
                    <strong className="font-semibold text-brand-forest">Zero Hardware Lock-In:</strong> Access your front desk from any modern laptop, iPad, or mobile phone.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-status-green shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-ink">
                    <strong className="font-semibold text-brand-forest">Instant Real-Time Sync:</strong> Front desk check-ins update housekeeping status and restaurant POS instantly via WebSocket streams.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-status-green shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-ink">
                    <strong className="font-semibold text-brand-forest">Multi-Role Permissions:</strong> Granular control ensuring receptionists, housekeepers, and managers only access authorized data.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-xs space-y-5">
              <h3 className="font-serif font-bold text-xl text-brand-forest">Legacy PMS vs Grove PMS</h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/60 text-red-900">
                  <span className="font-bold block mb-0.5">Legacy On-Premise Systems:</span>
                  Slow desktop interfaces, periodic data crashes, complex manual GST calculations, and expensive server hardware.
                </div>
                <div className="p-3.5 rounded-xl bg-brand-forest/8 border border-brand-forest/20 text-brand-forest">
                  <span className="font-bold block mb-0.5">Grove Cloud PMS:</span>
                  Instant modern UI, automatic encrypted cloud backups, integrated GST folios, and zero recurring IT overhead.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-brand-forest text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-8 shadow-sm">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                Upgrade Your Hotel Operations Today
              </h2>
              <p className="text-sm text-white/80 mt-2 max-w-xl">
                Join independent boutique hotels and homestays that trust Grove PMS for smooth daily workflows and complete financial clarity.
              </p>
            </div>
            <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/register-hotel"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-brand-forest font-semibold text-sm hover:bg-brand-sand transition-all text-center shadow-xs"
              >
                Register Your Property
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-forest-light/40 border border-white/20 text-white font-semibold text-sm hover:bg-brand-forest-light/60 transition-all text-center"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
