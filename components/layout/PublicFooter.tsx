import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';

const PRODUCT_NAME = 'Grove';
const PRODUCT_TAGLINE = 'Hospitality OS';

const PRODUCT_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Hotel PMS', href: '/#platform' },
  { label: 'Hotel Billing', href: '/#solutions' },
  { label: 'Housekeeping', href: '/#features' },
  { label: 'F&B Operations', href: '/#features' },
  { label: 'Banquet Management', href: '/#features' },
  { label: 'Reports & Analytics', href: '/#features' },
  { label: 'Pricing & Plans', href: '/pricing' },
];

const SOLUTION_LINKS = [
  { label: 'Small Hotels', href: '/#solutions' },
  { label: 'Boutique Hotels', href: '/#solutions' },
  { label: 'Resorts & Lodges', href: '/#solutions' },
  { label: 'Multi-Property Groups', href: '/#solutions' },
];

const RESOURCE_LINKS = [
  { label: 'FAQs', href: '/faqs' },
  { label: 'Case Studies', href: '/about#case-studies' },
  { label: 'Security Overview', href: '/security' },
  { label: 'Compliance Guide', href: '/compliance' },
];

const COMPANY_LINKS = [
  { label: 'About Grove', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Security & Data Compliance', href: '/security' },
];

const ACCESS_LINKS = [
  { label: 'Sign In', href: '/login' },
  { label: 'Pricing', href: '/pricing' },
];

export default function PublicFooter() {
  return (
    <footer
      role="contentinfo"
      aria-label="Grove Hospitality OS Footer"
      className="bg-[#FAF8F5] border-t border-border-subtle/80 pt-14 sm:pt-20 pb-8 sm:pb-12 text-ink relative overflow-hidden"
    >
      {/* Subtle Architectural Grid Texture Consistent with Grove Aesthetic */}
      <div
        className="pointer-events-none absolute inset-0 z-0 grove-grid-texture opacity-45"
        aria-hidden="true"
      />

      {/* Gentle Vignette Overlay to Soften Grid toward Center */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#FAF8F5]/30 via-transparent to-[#FAF8F5]/70"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main 6-Column Navigation Grid */}
        <nav
          aria-label="Footer Navigation"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr_1.05fr] gap-x-6 sm:gap-x-8 gap-y-10 lg:gap-x-6 xl:gap-x-8 mb-10 sm:mb-14"
        >
          {/* Column 1: Brand Identity */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1 flex flex-col items-start pr-0 lg:pr-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 focus-visible:ring-offset-2 rounded-lg"
              aria-label="Grove Hospitality OS - Home"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xs border border-border-subtle/90 bg-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0">
                <Image
                  src="/Grove.png"
                  alt="Grove Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="leading-tight">
                <span className="font-serif font-bold text-brand-forest text-base sm:text-lg block tracking-tight">
                  {PRODUCT_NAME}
                </span>
                <span className="text-[9px] sm:text-[10px] text-ink-muted uppercase tracking-[0.16em] font-semibold block">
                  {PRODUCT_TAGLINE}
                </span>
              </div>
            </Link>

            <p className="text-xs text-ink-muted leading-relaxed max-w-[260px] sm:max-w-[280px] mb-4">
              The unified operating system for modern hospitality properties, boutique hotels, and resorts.
            </p>

            {/* Architecture Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 border border-border-subtle/80 shadow-2xs text-[11px] text-ink-muted font-medium">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-green opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-green" />
              </span>
              <span className="text-ink/80 text-[10px] tracking-wide">Multi-Tenant Cloud OS</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="col-span-1">
            <h3 className="text-[11px] uppercase tracking-[0.14em] font-bold text-brand-forest mb-3.5">
              Product
            </h3>
            <ul className="space-y-2 text-xs text-ink-muted">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-forest transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 rounded-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div className="col-span-1">
            <h3 className="text-[11px] uppercase tracking-[0.14em] font-bold text-brand-forest mb-3.5">
              Solutions
            </h3>
            <ul className="space-y-2 text-xs text-ink-muted">
              {SOLUTION_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-forest transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 rounded-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="col-span-1">
            <h3 className="text-[11px] uppercase tracking-[0.14em] font-bold text-brand-forest mb-3.5">
              Resources
            </h3>
            <ul className="space-y-2 text-xs text-ink-muted">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-forest transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 rounded-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Company */}
          <div className="col-span-1">
            <h3 className="text-[11px] uppercase tracking-[0.14em] font-bold text-brand-forest mb-3.5">
              Company
            </h3>
            <ul className="space-y-2 text-xs text-ink-muted mb-4">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-forest transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 rounded-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Powered Client Section */}
            <div className="pt-3.5 border-t border-border-subtle/70">
              <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-ink-muted/80 block mb-1.5">
                Powered Client
              </span>
              <Link
                href="/about#case-studies"
                className="group block p-2.5 rounded-xl bg-white/70 hover:bg-white border border-border-subtle/80 hover:border-brand-forest/30 shadow-2xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30"
                aria-label="Hotel Greenery View in Gangtok, Sikkim - Read client case study"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-brand-forest group-hover:text-brand-forest-light">
                    Hotel Greenery View
                  </span>
                  <ArrowUpRight
                    className="w-3 h-3 text-ink-muted group-hover:text-brand-forest transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-ink-muted mt-0.5">
                  <MapPin className="w-3 h-3 text-brand-forest/70 shrink-0" aria-hidden="true" />
                  <span>Gangtok, Sikkim</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Column 6: Legal & Trust + Access */}
          <div className="col-span-1">
            <h3 className="text-[11px] uppercase tracking-[0.14em] font-bold text-brand-forest mb-3.5">
              Legal & Trust
            </h3>
            <ul className="space-y-2 text-xs text-ink-muted mb-4">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-forest transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 rounded-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Access Subsection */}
            <div className="pt-3.5 border-t border-border-subtle/70">
              <h4 className="text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted/80 mb-2">
                Access
              </h4>
              <ul className="space-y-1.5 text-xs text-ink-muted">
                {ACCESS_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-brand-forest transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 rounded-xs"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/register-hotel"
                    className="inline-flex items-center gap-1.5 font-semibold text-brand-forest hover:text-brand-forest-light group transition-colors duration-150 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 rounded-xs"
                  >
                    <span>Get Started</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Subtle Oversized Brand Watermark */}
        <div
          aria-hidden="true"
          className="relative w-full overflow-hidden select-none pointer-events-none mt-4 sm:mt-8 -mb-3 sm:-mb-5 flex items-center justify-center text-center z-0"
        >
          <span className="font-serif font-black tracking-[-0.04em] text-[16vw] sm:text-[14vw] lg:text-[12vw] xl:text-[11vw] leading-[0.8] text-brand-forest/[0.035] sm:text-brand-forest/[0.04] uppercase select-none whitespace-nowrap">
            GROVE
          </span>
        </div>

        {/* Bottom Bar Divider and Copyright */}
        <div className="relative z-10 border-t border-border-subtle/70 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-ink-muted">
          <p>© 2026 {PRODUCT_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-ink-muted text-[11px] sm:text-xs">
            <Lock className="w-3.5 h-3.5 text-brand-forest/70 shrink-0" aria-hidden="true" />
            <span>Multi-Tenant Architecture · PostgreSQL Row-Level Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
