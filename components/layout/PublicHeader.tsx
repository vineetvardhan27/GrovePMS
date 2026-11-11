'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/shared/ThemeToggle';

const PRODUCT_NAME = 'Grove';
const PRODUCT_TAGLINE = 'HOSPITALITY OS';

const NAV_LINKS = [
  { label: 'Features', href: '/hotel-management-software' },
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
      const isScrolled = window.scrollY > 30;
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
          h-[58px] sm:h-[62px]
          rounded-full
          flex items-center justify-between
          px-3.5 sm:px-5 lg:px-6
          w-[calc(100%-24px)] sm:w-[92%] lg:w-[88%] max-w-[1140px]
          transition-all duration-300
        `}
        style={{
          background: scrolled
            ? 'var(--glass-bg-scrolled)'
            : 'var(--glass-bg-top)',
          backdropFilter: 'blur(28px) saturate(210%)',
          WebkitBackdropFilter: 'blur(28px) saturate(210%)',
          border: scrolled
            ? '1px solid var(--glass-border-scrolled)'
            : '1px solid var(--glass-border-top)',
          boxShadow: scrolled
            ? '0 16px 40px -8px rgba(15, 36, 33, 0.12), 0 2px 8px rgba(15, 36, 33, 0.04), 0 0 0 1px rgba(31, 61, 58, 0.08), inset 0 1px 1px 0 var(--glass-highlight)'
            : '0 10px 30px -6px rgba(15, 36, 33, 0.08), 0 2px 6px rgba(15, 36, 33, 0.03), 0 0 0 1px rgba(31, 61, 58, 0.06), inset 0 1px 1px 0 var(--glass-highlight)',
        }}
      >
        {/* Crisp specular top-edge glass highlight */}
        <div
          className="pointer-events-none absolute inset-x-8 sm:inset-x-14 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/20 to-transparent"
          aria-hidden="true"
        />

        {/* Soft upper curved glass glare reflection */}
        <div
          className="pointer-events-none absolute inset-x-16 sm:inset-x-24 top-0 h-5 bg-gradient-to-b from-white/30 dark:from-white/10 via-white/5 dark:via-transparent to-transparent rounded-t-full"
          aria-hidden="true"
        />

        {/* Subtle bottom ambient glass refraction with dark forest green/teal depth */}
        <div
          className="pointer-events-none absolute inset-x-14 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#1F3D3A]/20 dark:via-emerald-500/20 to-transparent"
          aria-hidden="true"
        />

        {/* ── Left: Brand Identity ── */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 dark:focus-visible:ring-emerald-highlight/40 focus-visible:ring-offset-2 rounded-full"
            aria-label="Grove Hospitality OS – Home"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-[0_2px_8px_rgba(31,61,58,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-none border border-white/90 dark:border-white/15 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
              <Image
                src="/Grove.png"
                alt="Grove Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>
            <div className="leading-tight">
              <span className="font-serif font-bold text-brand-forest dark:text-[#F1F5F2] text-sm sm:text-base block tracking-tight">
                {PRODUCT_NAME}
              </span>
              <span className="text-[8.5px] sm:text-[9px] text-ink-muted dark:text-[#A5B5AD] uppercase tracking-[0.16em] font-semibold block mt-0.5">
                {PRODUCT_TAGLINE}
              </span>
            </div>
          </Link>
        </div>

        {/* ── Center: Navigation Links ── */}
        <nav
          className="hidden lg:flex items-center justify-center shrink-0 gap-0.5 xl:gap-1 mx-2 xl:mx-4"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`whitespace-nowrap text-[13px] xl:text-[13.5px] font-medium px-2.5 xl:px-3 py-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30 dark:focus-visible:ring-emerald-highlight/40 focus-visible:ring-offset-1 motion-reduce:transition-none ${
                  isActive
                    ? 'text-brand-forest dark:text-white font-semibold bg-white/80 dark:bg-white/10 shadow-[0_2px_8px_rgba(31,61,58,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-none border border-white/90 dark:border-white/15'
                    : 'text-ink/80 dark:text-[#A5B5AD] hover:text-brand-forest dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 border border-transparent'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: Authentication, Theme Toggle and Primary CTA ── */}
        <div className="hidden lg:flex items-center justify-end shrink-0 gap-2 xl:gap-2.5">
          <ThemeToggle
            variant="icon"
            className="!w-8 !h-8 !rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/75 dark:hover:bg-white/20 border-white/70 dark:border-white/15 shadow-2xs"
          />
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-ink-muted dark:text-[#A5B5AD] hidden 2xl:inline whitespace-nowrap">
                {staffName} · <span className="capitalize">{staffRole}</span>
              </span>
              <Link
                href="/dashboard"
                className="relative group bg-gradient-to-b from-[#28534E] to-[#1B3835] hover:from-[#2E5E58] hover:to-[#1F3D3A] dark:from-[#2E7D58] dark:to-[#1E573C] dark:hover:from-[#38946A] dark:hover:to-[#246647] text-white text-[13px] font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 border border-white/25 dark:border-white/20 shadow-sm whitespace-nowrap transition-all duration-200"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap text-[13px] xl:text-[13.5px] font-medium text-ink/80 dark:text-[#A5B5AD] hover:text-brand-forest dark:hover:text-white px-3 py-1.5 rounded-full transition-all duration-150 hover:bg-white/60 dark:hover:bg-white/10 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30"
              >
                Sign In
              </Link>
              <Link
                href="/register-hotel"
                className="relative group bg-gradient-to-b from-[#28534E] to-[#1B3835] hover:from-[#2E5E58] hover:to-[#1F3D3A] active:from-[#18312C] active:to-[#152B27] dark:from-[#2E7D58] dark:to-[#1E573C] dark:hover:from-[#38946A] dark:hover:to-[#246647] text-white text-[13px] font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 border border-white/25 dark:border-white/20 shadow-sm dark:shadow-[0_2px_12px_rgba(66,184,131,0.25)] whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest dark:focus-visible:ring-emerald-highlight focus-visible:ring-offset-2"
              >
                <span className="pointer-events-none absolute inset-x-2.5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" aria-hidden="true" />
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle
            variant="icon"
            className="!w-8 !h-8 !rounded-full bg-white/40 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border-white/60 dark:border-white/10 shadow-xs"
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center text-ink-muted hover:text-brand-forest dark:text-[#A5B5AD] dark:hover:text-white rounded-full transition-all bg-white/40 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-white/60 dark:border-white/10 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30"
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
          className="pointer-events-auto lg:hidden mx-auto mt-2 relative rounded-[24px] overflow-hidden w-[calc(100%-24px)] sm:w-[92%] max-w-[1140px] bg-white/90 dark:bg-[#12231F]/95 backdrop-blur-xl border border-white/80 dark:border-white/[0.12] shadow-xl dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)]"
          style={{
            animation: 'groveMenuSlideIn 200ms ease-out',
          }}
        >
          {/* Top light reflection */}
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent opacity-95"
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
                      ? 'text-brand-forest dark:text-white font-semibold bg-white/75 dark:bg-white/10 shadow-xs border border-white/80 dark:border-white/15'
                      : 'text-ink-muted dark:text-[#A5B5AD] hover:text-brand-forest dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3.5 pb-3.5">
            <hr className="border-border-subtle/50 dark:border-white/10 mb-3" />
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs text-ink-muted dark:text-[#A5B5AD]">
                  Signed in as <span className="font-medium text-ink dark:text-white">{staffName}</span> ({staffRole})
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gradient-to-b from-[#28534E] to-[#1B3835] dark:from-[#2E7D58] dark:to-[#1E573C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center border border-white/20 shadow-xs"
                >
                  Open Dashboard →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-ink dark:text-[#F1F5F2] text-center px-4 py-2.5 rounded-xl border border-white/80 dark:border-white/15 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 transition-colors shadow-2xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register-hotel"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gradient-to-b from-[#28534E] to-[#1B3835] dark:from-[#2E7D58] dark:to-[#1E573C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center border border-white/20 shadow-xs"
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
