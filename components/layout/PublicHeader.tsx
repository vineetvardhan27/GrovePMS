'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';

const PRODUCT_NAME = 'Grove';
const PRODUCT_TAGLINE = 'Hospitality OS';

export default function PublicHeader({
  staffName,
  staffRole,
}: {
  staffName?: string;
  staffRole?: string;
}) {
  const isAuthenticated = Boolean(staffName);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-border-subtle py-2.5 shadow-2xs'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-border-subtle bg-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/Grove.png"
              alt="Grove Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="leading-none">
            <span className="font-serif font-bold text-brand-forest text-base sm:text-lg block">
              {PRODUCT_NAME}
            </span>
            <span className="text-[9px] sm:text-[10px] text-ink-muted uppercase tracking-[0.15em] font-semibold">
              {PRODUCT_TAGLINE}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/#features"
            className="text-sm font-medium text-ink-muted hover:text-brand-forest px-3.5 py-2 rounded-lg transition-colors duration-150"
          >
            Features
          </Link>
          <Link
            href="/#solutions"
            className="text-sm font-medium text-ink-muted hover:text-brand-forest px-3.5 py-2 rounded-lg transition-colors duration-150"
          >
            Solutions
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-ink-muted hover:text-brand-forest px-3.5 py-2 rounded-lg transition-colors duration-150"
          >
            Pricing
          </Link>
          <Link
            href="/security"
            className="text-sm font-medium text-ink-muted hover:text-brand-forest px-3.5 py-2 rounded-lg transition-colors duration-150"
          >
            Security
          </Link>
          <Link
            href="/compliance"
            className="text-sm font-medium text-ink-muted hover:text-brand-forest px-3.5 py-2 rounded-lg transition-colors duration-150"
          >
            Compliance
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-ink-muted hover:text-brand-forest px-3.5 py-2 rounded-lg transition-colors duration-150"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-ink-muted hover:text-brand-forest px-3.5 py-2 rounded-lg transition-colors duration-150"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-muted">
                {staffName} · <span className="capitalize">{staffRole}</span>
              </span>
              <Link
                href="/dashboard"
                className="bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 group"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ink hover:text-brand-forest px-3.5 py-2 rounded-lg transition-colors duration-150"
              >
                Sign In
              </Link>
              <Link
                href="/register-hotel"
                className="bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 group shadow-2xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-ink-muted hover:text-brand-forest rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-border-subtle shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-ink-muted hover:text-brand-forest px-3 py-2.5 rounded-lg transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-ink-muted hover:text-brand-forest px-3 py-2.5 rounded-lg transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-ink-muted hover:text-brand-forest px-3 py-2.5 rounded-lg transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/security"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-ink-muted hover:text-brand-forest px-3 py-2.5 rounded-lg transition-colors"
            >
              Security
            </Link>
            <Link
              href="/compliance"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-ink-muted hover:text-brand-forest px-3 py-2.5 rounded-lg transition-colors"
            >
              Compliance
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-ink-muted hover:text-brand-forest px-3 py-2.5 rounded-lg transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-ink-muted hover:text-brand-forest px-3 py-2.5 rounded-lg transition-colors"
            >
              Contact
            </Link>
            <hr className="border-border-subtle my-2" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="block bg-brand-forest text-white text-sm font-semibold px-4 py-3 rounded-xl text-center"
              >
                Open Dashboard →
              </Link>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/login"
                  className="block text-sm font-medium text-ink text-center px-4 py-2.5 rounded-xl border border-border-subtle"
                >
                  Sign In
                </Link>
                <Link
                  href="/register-hotel"
                  className="block bg-brand-forest text-white text-sm font-semibold px-4 py-3 rounded-xl text-center"
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
