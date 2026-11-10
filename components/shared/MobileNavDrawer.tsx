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
        className="fixed inset-y-0 left-0 w-[285px] h-full text-white flex flex-col shadow-2xl z-[10000] overflow-hidden border-r border-white/[0.09]"
        style={{
          height: '100dvh',
          background: 'linear-gradient(180deg, #163C36 0%, #102F2B 55%, #0B2623 100%)',
        }}
        role="dialog"
        aria-label="Navigation Menu"
      >
        {/* Subtle luminous ambient highlight */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-black/20"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="px-4 py-4 border-b border-white/[0.09] flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Framed logo */}
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-white/[0.14] to-white/[0.04] p-[1.5px] ring-1 ring-white/[0.14] shadow-[0_4px_12px_rgba(0,0,0,0.3)] shrink-0 overflow-hidden flex items-center justify-center">
              <div className="h-full w-full rounded-[10px] bg-[#0E2824]/90 backdrop-blur-xs flex items-center justify-center p-1 overflow-hidden">
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
              <h2 className="text-[14px] font-semibold text-white truncate leading-tight">
                {staff.hotel_name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6CBF91] shadow-[0_0_6px_rgba(108,191,145,0.7)] shrink-0 animate-pulse" />
                <span className="text-[10px] font-medium tracking-wider uppercase text-[#B7C9C3]/75 truncate">
                  Control Centre
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#B7C9C3] hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
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
                    className="my-2 mx-1.5 border-t border-white/[0.08]"
                    aria-hidden="true"
                  />
                )}

                <Link
                  href={item.href}
                  onClick={handleClose}
                  className={`
                    flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13.5px] min-h-[42px] relative group
                    transition-all duration-200 ease-out select-none
                    ${isActive
                      ? 'bg-gradient-to-r from-[#24584B] via-[#1E4D41] to-[#163C36] text-white font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/[0.12]'
                      : 'text-[#B7C9C3] hover:text-white hover:bg-white/[0.06] hover:ring-1 hover:ring-white/[0.08] font-normal group-hover:translate-x-0.5'
                    }
                  `}
                >
                  {/* Active left slim 3px emerald indicator */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#6CBF91] rounded-r-full shadow-[0_0_8px_rgba(108,191,145,0.85)]"
                      aria-hidden="true"
                    />
                  )}

                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                      isActive
                        ? 'text-[#6CBF91] drop-shadow-[0_1px_3px_rgba(108,191,145,0.45)]'
                        : 'text-[#B7C9C3]/75 group-hover:text-[#6CBF91]'
                    }`}
                  />

                  <span className="truncate tracking-[-0.01em]">{item.name}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer: staff profile + switch account + sign-out */}
        <div className="px-3.5 py-4 border-t border-white/[0.09] bg-black/15 backdrop-blur-xs space-y-3 shrink-0 relative z-10">
          <div className="flex items-center gap-3 px-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ring-1 ring-white/15 shadow-sm ${roleMeta.avatarBg}`}>
              {initials(staff.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">{staff.full_name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <RoleIcon className="w-3 h-3 text-[#6CBF91]" />
                <span className="text-[11px] font-medium text-[#B7C9C3]/75 capitalize">{roleMeta.title}</span>
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
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[#B7C9C3] hover:text-white text-xs font-medium border border-white/[0.07] hover:border-white/15 transition-all duration-200 min-h-[32px] cursor-pointer group"
              >
                <LogOut className="w-3.5 h-3.5 text-[#B7C9C3]/80 group-hover:text-[#6CBF91] transition-colors" />
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
