'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Receipt,
  CreditCard,
  UtensilsCrossed,
  BarChart3,
  Settings,
  Building2,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Package,
  PartyPopper,
} from 'lucide-react';
import { StaffRole } from '../../lib/types/database.types';
import { signOut } from '../../app/(auth)/login/actions';

import type { StaffProfile } from '../../lib/auth/types';
import { AvailableStaffAccount } from '../../lib/auth/switchAccount';
import AccountSwitcher from './AccountSwitcher';
import ThemeToggle from './ThemeToggle';

const ALL_NAV_ITEMS = [
  { name: 'Dashboard',       href: '/dashboard',     icon: LayoutDashboard, section: 'core' },
  { name: 'Rooms',           href: '/rooms',         icon: BedDouble,        section: 'frontdesk' },
  { name: 'Bookings',        href: '/bookings',      icon: CalendarDays,     section: 'frontdesk' },
  { name: 'Guests',          href: '/guests',        icon: Users,            section: 'frontdesk' },
  { name: 'Billing',         href: '/billing',       icon: Receipt,          section: 'finance' },
  { name: 'Payments',        href: '/payments',      icon: CreditCard,       section: 'finance' },
  { name: 'Food & Beverage', href: '/food-beverage', icon: UtensilsCrossed,  section: 'finance' },
  { name: 'Inventory',       href: '/inventory',     icon: Package,          section: 'property' },
  { name: 'Banquet Hall',    href: '/banquet',       icon: PartyPopper,      section: 'property' },
  { name: 'Reports',         href: '/reports',       icon: BarChart3,        section: 'admin' },
  { name: 'Settings',        href: '/settings',      icon: Settings,         section: 'admin' },
];

const ROLE_META: Record<StaffRole, { title: string; icon: any; avatarBg: string }> = {
  owner:        { title: 'Owner',        icon: Building2,   avatarBg: 'bg-brand-sand text-brand-forest' },
  manager:      { title: 'Manager',      icon: ShieldCheck, avatarBg: 'bg-status-blue/30 text-white' },
  reception:    { title: 'Reception',    icon: UserCheck,   avatarBg: 'bg-status-amber/30 text-white' },
  housekeeping: { title: 'Housekeeping', icon: Sparkles,    avatarBg: 'bg-status-orange/30 text-white' },
};

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

interface MobileNavDrawerProps {
  staff: StaffProfile | { full_name: string; role: StaffRole; hotel_name: string };
  authorizedPaths: string[];
  availableAccounts?: AvailableStaffAccount[];
}

export default function MobileNavDrawer({
  staff,
  authorizedPaths,
  availableAccounts = [],
}: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const handleClose = useCallback(() => { setIsOpen(false); }, []);

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const original = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  const visibleNavItems = ALL_NAV_ITEMS.filter(item => authorizedPaths.includes(item.href));
  const roleMeta = ROLE_META[staff.role] || ROLE_META.reception;
  const RoleIcon = roleMeta.icon;

  const fullStaffProfile: StaffProfile = {
    id: (staff as any).id || '',
    email: (staff as any).email || '',
    full_name: staff.full_name,
    role: staff.role,
    hotel_id: (staff as any).hotel_id || '',
    hotel_name: staff.hotel_name,
    is_active: true,
  };

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="fixed inset-y-0 left-0 w-[285px] h-full text-white flex flex-col shadow-2xl z-[10000] overflow-hidden border-r"
        style={{
          height: '100dvh',
          background: 'var(--sidebar-gradient)',
          borderColor: 'var(--sidebar-border-right)',
        }}
        role="dialog"
        aria-label="Navigation Menu"
      >
        {/* Subtle luminous ambient highlight */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.06] via-transparent to-black/25"
          aria-hidden="true"
        />

        {/* Header */}
        <div
          className="px-4 py-4 border-b flex items-center justify-between shrink-0 relative z-10"
          style={{ borderColor: 'var(--sidebar-header-border)' }}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Framed logo */}
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-white/[0.18] to-white/[0.05] p-[1.5px] ring-1 ring-white/[0.14] shadow-[0_4px_12px_rgba(0,0,0,0.25)] shrink-0 overflow-hidden flex items-center justify-center">
              <div className="h-full w-full rounded-[10px] bg-[#0E2824]/90 dark:bg-[#071714]/90 backdrop-blur-xs flex items-center justify-center p-1 overflow-hidden">
                {(staff as any).hotel_logo_url ? (
                  <img
                    src={(staff as any).hotel_logo_url}
                    alt={staff.hotel_name}
                    className="max-h-7 max-w-full w-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                  />
                ) : (
                  <div className="w-full h-full rounded-md bg-gradient-to-br from-[#24584B] to-[#102F2B] text-white font-bold text-xs flex items-center justify-center tracking-wider">
                    {staff.hotel_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2
                className="text-[14px] font-semibold truncate leading-tight"
                style={{ color: 'var(--sidebar-text-primary)' }}
              >
                {staff.hotel_name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                  style={{
                    backgroundColor: 'var(--sidebar-icon-active)',
                    boxShadow: '0 0 6px var(--sidebar-nav-active-indicator-glow)',
                  }}
                />
                <span
                  className="text-[10px] font-bold tracking-widest uppercase truncate"
                  style={{ color: 'var(--sidebar-text-muted)' }}
                >
                  Control Centre
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle variant="icon" />
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--sidebar-text-muted)] hover:bg-white/10 hover:text-[var(--sidebar-text-primary)] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto overflow-x-hidden relative z-10">
          {visibleNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

            const prevItem = index > 0 ? visibleNavItems[index - 1] : null;
            const showDivider = prevItem && prevItem.section !== item.section;

            return (
              <div key={item.name} className="space-y-1">
                {showDivider && (
                  <div
                    className="my-2.5 mx-2 border-t"
                    style={{ borderColor: 'var(--sidebar-separator)' }}
                    aria-hidden="true"
                  />
                )}

                <Link
                  href={item.href}
                  onClick={handleClose}
                  className={`
                    sidebar-nav-item group
                    ${isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-idle'}
                  `}
                >
                  {/* Active left slim 3px emerald indicator */}
                  {isActive && (
                    <span
                      className="sidebar-active-indicator absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      aria-hidden="true"
                    />
                  )}

                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'sidebar-nav-icon-active' : 'sidebar-nav-icon-idle'
                    }`}
                  />

                  <span className="truncate tracking-[-0.01em]">{item.name}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer: staff profile + switch account + sign-out */}
        <div
          className="px-3.5 py-4 border-t space-y-3 shrink-0 relative z-10 backdrop-blur-xs"
          style={{
            backgroundColor: 'var(--sidebar-profile-bg)',
            borderColor: 'var(--sidebar-profile-border)',
          }}
        >
          <div className="flex items-center gap-3 px-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-white/15 dark:ring-white/10 shadow-sm ${roleMeta.avatarBg}`}>
              {initials(staff.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-semibold truncate leading-tight"
                style={{ color: 'var(--sidebar-text-primary)' }}
              >
                {staff.full_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <RoleIcon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: 'var(--sidebar-icon-active)' }}
                />
                <span
                  className="text-[11px] font-medium capitalize truncate"
                  style={{ color: 'var(--sidebar-text-muted)' }}
                >
                  {roleMeta.title}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <AccountSwitcher
                currentStaff={fullStaffProfile}
                availableAccounts={availableAccounts}
              />
            </div>
            <form action={signOut} className="shrink-0">
              <button
                type="submit"
                className="sidebar-signout-btn flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium min-h-[32px] cursor-pointer group"
              >
                <LogOut className="w-3.5 h-3.5 transition-colors group-hover:text-[var(--sidebar-icon-active)]" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-brand-forest hover:bg-brand-sand-dark transition-colors cursor-pointer shrink-0"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
