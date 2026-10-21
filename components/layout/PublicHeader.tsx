'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
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
      // 40px threshold for smooth transition between compact and expanded glass states
      const isScrolled = window.scrollY > 40;
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
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none pt-2.5 sm:pt-3.5"
    >
      <div
        className={`
          grove-navbar-capsule
          pointer-events-auto
          mx-auto
          relative
          min-h-[64px] sm:min-h-[72px] lg:min-h-[76px]
          rounded-full
          flex items-center justify-between
          gap-3 sm:gap-4 lg:gap-6
          px-3.5 py-2 sm:px-6 sm:py-2.5 lg:px-7
          ${
            scrolled
              ? 'w-[calc(100%-16px)] sm:w-[calc(100%-32px)] max-w-[1720px]'
              : 'w-[calc(100%-20px)] sm:w-[90%] lg:w-[86%] xl:w-[84%] max-w-[1360px]'
          }
        `}
        style={{
          background: scrolled
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 253, 249, 0.50) 50%, rgba(255, 255, 255, 0.64) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 253, 249, 0.28) 50%, rgba(255, 255, 255, 0.42) 100%)',
          backdropFilter: scrolled
            ? 'blur(30px) saturate(220%) brightness(106%) contrast(102%)'
            : 'blur(26px) saturate(210%) brightness(107%) contrast(102%)',
          WebkitBackdropFilter: scrolled
            ? 'blur(30px) saturate(220%) brightness(106%) contrast(102%)'
            : 'blur(26px) saturate(210%) brightness(107%) contrast(102%)',
          border: scrolled
            ? '1px solid rgba(255, 255, 255, 0.85)'
            : '1px solid rgba(255, 255, 255, 0.72)',
          boxShadow: scrolled
            ? '0 20px 48px -10px rgba(24, 49, 44, 0.12), 0 4px 16px -2px rgba(24, 49, 44, 0.05), 0 0 0 1px rgba(31, 61, 58, 0.08), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.45)'
            : '0 16px 40px -8px rgba(24, 49, 44, 0.08), 0 4px 14px -2px rgba(24, 49, 44, 0.03), 0 0 0 1px rgba(31, 61, 58, 0.07), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.45)',
        }}
      >
        {/* Crisp specular top-edge glass highlight */}
        <div
          className="pointer-events-none absolute inset-x-8 sm:inset-x-14 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95"
          aria-hidden="true"
        />

        {/* Soft upper curved glass glare reflection */}
        <div
          className="pointer-events-none absolute inset-x-16 sm:inset-x-24 top-0 h-6 bg-gradient-to-b from-white/35 via-white/10 to-transparent rounded-t-full"
          aria-hidden="true"
        />

        {/* Subtle bottom ambient glass refraction */}
        <div
          className="pointer-events-none absolute inset-x-14 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
          aria-hidden="true"
        />

        {/* ── Left: Brand Identity ── */}
        <div className="flex items-center justify-start xl:flex-1 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 focus-visible:ring-offset-2 rounded-full"
            aria-label="Grove Hospitality OS – Home"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden bg-white/75 backdrop-blur-md shadow-[0_2px_8px_rgba(31,61,58,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-white/90 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
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
              <span className="font-serif font-bold text-brand-forest text-sm sm:text-base lg:text-lg block tracking-tight">
                {PRODUCT_NAME}
              </span>
              <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] text-ink-muted uppercase tracking-[0.16em] font-semibold block mt-0.5">
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
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[13px] xl:text-[14px] font-medium px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 motion-reduce:transition-none ${
                  isActive
                    ? 'text-brand-forest font-semibold bg-white/75 shadow-[0_2px_8px_rgba(31,61,58,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] border border-white/90'
                    : 'text-ink/85 hover:text-brand-forest hover:bg-white/60 hover:shadow-[0_2px_8px_rgba(31,61,58,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:border-white/70 border border-transparent'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
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
                className="relative group bg-gradient-to-b from-[#28534E] to-[#1B3835] hover:from-[#2E5E58] hover:to-[#1F3D3A] active:from-[#18312C] active:to-[#152B27] text-white text-[13px] xl:text-[13.5px] font-semibold px-4.5 sm:px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-[0_4px_16px_rgba(31,61,58,0.28),inset_0_1px_1.5px_rgba(255,255,255,0.45)] hover:shadow-[0_6px_24px_rgba(31,61,58,0.36),inset_0_1px_1.5px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 border border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:transform-none"
              >
                <span className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" aria-hidden="true" />
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13px] xl:text-[13.5px] font-medium text-ink/85 hover:text-brand-forest px-3.5 py-2 rounded-full transition-all duration-150 hover:bg-white/60 hover:shadow-[0_2px_8px_rgba(31,61,58,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:border-white/70 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 focus-visible:ring-offset-1 motion-reduce:transition-none"
              >
                Sign In
              </Link>
              <Link
                href="/register-hotel"
                className="relative group bg-gradient-to-b from-[#28534E] to-[#1B3835] hover:from-[#2E5E58] hover:to-[#1F3D3A] active:from-[#18312C] active:to-[#152B27] text-white text-[13px] xl:text-[13.5px] font-semibold px-4.5 sm:px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-[0_4px_16px_rgba(31,61,58,0.28),inset_0_1px_1.5px_rgba(255,255,255,0.45)] hover:shadow-[0_6px_24px_rgba(31,61,58,0.36),inset_0_1px_1.5px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 border border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:transform-none"
              >
                <span className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" aria-hidden="true" />
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
            className="w-10 h-10 flex items-center justify-center text-ink-muted hover:text-brand-forest rounded-full transition-all bg-white/40 hover:bg-white/70 border border-white/60 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="grove-mobile-nav"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Glass Drawer ── */}
      {mobileMenuOpen && (
        <div
          id="grove-mobile-nav"
          className={`
            grove-navbar-capsule
            pointer-events-auto
            lg:hidden
            mx-auto mt-2
            relative
            rounded-[24px]
            overflow-hidden
            ${
              scrolled
                ? 'w-[calc(100%-16px)] sm:w-[calc(100%-32px)] max-w-[1720px]'
                : 'w-[calc(100%-20px)] sm:w-[90%] max-w-[1360px]'
            }
          `}
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 252, 246, 0.62) 100%)',
            backdropFilter: 'blur(32px) saturate(220%) brightness(107%)',
            WebkitBackdropFilter: 'blur(32px) saturate(220%) brightness(107%)',
            border: '1px solid rgba(255, 255, 255, 0.80)',
            boxShadow: '0 20px 50px -10px rgba(24, 49, 44, 0.16), 0 0 0 1px rgba(31, 61, 58, 0.08), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.95)',
            animation: 'groveMenuSlideIn 200ms ease-out',
          }}
        >
          {/* Top light reflection */}
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95"
            aria-hidden="true"
          />

          <nav className="px-3.5 py-3 space-y-0.5" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-sm font-medium px-4 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-brand-forest font-semibold bg-white/75 shadow-xs border border-white/80'
                      : 'text-ink-muted hover:text-brand-forest hover:bg-white/60 hover:border-white/60 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3.5 pb-3.5">
            <hr className="border-border-subtle/50 mb-3" />
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs text-ink-muted">
                  Signed in as <span className="font-medium text-ink">{staffName}</span> ({staffRole})
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gradient-to-b from-[#28534E] to-[#1B3835] text-white text-sm font-semibold px-4 py-3 rounded-xl text-center transition-all hover:brightness-110 shadow-xs border border-white/20"
                >
                  Open Dashboard →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-ink text-center px-4 py-2.5 rounded-xl border border-white/80 bg-white/50 hover:bg-white/80 transition-colors shadow-2xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register-hotel"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gradient-to-b from-[#28534E] to-[#1B3835] text-white text-sm font-semibold px-4 py-3 rounded-xl text-center transition-all hover:brightness-110 shadow-xs border border-white/20"
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

