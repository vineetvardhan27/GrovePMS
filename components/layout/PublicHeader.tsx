'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

const PRODUCT_NAME = 'Grove';
const PRODUCT_TAGLINE = 'Hospitality OS';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Solutions', href: '/#solutions' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Security', href: '/security' },
  { label: 'Compliance', href: '/compliance' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicHeader({
  staffName: initialStaffName,
  staffRole: initialStaffRole,
}: {
  staffName?: string;
  staffRole?: string;
}) {
  const [sessionStaff, setSessionStaff] = useState<{ name: string; role?: string } | null>(
    initialStaffName ? { name: initialStaffName, role: initialStaffRole } : null
  );
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialStaffName) return;
    if (typeof document !== 'undefined' && (document.cookie.includes('-auth-token') || document.cookie.includes('sb-'))) {
      const supabase = createClient();
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const { data: staffData } = (await supabase
            .from('staff')
            .select('full_name, role')
            .eq('id', user.id)
            .maybeSingle()) as { data: { full_name?: string; role?: string } | null };

          if (staffData?.full_name) {
            setSessionStaff({ name: staffData.full_name, role: staffData.role });
          } else {
            const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Staff';
            setSessionStaff({ name: fallbackName, role: 'Staff' });
          }
        }
      }).catch(() => {});
    }
  }, [initialStaffName]);

  const staffName = sessionStaff?.name || initialStaffName;
  const staffRole = sessionStaff?.role || initialStaffRole;
  const isAuthenticated = Boolean(staffName);

  useEffect(() => {
    const handleScroll = () => {
      // 50px threshold for switching between compact and expanded states
      const isScrolled = window.scrollY > 50;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [mobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [mobileMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ padding: '12px 0 0' }}
    >
      <div
        className={`
          grove-navbar-capsule
          pointer-events-auto
          mx-auto
          min-h-[76px] sm:min-h-[80px]
          rounded-full
          flex items-center justify-between
          gap-4 lg:gap-6
          ${
            scrolled
              ? 'w-[calc(100%-20px)] sm:w-[calc(100%-32px)] max-w-[1720px]'
              : 'w-[calc(100%-24px)] sm:w-[88%] lg:w-[86%] xl:w-[84%] 2xl:w-[82%] max-w-[1360px]'
          }
        `}
        style={{
          padding: '12px 20px 12px 24px',
          background: scrolled
            ? 'rgba(255, 255, 255, 0.85)'
            : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: scrolled
            ? '1px solid rgba(32, 70, 64, 0.18)'
            : '1px solid rgba(32, 70, 64, 0.14)',
          boxShadow: scrolled
            ? '0 10px 32px rgba(24, 49, 44, 0.08), 0 2px 8px rgba(24, 49, 44, 0.035), inset 0 1px 0 rgba(255, 255, 255, 0.85)'
            : '0 8px 30px rgba(24, 49, 44, 0.07), 0 2px 8px rgba(24, 49, 44, 0.035), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* ── Left: Brand Identity ── */}
        <div className="flex items-center justify-start xl:flex-1 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 focus-visible:ring-offset-2 rounded-full"
            aria-label="Grove Hospitality OS – Home"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-border-subtle/80 bg-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
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
              <span className="font-serif font-bold text-brand-forest text-base sm:text-lg block tracking-tight">
                {PRODUCT_NAME}
              </span>
              <span className="text-[9px] sm:text-[10px] text-ink-muted uppercase tracking-[0.16em] font-semibold">
                {PRODUCT_TAGLINE}
              </span>
            </div>
          </Link>
        </div>

        {/* ── Center: Navigation Links ── */}
        <nav
          className="hidden lg:flex items-center justify-center shrink-0 gap-0.5 xl:gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] xl:text-[14px] font-medium text-ink-muted hover:text-brand-forest px-2.5 xl:px-3.5 py-2 rounded-full transition-colors duration-150 hover:bg-brand-forest/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 motion-reduce:transition-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right: Authentication and Primary CTA ── */}
        <div className="hidden lg:flex items-center justify-end xl:flex-1 shrink-0 gap-2.5 xl:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-muted hidden 2xl:inline">
                {staffName} · <span className="capitalize">{staffRole}</span>
              </span>
              <Link
                href="/dashboard"
                className="bg-brand-forest hover:bg-brand-forest-light active:bg-[#18312C] text-white text-[13.5px] xl:text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-1.5 group shadow-[0_2px_8px_rgba(31,61,58,0.22)] hover:shadow-[0_4px_14px_rgba(31,61,58,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13.5px] xl:text-sm font-medium text-ink/85 hover:text-brand-forest px-3.5 py-2 rounded-full transition-colors duration-150 hover:bg-brand-forest/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 motion-reduce:transition-none"
              >
                Sign In
              </Link>
              <Link
                href="/register-hotel"
                className="bg-brand-forest hover:bg-brand-forest-light active:bg-[#18312C] text-white text-[13.5px] xl:text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-1.5 group shadow-[0_2px_8px_rgba(31,61,58,0.22)] hover:shadow-[0_4px_14px_rgba(31,61,58,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <div className="flex lg:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-ink-muted hover:text-brand-forest rounded-full transition-colors hover:bg-brand-forest/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="grove-mobile-nav"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div
          id="grove-mobile-nav"
          className={`
            grove-navbar-capsule
            pointer-events-auto
            lg:hidden
            mx-auto mt-2
            rounded-[24px]
            overflow-hidden
            ${
              scrolled
                ? 'w-[calc(100%-20px)] sm:w-[calc(100%-32px)] max-w-[1720px]'
                : 'w-[calc(100%-24px)] sm:w-[88%] max-w-[1360px]'
            }
          `}
          style={{
            background: 'rgba(255, 255, 255, 0.90)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(32, 70, 64, 0.16)',
            boxShadow: '0 12px 40px rgba(24, 49, 44, 0.10), 0 2px 8px rgba(24, 49, 44, 0.04)',
            animation: 'groveMenuSlideIn 200ms ease-out',
          }}
        >
          <nav className="px-4 py-3 space-y-0.5" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-ink-muted hover:text-brand-forest hover:bg-brand-forest/[0.06] px-4 py-3 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-4 pb-4">
            <hr className="border-border-subtle/60 mb-3" />
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs text-ink-muted">
                  Signed in as <span className="font-medium text-ink">{staffName}</span> ({staffRole})
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-brand-forest text-white text-sm font-semibold px-4 py-3 rounded-xl text-center transition-colors hover:bg-brand-forest-light shadow-xs"
                >
                  Open Dashboard →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-ink text-center px-4 py-2.5 rounded-xl border border-border-subtle/80 hover:bg-brand-sand/50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register-hotel"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-brand-forest text-white text-sm font-semibold px-4 py-3 rounded-xl text-center transition-colors hover:bg-brand-forest-light shadow-xs"
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
