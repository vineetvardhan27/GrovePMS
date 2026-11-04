import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
  Coins,
  QrCode,
  Smartphone,
  Share2,
  Printer,
} from 'lucide-react';

import BillingShowcase from '@/components/landing/features/BillingShowcase';
import FeatureFaqSection, { type FaqItem } from '@/components/landing/features/FeatureFaqSection';
import FeatureModuleNav from '@/components/landing/features/FeatureModuleNav';
import FeatureConversionBanner from '@/components/landing/features/FeatureConversionBanner';

export const metadata: Metadata = {
  title: 'Hotel Billing Software & Automated GST Folio Management | Grove PMS',
  description:
    'Consolidated guest folios, automated GST tax invoices, split payments, and multi-mode collection (UPI, Card, Cash) with Grove PMS hotel billing software.',
  alternates: {
    canonical: '/features/billing-and-payments',
  },
  openGraph: {
    title: 'Hotel Billing Software & Automated GST Folio Management | Grove PMS',
    description:
      'Consolidated guest folios, automated GST tax invoices, split payments, and multi-mode collection (UPI, Card, Cash) with Grove PMS hotel billing software.',
    url: 'https://www.grovepms.me/features/billing-and-payments',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Billing Software & Automated GST Folio Management | Grove PMS',
    description:
      'Consolidated guest folios, automated GST tax invoices, split payments, and multi-mode collection (UPI, Card, Cash) with Grove PMS hotel billing software.',
  },
};

const billingFaqs: FaqItem[] = [
  {
    question: 'How does Grove handle Indian GST calculations?',
    answer:
      'Grove automatically applies applicable GST rules based on room tariff slabs (e.g. 12% or 18%) and restaurant services (5% or 18%). It computes CGST and SGST for intrastate guests, and IGST for interstate guests, with exact SAC/HSN codes printed on the final invoice.',
  },
  {
    question: 'Can guests split their payment across UPI and credit cards?',
    answer:
      'Yes. Grove has built-in split-tender functionality. A guest can pay part of the folio via UPI QR code, part via credit card, and the remainder in cash. Grove maintains an exact audit trail of all transactions.',
  },
  {
    question: 'Are restaurant and room service charges automatically added to the room bill?',
    answer:
      'Yes. When the restaurant or kitchen creates a KOT or food order for an occupied room, it posts directly to that room’s consolidated folio in real time, preventing unbilled dining orders at checkout.',
  },
  {
    question: 'Can we send invoices directly to guests on WhatsApp or email?',
    answer:
      'Yes. With one click, front desk can send an audit-ready GST PDF invoice directly to the guest’s WhatsApp number or email address, saving paper and accelerating departure queues.',
  },
];

export default function BillingAndPaymentsFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Billing & Payments', item: '/features/billing-and-payments' },
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
            <span className="text-brand-forest font-semibold">Billing &amp; Payments</span>
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
            <span>Grove PMS — Consolidated Folios &amp; GST Billing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight max-w-4xl mx-auto leading-[1.10]">
            Flawless Hotel Billing.
            <br />
            Instant GST Compliance.
          </h1>

          <p className="mt-5 sm:mt-7 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Eliminate billing disputes, lost dining chits, and manual tax calculations. Consolidate room tariffs, restaurant KOTs, amenities, and advance payments into transparent digital guest folios with 1-click settlement.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request Billing Demo
            </GroveButton>
          </div>

          {/* Interactive Billing Showcase Mockup */}
          <BillingShowcase />
        </section>

        {/* ── 4 CORE CAPABILITIES ASYMMETRICAL GRID ── */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
              Financial Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black">
              Complete Financial Control Over Every Guest Stay
            </h2>
            <p className="text-sm sm:text-base text-ink-muted mt-3">
              Engineered for seamless guest checkout, zero reconciliation leakage, and full GST audit readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Capability 1 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Unified Multi-Department Folios
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Connect restaurant dining, room service, banquet orders, and minibar charges directly to the room folio. When a guest arrives at the front desk to check out, every service is already itemized with zero lost chits.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Real-time posting from Restaurant POS and kitchen KOTs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Itemized breakdown showing date, time, and service department</span>
                </li>
              </ul>
            </div>

            {/* Capability 2 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Automated Indian GST &amp; HSN/SAC Invoicing
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Grove calculates CGST and SGST for intrastate guests and IGST for interstate travelers automatically. Print or export tax invoices with correct SAC codes (996311 for accommodation, 996331 for dining).
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Support for corporate GSTIN capture and B2B invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>One-click export ready for monthly GSTR-1 and GSTR-3B filings</span>
                </li>
              </ul>
            </div>

            {/* Capability 3 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Multi-Mode Split Tender Payments
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Guests often split checkout amounts across UPI, corporate credit cards, and cash. Grove handles complex split-tender transactions smoothly, automatically balancing advance deposits against the final invoice.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Dynamic UPI QR code generation right at the front desk</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Comprehensive collection logs by payment mode for day-end reconciliation</span>
                </li>
              </ul>
            </div>

            {/* Capability 4 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Instant WhatsApp &amp; Thermal Receipt Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Speed up departure lines with paperless billing. Send an encrypted PDF tax invoice directly to the guest’s WhatsApp or email in one click, or generate clean standard thermal slips for physical receipts.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Custom hotel logo, contact details, and terms on every receipt</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Permanent digital invoice archives stored securely in the cloud</span>
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
                Billing Pipeline
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black">
                From Service Delivery to Bank Deposit
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  01. ACCRUE
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Auto Posting</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Room tariffs post nightly; F&amp;B orders post instantly as KOTs are completed.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  02. COMPUTE
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">GST Calculation</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  System computes exact CGST, SGST, or IGST based on guest GSTIN and state rules.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  03. SETTLE
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Split Collection</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Collect payments across UPI, Card, or Cash with instant advance deduction.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  04. DISPATCH
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Invoice Sent</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Invoice sent instantly via WhatsApp; collection logged in manager flash report.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <FeatureFaqSection moduleName="Billing & Payments" faqs={billingFaqs} />

        {/* ── CONVERSION BANNER ── */}
        <FeatureConversionBanner
          title="Streamline Guest Folios. Accelerate Checkout."
          subtitle="Join independent hoteliers who eliminated manual billing errors and achieved effortless GST compliance with Grove PMS."
          primaryCtaText="Start Free Trial Now"
        />

        {/* ── MODULE NAVIGATION ── */}
        <FeatureModuleNav currentSlug="billing-and-payments" />
      </main>

      <PublicFooter />
    </div>
  );
}
