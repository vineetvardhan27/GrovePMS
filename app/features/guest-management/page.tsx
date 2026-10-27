import type { Metadata } from 'next';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  Users,
  ShieldCheck,
  Search,
  FileText,
  History,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Guest Management Software & Directory',
  description:
    'Maintain verifiable guest ledgers, store identification details, review past stay histories, and deliver personalized hospitality with Grove PMS.',
  alternates: {
    canonical: '/features/guest-management',
  },
  openGraph: {
    title: 'Hotel Guest Management Software & Directory | Grove PMS',
    description:
      'Maintain verifiable guest ledgers, store identification details, review past stay histories, and deliver personalized hospitality with Grove PMS.',
    url: 'https://www.grovepms.me/features/guest-management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Guest Management Software & Directory | Grove PMS',
    description:
      'Maintain verifiable guest ledgers, store identification details, review past stay histories, and deliver personalized hospitality with Grove PMS.',
  },
};

export default function GuestManagementFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Guest Management', item: '/features/guest-management' },
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
            <span className="text-brand-forest font-semibold">Guest Management</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-6 shadow-2xs">
            <Users className="w-3.5 h-3.5" />
            <span>Digital Guest Profiles & CRM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Hotel Guest Management Software
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Replace loose paper registration cards with a centralized guest directory. Securely capture identification numbers, track lifetime visit histories, note guest preferences, and fulfill local police verification compliance.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request a Walkthrough
            </GroveButton>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="bg-white border-y border-border-subtle py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Guest Ledger Architecture
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                Know Every Guest the Moment They Arrive
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Identity & Compliance</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Record government ID type (Passport, Driving License, Aadhaar, National ID), document numbers, address, and nationality for seamless local tourism reporting.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Lifetime Stay History</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Track repeat guests, historical total spend, past room assignments, and reservation notes so your front desk can greet VIP returnees with familiar warmth.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Strict Data Privacy</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  PostgreSQL Row-Level Security ensures your guest phone numbers, emails, and identification records are strictly isolated and never visible to other properties.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Step Nav */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-xl text-brand-forest">Connected Billing & Reservations</h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">See how guest profiles automatically populate into reservations and folios.</p>
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
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
