import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import GroveButton from '@/components/shared/GroveButton';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  Users,
  ShieldCheck,
  Search,
  FileText,
  History,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  UserCheck,
  Award,
  FileCheck,
  Smartphone,
} from 'lucide-react';

import GuestManagementShowcase from '@/components/landing/features/GuestManagementShowcase';
import FeatureFaqSection, { type FaqItem } from '@/components/landing/features/FeatureFaqSection';
import FeatureModuleNav from '@/components/landing/features/FeatureModuleNav';
import FeatureConversionBanner from '@/components/landing/features/FeatureConversionBanner';

export const metadata: Metadata = {
  title: 'Hotel Guest Management Software & Digital CRM | Grove PMS',
  description:
    'Centralized guest directory, Aadhaar and passport ID verification, past stay histories, personalized preferences, and Form-C compliance with Grove PMS.',
  alternates: {
    canonical: '/features/guest-management',
  },
  openGraph: {
    title: 'Hotel Guest Management Software & Digital CRM | Grove PMS',
    description:
      'Centralized guest directory, Aadhaar and passport ID verification, past stay histories, personalized preferences, and Form-C compliance with Grove PMS.',
    url: 'https://www.grovepms.me/features/guest-management',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Guest Management Software & Digital CRM | Grove PMS',
    description:
      'Centralized guest directory, Aadhaar and passport ID verification, past stay histories, personalized preferences, and Form-C compliance with Grove PMS.',
  },
};

const guestFaqs: FaqItem[] = [
  {
    question: 'How does Grove help with Indian Police Verification and Form-C compliance?',
    answer:
      'Grove digitally captures guest identity proof (Aadhaar, Passport, Driving License, Voter ID) along with nationality, permanent address, and contact numbers. With one click, managers can export the daily guest arrival manifest formatted for local police station submissions and foreign guest Form-C filings.',
  },
  {
    question: 'Does Grove automatically recognize returning repeat guests?',
    answer:
      'Yes. When entering a phone number or email during booking or walk-in check-in, Grove automatically matches the guest with their historical profile, instantly showing total past visits, lifetime spend, and stored preferences.',
  },
  {
    question: 'Can we store specific guest preferences like extra pillows or Jain food?',
    answer:
      'Yes. Front desk staff can record dietary preferences, room floor choices, anniversary dates, and special requests directly in the guest profile. These notes surface automatically to reception and kitchen teams on future stays.',
  },
  {
    question: 'Is guest personal identification data stored securely?',
    answer:
      'All guest documents and profiles are stored inside your hotel’s isolated database partition protected by PostgreSQL Row-Level Security and encryption at rest. Only authorized hotel staff with appropriate permissions can view guest identification.',
  },
];

export default function GuestManagementFeaturePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Features', item: '/hotel-management-software' },
    { name: 'Guest Management', item: '/features/guest-management' },
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
            <span className="text-brand-forest font-semibold">Guest Management</span>
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
            <span>Grove PMS — Digital Guest CRM &amp; Ledger</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight max-w-4xl mx-auto leading-[1.10]">
            Know Every Guest.
            <br />
            Deliver Unforgettable Hospitality.
          </h1>

          <p className="mt-5 sm:mt-7 text-base sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
            Replace loose paper registration cards with a centralized guest dossier. Securely verify government IDs, track lifetime visit spend, record personal preferences, and build lasting guest loyalty.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <GroveButton href="/register-hotel" variant="primary" size="lg" withArrow className="w-full sm:w-auto">
              Start Free Trial
            </GroveButton>
            <GroveButton href="/contact" variant="secondary" size="lg" className="w-full sm:w-auto">
              Request a Walkthrough
            </GroveButton>
          </div>

          {/* Interactive Guest CRM Showcase */}
          <GuestManagementShowcase />
        </section>

        {/* ── 4 CORE CAPABILITIES ASYMMETRICAL GRID ── */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block mb-2">
              Guest Experience Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black">
              Elevating Guest Relationships from Check-In to Checkout
            </h2>
            <p className="text-sm sm:text-base text-ink-muted mt-3">
              Designed to help boutique properties offer the high-touch, personalized service that drives direct repeat bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Capability 1 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Lifetime Stay &amp; Revenue History
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Grove automatically creates a unified guest profile tracking every room night, dining expenditure, and booking channel across months and years. Instantly recognize VIP guests the moment they call for a reservation.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Aggregated lifetime spend and average daily spend per visit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Automatic repeat guest badges and VIP tier tags</span>
                </li>
              </ul>
            </div>

            {/* Capability 2 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Government ID &amp; Police Form-C Readiness
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Stay compliant with statutory hospitality regulations effortlessly. Store encrypted photos of Aadhaar cards, Passports, and Visas with digital verification status, ready to export for local police station inspection.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>One-click digital Form-C generation for international visitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Daily police station arrival log exportable to Excel or PDF</span>
                </li>
              </ul>
            </div>

            {/* Capability 3 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Personalized Hospitality &amp; Dietary Notes
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Deliver true luxury service by remembering the details that matter: preferred room temperatures, extra pillows, vegan or Jain dietary restrictions, or anniversary celebrations. Notes sync directly to housekeeping and kitchen teams.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Auto-surfaced preference tags at front desk check-in</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Special instructions printed on restaurant KOTs automatically</span>
                </li>
              </ul>
            </div>

            {/* Capability 4 */}
            <div className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-6 sm:p-8 shadow-[0_10px_30px_rgba(20,28,26,0.03)] space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#142320]">
                Direct Communication &amp; WhatsApp Connect
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Connect directly with your guests via WhatsApp. Send pre-arrival driving directions, room keys, digital stay confirmations, and post-stay review requests directly to the guest’s mobile device in one click.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#142320]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Instant WhatsApp folio and invoice dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Build your own direct booking customer database without OTA lock-in</span>
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
                Guest Relationship Lifecycle
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black">
                From Check-in Verification to Lifelong Loyalty
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  01. CAPTURE
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Digital Dossier</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Record name, phone, email, and upload photo ID proof in seconds during check-in.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  02. COMPLY
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Statutory Form-C</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  System logs government identification and prepares daily police arrival manifests.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  03. PERSONALIZE
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">In-Stay Notes</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Kitchen and housekeeping access preferences to deliver customized hospitality.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#1C2D29]/8 shadow-2xs space-y-2 relative">
                <span className="font-mono font-bold text-xs text-brand-forest px-2 py-0.5 rounded bg-brand-sand">
                  04. REENGAGE
                </span>
                <h4 className="font-serif font-bold text-base text-[#142320]">Direct Repeat</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Returning guests are instantly greeted by name, skipping tedious paperwork.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <FeatureFaqSection moduleName="Guest Management" faqs={guestFaqs} />

        {/* ── CONVERSION BANNER ── */}
        <FeatureConversionBanner
          title="Build Real Guest Relationships. Own Your Customer Data."
          subtitle="Upgrade your hotel with Grove PMS to transform one-time visitors into lifelong, direct-booking repeat guests."
          primaryCtaText="Start Free 14-Day Trial"
        />

        {/* ── MODULE NAVIGATION ── */}
        <FeatureModuleNav currentSlug="guest-management" />
      </main>

      <PublicFooter />
    </div>
  );
}
