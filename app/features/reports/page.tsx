import type { Metadata } from 'next';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  PieChart,
  Calendar,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Operations & Financial Reporting Software',
  description:
    'Real-time occupancy analytics, daily manager flash reports, revenue metrics, and tax summaries with Grove PMS hotel operations software.',
  alternates: {
    canonical: '/features/reports',
  },
  openGraph: {
    title: 'Hotel Operations & Financial Reporting Software | Grove PMS',
    description:
      'Real-time occupancy analytics, daily manager flash reports, revenue metrics, and tax summaries with Grove PMS hotel operations software.',
    url: 'https://www.grovepms.me/features/reports',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Operations & Financial Reporting Software | Grove PMS',
    description:
      'Real-time occupancy analytics, daily manager flash reports, revenue metrics, and tax summaries with Grove PMS hotel operations software.',
  },
};

export default function ReportsFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Reports & Analytics', item: '/features/reports' },
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
            <span className="text-brand-forest font-semibold">Reports & Analytics</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-6 shadow-2xs">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Business Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Hotel Operations & Financial Reporting Software
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Eliminate evening spreadsheet reconciliations. Get instant daily manager flash reports, track RevPAR and room occupancy trends, monitor payment modes, and export audit-ready financial data with one click.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request Reports Demo
            </GroveButton>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="bg-white border-y border-border-subtle py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Operational Intelligence
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                Actionable Financial Data for Hotel Owners and Managers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Daily Manager Flash Report</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Real-time summary of check-ins, check-outs, room nights sold, occupancy percentage, and gross room revenue generated across today’s operational shifts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Payment Mode Reconciliation</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Detailed breakdown of collections by Cash, UPI, and Card. Front desk cash drawers match back-office bank receipts with zero guesswork.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Tax Ledger & GST Exports</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Export complete invoice registries with sequential invoice numbering, taxable amounts, and CGST/SGST/IGST breakdowns ready for your chartered accountant.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore All Features Nav */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-xl text-brand-forest">Explore the Complete PMS Ecosystem</h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">Discover how every module feeds real-time financial data to your reports.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-forest">
              <Link href="/hotel-management-software" className="hover:underline flex items-center gap-1">
                <span>All Features</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/features/billing-and-payments" className="hover:underline flex items-center gap-1">
                <span>Billing & Folios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/pricing" className="hover:underline flex items-center gap-1">
                <span>Pricing Plans</span>
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
