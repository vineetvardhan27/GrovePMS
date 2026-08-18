import Link from 'next/link';
import {
  BedDouble,
  Users,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  LogOut,
  ShieldAlert,
  Plus,
  FileText,
  Banknote,
  Smartphone,
  Building2,
  MoreHorizontal,
  CheckCircle2,
  CalendarDays,
  Wrench,
} from 'lucide-react';
import { getCurrentStaff } from '../../../lib/auth/session';
import { getDashboardStats } from '../../../lib/reports/queries';
import { formatCurrency } from '../../../lib/utils/currency';
import { formatDate } from '../../../lib/utils/dates';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { access_denied?: string };
}) {
  const staff = await getCurrentStaff();
  const stats = await getDashboardStats();
  const isAccessDenied = searchParams?.access_denied === 'true';

  const kpiCards = [
    {
      label: 'Available',
      value: stats.rooms.available,
      icon: BedDouble,
      color: 'text-status-green',
      accent: 'border-l-status-green',
      href: '/rooms',
    },
    {
      label: 'Occupied',
      value: stats.rooms.occupied,
      icon: Users,
      color: 'text-status-red',
      accent: 'border-l-status-red',
      href: '/rooms',
    },
    {
      label: 'Reserved',
      value: stats.rooms.reserved,
      icon: Clock,
      color: 'text-status-blue',
      accent: 'border-l-status-blue',
      href: '/bookings',
    },
    {
      label: 'Arriving Today',
      value: stats.today.arrivals.length,
      icon: CalendarDays,
      color: 'text-status-amber',
      accent: 'border-l-status-amber',
      href: '/bookings',
    },
    {
      label: "Today's Departures",
      value: stats.today.departures.length,
      icon: LogOut,
      color: 'text-status-blue',
      accent: 'border-l-status-blue',
      href: '/billing',
    },
    {
      label: "Today's Collection",
      value: formatCurrency(stats.today.collection),
      icon: TrendingUp,
      color: 'text-status-green',
      accent: 'border-l-status-green',
      href: '/payments',
    },
    {
      label: 'Pending Balance',
      value: formatCurrency(stats.pending.totalBalance),
      icon: CreditCard,
      color: 'text-status-amber',
      accent: 'border-l-status-amber',
      href: '/billing',
    },
    {
      label: 'Cleaning Needed',
      value: stats.cleaningNeeded,
      icon: Sparkles,
      color: 'text-status-orange',
      accent: 'border-l-status-orange',
      href: '/rooms',
    },
  ];

  const quickActions = [
    { label: 'New Booking', icon: Plus, href: '/bookings/new', color: 'bg-brand-forest text-white hover:bg-brand-forest-light' },
    { label: 'Room Grid', icon: BedDouble, href: '/rooms', color: 'bg-white border border-border-subtle text-ink hover:bg-brand-sand' },
    { label: 'Billing', icon: FileText, href: '/billing', color: 'bg-white border border-border-subtle text-ink hover:bg-brand-sand' },
    { label: 'Payments', icon: Banknote, href: '/payments', color: 'bg-white border border-border-subtle text-ink hover:bg-brand-sand' },
    { label: 'Reports', icon: TrendingUp, href: '/reports', color: 'bg-white border border-border-subtle text-ink hover:bg-brand-sand' },
    { label: 'Guests', icon: Users, href: '/guests', color: 'bg-white border border-border-subtle text-ink hover:bg-brand-sand' },
  ];

  const modeIcons: Record<string, any> = {
    cash: Banknote,
    upi: Smartphone,
    card: CreditCard,
    bank_transfer: Building2,
    other: MoreHorizontal,
  };
  const modeLabels: Record<string, string> = {
    cash: 'Cash', upi: 'UPI', card: 'Card', bank_transfer: 'Bank', other: 'Other',
  };

  return (
    <div className="space-y-8">
      {/* Access Denied Alert */}
      {isAccessDenied && (
        <div className="p-4 bg-action-danger/10 border border-action-danger/25 rounded-xl flex items-start gap-3 text-action-danger">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Restricted Access</p>
            <p className="text-xs text-action-danger/90 mt-0.5">
              Your staff role ({staff?.role}) does not have permission to access that module.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-display text-brand-forest">
            Good {getGreeting()}, {staff?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-body text-ink-muted">
            {staff?.role && <span className="capitalize">{staff.role}</span>} · {staff?.hotel_name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-2xs min-h-touch ${action.color}`}
              >
                <Icon className="w-4 h-4" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">Live Property Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                href={card.href}
                key={card.label}
                className={`group bg-white rounded-xl p-5 border border-border-subtle border-l-4 ${card.accent} shadow-2xs hover:shadow-md transition-all`}
              >
                <div className="flex items-center justify-between text-ink-muted mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">{card.label}</span>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className={`text-2xl md:text-3xl font-serif font-bold tabular-nums ${card.color}`}>
                  {card.value}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Today's Collection Breakdown + Arrivals/Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Collection by Mode */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ink">Today's Collection</h3>
            <span className="text-xl font-serif font-bold text-brand-forest tabular-nums">
              {formatCurrency(stats.today.collection)}
            </span>
          </div>
          {stats.today.collection === 0 ? (
            <p className="text-xs text-ink-muted text-center py-4">No payments recorded today.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.today.collectionByMode).map(([mode, amount]) => {
                if (amount === 0) return null;
                const ModeIcon = modeIcons[mode] || MoreHorizontal;
                return (
                  <div key={mode} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-ink-muted">
                      <ModeIcon className="w-3.5 h-3.5" />
                      {modeLabels[mode] || mode}
                    </span>
                    <span className="font-bold text-ink tabular-nums">{formatCurrency(amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <Link href="/payments" className="text-xs text-brand-forest hover:underline flex items-center gap-1">
              <span>View all payments</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Today's Arrivals */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ink">Arriving Today</h3>
            <span className="px-2.5 py-0.5 bg-status-amber/15 text-status-amber border border-status-amber/30 rounded-lg text-xs font-bold">
              {stats.today.arrivals.length}
            </span>
          </div>
          {stats.today.arrivals.length === 0 ? (
            <p className="text-xs text-ink-muted text-center py-4">No arrivals scheduled today.</p>
          ) : (
            <div className="space-y-3">
              {stats.today.arrivals.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-xs truncate">{b.guest.full_name}</p>
                    <p className="text-[11px] text-ink-muted">
                      Room {b.room.room_number} · {b.adults} Adults
                    </p>
                  </div>
                  <Link
                    href="/bookings"
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-status-green/15 border border-status-green/30 text-status-green text-[11px] font-semibold hover:bg-status-green/25 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Check In
                  </Link>
                </div>
              ))}
              {stats.today.arrivals.length > 4 && (
                <p className="text-xs text-ink-muted">+{stats.today.arrivals.length - 4} more</p>
              )}
            </div>
          )}
        </div>

        {/* Today's Departures */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-ink">Departing Today</h3>
            <span className="px-2.5 py-0.5 bg-status-blue/15 text-status-blue border border-status-blue/30 rounded-lg text-xs font-bold">
              {stats.today.departures.length}
            </span>
          </div>
          {stats.today.departures.length === 0 ? (
            <p className="text-xs text-ink-muted text-center py-4">No checkouts due today.</p>
          ) : (
            <div className="space-y-3">
              {stats.today.departures.slice(0, 4).map((b) => {
                const balance = Math.max(0, b.total_amount - b.advance_amount);
                return (
                  <div key={b.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-xs truncate">{b.guest.full_name}</p>
                      <p className="text-[11px] text-ink-muted">
                        Room {b.room.room_number}
                        {balance > 0 && <span className="text-status-amber"> · {formatCurrency(balance)} due</span>}
                      </p>
                    </div>
                    <Link
                      href={`/billing/${b.id}`}
                      className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-forest/10 border border-brand-forest/30 text-brand-forest text-[11px] font-semibold hover:bg-brand-forest/20 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Bill
                    </Link>
                  </div>
                );
              })}
              {stats.today.departures.length > 4 && (
                <p className="text-xs text-ink-muted">+{stats.today.departures.length - 4} more</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Room Status Summary Row */}
      {(stats.cleaningNeeded > 0 || stats.rooms.maintenance > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {stats.cleaningNeeded > 0 && (
            <div className="bg-status-orange/10 border border-status-orange/25 rounded-xl p-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-status-orange shrink-0" />
              <div>
                <p className="font-semibold text-sm text-ink">
                  {stats.cleaningNeeded} Room{stats.cleaningNeeded > 1 ? 's' : ''} Need Cleaning
                </p>
                <Link href="/rooms" className="text-xs text-status-orange hover:underline">
                  View room grid →
                </Link>
              </div>
            </div>
          )}
          {stats.rooms.maintenance > 0 && (
            <div className="bg-status-red/10 border border-status-red/25 rounded-xl p-4 flex items-center gap-3">
              <Wrench className="w-5 h-5 text-status-red shrink-0" />
              <div>
                <p className="font-semibold text-sm text-ink">
                  {stats.rooms.maintenance} Room{stats.rooms.maintenance > 1 ? 's' : ''} Under Maintenance
                </p>
                <Link href="/rooms" className="text-xs text-status-red hover:underline">
                  View room grid →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
