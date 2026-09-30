import Link from 'next/link';
import {
  CheckCircle2,
  Users,
  Clock,
  Calendar,
  Sparkles,
  Wrench,
  ShieldAlert,
  Plus,
  BedDouble,
  Receipt,
  CreditCard,
  BarChart3,
  TrendingUp,
  Banknote,
  Smartphone,
  Building2,
  MoreHorizontal,
  ArrowRight,
  UtensilsCrossed,
  LayoutDashboard,
} from 'lucide-react';
import { getCurrentStaff } from '../../../lib/auth/session';
import { getDashboardStats } from '../../../lib/reports/queries';
import { getRooms, getRoomCategories } from '../../../lib/rooms/queries';
import { formatCurrency } from '../../../lib/utils/currency';
import DashboardRoomGrid from '../../../components/dashboard/DashboardRoomGrid';
import PropertyStatusCards from '../../../components/dashboard/PropertyStatusCards';
import AnimatedKpiValue from '../../../components/shared/AnimatedKpiValue';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { access_denied?: string };
}) {
  const [staff, stats, rooms, categories] = await Promise.all([
    getCurrentStaff(),
    getDashboardStats(),
    getRooms(),
    getRoomCategories(),
  ]);

  const isAccessDenied = searchParams?.access_denied === 'true';

  const modeIcons: Record<string, any> = {
    cash: Banknote,
    upi: Smartphone,
    card: CreditCard,
    bank_transfer: Building2,
    other: MoreHorizontal,
  };

  const modeLabels: Record<string, string> = {
    cash: 'Cash',
    upi: 'UPI',
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    other: 'Other',
  };

  return (
    <div className="space-y-6">
      {/* Access Denied Alert */}
      {isAccessDenied && (
        <div className="p-4 bg-action-danger/10 border border-action-danger/30 rounded-xl flex items-start gap-3 text-action-danger">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Restricted Access</p>
            <p className="text-xs text-action-danger/90 mt-0.5">
              Your staff role ({staff?.role}) does not have permission to access that module.
            </p>
          </div>
        </div>
      )}

      {/* Page Title & Greeting matching Food & Beverage Overview standard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-brand-forest shrink-0" aria-hidden="true" />
            <span>Good {getGreeting()}, {staff?.full_name?.split(' ')[0]}</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            {staff?.hotel_name} · <span className="capitalize">{staff?.role}</span> ·{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/bookings/new"
            className="pms-btn-primary flex items-center gap-2 shadow-xs text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Booking</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions (Food & Beverage Overview Card Reference Style) */}
      <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Quick Actions — Operational Shortcuts
          </span>
          <span className="text-xs text-ink-muted hidden sm:inline">One-click property navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link href="/bookings/new" className="pms-quick-action group">
            <div className="w-8 h-8 rounded-md bg-brand-forest/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-brand-forest group-hover:text-white" />
            </div>
            <div className="truncate min-w-0">
              <div className="font-semibold truncate">New Booking</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Check-in / Reserve</div>
            </div>
          </Link>

          <Link href="/rooms" className="pms-quick-action group">
            <div className="w-8 h-8 rounded-md bg-brand-forest/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <BedDouble className="w-4 h-4 text-brand-forest group-hover:text-white" />
            </div>
            <div className="truncate min-w-0">
              <div className="font-semibold truncate">Room Chart</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Live matrix</div>
            </div>
          </Link>

          <Link href="/billing" className="pms-quick-action group">
            <div className="w-8 h-8 rounded-md bg-brand-forest/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4 text-brand-forest group-hover:text-white" />
            </div>
            <div className="truncate min-w-0">
              <div className="font-semibold truncate">Billing</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Folios & GST</div>
            </div>
          </Link>

          <Link href="/payments" className="pms-quick-action group">
            <div className="w-8 h-8 rounded-md bg-brand-forest/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-brand-forest group-hover:text-white" />
            </div>
            <div className="truncate min-w-0">
              <div className="font-semibold truncate">Payments</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Ledger & Cash</div>
            </div>
          </Link>

          <Link href="/food-beverage" className="pms-quick-action group">
            <div className="w-8 h-8 rounded-md bg-brand-forest/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4 text-brand-forest group-hover:text-white" />
            </div>
            <div className="truncate min-w-0">
              <div className="font-semibold truncate">F&amp;B POS</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Dining &amp; Kitchen</div>
            </div>
          </Link>

          <Link href="/reports" className="pms-quick-action group">
            <div className="w-8 h-8 rounded-md bg-brand-forest/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-brand-forest group-hover:text-white" />
            </div>
            <div className="truncate min-w-0">
              <div className="font-semibold truncate">Reports</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">ADR &amp; RevPAR</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Primary Visual Element: Live Room Status Counters with staggered entrance */}
      <PropertyStatusCards
        stats={{
          available: stats.rooms.available,
          occupied: stats.rooms.occupied,
          reserved: stats.rooms.reserved,
          arrivingToday: stats.today.arrivals.length,
        }}
      />

      {/* Signature Section: Live Room Grid (Wrapped in unified card shell) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Floor-by-Floor Room Matrix
          </h2>
          <span className="text-xs text-ink-muted">Real-time status updates</span>
        </div>
        <DashboardRoomGrid initialRooms={rooms} categories={categories} />
      </div>

      {/* Secondary Information Hierarchy: Operations & Financial Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Financial Overview */}
        <div className="bg-white rounded-xl border border-border-subtle shadow-card p-5 space-y-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-forest" />
                <h2 className="text-sm font-bold text-ink">Financial Summary</h2>
              </div>
              <span className="text-xs text-ink-muted">Today&apos;s collections</span>
            </div>

            {/* Collection Total & Mode Breakdown */}
            <div className="p-4 bg-brand-sand/50 rounded-xl border border-border-subtle space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Today&apos;s Collection
                </span>
                <span className="text-2xl font-bold font-serif text-brand-forest tabular-nums">
                  <AnimatedKpiValue value={stats.today.collection} type="currency" />
                </span>
              </div>

              {stats.today.collection === 0 ? (
                <p className="text-xs text-ink-muted italic pt-1 border-t border-border-subtle">
                  No payments recorded so far today.
                </p>
              ) : (
                <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(stats.today.collectionByMode).map(([mode, amount]) => {
                    if (amount === 0) return null;
                    const ModeIcon = modeIcons[mode] || MoreHorizontal;
                    return (
                      <div key={mode} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-border-subtle">
                        <span className="flex items-center gap-1.5 text-ink-muted">
                          <ModeIcon className="w-3.5 h-3.5 text-brand-forest" />
                          <span>{modeLabels[mode] || mode}</span>
                        </span>
                        <span className="font-semibold text-ink tabular-nums">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Balance Row */}
            <div className="flex items-center justify-between p-4 bg-status-amber/10 rounded-xl border border-status-amber/25">
              <div>
                <p className="text-xs font-semibold text-status-amber uppercase tracking-wider">
                  Pending Balance
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Across {stats.pending.bookingCount} active reservation{stats.pending.bookingCount === 1 ? '' : 's'}
                </p>
              </div>
              <span className="text-xl font-bold font-serif text-status-amber tabular-nums">
                <AnimatedKpiValue value={stats.pending.totalBalance} type="currency" />
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            <Link
              href="/payments"
              className="font-semibold text-brand-forest hover:text-brand-forest-light hover:underline flex items-center gap-1"
            >
              <span>View all payments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/billing"
              className="font-semibold text-brand-forest hover:text-brand-forest-light hover:underline flex items-center gap-1"
            >
              <span>Manage guest folios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Panel 2: Today's Movements & Housekeeping Operations */}
        <div className="bg-white rounded-xl border border-border-subtle shadow-card p-5 space-y-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-forest" />
                <h2 className="text-sm font-bold text-ink">Guest Operations</h2>
              </div>
              <span className="text-xs text-ink-muted">Arrivals &amp; departures</span>
            </div>

            {/* Arrivals List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted">
                <span>Arrivals Scheduled</span>
                <span className="px-2 py-0.5 rounded-full bg-status-amber/15 text-status-amber text-[11px] font-bold">
                  {stats.today.arrivals.length} Live
                </span>
              </div>

              {stats.today.arrivals.length === 0 ? (
                <p className="text-xs text-ink-muted p-3 bg-brand-sand/30 rounded-lg text-center">
                  No arrivals scheduled for today.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.today.arrivals.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-lg border border-border-subtle bg-brand-sand/30 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{b.guest.full_name}</p>
                        <p className="text-[11px] text-ink-muted">
                          Room {b.room.room_number} ({b.room.category.name})
                        </p>
                      </div>
                      <Link
                        href="/bookings"
                        className="shrink-0 px-2.5 py-1 rounded bg-status-green/15 border border-status-green/30 text-status-green font-semibold hover:bg-status-green/25 transition-colors"
                      >
                        Check In
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Departures List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted">
                <span>Departures Scheduled</span>
                <span className="px-2 py-0.5 rounded-full bg-status-blue/15 text-status-blue text-[11px] font-bold">
                  {stats.today.departures.length} Due
                </span>
              </div>

              {stats.today.departures.length === 0 ? (
                <p className="text-xs text-ink-muted p-3 bg-brand-sand/30 rounded-lg text-center">
                  No checkouts due today.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.today.departures.slice(0, 3).map((b) => {
                    const balance = Math.max(0, b.total_amount - b.advance_amount);
                    return (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-lg border border-border-subtle bg-brand-sand/30 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-ink truncate">{b.guest.full_name}</p>
                          <p className="text-[11px] text-ink-muted">
                            Room {b.room.room_number}
                            {balance > 0 && (
                              <span className="text-status-amber font-medium">
                                {' '}· {formatCurrency(balance)} due
                              </span>
                            )}
                          </p>
                        </div>
                        <Link
                          href={`/billing/${b.id}`}
                          className="shrink-0 px-2.5 py-1 rounded bg-brand-forest/10 border border-brand-forest/30 text-brand-forest font-semibold hover:bg-brand-forest/20 transition-colors"
                        >
                          Checkout Bill
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Housekeeping & Maintenance Status summary */}
            {(stats.cleaningNeeded > 0 || stats.rooms.maintenance > 0) && (
              <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-2 text-xs">
                {stats.cleaningNeeded > 0 && (
                  <div className="flex-1 flex items-center justify-between p-2.5 bg-status-orange/10 border border-status-orange/25 rounded-lg">
                    <span className="flex items-center gap-1.5 text-status-orange font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{stats.cleaningNeeded} Needs Cleaning</span>
                    </span>
                    <Link href="/rooms" className="text-status-orange font-semibold hover:underline">
                      View →
                    </Link>
                  </div>
                )}
                {stats.rooms.maintenance > 0 && (
                  <div className="flex-1 flex items-center justify-between p-2.5 bg-status-slate/10 border border-status-slate/25 rounded-lg">
                    <span className="flex items-center gap-1.5 text-status-slate font-medium">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{stats.rooms.maintenance} Maintenance</span>
                    </span>
                    <Link href="/rooms" className="text-status-slate font-semibold hover:underline">
                      View →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            <Link
              href="/bookings"
              className="font-semibold text-brand-forest hover:text-brand-forest-light hover:underline flex items-center gap-1"
            >
              <span>Open booking register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
