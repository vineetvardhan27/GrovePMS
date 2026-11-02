import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import MultiPropertyArchitecture from '@/components/landing/MultiPropertyArchitecture';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbSchema } from '@/lib/seo/structuredData';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Database,
  UserCheck,
  Server,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  FileCheck,
  Network,
  HardDrive,
  EyeOff,
  Terminal,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hotel Data Security & Tenant Isolation | Grove PMS',
  description:
    'Discover how Grove PMS secures hotel operations with PostgreSQL Row-Level Security, multi-tenant database isolation, encrypted sessions, and granular RBAC.',
  alternates: {
    canonical: '/security',
  },
  openGraph: {
    title: 'Hotel Data Security & Tenant Isolation | Grove PMS',
    description:
      'Discover how Grove PMS secures hotel operations with PostgreSQL Row-Level Security, multi-tenant database isolation, encrypted sessions, and granular RBAC.',
    url: 'https://www.grovepms.me/security',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel Data Security & Tenant Isolation | Grove PMS',
    description:
      'Discover how Grove PMS secures hotel operations with PostgreSQL Row-Level Security, multi-tenant database isolation, encrypted sessions, and granular RBAC.',
  },
};

export default function SecurityPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Security', item: '/security' },
  ]);

  const securityPillars = [
    {
      icon: Database,
      number: '01',
      title: 'PostgreSQL Row-Level Security (RLS)',
      description:
        'Every database read, write, update, and delete is evaluated directly inside PostgreSQL using kernel-enforced Row-Level Security policies. Queries automatically inject the authenticated staff member’s hotel_id boundary.',
      highlight: 'Zero application-layer leakage risk',
    },
    {
      icon: Lock,
      number: '02',
      title: 'Cryptographic Session Management',
      description:
        'Authentication is powered by Supabase with time-bounded, digitally signed JWT tokens. Tokens are transmitted strictly over secure HTTP-only cookies with SameSite=Lax attributes to protect against XSS and CSRF exploits.',
      highlight: '60-minute cryptographic token refresh',
    },
    {
      icon: KeyRound,
      number: '03',
      title: 'Granular Role-Based Access (RBAC)',
      description:
        'Grove enforces rigid principle-of-least-privilege boundaries across four staff tiers (Owner, Manager, Reception, Housekeeping). Staff only see the operational modules required for their shift.',
      highlight: 'Separation of duties & zero privilege creep',
    },
    {
      icon: UserCheck,
      number: '04',
      title: 'Staff Identity & Verified Onboarding',
      description:
        'Public staff signups are permanently disabled. Only the verified Hotel Owner can provision, assign roles to, or deactivate staff accounts, preventing rogue access to property records.',
      highlight: 'Owner-controlled staff access lifecycle',
    },
  ];

  const rbacMatrix = [
    {
      feature: 'Hotel Settings & Tax Slabs',
      owner: true,
      manager: false,
      reception: false,
      housekeeping: false,
    },
    {
      feature: 'Staff User Provisioning',
      owner: true,
      manager: false,
      reception: false,
      housekeeping: false,
    },
    {
      feature: 'Monthly GSTR Tax Reports & Exports',
      owner: true,
      manager: false,
      reception: false,
      housekeeping: false,
    },
    {
      feature: 'Daily Flash Revenue Reports',
      owner: true,
      manager: true,
      reception: false,
      housekeeping: false,
    },
    {
      feature: 'Room Availability Matrix & Booking Diary',
      owner: true,
      manager: true,
      reception: true,
      housekeeping: false,
    },
    {
      feature: 'Guest Check-in, Check-out & Folio Settlement',
      owner: true,
      manager: true,
      reception: true,
      housekeeping: false,
    },
    {
      feature: 'F&B Restaurant Table Orders & KOT Printing',
      owner: true,
      manager: true,
      reception: true,
      housekeeping: false,
    },
    {
      feature: 'Housekeeping Turnarounds & Cleaning Statuses',
      owner: true,
      manager: true,
      reception: true,
      housekeeping: true,
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
              <span>Grove PMS — Zero-Trust Hospitality Infrastructure</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-black tracking-tight leading-[1.10]">
              Enterprise Data Security &amp; Architectural Isolation.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 sm:mt-8 text-base sm:text-xl text-ink-muted leading-relaxed max-w-3xl mx-auto">
              How Grove PMS protects your hotel’s bookings, guests, folios, and revenues with kernel-level PostgreSQL Row-Level Security, end-to-end encrypted sessions, and strict multi-tenant boundaries.
            </p>

            {/* Security Assurance Badges */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-semibold text-ink-muted">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                <span>PostgreSQL Row-Level Security (RLS)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                <span>TLS 1.3 In-Transit Encryption</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                <span>Automated Daily Backups</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-border-subtle shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                <span>Zero Public Staff Registrations</span>
              </span>
            </div>
          </section>

          {/* ── 2. CORE SECURITY PILLARS ── */}
          <section className="mb-20 sm:mb-28">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Architectural Guarantees</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
                Four Layers of Property Protection.
              </h2>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
                Security in Grove is implemented at the database engine level, ensuring that data partitions are physically impossible to bypass.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
              {securityPillars.map((pillar) => {
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
                      <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
                      <span>{pillar.highlight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 3. INTERACTIVE MULTI-PROPERTY ARCHITECTURE DIAGRAM ── */}
          <section className="mb-20 sm:mb-28">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold tracking-wider uppercase">
                <Network className="w-3.5 h-3.5" />
                <span>Multi-Tenant Visualization</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
                How Properties Coexist Without Shared State.
              </h2>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
                Explore how independent properties operate concurrently while maintaining airtight database partition.
              </p>
            </div>

            <div className="rounded-[28px] sm:rounded-[36px] bg-white/70 backdrop-blur-xl border border-white/80 p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-15px_rgba(31,61,58,0.08)]">
              <MultiPropertyArchitecture inView={true} />
            </div>
          </section>

          {/* ── 4. TECHNICAL DATA PIPELINE & SQL POLICY DEEP-DIVE ── */}
          <section className="mb-20 sm:mb-28">
            <div className="rounded-[28px] sm:rounded-[36px] bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_24px_70px_-12px_rgba(20,38,34,0.09)] p-6 sm:p-10 lg:p-14 text-left">
              <div className="max-w-3xl mx-auto space-y-5">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block">
                  Engine-Level Enforcement
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-black tracking-tight leading-tight">
                  The Four-Stage Data Resolution Pipeline
                </h2>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  In generic SaaS applications, tenant isolation often depends on developers remembering to add a <code className="text-xs font-mono bg-brand-sand px-1.5 py-0.5 rounded text-brand-forest">WHERE hotel_id = ...</code> clause to every single API endpoint. If one engineer forgets a where clause, data leaks across hotels.
                </p>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Grove eliminates human error by enforcing data scoping at the PostgreSQL database engine layer. Every incoming query passes through the immutable pipeline below:
                </p>

                {/* Pipeline Visual Breadcrumb */}
                <div className="my-6 p-4 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#1C2D29]/10 space-y-3 font-mono text-xs text-ink">
                  <div className="text-ink-muted font-sans font-bold text-xs uppercase tracking-wider mb-2">
                    Resolution Pipeline Workflow:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center font-sans font-semibold">
                    <div className="p-3 rounded-xl bg-white border border-border-subtle shadow-2xs">
                      <span className="text-[10px] text-brand-forest/70 block uppercase">Step 01</span>
                      <span className="text-xs text-black">Supabase Auth</span>
                      <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">auth.users.id</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-border-subtle shadow-2xs">
                      <span className="text-[10px] text-brand-forest/70 block uppercase">Step 02</span>
                      <span className="text-xs text-black">Staff Binding</span>
                      <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">staff.hotel_id</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-border-subtle shadow-2xs">
                      <span className="text-[10px] text-brand-forest/70 block uppercase">Step 03</span>
                      <span className="text-xs text-black">Tenant Context</span>
                      <span className="text-[10px] text-ink-muted block mt-0.5 font-mono">hotels.id</span>
                    </div>
                    <div className="p-3 rounded-xl bg-brand-forest text-white shadow-2xs">
                      <span className="text-[10px] text-emerald-300 block uppercase">Step 04</span>
                      <span className="text-xs text-white">PostgreSQL RLS</span>
                      <span className="text-[10px] text-white/80 block mt-0.5 font-mono">WHERE scoped</span>
                    </div>
                  </div>
                </div>

                {/* SQL Code Block */}
                <div className="rounded-2xl bg-[#142320] text-emerald-100 p-5 sm:p-6 font-mono text-xs overflow-x-auto shadow-inner border border-white/10">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-white/60 text-[11px] font-sans">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>supabase/migrations/rls_hotel_isolation.sql</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Active Policy
                    </span>
                  </div>
                  <pre className="leading-relaxed">
{`-- 1. Enable Row-Level Security on critical tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- 2. Define non-bypassable policy for staff membership
CREATE POLICY "staff_hotel_isolation_policy" ON public.bookings
  FOR ALL
  TO authenticated
  USING (
    hotel_id IN (
      SELECT s.hotel_id FROM public.staff s
      WHERE s.id = auth.uid() AND s.is_active = true
    )
  );`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX ── */}
          <section className="mb-20 sm:mb-28">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold tracking-wider uppercase">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Permission Governance</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-black tracking-tight leading-[1.15]">
                Role-Based Operational Matrix.
              </h2>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
                Strict boundaries prevent receptionists from viewing financial reports, or housekeepers from altering room tariffs.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF8F5] border-b border-border-subtle text-ink-muted font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5 sm:px-6">Operational Scope</th>
                      <th className="py-4 px-4 text-center">Owner</th>
                      <th className="py-4 px-4 text-center">Manager</th>
                      <th className="py-4 px-4 text-center">Reception</th>
                      <th className="py-4 px-4 text-center">Housekeeping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/70">
                    {rbacMatrix.map((row) => (
                      <tr key={row.feature} className="hover:bg-brand-sand/30 transition-colors">
                        <td className="py-3.5 px-5 sm:px-6 font-medium text-black">
                          {row.feature}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {row.owner ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-status-green/10 text-status-green mx-auto">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="text-ink-muted/40">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {row.manager ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-status-green/10 text-status-green mx-auto">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="text-ink-muted/40">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {row.reception ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-status-green/10 text-status-green mx-auto">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="text-ink-muted/40">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {row.housekeeping ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-status-green/10 text-status-green mx-auto">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="text-ink-muted/40">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── 6. DISASTER RECOVERY & VULNERABILITY DISCLOSURE ── */}
          <section className="mb-20 sm:mb-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
              <div className="p-7 sm:p-9 rounded-[28px] bg-white border border-border-subtle shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                  <HardDrive className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-black">
                  Disaster Recovery &amp; Automated Backups
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Unlike traditional on-premise hotel servers where a single hard drive failure or power surge can wipe out years of guest records, Grove performs automated daily PostgreSQL snapshots with point-in-time recovery.
                </p>
                <div className="pt-2 text-xs font-semibold text-brand-forest flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                  <span>Hosted in secure AWS Mumbai (ap-south-1) data centers</span>
                </div>
              </div>

              <div className="p-7 sm:p-9 rounded-[28px] bg-white border border-border-subtle shadow-2xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-forest/10 text-brand-forest flex items-center justify-center">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-black">
                  Responsible Vulnerability Disclosure
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  We believe in community-driven, transparent software security. If you discover a potential vulnerability in Grove PMS, please email our engineering response desk immediately at{' '}
                  <span className="font-semibold text-brand-forest">security@grovepms.com</span>.
                </p>
                <div className="pt-2 text-xs font-semibold text-brand-forest flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-status-green" />
                  <span>Acknowledged &amp; triaged within 24 hours</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── 7. FAST-TRACK CONVERSION CALLOUT ── */}
          <section className="pt-6">
            <div className="rounded-[28px] sm:rounded-[36px] bg-white/70 backdrop-blur-xl border border-white/80 p-8 sm:p-12 lg:p-14 text-center shadow-lg relative overflow-hidden">
              <div
                className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl"
                aria-hidden="true"
              />

              <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/70 block">
                  Enterprise Hospitality Protection
                </span>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-black tracking-tight leading-tight">
                  Protect Your Hotel’s Data Sovereignty.
                </h2>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Experience a modern PMS engineered around multi-tenant isolation, automated daily backups, and predictable pricing.
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
                  Need detailed statutory records &amp; audit documentation?{' '}
                  <Link href="/compliance" className="font-semibold text-brand-forest underline hover:text-brand-forest-light">
                    Review Compliance Framework →
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
