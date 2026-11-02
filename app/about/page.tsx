import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import HotelPropertyShowcase from '@/components/landing/HotelPropertyShowcase';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  Hotel,
  Sparkles,
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Zap,
  Lock,
  Scale,
  Receipt,
  Users,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Quote,
  HeartHandshake,
  Laptop,
  Check,
  TrendingDown,
  BedDouble,
  FileSpreadsheet,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About — Hotel Software for Independent Hotel Owners | Grove PMS',
  description:
    'Learn about Grove PMS — engineered to bring calm, connected, and reliable cloud PMS technology to independent hotels, boutique resorts, and homestays across India.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Grove PMS | Hotel Software for Independent Hotel Owners',
    description:
      'Learn about Grove PMS — engineered to bring calm, connected, and reliable cloud PMS technology to independent hotels, boutique resorts, and homestays across India.',
    url: 'https://www.grovepms.me/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Grove PMS | Hotel Software for Independent Hotel Owners',
    description:
      'Learn about Grove PMS — engineered to bring calm, connected, and reliable cloud PMS technology to independent hotels, boutique resorts, and homestays across India.',
  },
};

export default function AboutPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'About', item: '/about' },
  ]);

  const corePillars = [
    {
      icon: Zap,
      number: '01',
      title: 'Calm by Design (Zero Operational Lag)',
      description:
        'Front desks cannot freeze when thirty guests arrive at once. Grove is engineered for rapid keyboard interaction, sub-second screen transitions, and instant search so reception staff never keep a guest waiting.',
      benefit: 'Average check-in time: under 45 seconds',
    },
    {
      icon: Lock,
      number: '02',
      title: 'Database-Level Tenant Isolation',
      description:
        'We do not rely on fragile application code for data security. Every guest ledger, billing record, and reservation is strictly protected by PostgreSQL Row-Level Security (RLS) directly at the database engine level.',
      benefit: 'Guaranteed 100% data partition per property',
    },
    {
      icon: Scale,
      number: '03',
      title: 'Honest, Hoteliers-First Economics',
      description:
        'We charge a flat ₹999/month. We never levy hidden commissions on direct bookings, never charge extra fees as your occupancy grows, and never take a percentage cut of your hard-earned room revenue.',
      benefit: 'Save ₹30,000–₹80,000 annually vs legacy systems',
    },
    {
      icon: Users,
      number: '04',
      title: 'Field-Tested in Real Operating Hotels',
      description:
        'Grove was not conceived in an abstract tech office. We developed and refined our workflows on-site inside operational boutique hotels, standing side-by-side with front-desk staff, night auditors, and housekeepers.',
      benefit: 'Zero training curve for new receptionists',
    },
  ];

  const operationalDifferences = [
    {
      legacy: 'Separate paper registers, offline desktop PCs prone to hard drive crashes, and lost bills.',
      grove: 'Cloud-native sync across reception, restaurant, and housekeeping on any phone, tablet, or laptop.',
    },
    {
      legacy: 'Midnight audit stress: 90+ minutes matching room chits, bar receipts, and cash drawers.',
      grove: 'Sub-4-minute automated night audit closeout with unified billing and audited GST ledgers.',
    },
    {
      legacy: 'High commission cuts (2–3% of gross hotel revenue) or exorbitant per-room software licenses.',
      grove: 'Flat, transparent ₹999/month per hotel with unlimited rooms, unlimited staff accounts, and zero commissions.',
    },
    {
      legacy: 'Complicated menus designed 15 years ago that take weeks of training for new front-desk hires.',
      grove: 'Editorial, intuitive hospitality interface that staff master comfortably on their very first shift.',
    },
  ];

  const complianceFeatures = [
    {
      icon: Receipt,
      title: 'Indian GST & SAC Compliance',
      description:
        'Built-in sequential GST tax invoicing, dual-slab room rates (12% / 18%), itemized F&B food slabs, and instant monthly GSTR-1 & GSTR-3B summary exports for your accountant.',
    },
    {
      icon: ShieldCheck,
      title: 'Statutory Guest Registers & Form-C',
      description:
        'Compliant digital check-in logs capturing mandatory identification details (Aadhaar, Passport, Visa reference) with instant guest search for local authority audits.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Immutable Shift & Cash Audit Trails',
      description:
        'Every room tariff posting, payment receipt, advance token, discount, and room status transition is permanently attributed to the active staff user ID.',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 relative overflow-x-hidden flex flex-col justify-between">
      <JsonLd data={breadcrumbSchema} />

      {/* Subtle Architectural Grid Texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 grove-grid-texture opacity-50"
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
            <div className="grove-glass-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-brand-forest text-xs font-semibold mb-5 sm:mb-6 shadow-2xs">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={16}
                height={16}
                className="w-4 h-4 object-contain shrink-0"
              />
              <span>Grove PMS — Hospitality Engineering &amp; Philosophy</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight leading-[1.10]">
              Technology Crafted to Bring Calm to Hotel Operations.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 sm:mt-8 text-base sm:text-xl text-ink-muted leading-relaxed max-w-3xl mx-auto">
              We engineer intuitive, high-performance cloud software for boutique hotels, heritage stays, and independent resorts across India. Built out of first-hand operational frustration with bloated legacy systems, lost chits, and fragmented tools.
            </p>

            {/* SLA & Architecture Assurance Pills */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-semibold text-ink-muted">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                <span>100% Cloud-Native OS</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                <span>Database-Enforced Tenant Isolation</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                <span>Flat ₹999/mo · Zero Commission</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                <span>Built for Indian Hospitality Regulations</span>
              </span>
            </div>
          </section>

          {/* ── 2. THE ORIGIN STORY: WHY WE BUILT GROVE ── */}
          <section className="mb-20 sm:mb-28">
            <div className="rounded-[28px] sm:rounded-[36px] bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_24px_70px_-12px_rgba(20,38,34,0.09)] p-6 sm:p-10 lg:p-14 relative overflow-hidden">
              <div
                className="pointer-events-none absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                {/* Left Column: Narrative */}
                <div className="lg:col-span-6 space-y-5 text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block">
                    Our Origin &amp; Purpose
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black tracking-tight leading-tight">
                    Hospitality is Personal. Software Shouldn’t Get in the Way.
                  </h2>
                  <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                    Step behind the front desk of most independent hotels and you’ll witness a familiar scene: a receptionist juggling three ring-bound register books, an offline desktop PC displaying an archaic Windows 98-era software interface, handwritten kitchen slips tacked to a corkboard, and an owner spending hours each night cross-checking Excel formulas.
                  </p>
                  <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                    Hotels run 24 hours a day, 365 days a year. When software fails, crashes, or takes five minutes to log a simple room extension, it directly degrades guest hospitality.
                  </p>
                  <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                    We built Grove to eliminate that friction completely. By bringing reservations, room matrix, guest folios, restaurant KOTs, housekeeping status, and management reporting under a single, unified cloud architecture, Grove delivers effortless operational calm.
                  </p>

                  <div className="pt-2">
                    <div className="inline-flex items-center gap-3 p-3.5 rounded-2xl bg-brand-sand/60 border border-[#1C2D29]/10">
                      <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0">
                        <Quote className="w-5 h-5 text-emerald-300" />
                      </div>
                      <p className="text-xs font-medium text-ink italic leading-snug">
                        &ldquo;Our design rule is simple: if a front-desk receptionist cannot execute an action in under three clicks, the interface is broken and needs rethinking.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Contrast Box */}
                <div className="lg:col-span-6">
                  <div className="rounded-3xl bg-[#153630] text-white p-6 sm:p-8 lg:p-9 shadow-xl relative overflow-hidden">
                    <div
                      className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl"
                      aria-hidden="true"
                    />

                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-3">
                      The Operational Paradigm Shift
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6">
                      Traditional Chaos vs. The Grove Way
                    </h3>

                    <div className="space-y-4">
                      {operationalDifferences.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                        >
                          <div className="flex items-start gap-2.5 text-xs text-brand-sand/70 mb-2">
                            <span className="font-mono text-status-red text-[11px] font-bold uppercase shrink-0 mt-0.5">
                              [Traditional]
                            </span>
                            <span className="line-through opacity-85 leading-relaxed">{item.legacy}</span>
                          </div>
                          <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-white font-medium">
                            <span className="font-mono text-emerald-400 text-[11px] font-bold uppercase shrink-0 mt-0.5">
                              [Grove OS]
                            </span>
                            <span className="leading-relaxed text-emerald-50">{item.grove}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. PRODUCT & ENGINEERING PRINCIPLES ── */}
          <section className="mb-20 sm:mb-28 text-center">
            <div className="max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Foundational Values</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
                Principles That Shape How We Build.
              </h2>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
                Every architectural decision, database query, and interface design choice in Grove is governed by four core commitments to hoteliers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
              {corePillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="rounded-[28px] bg-white/75 backdrop-blur-md border border-white/80 p-7 sm:p-9 shadow-[0_12px_32px_-6px_rgba(20,38,34,0.05)] hover:shadow-[0_18px_44px_-8px_rgba(20,38,34,0.10)] transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-brand-forest/8 text-brand-forest flex items-center justify-center border border-brand-forest/10 group-hover:scale-105 transition-transform duration-200">
                          <Icon className="w-6 h-6 text-brand-forest" />
                        </div>
                        <span className="font-mono text-xs font-bold text-brand-forest/60 bg-brand-sand px-2.5 py-1 rounded-full border border-border-subtle/60">
                          {pillar.number}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-black mb-3">
                        {pillar.title}
                      </h3>

                      <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#1C2D29]/8 flex items-center gap-2 text-xs font-semibold text-brand-forest">
                      <Check className="w-4 h-4 text-status-green stroke-[3] shrink-0" />
                      <span>{pillar.benefit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 4. CUSTOMER SPOTLIGHT: HOTEL GREENERY VIEW ── */}
          <section id="case-studies" className="mb-20 sm:mb-28">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Field-Proven Operations</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
                Powering Boutique Hospitality in Sikkim.
              </h2>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
                Discover how Hotel Greenery View unified their front desk, housekeeping turnarounds, and kitchen orders on Grove PMS.
              </p>
            </div>

            <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-border-subtle/80 shadow-[0_20px_50px_-15px_rgba(31,61,58,0.09)] overflow-hidden transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Left Column: Story & Metrics */}
                <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 text-left">
                  <div>
                    {/* Live status badge & location */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Customer Property
                      </span>
                      <span className="text-[11px] font-medium text-ink-muted bg-brand-sand/70 px-2.5 py-1 rounded-full border border-border-subtle/50">
                        Boutique Hotel
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted bg-brand-sand/70 px-2.5 py-1 rounded-full border border-border-subtle/50">
                        <MapPin className="w-3 h-3 text-brand-forest/70" />
                        <span>Gangtok, Sikkim</span>
                      </span>
                    </div>

                    {/* Hotel Header with Logo & Direct Website Link */}
                    <div className="flex items-center gap-3.5 sm:gap-4 mb-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FAF8F5] border border-border-subtle/80 shadow-2xs overflow-hidden flex items-center justify-center shrink-0 p-1.5 transition-transform duration-200 hover:scale-105">
                        <Image
                          src="/images/hotel/hotel-greenery-view-logo.png"
                          alt="Hotel Greenery View Logo"
                          width={56}
                          height={56}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-2xl sm:text-3xl text-black tracking-tight leading-tight">
                          Hotel Greenery View
                        </h3>
                        <a
                          href="https://hotelgreeneryview.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11.5px] sm:text-xs text-brand-forest hover:text-brand-forest-light font-medium transition-colors mt-0.5 group/link"
                        >
                          <span className="underline underline-offset-2">hotelgreeneryview.com</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-brand-forest/70 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </a>
                      </div>
                    </div>

                    <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed">
                      Hotel Greenery View is an exemplary 19-room boutique property located in Gangtok. Operating across multiple floors with in-house dining, banquet facilities, and active walk-in guests, the management required a modern system that could coordinate reservations, housekeeping clean statuses, and restaurant food orders without paper delays.
                    </p>

                    <blockquote className="mt-5 p-4 rounded-2xl bg-brand-sand/40 border border-[#1C2D29]/8 text-xs sm:text-sm text-ink italic leading-relaxed">
                      &ldquo;Before Grove, evening closeouts were exhausting. We had separate registers for room check-ins, dining bills, and token advances. Grove brought everything onto one clean dashboard. Even during peak seasonal rushes, our front desk is calm and organized.&rdquo;
                    </blockquote>

                    {/* Active Modules Tags */}
                    <div className="mt-5 pt-4 border-t border-[#1C2D29]/8">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest/65 block mb-2">
                        Active Operational Modules:
                      </span>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {[
                          'Front Desk Matrix',
                          'Digital Folios',
                          'F&B Restaurant KOT',
                          'Housekeeping Dispatch',
                          'GST Sequential Invoices',
                          'Owner Flash Reports',
                        ].map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center text-[11px] font-medium text-brand-forest bg-[#F6F3ED] border border-[#E7E2D6] px-2.5 py-1 rounded-full"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-forest text-white text-xs sm:text-sm font-semibold shadow-xs hover:bg-brand-forest-light transition-all"
                    >
                      <span>Explore Transparent ₹999/mo Plan</span>
                      <ArrowRight className="w-4 h-4 text-emerald-300" />
                    </Link>
                    <a
                      href="https://hotelgreeneryview.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#1C2D29]/15 text-xs sm:text-sm font-semibold text-brand-forest hover:bg-brand-sand/60 hover:border-brand-forest/30 transition-all duration-200"
                    >
                      <span>Visit Hotel Website</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-brand-forest/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                    <Link
                      href="/contact"
                      className="px-4 py-2.5 rounded-full bg-white border border-[#1C2D29]/15 text-xs sm:text-sm font-semibold text-brand-forest hover:bg-brand-sand/60 transition-colors"
                    >
                      Schedule Guided Walkthrough
                    </Link>
                  </div>
                </div>

                {/* Right Column: Hotel Photograph with Interactive Parallax */}
                <HotelPropertyShowcase className="lg:col-span-5" />
              </div>

              {/* Bottom Integrated Stats Shelf */}
              <div className="border-t border-border-subtle/80 bg-brand-sand/35 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle/80 text-left">
                <div className="p-5 sm:p-6 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-border-subtle/80 flex items-center justify-center text-brand-forest shrink-0">
                    <BedDouble className="w-5 h-5 text-brand-forest" />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-black tabular-nums block">
                      19
                    </span>
                    <span className="text-[11px] text-ink-muted">Rooms Managed Live</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-border-subtle/80 flex items-center justify-center text-brand-forest shrink-0">
                    <Users className="w-5 h-5 text-brand-forest" />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-black tabular-nums block">
                      4
                    </span>
                    <span className="text-[11px] text-ink-muted">Staff Access Roles</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-border-subtle/80 flex items-center justify-center text-brand-forest shrink-0">
                    <Receipt className="w-5 h-5 text-brand-forest" />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-black tabular-nums block">
                      100%
                    </span>
                    <span className="text-[11px] text-ink-muted">Digital Folio Settlement</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-border-subtle/80 flex items-center justify-center text-brand-forest shrink-0">
                    <Clock className="w-5 h-5 text-brand-forest" />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-black tabular-nums block">
                      &lt; 4m
                    </span>
                    <span className="text-[11px] text-ink-muted">Night Audit Closeout</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. COMPLIANCE & RESPONSIBLE OPERATIONS ── */}
          <section className="mb-20 sm:mb-28 text-center">
            <div className="max-w-3xl mx-auto mb-12 sm:mb-14 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold tracking-wider uppercase">
                <Scale className="w-3.5 h-3.5" />
                <span>Statutory Readiness</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
                Engineered for Indian Hospitality Regulations.
              </h2>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
                Never stress over an unexpected tax audit, missing guest ID records, or tax invoice discrepancies again.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {complianceFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-6 sm:p-7 rounded-2xl bg-white border border-border-subtle shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-black">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 6. FAST-TRACK CONVERSION CALLOUT ── */}
          <section className="pt-6">
            <div className="rounded-[28px] sm:rounded-[36px] bg-white/70 backdrop-blur-xl border border-white/80 p-8 sm:p-12 lg:p-14 text-center shadow-lg relative overflow-hidden">
              <div
                className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl"
                aria-hidden="true"
              />

              <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block">
                  Begin Your Modernization Today
                </span>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-black tracking-tight leading-tight">
                  Experience What Calm Operations Feel Like.
                </h2>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Join boutique hotel owners who have replaced disjointed software, manual logs, and spreadsheet reconciliations with Grove.
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
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#1C2D29]/15 text-brand-forest font-serif font-bold text-sm sm:text-base hover:bg-brand-sand/60 transition-colors text-center shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <span>View Pricing (₹999/mo)</span>
                  </Link>
                </div>
                <p className="mt-4 text-xs text-ink-muted">
                  Have specific questions for your property?{' '}
                  <Link href="/contact" className="font-semibold text-brand-forest underline hover:text-brand-forest-light">
                    Schedule a Guided Consultation →
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
