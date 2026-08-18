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
} from 'lucide-react';
import { getCurrentStaff } from '../../../lib/auth/session';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { access_denied?: string };
}) {
  const staff = await getCurrentStaff();
  const isAccessDenied = searchParams?.access_denied === 'true';

  const statCards = [
    { label: 'Available Rooms', value: '7', icon: BedDouble, color: 'text-status-green', bg: 'border-l-4 border-l-status-green' },
    { label: 'Occupied Rooms', value: '2', icon: Users, color: 'text-status-red', bg: 'border-l-4 border-l-status-red' },
    { label: 'Arriving Today', value: '1', icon: Clock, color: 'text-status-amber', bg: 'border-l-4 border-l-status-amber' },
    { label: "Today's Departures", value: '0', icon: LogOut, color: 'text-status-blue', bg: 'border-l-4 border-l-status-blue' },
    { label: "Today's Collection", value: '₹12,500', icon: TrendingUp, color: 'text-status-green', bg: 'border-l-4 border-l-status-green' },
    { label: 'Pending Balance', value: '₹4,000', icon: CreditCard, color: 'text-status-amber', bg: 'border-l-4 border-l-status-amber' },
    { label: 'Cleaning Needed', value: '1', icon: Sparkles, color: 'text-status-orange', bg: 'border-l-4 border-l-status-orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Access Denied Alert if redirected by role-gated middleware */}
      {isAccessDenied && (
        <div className="p-4 bg-action-danger/10 border border-action-danger/25 rounded-xl flex items-start gap-3 text-action-danger">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Restricted Access</p>
            <p className="text-xs text-action-danger/90 mt-0.5">
              Your staff role ({staff?.role}) does not have permission to access that module. You have been redirected to the main dashboard.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-display text-brand-forest">Welcome, {staff?.full_name}</h1>
          <p className="text-body text-ink-muted">Logged in as {staff?.role} at {staff?.hotel_name}</p>
        </div>
      </div>

      {/* KPI / Status Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-lg p-5 border border-border-subtle shadow-xs ${stat.bg}`}
            >
              <div className="flex items-center justify-between text-ink-muted mb-2">
                <span className="text-caption font-medium">{stat.label}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl md:text-3xl font-semibold text-ink tabular-nums">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Phase 1 Auth Status Card */}
      <div className="bg-brand-sand-dark border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-h2 text-brand-forest">Phase 1 (Auth & Roles) Active</h2>
          <p className="text-body text-ink-muted mt-1">
            Navigation and routes are currently filtered for <strong>{staff?.role}</strong> role. Test other accounts via the login page.
          </p>
        </div>
        <a
          href="/rooms"
          className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-forest-light text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0 min-h-touch"
        >
          <span>View Room Grid</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
