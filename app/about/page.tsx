import type { Metadata } from 'next';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { Hotel, Sparkles, Building2, MapPin, CheckCircle2, Shield } from 'lucide-react';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = {
  title: 'About — Hotel Software for Independent Hotel Owners',
  description:
    'Learn about Grove PMS — engineered to bring calm, connected, and reliable cloud PMS technology to independent hotels, boutique resorts, and homestays.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Grove PMS | Hotel Software for Independent Hotel Owners',
    description:
      'Learn about Grove PMS — engineered to bring calm, connected, and reliable cloud PMS technology to independent hotels, boutique resorts, and homestays.',
    url: 'https://www.grovepms.me/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Grove PMS | Hotel Software for Independent Hotel Owners',
    description:
      'Learn about Grove PMS — engineered to bring calm, connected, and reliable cloud PMS technology to independent hotels, boutique resorts, and homestays.',
  },
};

export default function AboutPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'About', item: '/about' },
  ]);

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <JsonLd data={breadcrumbSchema} />
      <PublicHeader />


      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-12 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product & Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight">
            About Grove
          </h1>
          <p className="text-base sm:text-lg text-ink-muted mt-3 max-w-2xl leading-relaxed">
            The operating system engineered to bring calm, connected, and reliable technology to independent hotels,
            resorts, and boutique hospitality properties.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm sm:text-base text-ink-muted leading-relaxed">
          {/* Mission */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-forest mb-3">Our Mission</h2>
            <p>
              Hospitality operations are inherently dynamic. Between check-ins, room cleans, restaurant orders, banquet
              inquiries, and GST filings, traditional hotels often struggle with fragmented software, spreadsheet
              workarounds, and isolated systems.
            </p>
            <p className="mt-3">
              Grove was created to unify every facet of property operations into one clean, responsive workspace. By
              connecting reservations, front desk, billing, food & beverage, banquets, housekeeping, and owner reports,
              we help hospitality teams deliver better guest experiences while maintaining complete financial clarity.
            </p>
          </section>

          {/* Core Philosophy */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-forest mb-4">Product Principles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-border-subtle">
                <h3 className="font-serif font-bold text-base text-ink mb-1.5">1. Connected by Design</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Every reservation connects to a guest, every room charge links to a folio, and every payment updates the
                  owner&apos;s daily report automatically.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-border-subtle">
                <h3 className="font-serif font-bold text-base text-ink mb-1.5">2. Calm & Responsive</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Engineered with fast keyboard navigation, zero lag, and clear visual status indicators so reception staff
                  can serve guests without software delays.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-border-subtle">
                <h3 className="font-serif font-bold text-base text-ink mb-1.5">3. Strictly Isolated</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  PostgreSQL Row-Level Security ensures that each hotel property operates inside an impenetrable, isolated
                  database boundary.
                </p>
              </div>
            </div>
          </section>

          {/* Customer Spotlight */}
          <section id="case-studies" className="bg-white rounded-3xl p-6 sm:p-8 border border-border-subtle">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-forest/60 block mb-1">
              Customer Spotlight
            </span>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0">
                <Hotel className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-brand-forest">Hotel Greenery View</h3>
                <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-forest/70" />
                  <span>Gangtok, Sikkim</span>
                </div>
                <p className="text-xs sm:text-sm text-ink-muted mt-3 leading-relaxed">
                  Hotel Greenery View is an exemplary 19-room boutique property located in Gangtok, running its full front
                  desk, housekeeping turnarounds, restaurant billing, and financial reconciliations on Grove.
                </p>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border-subtle text-center">
                  <div>
                    <span className="font-serif font-bold text-brand-forest text-base sm:text-lg">19</span>
                    <span className="block text-[10px] text-ink-muted">Rooms Managed</span>
                  </div>
                  <div>
                    <span className="font-serif font-bold text-brand-forest text-base sm:text-lg">4</span>
                    <span className="block text-[10px] text-ink-muted">Staff Roles</span>
                  </div>
                  <div>
                    <span className="font-serif font-bold text-brand-forest text-base sm:text-lg">100%</span>
                    <span className="block text-[10px] text-ink-muted">Digital Folios</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
