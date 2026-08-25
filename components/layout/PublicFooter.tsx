import React from 'react';
import Link from 'next/link';
import { Hotel, Lock, ShieldCheck } from 'lucide-react';

const PRODUCT_NAME = 'Grove';
const PRODUCT_TAGLINE = 'Hospitality OS';

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t border-border-subtle py-14 sm:py-20 text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* 1. Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <div className="p-1.5 bg-brand-forest text-white rounded-lg transition-transform group-hover:scale-105">
                <Hotel className="w-4 h-4" />
              </div>
              <div className="leading-none">
                <span className="font-serif font-bold text-brand-forest text-sm block">
                  {PRODUCT_NAME}
                </span>
                <span className="text-[8px] text-ink-muted uppercase tracking-wider font-semibold">
                  {PRODUCT_TAGLINE}
                </span>
              </div>
            </Link>
            <p className="text-[11px] text-ink-muted leading-relaxed max-w-[220px]">
              The unified operating system for modern hospitality properties, boutique hotels, and resorts.
            </p>
          </div>

          {/* 2. PRODUCT */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-ink mb-3.5">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/#features" className="hover:text-brand-forest transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#platform" className="hover:text-brand-forest transition-colors">
                  Hotel PMS
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="hover:text-brand-forest transition-colors">
                  Hotel Billing
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-brand-forest transition-colors">
                  Housekeeping
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-brand-forest transition-colors">
                  F&B Operations
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-brand-forest transition-colors">
                  Banquet Management
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-brand-forest transition-colors">
                  Reports & Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. SOLUTIONS */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-ink mb-3.5">
              Solutions
            </h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/#solutions" className="hover:text-brand-forest transition-colors">
                  Small Hotels
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="hover:text-brand-forest transition-colors">
                  Boutique Hotels
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="hover:text-brand-forest transition-colors">
                  Resorts & Lodges
                </Link>
              </li>
              <li>
                <Link href="/#solutions" className="hover:text-brand-forest transition-colors">
                  Multi-Property Groups
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. RESOURCES */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-ink mb-3.5">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/faqs" className="hover:text-brand-forest transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/about#case-studies" className="hover:text-brand-forest transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-brand-forest transition-colors">
                  Security Overview
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-brand-forest transition-colors">
                  Compliance Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* 5. COMPANY */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-ink mb-3.5">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/about" className="hover:text-brand-forest transition-colors">
                  About {PRODUCT_NAME}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-forest transition-colors">
                  Contact Us
                </Link>
              </li>
              <li className="pt-2">
                <span className="text-[10px] uppercase font-bold text-ink/70 block">Powered Client</span>
                <span className="text-[11px] text-ink font-medium block">Hotel Greenery View</span>
                <span className="text-[10px] text-ink-muted block">Gangtok, Sikkim</span>
              </li>
            </ul>
          </div>

          {/* 6. LEGAL & ACCESS */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-ink mb-3.5">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs text-ink-muted mb-4">
              <li>
                <Link href="/privacy-policy" className="hover:text-brand-forest transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-forest transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-brand-forest transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-brand-forest transition-colors">
                  Security & Data
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="hover:text-brand-forest transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>

            <h4 className="text-[11px] uppercase tracking-wider font-bold text-ink mb-2">
              Access
            </h4>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/login" className="hover:text-brand-forest transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register-hotel" className="font-semibold text-brand-forest hover:underline">
                  Get Started →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-border-subtle pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-muted">
          <span>© 2026 {PRODUCT_NAME}. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-brand-forest/70" />
            <span>Multi-Tenant Architecture · PostgreSQL Row-Level Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
