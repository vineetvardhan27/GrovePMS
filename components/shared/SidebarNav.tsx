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
                className="my-2 mx-1.5 border-t border-white/[0.08]"
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
  );
}
