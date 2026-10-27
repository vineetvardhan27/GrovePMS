import type { Metadata } from 'next';
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
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Inventory Management & Stock Software',
  description:
    'Monitor hotel inventory levels, track room consumables, manage minibar items, and prevent stock-outs with Grove PMS hotel inventory software.',
  alternates: {
    canonical: '/features/inventory-management',
  },
  openGraph: {
    title: 'Hotel Inventory Management & Stock Software | Grove PMS',
    description:
      'Monitor hotel inventory levels, track room consumables, manage minibar items, and prevent stock-outs with Grove PMS hotel inventory software.',
    url: 'https://www.grovepms.me/features/inventory-management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Inventory Management & Stock Software | Grove PMS',
    description:
      'Monitor hotel inventory levels, track room consumables, manage minibar items, and prevent stock-outs with Grove PMS hotel inventory software.',
  },
};

export default function InventoryManagementFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Inventory Management', item: '/features/inventory-management' },
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
            <span className="text-brand-forest font-semibold">Inventory Management</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-6 shadow-2xs">
            <Warehouse className="w-3.5 h-3.5" />
            <span>Stock & Consumables Control</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Hotel Inventory Management Software
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Take total control over property supplies. Monitor toiletries, linens, minibar stock, and food & beverage ingredients in real-time, preventing unexpected shortages and inventory leakage.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request Inventory Demo
            </GroveButton>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="bg-white border-y border-border-subtle py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
                Supply Chain Visibility
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                Precision Stock Auditing Across Every Department
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Departmental Categorization</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Track stock categorized by Housekeeping (toiletries, linen, detergents), F&B (beverages, dairy, pantry), and Front Desk stationery.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Low Stock Alert Triggers</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Set minimum threshold levels per item. Grove flags low-stock warnings before essential amenities run out during peak weekend occupancy.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-brand-sand/30 border border-border-subtle space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">Wastage & Audit Logs</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Maintain an immutable record of every inventory receipt, issue, or damage write-off with staff accountability and date stamps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Connected System Navigation */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-xl text-brand-forest">Part of the Connected Grove PMS</h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">See how housekeeping and F&B operations feed directly into inventory logs.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-forest">
              <Link href="/features/room-management" className="hover:underline flex items-center gap-1">
                <span>Room Management</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/features/reports" className="hover:underline flex items-center gap-1">
                <span>Manager Reports</span>
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
