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

import { StaffProfile } from '../../lib/auth/session';
import { AvailableStaffAccount } from '../../lib/auth/switchAccount';
import AccountSwitcher from './AccountSwitcher';

const ALL_NAV_ITEMS = [
  { name: 'Dashboard',       href: '/dashboard',     icon: LayoutDashboard },
  { name: 'Rooms',           href: '/rooms',         icon: BedDouble },
  { name: 'Bookings',        href: '/bookings',      icon: CalendarDays },
  { name: 'Guests',          href: '/guests',        icon: Users },
  { name: 'Billing',         href: '/billing',       icon: Receipt },
  { name: 'Payments',        href: '/payments',      icon: CreditCard },
  { name: 'Food & Beverage', href: '/food-beverage', icon: UtensilsCrossed },
  { name: 'Inventory',       href: '/inventory',     icon: Package },
  { name: 'Banquet Hall',    href: '/banquet',       icon: PartyPopper },
  { name: 'Reports',         href: '/reports',       icon: BarChart3 },
  { name: 'Settings',        href: '/settings',      icon: Settings },
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
        className="fixed inset-y-0 left-0 w-[280px] h-full bg-brand-forest text-white flex flex-col shadow-modal z-[10000] overflow-hidden"
        style={{ height: '100dvh' }}
        role="dialog"
        aria-label="Navigation Menu"
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 bg-white/95 rounded-lg p-1 flex items-center justify-center shrink-0 shadow-xs">
              {(staff as any).hotel_logo_url ? (
                <img src={(staff as any).hotel_logo_url} alt={staff.hotel_name} className="h-8 w-auto object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-md bg-brand-forest text-white font-bold font-serif text-xs flex items-center justify-center">
                  {staff.hotel_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-[14px] font-bold truncate text-white leading-tight">
                {staff.hotel_name}
              </h2>
              <p className="text-[10px] text-brand-sand/60">Control Centre</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-brand-sand/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 min-h-touch relative group
                  ${isActive
                    ? 'bg-white/12 text-white font-medium'
                    : 'text-brand-sand/75 hover:bg-white/8 hover:text-brand-sand font-normal'
                  }
                `}
              >
                {/* Active left indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-sand rounded-r-full" />
                )}
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors duration-150 ${
                    isActive ? 'text-white' : 'text-brand-sand/60 group-hover:text-brand-sand/90'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: staff profile + switch account + sign-out */}
        <div className="px-3 py-4 border-t border-white/8 space-y-3 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${roleMeta.avatarBg}`}>
              {initials(staff.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{staff.full_name}</p>
              <div className="flex items-center gap-1">
                <RoleIcon className="w-3 h-3 text-brand-sand/50" />
                <span className="text-[11px] text-brand-sand/50">{roleMeta.title}</span>
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
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-action-danger/20 hover:bg-action-danger/30 text-white text-xs font-medium transition-colors min-h-[32px] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
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
