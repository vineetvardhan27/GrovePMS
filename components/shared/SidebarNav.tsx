'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Receipt,
  CreditCard,
  UtensilsCrossed,
  Package,
  PartyPopper,
  BarChart3,
  Settings,
} from 'lucide-react';

export interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section: 'core' | 'frontdesk' | 'finance' | 'property' | 'admin';
}

export const ALL_NAV_ITEMS: NavItemConfig[] = [
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

interface SidebarNavProps {
  authorizedPaths: string[];
}

export default function SidebarNav({ authorizedPaths }: SidebarNavProps) {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  const activePath = pendingPath || pathname;
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => authorizedPaths.includes(item.href));

  return (
    <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto overflow-x-hidden relative z-10">
      {visibleNavItems.map((item, index) => {
        const Icon = item.icon;
        const isActive =
          activePath === item.href ||
          (item.href !== '/dashboard' && activePath.startsWith(`${item.href}/`));

        // Subtle section separator when moving between operational groups
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
              onClick={() => {
                if (pathname !== item.href) {
                  setPendingPath(item.href);
                }
              }}
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
  );
}
