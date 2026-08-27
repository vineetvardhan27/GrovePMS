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
  LogOut,
} from 'lucide-react';
import { getCurrentStaff } from '../../../lib/auth/session';
import { getDashboardStats } from '../../../lib/reports/queries';
import { getRooms, getRoomCategories } from '../../../lib/rooms/queries';
import { formatCurrency } from '../../../lib/utils/currency';
import DashboardRoomGrid from '../../../components/dashboard/DashboardRoomGrid';
import PropertyStatusCards from '../../../components/dashboard/PropertyStatusCards';

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
    <div className="space-y-8">
      {/* Access Denied Alert */}
      {isAccessDenied && (
        <div className="p-4 bg-action-danger/10 border border-action-danger/30 rounded-lg flex items-start gap-3 text-action-danger">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Restricted Access</p>
            <p className="text-xs text-action-danger/90 mt-0.5">
              Your staff role ({staff?.role}) does not have permission to access that module.
            </p>
          </div>
        </div>
      )}

      {/* Page Title & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pb-1 border-b border-border-subtle">
        <div>
          <h1 className="text-display font-serif text-brand-forest">
            Good {getGreeting()}, {staff?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-body text-ink-muted mt-1">
            {staff?.hotel_name} · <span className="capitalize">{staff?.role}</span> ·{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Quick Actions (Design.md §4: rounded-lg, primary solid brand-forest, secondary distinct) */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Primary Action (Prominent full-width on mobile) */}
          <Link
            href="/bookings/new"
            className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 bg-brand-forest hover:bg-brand-forest-light text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-2xs min-h-touch cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </Link>

          {/* Secondary Actions */}
          <Link
            href="/rooms"
            className="inline-flex items-center justify-center gap-2 bg-brand-sand-dark/60 hover:bg-brand-sand text-ink hover:text-brand-forest px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-border-subtle transition-colors min-h-touch cursor-pointer"
          >
            <BedDouble className="w-4 h-4 text-ink-muted" />
            <span>Room Chart</span>
          </Link>

          <Link
            href="/billing"
            className="inline-flex items-center justify-center gap-2 bg-brand-sand-dark/60 hover:bg-brand-sand text-ink hover:text-brand-forest px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-border-subtle transition-colors min-h-touch cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-ink-muted" />
            <span>Billing</span>
          </Link>

          <Link
            href="/payments"
            className="inline-flex items-center justify-center gap-2 bg-brand-sand-dark/60 hover:bg-brand-sand text-ink hover:text-brand-forest px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-border-subtle transition-colors min-h-touch cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-ink-muted" />
            <span>Payments</span>
          </Link>

          <Link
            href="/reports"
            className="inline-flex items-center justify-center gap-2 bg-brand-sand-dark/60 hover:bg-brand-sand text-ink hover:text-brand-forest px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-border-subtle transition-colors min-h-touch cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-ink-muted" />
            <span>Reports</span>
          </Link>

          <Link
            href="/guests"
            className="inline-flex items-center justify-center gap-2 bg-brand-sand-dark/60 hover:bg-brand-sand text-ink hover:text-brand-forest px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium border border-border-subtle transition-colors min-h-touch cursor-pointer"
          >
            <Users className="w-4 h-4 text-ink-muted" />
            <span>Guests</span>
          </Link>
        </div>
      </div>

      {/* Primary Visual Element: Live Room Status Counters */}
      <PropertyStatusCards
        stats={{
          available: stats.rooms.available,
          occupied: stats.rooms.occupied,
          reserved: stats.rooms.reserved,
          arrivingToday: stats.today.arrivals.length,
        }}
      />

      {/* Signature Section: Live Room Grid (Design.md §0) */}
      <div>
        <DashboardRoomGrid initialRooms={rooms} categories={categories} />
      </div>

      {/* Secondary Information Hierarchy: Operations & Financial Panels (Non-Redundant) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Financial Overview (Single source of financial truth) */}
        <div className="bg-white rounded-lg border border-border-subtle shadow-2xs p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="text-h2 font-bold text-ink">Financial Summary</h3>
                <p className="text-xs text-ink-muted mt-0.5">Today's collection & outstanding balances</p>
              </div>
              <div className="p-2 bg-status-green/10 rounded-lg text-status-green">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Collection Total & Mode Breakdown */}
            <div className="p-4 bg-brand-sand/50 rounded-lg border border-border-subtle space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Today's Collection
                </span>
                <span className="text-2xl font-bold font-sans text-brand-forest tabular-nums">
                  {formatCurrency(stats.today.collection)}
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
                      <div key={mode} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-border-subtle">
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
            <div className="flex items-center justify-between p-4 bg-status-amber/10 rounded-lg border border-status-amber/25">
              <div>
                <p className="text-xs font-semibold text-status-amber uppercase tracking-wider">
                  Pending Balance
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Across {stats.pending.bookingCount} active reservation{stats.pending.bookingCount === 1 ? '' : 's'}
                </p>
              </div>
              <span className="text-xl font-bold font-sans text-status-amber tabular-nums">
                {formatCurrency(stats.pending.totalBalance)}
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
              <span>Manage guest bills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Panel 2: Today's Movements & Housekeeping Operations */}
        <div className="bg-white rounded-lg border border-border-subtle shadow-2xs p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="text-h2 font-bold text-ink">Guest Operations</h3>
                <p className="text-xs text-ink-muted mt-0.5">Today's scheduled arrivals and departures</p>
              </div>
              <div className="p-2 bg-brand-sand rounded-lg text-brand-forest">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Arrivals List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted">
                <span>Arrivals Scheduled</span>
                <span className="px-2 py-0.5 rounded bg-status-amber/15 text-status-amber border border-status-amber/30 text-[11px] font-bold">
                  {stats.today.arrivals.length}
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
                <span className="px-2 py-0.5 rounded bg-status-blue/15 text-status-blue border border-status-blue/30 text-[11px] font-bold">
                  {stats.today.departures.length}
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
