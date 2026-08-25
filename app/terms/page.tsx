import type { Metadata } from 'next';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { FileText, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Grove — Hospitality OS',
  description: 'Terms of service and operational agreement for hotels, owners, and operators using Grove.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
            <FileText className="w-3.5 h-3.5" />
            <span>Service Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight">
            Terms of Service
          </h1>
          <div className="flex items-center gap-4 mt-3 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-forest/70" />
              Last Updated: August 25, 2026
            </span>
            <span>·</span>
            <span>Version 1.2</span>
          </div>
        </div>

        {/* Terms Content */}
        <div className="prose prose-stone max-w-none text-ink-muted leading-relaxed space-y-8 text-sm sm:text-base">
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mt-0 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By registering a hotel property, creating a staff account, or accessing the Grove Property Management
              System (&quot;Grove,&quot; &quot;the Platform,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service.
              If you represent a hotel or legal entity, you affirm that you have the requisite authority to bind that entity
              to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              2. Description of the Platform
            </h2>
            <p>
              Grove provides multi-tenant cloud software designed for hotel property management, including front desk
              check-ins, reservations, room matrix management, housekeeping status, food & beverage order posting, banquet
              event packages, guest billing, and analytical reports.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              3. Hotel Registration & Single-Owner Architecture
            </h2>
            <p>
              Each hotel property is onboarded through the Property Registration flow. Under Grove&apos;s architecture:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>Each hotel is associated with exactly one authenticated Hotel Owner account at registration.</li>
              <li>The Owner is responsible for configuring property details, tax identifiers, room inventories, and staff accounts.</li>
              <li>The Owner must provide accurate, verified legal business details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              4. Staff Accounts & Access Control
            </h2>
            <p>
              Staff accounts (Manager, Reception, Housekeeping) may only be provisioned by the authenticated Hotel Owner
              via the internal Settings control centre. Hotels agree to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>Maintain individual credentials for each employee and prohibit credential sharing.</li>
              <li>Immediately deactivate access for staff members who leave employment.</li>
              <li>Assign roles that align strictly with operational necessity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              5. Customer Data Ownership & Isolation
            </h2>
            <p>
              The Hotel retains full and exclusive ownership of all guest profiles, reservation histories, billing records,
              and operational logs inputted into Grove. Grove claims no ownership over Customer Data.
            </p>
            <p className="mt-2">
              Grove enforces PostgreSQL Row-Level Security (RLS) to ensure that your data is strictly accessible only to
              your hotel&apos;s authorized staff.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              6. Acceptable Use Policy
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>Attempt to bypass database Row-Level Security or access another property&apos;s data.</li>
              <li>Reverse engineer, decompile, or copy the proprietary source code of Grove.</li>
              <li>Use the Platform for fraudulent billing or unlawful surveillance activities.</li>
              <li>Interfere with platform stability through automated scraping or denial-of-service attempts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              7. Service Availability & Maintenance
            </h2>
            <p>
              We strive to maintain continuous platform availability for hotel 24/7 operations. Scheduled maintenance
              windows are announced in advance where feasible. Grove does not guarantee 100% uninterrupted uptime and is not
              liable for local internet connectivity disruptions at the property.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Grove and its operators shall not be liable for indirect,
              incidental, consequential, or punitive damages, including loss of hotel revenue or operational downtime
              arising out of or related to the use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              9. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its
              conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the competent
              courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              10. Contact Information
            </h2>
            <p>
              For legal inquiries or questions regarding these Terms, please contact our legal team at{' '}
              <span className="font-semibold text-brand-forest">legal@grovepms.com</span>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
