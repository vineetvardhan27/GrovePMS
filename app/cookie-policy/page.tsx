import type { Metadata } from 'next';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import { Cookie, Calendar, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy | Grove — Hospitality OS',
  description: 'Understand how Grove uses essential session cookies for secure hotel authentication and operations.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 flex flex-col justify-between">
      <PublicHeader />

      <main className="pt-28 sm:pt-36 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookie Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-forest tracking-tight">
            Cookie Policy
          </h1>
          <div className="flex items-center gap-4 mt-3 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-forest/70" />
              Last Updated: August 25, 2026
            </span>
            <span>·</span>
            <span>Version 1.1</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-stone max-w-none text-ink-muted leading-relaxed space-y-8 text-sm sm:text-base">
          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mt-0 mb-3">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files placed on your device by websites you visit. They are widely used to make web
              applications function properly, remember user authentication states, and maintain secure sessions.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              2. Our Privacy-First Commitment
            </h2>
            <div className="bg-white/80 p-4 rounded-xl border border-border-subtle mb-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-status-green shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-forest">No Third-Party Advertising Trackers</p>
                  <p className="text-xs sm:text-sm mt-0.5">
                    Grove does <strong>NOT</strong> use third-party advertising cookies, cross-site trackers, behavioral profiling
                    cookies, or commercial data-mining scripts.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              3. Cookies We Actually Use
            </h2>
            <p>
              We only use <strong>Strictly Essential</strong> cookies required for authenticated hotel operations:
            </p>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs sm:text-sm border border-border-subtle bg-white rounded-xl overflow-hidden">
                <thead className="bg-brand-sand/60 border-b border-border-subtle text-ink font-semibold">
                  <tr>
                    <th className="p-3">Cookie Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr>
                    <td className="p-3 font-mono text-xs text-brand-forest">sb-access-token</td>
                    <td className="p-3">Essential / Auth</td>
                    <td className="p-3">Maintains secure JWT token for staff and owner authentication.</td>
                    <td className="p-3">Session / 1 hr</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs text-brand-forest">sb-refresh-token</td>
                    <td className="p-3">Essential / Auth</td>
                    <td className="p-3">Enables secure token refresh so active staff remain logged in.</td>
                    <td className="p-3">Persistent (30d)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              4. Managing & Disabling Cookies
            </h2>
            <p>
              Because these cookies are strictly essential to authenticate your staff session and verify your hotel
              workspace, disabling cookies in your browser settings will prevent you from logging in to the PMS dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-forest mb-3">
              5. Contact Us
            </h2>
            <p>
              If you have questions regarding our cookie practices, please contact{' '}
              <span className="font-semibold text-brand-forest">privacy@grovepms.com</span>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
