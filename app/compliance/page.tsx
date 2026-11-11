import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  Scale,
  Receipt,
  Users,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  Landmark,
  Calculator,
  DownloadCloud,
  CreditCard,
  Check,
  Building2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Compliance, GST Invoicing & Audit Trails | Grove PMS',
  description:
    'Learn how Grove PMS equips hotels with operational workflows for sequential GST tax invoicing, digital guest registers, Form-C immigration reporting, and immutable shift audit trails.',
  alternates: {
    canonical: '/compliance',
  },
  openGraph: {
    title: 'Hotel Compliance, GST Invoicing & Audit Trails | Grove PMS',
    description:
      'Learn how Grove PMS equips hotels with operational workflows for sequential GST tax invoicing, digital guest registers, Form-C immigration reporting, and immutable shift audit trails.',
    url: 'https://www.grovepms.me/compliance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Compliance, GST Invoicing & Audit Trails | Grove PMS',
    description:
      'Learn how Grove PMS equips hotels with operational workflows for sequential GST tax invoicing, digital guest registers, Form-C immigration reporting, and immutable shift audit trails.',
  },
};

export default function CompliancePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Compliance', item: '/compliance' },
  ]);

  const compliancePillars = [
    {
      icon: Receipt,
      number: '01',
      title: 'Indian GST Sequential Invoicing & SAC Codes',
      description:
        'Grove automatically calculates applicable GST slabs based on daily room tariff (12% for tariffs under ₹7,500; 18% for ₹7,500 and above) plus 5% F&B restaurant taxes. Generates audit-ready tax invoices with proper SAC codes (996311 for rooms, 996331 for dining).',
      benefit: 'Eliminates front-desk manual tax calculation errors',
    },
    {
      icon: Users,
      number: '02',
      title: 'Statutory Guest Registers & Identity Verification',
      description:
        'Maintain digital guest check-in dossiers capturing full legal names, verified contact numbers, permanent residential addresses, photo ID references (Aadhaar, Voter ID, Driving License, Passport), and vehicle registration numbers as required by local authorities.',
      benefit: 'Instant 1-click police arrival manifest exports',
    },
    {
      icon: Landmark,
      number: '03',
      title: 'Foreign National Form-C Readiness (e-FRRO)',
      description:
        'Standardized intake workflows for non-Indian guests capturing passport numbers, visa issuance dates, expiry thresholds, port of entry into India, and next destination details. Pre-formats data for convenient filing on the official Bureau of Immigration portal.',
      benefit: 'Full statutory compliance with Indian immigration laws',
    },
    {
      icon: FileSpreadsheet,
      number: '04',
      title: 'Immutable Shift Handovers & Night Audits',
      description:
        'Every single room tariff posting, bar order, banquet advance token, discount, and payment collection (UPI, Cash, Card) is permanently logged to the active receptionist’s user ID with timestamped audit trails that cannot be retroactively tampered with.',
      benefit: 'Zero cashier leakage between morning and night shifts',
    },
  ];

  const gstInvoiceElements = [
    {
      label: 'Sequential Invoice Numbering',
      detail: 'Complies with GST rules requiring unique, continuous sequential numbers per financial year (e.g., INV-2026-27-01042).',
    },
    {
      label: 'Dual GSTIN Attribution',
      detail: 'Captures the Hotel’s registered GSTIN and the Guest / Corporate Entity GSTIN for B2B input tax credit (ITC) eligibility.',
    },
    {
      label: 'HSN / SAC Categorization',
      detail: 'Explicit itemization for SAC 996311 (Room Accommodation) and SAC 996331 (Restaurant & Food Service).',
    },
    {
      label: 'Tax Bifurcation (CGST + SGST vs. IGST)',
      detail: 'Calculates intra-state CGST (6%/9%) + SGST (6%/9%) or inter-state IGST (12%/18%) based on guest place of supply state code.',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 relative overflow-x-hidden flex flex-col justify-between">
      <JsonLd data={breadcrumbSchema} />

      {/* Subtle Architectural Grid Texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 grove-grid-texture opacity-85"
        aria-hidden="true"
      />

      {/* Ambient Top Glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-brand-forest/[0.04] to-transparent -z-10"
        aria-hidden="true"
      />

      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── 1. HERO SECTION ── */}
          <section className="text-center max-w-4xl mx-auto mb-16 sm:mb-24">
            {/* Eyebrow Badge */}
            <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest dark:text-[#42C995] text-xs font-semibold mb-5 sm:mb-6 shadow-2xs">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={16}
                height={16}
                className="w-4 h-4 object-contain shrink-0"
              />
              <span>Grove PMS — Statutory Compliance &amp; Governance</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black dark:text-[#F1F5F2] tracking-tight leading-[1.10]">
              Compliance, GST Invoicing &amp; Statutory Governance.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 sm:mt-8 text-base sm:text-xl text-ink-muted dark:text-[#A9BDB1] leading-relaxed max-w-3xl mx-auto">
              Standardized cloud workflows engineered for Indian hotel regulations — from dual-slab GST sequential invoicing and accountant GSTR filing exports, to digital guest police registers and immutable shift audit trails.
            </p>

            {/* Statutory Assurance Badges */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-semibold text-ink-muted dark:text-[#A9BDB1]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs dark:bg-[#10271F] dark:border-[rgba(130,180,150,0.18)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green dark:text-emerald-400" />
                <span>Sequential GST Tax Invoicing</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs dark:bg-[#10271F] dark:border-[rgba(130,180,150,0.18)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green dark:text-emerald-400" />
                <span>SAC 996311 &amp; 996331 Automation</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs dark:bg-[#10271F] dark:border-[rgba(130,180,150,0.18)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green dark:text-emerald-400" />
                <span>Digital Form-C Foreign Guest Ledger</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs dark:bg-[#10271F] dark:border-[rgba(130,180,150,0.18)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green dark:text-emerald-400" />
                <span>Accountant GSTR-1 &amp; GSTR-3B Sync</span>
              </span>
            </div>
          </section>

          {/* ── 2. STATUTORY RESPONSIBILITY ADVISORY BANNER ── */}
          <section className="mb-16 sm:mb-20">
            <div className="bg-amber-500/10 border border-amber-500/25 dark:bg-amber-500/10 dark:border-amber-400/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-4xl mx-auto text-ink">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-amber-800 dark:text-amber-300" />
                </div>
                <div className="text-xs sm:text-sm text-ink leading-relaxed">
                  <h3 className="font-serif font-bold text-base text-amber-950 dark:text-amber-300 mb-1">
                    Regulatory Advisory for Hoteliers
                  </h3>
                  <p className="text-ink-muted dark:text-[#D5E2DA]">
                    Grove provides high-precision operational software designed to assist hotel owners and staff in maintaining statutory records, tax folios, and guest logs. Individual properties remain solely responsible for local Sarai Act registrations, municipal trade licenses, fire NOCs, and state tourism certifications applicable to their jurisdiction. Hotels should verify their tax categorization with their certified chartered accountants.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. FOUR COMPLIANCE PILLARS ── */}
          <section className="mb-20 sm:mb-28">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest dark:bg-[#17352A] dark:border-[#42C995]/25 dark:text-[#42C995] text-xs font-semibold tracking-wider uppercase">
                <Scale className="w-3.5 h-3.5" />
                <span>Regulatory Foundation</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black dark:text-[#F1F5F2] tracking-tight leading-[1.15]">
                Four Built-In Statutory Safeguards.
              </h2>
              <p className="text-base sm:text-lg text-ink-muted dark:text-[#A9BDB1] leading-relaxed max-w-2xl mx-auto">
                Built from the ground up to ensure boutique resorts and independent properties operate without compliance exposure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
              {compliancePillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.4)] p-7 sm:p-9 shadow-[0_12px_32px_-6px_rgba(20,38,34,0.05)] hover:shadow-[0_18px_44px_-8px_rgba(20,38,34,0.10)] transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-brand-forest/8 text-brand-forest dark:bg-[#17352A] dark:text-[#42C995] dark:border dark:border-[#42C995]/25 flex items-center justify-center border border-brand-forest/10 group-hover:scale-105 transition-transform duration-200">
                          <Icon className="w-6 h-6 text-brand-forest dark:text-[#42C995]" />
                        </div>
                        <span className="font-mono text-xs font-bold text-brand-forest/60 bg-brand-sand px-2.5 py-1 rounded-full border border-border-subtle/60 dark:bg-[#17352A] dark:text-[#42C995] dark:border-[#42C995]/20">
                          {pillar.number}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-black dark:text-[#F1F5F2] mb-3">
                        {pillar.title}
                      </h3>

                      <p className="text-sm sm:text-base text-ink-muted dark:text-[#A9BDB1] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#1C2D29]/8 dark:border-[rgba(130,180,150,0.15)] flex items-center gap-2 text-xs font-semibold text-brand-forest dark:text-[#42C995]">
                      <Check className="w-4 h-4 text-status-green dark:text-emerald-400 stroke-[3] shrink-0" />
                      <span>{pillar.benefit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 4. GST INVOICE COMPLIANCE ANATOMY ── */}
          <section className="mb-20 sm:mb-28">
            <div className="rounded-[28px] sm:rounded-[36px] bg-white/80 backdrop-blur-xl border border-white/90 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_24px_70px_-12px_rgba(0,0,0,0.5)] shadow-[0_24px_70px_-12px_rgba(20,38,34,0.09)] p-6 sm:p-10 lg:p-14 text-left">
              <div className="max-w-3xl mx-auto space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 dark:text-[#42C995] block">
                  Tax Architecture
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black dark:text-[#F1F5F2] tracking-tight leading-tight">
                  The Anatomy of a Statutory Grove GST Invoice
                </h2>
                <p className="text-sm sm:text-base text-ink-muted dark:text-[#A9BDB1] leading-relaxed">
                  Every tax invoice generated by Grove PMS adheres strictly to Indian Goods and Services Tax Act specifications. The layout ensures flawless reconciliation for both your hotel and corporate business travelers claiming input tax credits.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {gstInvoiceElements.map((item) => (
                    <div
                      key={item.label}
                      className="p-5 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/8 dark:bg-[#132D23]/70 dark:border-[rgba(130,180,150,0.15)] space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-brand-forest dark:text-[#42C995] font-semibold text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-status-green dark:text-emerald-400 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <p className="text-xs text-ink-muted dark:text-[#A9BDB1] leading-relaxed pl-6">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Sample Folio Specimen Card */}
                <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#142320] text-brand-sand/90 font-mono text-xs border border-white/10 shadow-inner">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white text-[11px] font-sans">
                    <span className="font-bold">INVOICE SPECIMEN #INV-2026-27-01042</span>
                    <span className="text-emerald-400 font-semibold uppercase">Valid Tax Invoice</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] leading-relaxed">
                    <div>
                      <span className="text-white/60 block">SUPPLIER:</span>
                      <span className="text-white font-bold font-sans">HOTEL GREENERY VIEW</span>
                      <span className="block text-white/70">GSTIN: 11AABCH1234D1Z5</span>
                      <span className="block text-white/70">State Code: 11 (Sikkim)</span>
                    </div>
                    <div>
                      <span className="text-white/60 block">RECIPIENT (CORPORATE):</span>
                      <span className="text-white font-bold font-sans">VERTEX ENTERPRISES PVT LTD</span>
                      <span className="block text-white/70">GSTIN: 27AABCV5678E1Z2</span>
                      <span className="block text-white/70">Place of Supply: 11 (Intra-State)</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span>SAC 996311 (Deluxe Suite, 2 Nights): ₹9,000</span>
                    <span>CGST 9% (₹810) + SGST 9% (₹810)</span>
                    <span className="text-emerald-400 font-bold">Total: ₹10,620</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. ACCOUNTANT GSTR FILING RECONCILIATION WORKFLOW ── */}
          <section className="mb-20 sm:mb-28 text-center">
            <div className="max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest dark:bg-[#17352A] dark:border-[#42C995]/25 dark:text-[#42C995] text-xs font-semibold tracking-wider uppercase">
                <Calculator className="w-3.5 h-3.5" />
                <span>Accountant Synchronization</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black dark:text-[#F1F5F2] tracking-tight leading-[1.15]">
                How Your Accountant Prepares GSTR-1 &amp; GSTR-3B.
              </h2>
              <p className="text-base sm:text-lg text-ink-muted dark:text-[#A9BDB1] leading-relaxed max-w-2xl mx-auto">
                No manual ledger typing at month end. Grove exports cleanly structured CSV and Excel files ready for tax software.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 sm:p-8 rounded-[28px] bg-white dark:bg-[#10271F]/80 border border-border-subtle dark:border-[rgba(130,180,150,0.18)] shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest/10 text-brand-forest dark:bg-[#17352A] dark:text-[#42C995] flex items-center justify-center font-mono font-bold text-xs">
                  01
                </div>
                <h3 className="font-serif font-bold text-xl text-black dark:text-[#F1F5F2]">Real-Time Accrual</h3>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-[#A9BDB1] leading-relaxed">
                  As guests check out or restaurant orders are paid, tariffs and applicable taxes post automatically to sequential invoice registers.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-[28px] bg-white dark:bg-[#10271F]/80 border border-border-subtle dark:border-[rgba(130,180,150,0.18)] shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest/10 text-brand-forest dark:bg-[#17352A] dark:text-[#42C995] flex items-center justify-center font-mono font-bold text-xs">
                  02
                </div>
                <h3 className="font-serif font-bold text-xl text-black dark:text-[#F1F5F2]">Midnight Freeze</h3>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-[#A9BDB1] leading-relaxed">
                  At midnight, the automated night audit freezes daily collections, balances credit card and UPI reconciliations, and verifies sequentiality.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-[28px] bg-white dark:bg-[#10271F]/80 border border-border-subtle dark:border-[rgba(130,180,150,0.18)] shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest/10 text-brand-forest dark:bg-[#17352A] dark:text-[#42C995] flex items-center justify-center font-mono font-bold text-xs">
                  03
                </div>
                <h3 className="font-serif font-bold text-xl text-black dark:text-[#F1F5F2]">1-Click GSTR Export</h3>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-[#A9BDB1] leading-relaxed">
                  On the 1st of every month, hotel owners export a comprehensive tax report formatted for GSTR-1 Table 4 (B2B), Table 7 (B2C), and GSTR-3B.
                </p>
              </div>
            </div>
          </section>

          {/* ── 6. FAST-TRACK CONVERSION CALLOUT ── */}
          <section className="pt-6">
            <div className="rounded-[28px] sm:rounded-[36px] bg-white/70 backdrop-blur-xl border border-white/80 dark:bg-[#10271F]/80 dark:border-[rgba(130,180,150,0.18)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] p-8 sm:p-12 lg:p-14 text-center shadow-lg relative overflow-hidden">
              <div
                className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl"
                aria-hidden="true"
              />

              <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 dark:text-[#42C995] block">
                  Audited Operational Calm
                </span>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-black dark:text-[#F1F5F2] tracking-tight leading-tight">
                  Run a 100% Tax-Compliant Property.
                </h2>
                <p className="text-sm sm:text-base text-ink-muted dark:text-[#A9BDB1] leading-relaxed">
                  Eliminate billing disputes, lost guest ID records, and manual tax calculations with Grove PMS.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Link
                    href="/register-hotel"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-forest hover:bg-brand-forest-light text-white font-serif font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-emerald-300" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#1C2D29]/15 text-brand-forest font-serif font-bold text-sm sm:text-base hover:bg-brand-sand/60 transition-colors text-center shadow-2xs flex items-center justify-center gap-1.5 dark:bg-[#142A22] dark:text-[#F1F5F2] dark:border-[rgba(130,180,150,0.25)]"
                  >
                    <span>View Pricing (₹999/mo)</span>
                  </Link>
                </div>
                <p className="mt-4 text-xs text-ink-muted dark:text-[#A9BDB1]">
                  Interested in PostgreSQL multi-tenant isolation &amp; encryption?{' '}
                  <Link href="/security" className="font-semibold text-brand-forest dark:text-[#42C995] underline hover:text-brand-forest-light dark:hover:text-[#6EE7B7]">
                    Review Data Security Architecture →
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
