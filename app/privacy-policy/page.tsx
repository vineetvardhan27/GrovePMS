import type { Metadata } from 'next';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { ShieldCheck, Calendar, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Grove — Hospitality OS',
  description: 'Understand how Grove handles personal, guest, and hotel operational data with strict tenant isolation.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Transparency & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight">
            Privacy Policy
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

        {/* Content Body */}
        <div className="prose prose-stone max-w-none text-ink-muted leading-relaxed space-y-8 text-sm sm:text-base">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mt-0 mb-3">
              1. Introduction
            </h2>
            <p>
              Grove (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;) provides a multi-tenant cloud-based Property
              Management System (PMS) designed for hotels, boutique properties, resorts, and hospitality operators
              (&quot;Hotels&quot; or &quot;Customers&quot;).
            </p>
            <p className="mt-2">
              This Privacy Policy explains how we collect, process, store, and safeguard data when hotels use Grove to
              manage front desk operations, reservations, billing, housekeeping, inventory, and staff permissions.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              2. Data Controller vs. Data Processor Distinction
            </h2>
            <div className="bg-white/80 p-4 rounded-xl border border-border-subtle mb-3">
              <p className="font-semibold text-brand-forest mb-1">Important Clarification:</p>
              <p className="text-xs sm:text-sm">
                <strong>The Hotel</strong> operates as the <em>Data Controller</em> for all guest details, reservation
                records, stay histories, and guest folio billing data inputted into Grove.
                <strong> Grove</strong> operates strictly as the <em>Data Processor</em> providing the technical
                infrastructure to store and process this operational information on behalf of the Hotel.
              </p>
            </div>
          </section>

          {/* Section 3 & 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              3. Information We Collect
            </h2>
            <p>We collect information in three primary operational categories:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>
                <strong>Hotel Account Data:</strong> Hotel name, business address, contact person, billing email, tax/GST
                identifiers, and room category configurations.
              </li>
              <li>
                <strong>Staff User Data:</strong> Operational staff names, professional email addresses, assigned operational
                roles (Owner, Manager, Reception, Housekeeping), and system activity timestamps.
              </li>
              <li>
                <strong>Guest & Stay Data (Processed on behalf of Hotels):</strong> Guest full names, phone numbers, email
                addresses, check-in/check-out dates, room assignments, identity verification document references, folio
                transactions, and payment mode metadata.
              </li>
            </ul>
          </section>

          {/* Section 5 & 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              4. How We Use Your Information
            </h2>
            <p>We utilize the collected information strictly for operational and technical service fulfillment:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>Authenticating authorized hotel owners and staff members into their property workspace.</li>
              <li>Enforcing multi-tenant database isolation so that each hotel only accesses its own property data.</li>
              <li>Generating compliant hotel folios, GST invoices, and financial reports requested by hotel staff.</li>
              <li>Maintaining operational audit trails for check-ins, check-outs, room status shifts, and billing adjustments.</li>
              <li>Providing technical support, service uptime monitoring, and critical platform security notices.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              5. Data Storage & Tenant Isolation Architecture
            </h2>
            <p>
              Grove is engineered on PostgreSQL with Row-Level Security (RLS). All hotel operational data — including
              rooms, reservations, folios, KOT orders, and staff records — is strictly scoped by a unique <code className="text-brand-forest font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-border-subtle">hotel_id</code>.
            </p>
            <p className="mt-2">
              Database-level policies ensure that staff from Hotel Alpha can never view, query, or mutate records
              belonging to Hotel Beta.
            </p>
          </section>

          {/* Section 8 & 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              6. Data Sharing & Third-Party Processors
            </h2>
            <p>
              We do not sell, rent, or trade hotel, staff, or guest personal data to data brokers, advertisers, or third
              parties.
            </p>
            <p className="mt-2">We engage selected technical infrastructure providers solely to deliver platform functionality:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>
                <strong>Supabase (Authentication & Database):</strong> Used for secure token-based user authentication,
                session management, and encrypted database hosting.
              </li>
              <li>
                <strong>Hosting Infrastructure:</strong> Used to serve the web application over HTTPS with standard TLS encryption.
              </li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              7. Data Retention & Deletion
            </h2>
            <p>
              Operational hotel data is retained for the duration of the Hotel&apos;s active account with Grove. Upon account
              termination or written request by an authorized Hotel Owner, we provide data export options and initiate
              secure deletion procedures in accordance with applicable statutory record-keeping periods.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              8. Hotel / Customer Responsibilities
            </h2>
            <p>Hotels using Grove are responsible for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>Obtaining any necessary consent from guests before inputting personal data into the PMS.</li>
              <li>Ensuring that staff credentials are safeguarded and not shared among multiple employees.</li>
              <li>Complying with local hospitality laws regarding guest register maintenance and tax filing.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              9. User Rights
            </h2>
            <p>
              Staff and account owners have the right to inspect, update, or correct their account profile information.
              Guests seeking to exercise data subject rights regarding stay histories or personal details should contact
              the specific Hotel where they stayed, as the Hotel is the designated Data Controller.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              10. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically to reflect architectural updates or regulatory adjustments.
              Any revisions will be published on this page with an updated &quot;Last Updated&quot; date.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              11. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or Grove&apos;s data handling practices, please contact our
              privacy team:
            </p>
            <div className="bg-white p-4 rounded-xl border border-border-subtle mt-3 text-sm">
              <p className="font-semibold text-brand-forest">Grove Privacy & Data Governance</p>
              <p className="text-ink-muted mt-0.5">Email: privacy@grovepms.com</p>
              <p className="text-ink-muted">Website: https://grovepms.com/privacy-policy</p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
