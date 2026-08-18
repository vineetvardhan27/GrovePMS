import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  Hotel,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Building2,
} from 'lucide-react';
import { getCurrentStaff, ROLE_NAV_ITEMS } from '../../lib/auth/session';
import { signOut } from '../(auth)/login/actions';
import { StaffRole } from '../../lib/types/database.types';
import MobileNavDrawer from '../../components/shared/MobileNavDrawer';

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getCurrentStaff();

  // If unauthenticated, redirect to login
  if (!staff) {
    redirect('/login');
  }

  const authorizedPaths = ROLE_NAV_ITEMS[staff.role] || ['/dashboard', '/rooms'];
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => authorizedPaths.includes(item.href));
  const roleBadgeInfo = ROLE_BADGES[staff.role] || ROLE_BADGES.reception;
  const RoleIcon = roleBadgeInfo.icon;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-sand">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 bg-brand-forest text-white flex-col shrink-0 border-r border-brand-forest-light">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-brand-forest-light">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Hotel className="w-6 h-6 text-brand-sand" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold tracking-tight truncate">Greenery View</h2>
            <p className="text-xs text-brand-sand/70 truncate">Hotel Control Centre</p>
          </div>
        </div>

        {/* Navigation links (Filtered dynamically by staff role) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-tiny font-medium uppercase tracking-wider text-brand-sand/60">
            Navigation ({staff.role})
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-sand/90 hover:bg-brand-forest-light hover:text-white transition-colors min-h-touch"
              >
                <Icon className="w-5 h-5 text-brand-sand/80 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Active Staff profile & Logout footer */}
        <div className="p-4 border-t border-brand-forest-light bg-brand-forest-light/40 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-sand text-brand-forest flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {staff.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{staff.full_name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${roleBadgeInfo.color}`}>
                  <RoleIcon className="w-3 h-3" />
                  <span>{roleBadgeInfo.title}</span>
                </span>
              </div>
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-brand-sand text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar (Responsive on mobile) */}
        <header className="h-16 bg-white/85 backdrop-blur-sm border-b border-border-subtle flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Hamburger Drawer Toggle */}
            <MobileNavDrawer staff={staff} authorizedPaths={authorizedPaths} />

            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-sm font-medium text-ink truncate">
                {staff.hotel_name}
              </span>
              <span className="text-xs text-ink-muted">/</span>
              <span className="text-xs text-ink-muted capitalize truncate">{staff.role} View</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="text-xs text-ink-muted hover:text-brand-forest font-medium px-2.5 py-1.5 rounded-lg border border-border-subtle bg-brand-sand/60 hover:bg-brand-sand transition-colors min-h-[36px] flex items-center"
            >
              Switch Role
            </Link>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
