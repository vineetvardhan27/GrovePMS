'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Hotel,
  LogOut,
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  Building2,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { StaffRole } from '../../lib/types/database.types';
import { signOut } from '../../app/(auth)/login/actions';

const ALL_NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Rooms', href: '/rooms', icon: BedDouble },
  { name: 'Bookings', href: '/bookings', icon: CalendarDays },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Billing', href: '/billing', icon: Receipt },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const ROLE_BADGES: Record<StaffRole, { title: string; icon: any; color: string }> = {
  owner: { title: 'Owner', icon: Building2, color: 'bg-brand-sand-dark text-brand-forest border-brand-sand' },
  manager: { title: 'Manager', icon: ShieldCheck, color: 'bg-status-blue/20 text-white border-status-blue/40' },
  reception: { title: 'Receptionist', icon: UserCheck, color: 'bg-status-amber/20 text-white border-status-amber/40' },
  housekeeping: { title: 'Housekeeping', icon: Sparkles, color: 'bg-status-orange/20 text-white border-status-orange/40' },
};

interface MobileNavDrawerProps {
  staff: {
    full_name: string;
    role: StaffRole;
    hotel_name: string;
  };
  authorizedPaths: string[];
}

export default function MobileNavDrawer({ staff, authorizedPaths }: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer callback
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close drawer automatically on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => authorizedPaths.includes(item.href));
  const roleBadgeInfo = ROLE_BADGES[staff.role] || ROLE_BADGES.reception;
  const RoleIcon = roleBadgeInfo.icon;

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] md:hidden" aria-modal="true" role="dialog">
      {/* Dimmed backdrop scrim (click-to-close) */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer z-[9999]"
        aria-hidden="true"
      />

      {/* Slide-out Navigation Panel (100% Solid opaque background, full viewport height) */}
      <div
        className="fixed inset-y-0 left-0 w-4/5 max-w-xs h-full bg-[#1F3D3A] text-white flex flex-col justify-between shadow-2xl z-[10000] overflow-hidden transform transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ backgroundColor: '#1F3D3A', height: '100dvh' }}
        role="dialog"
        aria-label="Global Navigation Menu"
      >
        {/* Header row: Logo, Name, Close (X) button with >= 44x44px target */}
        <div
          className="p-4 border-b border-brand-forest-light bg-[#1F3D3A] flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#1F3D3A' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-lg text-brand-sand shrink-0">
              <Hotel className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-base font-bold tracking-tight truncate text-white">
                {staff.hotel_name}
              </h2>
              <p className="text-xs text-brand-sand/70 truncate">Control Centre</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-11 h-11 rounded-lg text-brand-sand hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close Navigation Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation route list (scoped to role, min 44x44px per row, icon + label) */}
        <nav
          className="flex-1 p-3 space-y-1.5 overflow-y-auto bg-[#1F3D3A]"
          style={{ backgroundColor: '#1F3D3A' }}
        >
          <div className="px-3.5 py-1 text-tiny font-semibold uppercase tracking-wider text-brand-sand/60">
            Menu ({staff.role})
          </div>

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleClose}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-touch ${
                  isActive
                    ? 'bg-brand-forest-light text-white font-semibold shadow-xs'
                    : 'text-brand-sand/90 hover:bg-brand-forest-light/60 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 text-brand-sand/80 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Account section at bottom: Profile, Switch Role, Sign Out (visually separated) */}
        <div
          className="p-4 border-t border-brand-forest-light bg-black/25 shrink-0 space-y-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-sand text-brand-forest flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {staff.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{staff.full_name}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-tiny font-medium border ${roleBadgeInfo.color}`}>
                <RoleIcon className="w-3 h-3" />
                <span>{roleBadgeInfo.title}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/login"
              onClick={handleClose}
              className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-brand-sand text-xs font-medium transition-colors min-h-touch text-center"
            >
              Switch Role
            </Link>

            <form action={signOut} className="flex-1">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-action-danger/25 hover:bg-action-danger/35 text-white text-xs font-medium transition-colors min-h-touch cursor-pointer"
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
      {/* Mobile Menu Hamburger Button (Min 44x44px hit area per Design.md §3) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-brand-forest hover:bg-brand-sand transition-colors cursor-pointer shrink-0"
        aria-label="Open Navigation Menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Render drawer into document.body to escape header container constraints */}
      {isOpen && mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
