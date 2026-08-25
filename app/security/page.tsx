import type { Metadata } from 'next';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { Shield, Lock, KeyRound, Layers, Database, UserCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security & Data Protection | Grove — Hospitality OS',
  description: 'Technical overview of Grove multi-tenant database isolation, PostgreSQL Row-Level Security, and authentication architecture.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Architecture & Trust</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight">
            Security & Data Protection
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl leading-relaxed">
            Grove is engineered around multi-tenant isolation, role-based access control, and database-level security
            policies. Here is an honest, technical explanation of how our architecture protects your hotel&apos;s data.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {[
            {
              icon: Database,
              title: 'PostgreSQL Row-Level Security',
              desc: 'Every database query is automatically filtered by tenant ID at the database layer, preventing cross-property data leaks.',
            },
            {
              icon: Lock,
              title: 'Encrypted Authentication',
              desc: 'Authentication and password hashing are managed through Supabase with secure, time-bounded JWT session tokens.',
            },
            {
              icon: KeyRound,
              title: 'Granular Role-Based Access',
              desc: 'Explicit permissions per role (Owner, Manager, Reception, Housekeeping) ensure staff only access authorized workflows.',
            },
            {
              icon: UserCheck,
              title: 'Staff Identity Resolution',
              desc: 'Staff accounts are tied to verified hotel entities and can only be provisioned by authenticated Hotel Owners.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6 transition-all hover:border-brand-forest/30"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-3.5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-ink">{card.title}</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mt-1.5">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Technical Architecture Deep-Dive */}
        <div className="prose prose-stone max-w-none text-ink-muted leading-relaxed space-y-8 text-sm sm:text-base">
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              1. Multi-Tenant Architecture & Data Flow
            </h2>
            <p>
              In Grove, security is not enforced purely through frontend checks. Our core data isolation is enforced at
              the PostgreSQL database layer using Row-Level Security (RLS) policies.
            </p>
            <div className="bg-white p-5 rounded-2xl border border-border-subtle my-4 font-mono text-xs text-ink space-y-2">
              <div className="text-ink-muted font-sans font-semibold text-xs mb-2">Data Resolution Pipeline:</div>
              <div className="flex items-center gap-2">
                <span className="bg-brand-sand px-2 py-1 rounded">1. Supabase Auth</span>
                <span>→</span>
                <span className="bg-brand-sand px-2 py-1 rounded font-semibold text-brand-forest">auth.users.id</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-brand-sand px-2 py-1 rounded">2. Staff Lookup</span>
                <span>→</span>
                <span className="bg-brand-sand px-2 py-1 rounded font-semibold text-brand-forest">public.staff.hotel_id</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-brand-sand px-2 py-1 rounded">3. Tenant Scope</span>
                <span>→</span>
                <span className="bg-brand-sand px-2 py-1 rounded font-semibold text-brand-forest">public.hotels.id</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-brand-sand px-2 py-1 rounded">4. Row-Level Policy</span>
                <span>→</span>
                <span className="bg-brand-forest text-white px-2 py-1 rounded">WHERE hotel_id = staff.hotel_id</span>
              </div>
            </div>
            <p className="mt-3">
              This guarantees that staff from Hotel Alpha can never read, modify, or delete bookings, folios, or guest
              records belonging to Hotel Beta.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              2. Role-Based Permissions Hierarchy
            </h2>
            <p>
              Grove recognizes four distinct operational roles with strict principle-of-least-privilege boundaries:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
              <li>
                <strong>Owner:</strong> Sole administrative authority for property settings, tax configuration, staff
                account creation, financial exports, and billing folios.
              </li>
              <li>
                <strong>Manager:</strong> Operational oversight, daily reporting, room allocations, booking modifications,
                and front desk supervision.
              </li>
              <li>
                <strong>Reception:</strong> Front desk check-ins, guest verification, keycards, room tariff posting, and
                express check-out.
              </li>
              <li>
                <strong>Housekeeping:</strong> Room status updates (dirty, cleaning, inspected, out-of-order) without
                access to financial ledgers or owner settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              3. Encryption & Communications
            </h2>
            <p>
              All traffic between your browser and Grove is encrypted in transit using industry-standard TLS (Transport
              Layer Security) over HTTPS. Session tokens are digitally signed with cryptographic keys and transmitted over
              secure HTTP-only cookie headers.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              4. Responsible Vulnerability Reporting
            </h2>
            <p>
              We welcome responsible disclosure of potential security vulnerabilities. If you discover a security concern,
              please email our engineering team directly at{' '}
              <span className="font-semibold text-brand-forest">security@grovepms.com</span>. We review and respond to
              legitimate security reports promptly.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
