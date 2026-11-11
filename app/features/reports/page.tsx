import type { Metadata } from 'next';
import Image from 'next/image';
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
  Download,
  ShieldCheck,
  Scale,
} from 'lucide-react';

import ReportsShowcase from '@/components/landing/features/ReportsShowcase';
import FeatureFaqSection, { type FaqItem } from '@/components/landing/features/FeatureFaqSection';
import FeatureModuleNav from '@/components/landing/features/FeatureModuleNav';
import FeatureConversionBanner from '@/components/landing/features/FeatureConversionBanner';

export const metadata: Metadata = {
  title: 'Hotel Operations & Financial Reporting Software | Grove PMS',
  description:
    'Real-time RevPAR metrics, ADR tracking, daily manager flash reports, automated night audit, and 1-click GST GSTR-1 tax export with Grove PMS.',
  alternates: {
    canonical: '/features/reports',
  },
  openGraph: {
    title: 'Hotel Operations & Financial Reporting Software | Grove PMS',
    description:
      'Real-time RevPAR metrics, ADR tracking, daily manager flash reports, automated night audit, and 1-click GST GSTR-1 tax export with Grove PMS.',
    url: 'https://www.grovepms.me/features/reports',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Operations & Financial Reporting Software | Grove PMS',
    description:
      'Real-time RevPAR metrics, ADR tracking, daily manager flash reports, automated night audit, and 1-click GST GSTR-1 tax export with Grove PMS.',
  },
};

const reportFaqs: FaqItem[] = [
  {
    question: 'How does the daily automated night audit work in Grove PMS?',
    answer:
      'Grove automatically runs night audit reconciliations at midnight, computing daily room revenues, F&B earnings, tax accruals, and cash drawer collections. There is no need for manual spreadsheet calculations or locking reception terminals for hours.',
  },
  {
    question: 'Can we export reports for our Chartered Accountant and tax filings?',
    answer:
      'Yes. Grove provides 1-click Excel exports specifically formatted for Indian GST compliance (GSTR-1 B2B and B2C summaries, SAC-wise totals, and output tax ledgers). Your accountant can import files directly without manual data entry.',
  },
  {
    question: 'What hospitality KPIs does Grove track out-of-the-box?',
    answer:
      'Grove tracks Occupancy %, ADR (Average Daily Rate), RevPAR (Revenue Per Available Room), Room Revenue vs F&B Revenue, Collections by Payment Mode (UPI, Card, Cash, Bank Transfer), and Outstanding Folio Balances.',
  },
  {
    question: 'Can hotel owners view live performance reports remotely?',
    answer:
      'Yes. Because Grove PMS is 100% cloud-native, hotel owners and general managers can check real-time occupancy and daily collections securely from any smartphone or laptop anywhere in the world.',
  },
];

export default function ReportsFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Reports & Analytics', item: '/features/reports' },
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
            <span className="text-brand-forest font-semibold">Reports &amp; Analytics</span>
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
            <span>Grove PMS — Executive Business Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight max-w-4xl mx-auto leading-[1.10]">
            Complete Operational Clarity.
            <br />
            Audited Financial Intelligence.
          </h1>

          <p className="mt-5 sm:mt-7 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Eliminate evening spreadsheet reconciliations and manual audit headaches. Get instant manager flash reports, monitor RevPAR and ADR trends, reconcile UPI and cash collections, and export audit-ready GST data in one click.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request Reports Demo
            </GroveButton>
          </div>

          {/* Interactive Reports Showcase Mockup */}
          <ReportsShowcase />
        </section>

        {/* ── 4 CORE CAPABILITIES ASYMMETRICAL GRID ── */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
              Business Intelligence Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black">
              Data-Driven Decision Making for Hospitality Leaders
            </h2>
            <p className="text-sm sm:text-base text-ink-muted mt-3">
              Engineered to give hotel owners, general managers, and finance teams real-time operational truth without complex setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Capability 1 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Daily Manager Flash Reports
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Receive an automatic daily operational summary covering rooms occupied, expected arrivals, checkout folios settled, dining revenues, and total cash collected across every front-desk shift.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Instant comparison with previous day and weekly historical averages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Shift-wise cash drawer handover balances and discrepancies</span>
                </li>
              </ul>
            </div>

            {/* Capability 2 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Yield &amp; Revenue Metrics (ADR &amp; RevPAR)
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Track your Average Daily Rate (ADR) and Revenue Per Available Room (RevPAR) continuously. Understand which room categories generate the highest margins and optimize pricing across weekdays and weekend peaks.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Category-wise yield analytics (Deluxe vs Suites vs Cottages)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Seasonal occupancy pace tracking to forecast upcoming revenue</span>
                </li>
              </ul>
            </div>

            {/* Capability 3 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                GST Audit &amp; Tax Ledger Reconciliations
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Stay fully compliant with Indian GST tax laws. Grove breaks down output CGST, SGST, and IGST by SAC code, providing zero-headache reports ready for monthly GSTR-1 and GSTR-3B filings.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Detailed B2B corporate tax invoices vs B2C walk-in receipts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>1-click Excel export formatted for Chartered Accountants</span>
                </li>
              </ul>
            </div>

            {/* Capability 4 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Multi-Channel Payment Reconciliation
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Cross-verify your physical bank statement against PMS collection logs. Reconcile UPI payments, credit card batch settlements, bank transfers, and cash ledger balances with automated audit trails.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Zero revenue leakage between POS orders and settled bank accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>PDF, Excel, and thermal print summary options for daily closeout</span>
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
                Reporting Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black">
                From Daily Transactions to Tax Filing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  01. LOG
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Real-Time Capture</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Every check-in, dining order, and payment is logged with exact staff attribution.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  02. AUDIT
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Midnight Closeout</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Night audit reconciles daily rooms, collections, and tax liability automatically.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  03. FLASH
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Manager Report</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Owner and GM review daily flash performance on phone before morning briefing.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  04. EXPORT
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Accountant Sync</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Export GST spreadsheets in 1 click for effortless monthly tax return filing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <FeatureFaqSection moduleName="Reports & Analytics" faqs={reportFaqs} />

        {/* ── CONVERSION BANNER ── */}
        <FeatureConversionBanner
          title="Run Your Hotel with Complete Financial Truth."
          subtitle="Upgrade your hotel management with Grove PMS to get instant daily manager flash reports, track RevPAR, and eliminate accounting headaches."
          primaryCtaText="Start Free 14-Day Trial"
        />

        {/* ── MODULE NAVIGATION ── */}
        <FeatureModuleNav currentSlug="reports" />
      </main>

      <PublicFooter />
    </div>
  );
}
