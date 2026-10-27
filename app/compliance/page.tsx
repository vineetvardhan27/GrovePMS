import type { Metadata } from 'next';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { Scale, Receipt, Users, FileSpreadsheet, AlertCircle } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = {
  title: 'Hotel Compliance, GST Invoicing & Audit Trails',
  description:
    'Learn how Grove PMS equips hotels with operational workflows for sequential GST tax invoicing, digital guest registers, and immutable shift audit trails.',
  alternates: {
    canonical: '/compliance',
  },
  openGraph: {
    title: 'Hotel Compliance, GST Invoicing & Audit Trails | Grove PMS',
    description:
      'Learn how Grove PMS equips hotels with operational workflows for sequential GST tax invoicing, digital guest registers, and immutable shift audit trails.',
    url: 'https://www.grovepms.me/compliance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Compliance, GST Invoicing & Audit Trails | Grove PMS',
    description:
      'Learn how Grove PMS equips hotels with operational workflows for sequential GST tax invoicing, digital guest registers, and immutable shift audit trails.',
  },
};

export default function CompliancePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Compliance', item: '/compliance' },
  ]);

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <JsonLd data={breadcrumbSchema} />
      <PublicHeader />


      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Operational Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight">
            Compliance & Responsible Data Handling
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl leading-relaxed">
            Grove equips hotel operators with structured operational workflows designed to maintain clean tax records,
            guest registration logs, and verifiable financial ledgers.
          </p>
        </div>

        {/* Disclaimer Alert */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 sm:p-5 mb-10 text-ink">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-ink leading-relaxed">
              <p className="font-semibold text-amber-900 mb-1">Important Notice on Regulatory Responsibilities:</p>
              <p className="text-ink-muted">
                Grove provides operational software designed to assist hotels in managing records and workflows. Hotels
                remain solely responsible for complying with the local, municipal, state, and national laws applicable to
                their property. Requirements may vary by location, property size, and business structure. Hotels should
                verify applicable requirements with their qualified legal, tax, or accounting professionals.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Workflow Modules */}
        <div className="space-y-6">
          {/* GST & Tax Records */}
          <div className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-brand-forest text-white">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-forest m-0">
                GST Invoicing & Tax Ledger Workflows
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Grove includes flexible tax rate management allowing hotel owners to configure applicable GST slabs (e.g.,
              12%, 18%) for room tariffs, F&B food orders, and banquet events. The system generates sequential invoice
              numbers with itemized CGST, SGST, or IGST breakdowns, and enables monthly export of transaction summaries
              to facilitate periodic GSTR-1 and GSTR-3B filings by your accountant.
            </p>
          </div>

          {/* Guest Registration Records */}
          <div className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-brand-forest text-white">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-forest m-0">
                Guest Registration & Identity Verification
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Hotels can maintain digital guest check-in records containing full names, contact information, check-in/out
              dates, and identity document details (e.g., Aadhaar, Passport reference) as required under standard
              hospitality record-keeping protocols and local regulatory guidelines.
            </p>
          </div>

          {/* Staff Access & Auditability */}
          <div className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-brand-forest text-white">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-forest m-0">
                Auditability & Financial Reconciliations
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Every room charge posting, payment receipt, banquet advance deposit, and room status change is logged with an
              audit trail. Daily shift handovers and cashier balance summaries ensure transparency between morning and
              evening reception shifts.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
