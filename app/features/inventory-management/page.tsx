import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  Warehouse,
  Boxes,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Layers,
  FileSpreadsheet,
  PackagePlus,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

import InventoryShowcase from '@/components/landing/features/InventoryShowcase';
import FeatureFaqSection, { type FaqItem } from '@/components/landing/features/FeatureFaqSection';
import FeatureModuleNav from '@/components/landing/features/FeatureModuleNav';
import FeatureConversionBanner from '@/components/landing/features/FeatureConversionBanner';

export const metadata: Metadata = {
  title: 'Hotel Inventory Management & Stock Software | Grove PMS',
  description:
    'Monitor hotel inventory levels, manage housekeeping linen, track room amenities, and automate supplier purchase orders with Grove PMS.',
  alternates: {
    canonical: '/features/inventory-management',
  },
  openGraph: {
    title: 'Hotel Inventory Management & Stock Software | Grove PMS',
    description:
      'Monitor hotel inventory levels, manage housekeeping linen, track room amenities, and automate supplier purchase orders with Grove PMS.',
    url: 'https://www.grovepms.me/features/inventory-management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Inventory Management & Stock Software | Grove PMS',
    description:
      'Monitor hotel inventory levels, manage housekeeping linen, track room amenities, and automate supplier purchase orders with Grove PMS.',
  },
};

const inventoryFaqs: FaqItem[] = [
  {
    question: 'How do par level alerts work in Grove PMS?',
    answer:
      'You can define ideal par stock and minimum reorder thresholds for every item (e.g. 100 bath towels or 50 shampoo bottles). When daily consumption pushes stock below the threshold, Grove triggers an amber or red alert on your dashboard with one-click purchase order generation.',
  },
  {
    question: 'Can we track inventory across multiple departments (Linen, F&B, Minibar)?',
    answer:
      'Yes. Grove organizes inventory into customizable categories: Housekeeping Linen, Guest Toiletries, Minibar & Beverages, Kitchen Dry Goods, and Engineering Spares. Each category has dedicated stock ledgers and vendor assignments.',
  },
  {
    question: 'How are damage, stained linen, and breakage handled?',
    answer:
      'Grove includes a dedicated wastage and damage logging tool. Staff can record damaged towels, broken glassware, or expired minibar items with timestamped notes and staff attributions, ensuring discrepancies are tracked transparently.',
  },
  {
    question: 'Does stock automatically update when deliveries arrive?',
    answer:
      'Yes. When a vendor delivers an order, managers simply click "Receive Order" against the generated PO. Grove updates current stock levels and recalculates average unit costs instantly.',
  },
];

export default function InventoryManagementFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Inventory Management', item: '/features/inventory-management' },
  ]);

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between relative overflow-x-hidden">
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
            <span className="text-brand-forest font-semibold">Inventory Management</span>
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
            <span>Grove PMS — Stock &amp; Consumables Control</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight max-w-4xl mx-auto leading-[1.10]">
            Zero Stockouts.
            <br />
            Total Supply Chain Control.
          </h1>

          <p className="mt-5 sm:mt-7 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Eliminate unexpected shortages, inventory leakage, and emergency supply runs. Monitor toiletries, linens, minibar beverages, and cleaning supplies in real time with automated par level thresholds.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request Inventory Demo
            </GroveButton>
          </div>

          {/* Interactive Inventory Showcase */}
          <InventoryShowcase />
        </section>

        {/* ── 4 CORE CAPABILITIES ASYMMETRICAL GRID ── */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
              Supply Chain Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black">
              Smart Stock Oversight for Independent Hoteliers
            </h2>
            <p className="text-sm sm:text-base text-ink-muted mt-3">
              Engineered to protect operating margins by eliminating waste, pilferage, and emergency off-contract purchases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Capability 1 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Live Par Levels &amp; Threshold Alerts
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Set minimum stock thresholds for every item on your property. When linens or guest amenities drop below safety limits, Grove flags them immediately, alerting managers before rooms run short on guest supplies.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Color-coded stock health: Optimal (Green), Warning (Amber), Critical (Red)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Auto-calculated reorder quantities based on target par counts</span>
                </li>
              </ul>
            </div>

            {/* Capability 2 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Automated Vendor Purchase Orders
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Generate clean, professional purchase orders in one click. Grove aggregates all low-stock items from an approved vendor into a consolidated PO, complete with item specifications, agreed rates, and delivery instructions.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Supplier directory with contacts, terms, and tax registration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>1-click email and PDF PO export directly to vendor</span>
                </li>
              </ul>
            </div>

            {/* Capability 3 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Damage, Wastage &amp; Breakage Auditing
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Track stained linen, discarded toiletries, broken glassware, and expired minibar snacks. Timestamped shrinkage logs ensure managers have complete visibility into operational loss patterns.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Mandatory reason tagging for all inventory write-offs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Automatic adjustment of property asset valuations</span>
                </li>
              </ul>
            </div>

            {/* Capability 4 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Multi-Department Stock Allocation
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Separate main central storage from departmental sub-inventories like floor linen closets, restaurant bars, and kitchen pantries. Transfer stock with digital vouchers to prevent internal loss.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Inter-department transfer records with supervisor sign-off</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Real-time consumption reports by room turn and occupied night</span>
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
                Supply Lifecycle
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black">
                From Consumption to Replenishment
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  01. CONSUME
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Room Turnarounds</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Housekeeping uses fresh amenities; system deducts daily consumables.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  02. ALERT
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Par Level Warning</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  When count reaches safety threshold, an automated reorder prompt appears.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  03. ORDER
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">1-Click PO Dispatch</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Manager approves purchase order; supplier receives PDF copy via email.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  04. RESTOCK
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Goods Inward Receipt</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Delivery is verified on mobile; stock counts return to optimal green.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <FeatureFaqSection moduleName="Inventory Management" faqs={inventoryFaqs} />

        {/* ── CONVERSION BANNER ── */}
        <FeatureConversionBanner
          title="Never Run Out of Essential Supplies Again."
          subtitle="Upgrade your hotel inventory control with Grove PMS to protect cash flow, prevent leakage, and guarantee flawless guest comfort."
          primaryCtaText="Start Free 14-Day Trial"
        />

        {/* ── MODULE NAVIGATION ── */}
        <FeatureModuleNav currentSlug="inventory-management" />
      </main>

      <PublicFooter />
    </div>
  );
}
