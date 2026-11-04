import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema, getSoftwareApplicationSchema } from '@/lib/seo/structuredData';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
} from 'lucide-react';

import HeroProductShowcase from '@/components/landing/hotel-management/HeroProductShowcase';
import OperationalFeaturesGrid from '@/components/landing/hotel-management/OperationalFeaturesGrid';
import ConnectedWorkflowSection from '@/components/landing/hotel-management/ConnectedWorkflowSection';
import LegacyComparisonSection from '@/components/landing/hotel-management/LegacyComparisonSection';
import ProductCapabilitiesTabs from '@/components/landing/hotel-management/ProductCapabilitiesTabs';
import SecurityArchitectureSection from '@/components/landing/hotel-management/SecurityArchitectureSection';
import OperationalBenefitsSection from '@/components/landing/hotel-management/OperationalBenefitsSection';
import ConversionBanner from '@/components/landing/hotel-management/ConversionBanner';

export const metadata: Metadata = {
  title: 'Hotel Management Software | Cloud Property Management System (PMS) | Grove',
  description:
    'Modern cloud hotel property management software built for independent boutique hotels, resorts, and homestays. Unify reservations, visual front desk matrix, live housekeeping, guest CRM, and automated GST billing.',
  alternates: {
    canonical: '/hotel-management-software',
  },
  openGraph: {
    title: 'Hotel Management Software | Cloud Property Management System (PMS) | Grove',
    description:
      'Modern cloud hotel property management software built for independent boutique hotels, resorts, and homestays. Unify reservations, visual front desk matrix, live housekeeping, guest CRM, and automated GST billing.',
    url: 'https://www.grovepms.me/hotel-management-software',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Management Software | Cloud Property Management System (PMS) | Grove',
    description:
      'Modern cloud hotel property management software built for independent boutique hotels, resorts, and homestays. Unify reservations, visual front desk matrix, live housekeeping, guest CRM, and automated GST billing.',
  },
};

export default function HotelManagementSoftwarePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Hotel Management Software', item: '/hotel-management-software' },
  ]);
  const softwareSchema = getSoftwareApplicationSchema();

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between relative overflow-x-hidden">
      {/* Page-wide subtle architectural grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 grove-grid-texture opacity-85"
        aria-hidden="true"
      />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={softwareSchema} />
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-12">
        {/* ── BREADCRUMB BAR ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5 font-medium">
            <Link href="/" className="hover:text-brand-forest transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-brand-forest font-semibold">Hotel Management Software</span>
          </nav>
        </div>

        {/* ── HERO SECTION ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8 sm:pb-12">
          {/* Eyebrow Pill */}
          <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-5 sm:mb-6 shadow-2xs">
            <Image
              src="/Grove.png"
              alt="Grove Logo"
              width={16}
              height={16}
              className="w-4 h-4 object-contain shrink-0"
            />
            <span>Grove PMS — Complete Hospitality Operating System</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight max-w-4xl mx-auto leading-[1.10]">
            Run Your Entire Hotel.
            <br />
            From One Intelligent Platform.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-7 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Manage reservations, room allocation, guest billing, housekeeping, restaurant orders and hotel operations through one connected cloud-based platform.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <GroveButton
              href="/register-hotel"
              variant="primary"
              size="lg"
              withArrow
              className="w-full sm:w-auto"
            >
              Start Free Trial
            </GroveButton>
            <GroveButton
              href="/pricing"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Explore Transparent Pricing
            </GroveButton>
          </div>

          {/* Trust Highlights */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-ink-muted">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-green" />
              <span>Full ₹999/month Transparent Plan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-green" />
              <span>Zero Hardware Installation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-green" />
              <span>Free Guided White-Glove Onboarding</span>
            </div>
          </div>

          {/* ── HERO PRODUCT SHOWCASE ── */}
          <HeroProductShowcase />
        </section>

        {/* ── 2. OPERATIONAL FOUNDATION (FEATURE SHOWCASE) ── */}
        <OperationalFeaturesGrid />

        {/* ── 3. CONNECTED WORKFLOW SECTION ── */}
        <ConnectedWorkflowSection />

        {/* ── 4. WHY GROVE (LEGACY SOFTWARE COMPARISON) ── */}
        <LegacyComparisonSection />

        {/* ── 5. PRODUCT CAPABILITIES TABS ── */}
        <ProductCapabilitiesTabs />

        {/* ── 6. SECURITY & MULTI-TENANT ARCHITECTURE ── */}
        <SecurityArchitectureSection />

        {/* ── 7. EDITORIAL BENEFITS SECTION ── */}
        <OperationalBenefitsSection />

        {/* ── 8. FINAL CONVERSION BANNER ── */}
        <ConversionBanner />
      </main>

      <PublicFooter />
    </div>
  );
}
