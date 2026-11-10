import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import {
  Hotel,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { getStaffResolution, ROLE_NAV_ITEMS } from '../../lib/auth/session';
import { getAvailableStaffAccounts } from '../../lib/auth/switchAccount';
import { signOut } from '../(auth)/login/actions';
import { StaffRole } from '../../lib/types/database.types';
import MobileNavDrawer from '../../components/shared/MobileNavDrawer';
import SidebarNav from '../../components/shared/SidebarNav';
import AccountSwitcher from '../../components/shared/AccountSwitcher';
import { AuthProvider } from '../../components/providers/AuthProvider';

const ROLE_META: Record<StaffRole, { title: string; icon: any; avatarBg: string }> = {
  owner:        { title: 'Owner',        icon: Building2,  avatarBg: 'bg-brand-sand text-brand-forest' },
  manager:      { title: 'Manager',      icon: ShieldCheck, avatarBg: 'bg-status-blue/30 text-white' },
  reception:    { title: 'Reception',    icon: UserCheck,   avatarBg: 'bg-status-amber/30 text-white' },
  housekeeping: { title: 'Housekeeping', icon: Sparkles,    avatarBg: 'bg-status-orange/30 text-white' },
};

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const resolution = await getStaffResolution();

  // 1. Unauthenticated -> redirect to login
  if (resolution.status === 'unauthenticated') {
    redirect('/login');
  }

  // 2. Case A: No staff record
  if (resolution.status === 'no_staff_record') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-sand">
        <div className="max-w-md w-full bg-white rounded-xl border border-border-subtle p-8 shadow-card text-center space-y-6">
          <div className="w-12 h-12 bg-status-amber/12 text-status-amber rounded-xl flex items-center justify-center mx-auto border border-status-amber/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Account Not Assigned</h1>
            <p className="text-sm text-ink-muted mt-2 leading-relaxed">
              Your account ({resolution.user.email}) is authenticated, but has not been assigned to a hotel. Please contact your administrator.
            </p>
          </div>
          <form action={signOut}>
            <button type="submit" className="pms-btn-primary w-full justify-center">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Case B: Staff deactivated
  if (resolution.status === 'inactive_staff') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-sand">
        <div className="max-w-md w-full bg-white rounded-xl border border-border-subtle p-8 shadow-card text-center space-y-6">
          <div className="w-12 h-12 bg-action-danger/12 text-action-danger rounded-xl flex items-center justify-center mx-auto border border-action-danger/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Account Deactivated</h1>
            <p className="text-sm text-ink-muted mt-2 leading-relaxed">
              Your account ({resolution.user.email}) has been deactivated. Please contact your administrator.
            </p>
          </div>
          <form action={signOut}>
            <button type="submit" className="pms-btn-primary w-full justify-center">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. Case C: Hotel configuration missing
  if (resolution.status === 'hotel_not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-brand-sand">
        <div className="max-w-md w-full bg-white rounded-xl border border-border-subtle p-8 shadow-card text-center space-y-6">
          <div className="w-12 h-12 bg-action-danger/12 text-action-danger rounded-xl flex items-center justify-center mx-auto border border-action-danger/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Hotel Configuration Error</h1>
            <p className="text-sm text-ink-muted mt-2 leading-relaxed">
              The hotel property assigned to your account could not be found. Please contact support.
            </p>
          </div>
          <form action={signOut}>
            <button type="submit" className="pms-btn-primary w-full justify-center">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  const staff = resolution.staff;

  const userRole = (staff.role as StaffRole) || 'reception';
  const authorizedPaths = ROLE_NAV_ITEMS[userRole] || ['/dashboard', '/rooms'];
  const roleMeta = ROLE_META[userRole] || ROLE_META.reception;
  const RoleIcon = roleMeta.icon;

  // Reuse caller staff context to eliminate redundant getUser() and staff queries
  const availableAccounts = await getAvailableStaffAccounts(staff.hotel_id, staff);

  return (
    <AuthProvider initialStaff={staff} initialUser={resolution.user}>
      <div className="min-h-screen flex flex-col md:flex-row bg-brand-sand">

        {/* ================================================================
            DESKTOP SIDEBAR — hidden on mobile & print
            ================================================================ */}
        <aside
          className="print:hidden hidden md:flex md:w-60 md:sticky md:top-0 md:h-screen md:max-h-screen text-white flex-col shrink-0 z-30 select-none relative overflow-hidden border-r border-white/[0.08] shadow-[2px_0_16px_rgba(0,0,0,0.22)]"
          style={{ background: 'linear-gradient(180deg, #163C36 0%, #102F2B 55%, #0B2623 100%)' }}
        >
          {/* Subtle luminous ambient highlight */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-black/20"
            aria-hidden="true"
          />

          {/* Brand header */}
          <div className="px-4 py-4 flex items-center gap-3 border-b border-white/[0.09] relative z-10 shrink-0">
            {/* Hotel logo with premium framed appearance */}
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-white/[0.14] to-white/[0.04] p-[1.5px] ring-1 ring-white/[0.14] shadow-[0_4px_12px_rgba(0,0,0,0.3)] shrink-0 overflow-hidden flex items-center justify-center">
              <div className="h-full w-full rounded-[10px] bg-[#0E2824]/90 backdrop-blur-xs flex items-center justify-center p-1 overflow-hidden">
                {staff.hotel_logo_url ? (
                  <img
                    src={staff.hotel_logo_url}
                    alt={staff.hotel_name}
                    className="max-h-7 max-w-full w-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                  />
                ) : (
                  <div className="w-full h-full rounded-md bg-gradient-to-br from-[#24584B] to-[#102F2B] text-white font-bold text-xs flex items-center justify-center tracking-wider">
                    {staff.hotel_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[14px] font-semibold tracking-tight text-white truncate leading-tight">
                {staff.hotel_name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6CBF91] shadow-[0_0_6px_rgba(108,191,145,0.7)] shrink-0 animate-pulse" />
                <span className="text-[10px] font-medium tracking-wider uppercase text-[#B7C9C3]/75 truncate">
                  Control Centre
                </span>
              </div>
            </div>
          </div>

          {/* Navigation (role-scoped, active via client component) */}
          <SidebarNav authorizedPaths={authorizedPaths} />

          {/* Staff profile & sign-out footer */}
          <div className="px-3.5 py-4 border-t border-white/[0.09] bg-black/15 backdrop-blur-xs space-y-3 shrink-0 relative z-10">
            {/* Avatar + name + role */}
            <div className="flex items-center gap-3 px-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ring-1 ring-white/15 shadow-sm ${roleMeta.avatarBg}`}
                aria-label={`${staff.full_name} avatar`}
              >
                {initials(staff.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate leading-tight">
                  {staff.full_name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RoleIcon className="w-3 h-3 text-[#6CBF91] shrink-0" />
                  <span className="text-[11px] font-medium text-[#B7C9C3]/75 capitalize">
                    {roleMeta.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Sign out */}
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-[#B7C9C3] hover:text-white text-xs font-medium py-2 px-3 rounded-xl border border-white/[0.07] hover:border-white/15 transition-all duration-200 cursor-pointer shadow-xs group"
              >
                <LogOut className="w-3.5 h-3.5 text-[#B7C9C3]/80 group-hover:text-[#6CBF91] transition-colors" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </aside>

        {/* ================================================================
            MAIN CONTENT AREA
            ================================================================ */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* Top header bar */}
          <header className="print:hidden h-14 bg-white/90 backdrop-blur-sm border-b border-border-subtle flex items-center justify-between px-4 md:px-6 shrink-0 relative z-40">
            {/* Left: mobile hamburger + breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <MobileNavDrawer
                staff={staff}
                authorizedPaths={authorizedPaths}
                availableAccounts={availableAccounts}
              />

              <div className="flex items-center gap-2 min-w-0">
                {staff.hotel_logo_url ? (
                  <div className="h-8 w-8 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-border-subtle shadow-xs overflow-hidden">
                    <img
                      src={staff.hotel_logo_url}
                      alt={staff.hotel_name}
                      className="max-h-6 max-w-full w-auto object-contain"
                    />
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-sm font-semibold text-ink truncate hidden sm:block">
                    {staff.hotel_name}
                  </span>
                  <span className="text-xs text-border-subtle hidden sm:block">/</span>
                  <span className="text-xs text-ink-muted capitalize truncate">
                    {staff.role} View
                  </span>
                </div>
              </div>
            </div>

            {/* Right: date + status + switch account */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden md:block text-xs text-ink-muted tabular-nums">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-status-green/10 border border-status-green/20 text-status-green text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                Open
              </span>
              <AccountSwitcher
                currentStaff={staff}
                availableAccounts={availableAccounts}
              />
            </div>
          </header>

          {/* Page content */}
          <div className="p-5 sm:p-6 md:p-8 flex-1">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
