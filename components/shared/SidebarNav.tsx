'use client';

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

interface SidebarNavProps {
  authorizedPaths: string[];
}

export default function SidebarNav({ authorizedPaths }: SidebarNavProps) {
  const pathname = usePathname();
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => authorizedPaths.includes(item.href));

  return (
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
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 min-h-touch relative group
              ${isActive
                ? 'bg-white/12 text-white font-medium'
                : 'text-brand-sand/75 hover:bg-white/8 hover:text-brand-sand font-normal'
              }
            `}
          >
            {/* Active left accent */}
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
  );
}
