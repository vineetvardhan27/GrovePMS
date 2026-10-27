import type { Metadata } from 'next';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  CreditCard,
  Receipt,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
  Coins,
  QrCode,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Billing Software & Folio Management',
  description:
    'Consolidated guest folios, automated GST tax invoices, split payments, and multi-mode collection (Cash, Card, UPI) with Grove PMS hotel billing software.',
  alternates: {
    canonical: '/features/billing-and-payments',
  },
  openGraph: {
    title: 'Hotel Billing Software & Folio Management | Grove PMS',
    description:
      'Consolidated guest folios, automated GST tax invoices, split payments, and multi-mode collection (Cash, Card, UPI) with Grove PMS hotel billing software.',
    url: 'https://www.grovepms.me/features/billing-and-payments',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Billing Software & Folio Management | Grove PMS',
    description:
      'Consolidated guest folios, automated GST tax invoices, split payments, and multi-mode collection (Cash, Card, UPI) with Grove PMS hotel billing software.',
  },
};

export default function BillingAndPaymentsFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Billing & Payments', item: '/features/billing-and-payments' },
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
            <span className="text-brand-forest font-semibold">Billing & Payments</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-6 shadow-2xs">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Consolidated Folio & GST Billing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Hotel Billing & Payment Management Software
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Eliminate billing disputes, lost room charges, and manual tax calculations. Consolidate accommodation, restaurant dining, banquet items, and amenities into clean digital guest folios with instant GST invoices.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request Billing Demo
            </GroveButton>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="bg-white border-y border-border-subtle py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Financial Accuracy
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                From Express Check-In to Final GST Invoicing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Sequential GST Invoices</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Automatic calculation of statutory GST slabs (e.g. 12%, 18%) with granular CGST, SGST, and IGST breakdowns ready for monthly tax filings.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Multi-Mode Split Payments</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Accept split tender across Cash, UPI (Google Pay, PhonePe, Paytm), and Credit/Debit Cards on the same bill without ledger discrepancies.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Room Charge Posting</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Post restaurant bills, laundry, airport pickups, and extra bedding directly to the guest’s open room ledger with instantaneous balance recalculation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Audit & Compliance Assurance */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-xl text-brand-forest">Looking for Complete Financial Reports?</h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">Discover how daily manager flash reports track collections and revenue.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-forest">
              <Link href="/features/reports" className="hover:underline flex items-center gap-1">
                <span>Manager Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/compliance" className="hover:underline flex items-center gap-1">
                <span>Compliance Guide</span>
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
