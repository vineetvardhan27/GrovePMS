'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  ChevronDown,
  Check,
  Building2,
  ShieldCheck,
  UserCheck,
  Sparkles,
  LogOut,
  Loader2,
  AlertCircle,
  Settings,
  X,
} from 'lucide-react';
import type { StaffProfile } from '../../lib/auth/types';
import {
  AvailableStaffAccount,
  switchStaffAccountAction,
} from '../../lib/auth/switchAccount';
import { canSwitchAccounts } from '../../lib/auth/switchAccountHelpers';
import { StaffRole } from '../../lib/types/database.types';
import { signOut } from '../../app/(auth)/login/actions';

const ROLE_META: Record<
  StaffRole,
  { label: string; icon: any; badgeClass: string; avatarBg: string }
> = {
  owner: {
    label: 'Owner',
    icon: Building2,
    badgeClass: 'bg-brand-forest/10 text-brand-forest border-brand-forest/20',
    avatarBg: 'bg-brand-forest text-brand-sand',
  },
  manager: {
    label: 'Manager',
    icon: ShieldCheck,
    badgeClass: 'bg-status-blue/10 text-status-blue border-status-blue/20',
    avatarBg: 'bg-status-blue text-white',
  },
  reception: {
    label: 'Reception',
    icon: UserCheck,
    badgeClass: 'bg-status-amber/10 text-status-amber border-status-amber/20',
    avatarBg: 'bg-status-amber text-white',
  },
  housekeeping: {
    label: 'Housekeeping',
    icon: Sparkles,
    badgeClass: 'bg-status-orange/10 text-status-orange border-status-orange/20',
    avatarBg: 'bg-status-orange text-white',
  },
};

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface AccountSwitcherProps {
  currentStaff: StaffProfile;
  availableAccounts: AvailableStaffAccount[];
}

export default function AccountSwitcher({
  currentStaff,
  availableAccounts,
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [switchingToId, setSwitchingToId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const currentRole = currentStaff.role as StaffRole;
  const currentMeta = ROLE_META[currentRole] || ROLE_META.reception;
  const CurrentIcon = currentMeta.icon;

  // Accounts the caller can switch INTO (excluding current self)
  const otherAccounts = availableAccounts.filter((acc) => acc.id !== currentStaff.id);

  // Role hierarchy: whether this role has anyone else to switch to
  const hasOthersToSwitchTo = canSwitchAccounts(currentRole) && otherAccounts.length > 0;

  // Only Owner/Manager can manage staff
  const canManageStaff = currentRole === 'owner' || currentRole === 'manager';

  const handleSwitch = async (targetAccount: AvailableStaffAccount) => {
    if (switchingToId) return;

    setErrorMessage(null);
    setSwitchingToId(targetAccount.id);

    try {
      const result = await switchStaffAccountAction(targetAccount.id);
      if (result?.success || result === undefined) {
        setIsOpen(false);
        // Hard reload to refresh all route guards, cookies, and server state
        window.location.href = '/dashboard';
        return;
      }

      setErrorMessage(result?.error || 'Failed to switch account.');
      setSwitchingToId(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred while switching.');
      setSwitchingToId(null);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setErrorMessage(null);
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account Menu"
        className="flex items-center gap-2 text-xs text-ink font-medium px-3 py-1.5 rounded-lg border border-border-subtle bg-brand-sand/60 hover:bg-brand-sand transition-colors duration-150 min-h-[32px] cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/30"
      >
        <Users className="w-3.5 h-3.5 text-brand-forest" />
        <span className="hidden sm:inline">
          {hasOthersToSwitchTo ? 'Switch Account' : currentMeta.label}
        </span>
        <span className="sm:hidden">{currentMeta.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink-muted transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Account Menu Popover"
          className="absolute right-0 mt-2 bg-white rounded-xl border border-border-subtle shadow-modal z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col"
          style={{
            width: 'min(22rem, calc(100vw - 2rem))',
            maxHeight: 'min(80vh, calc(100vh - 5rem))',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-brand-sand/40 border-b border-border-subtle flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-forest" />
              <h3 className="text-sm font-semibold text-brand-forest">
                {hasOthersToSwitchTo ? 'Switch Account' : 'Active Account'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="m-3 p-3 bg-status-red/10 border border-status-red/25 rounded-lg flex items-start gap-2 text-status-red text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* CURRENT ACTIVE ACCOUNT */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted px-2 mb-1.5">
                Current Active Account
              </p>
              <div className="p-3 rounded-lg bg-brand-sand/50 border border-brand-forest/30 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${currentMeta.avatarBg}`}
                  >
                    {initials(currentStaff.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate leading-tight">
                      {currentStaff.full_name}
                    </p>
                    <p className="text-xs text-ink-muted truncate mt-0.5">
                      {currentStaff.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${currentMeta.badgeClass}`}
                  >
                    <CurrentIcon className="w-3 h-3" />
                    <span>{currentMeta.label}</span>
                  </span>
                  <div className="w-5 h-5 rounded-full bg-status-green text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* AVAILABLE ACCOUNTS — only shown for roles with hierarchy access */}
            {hasOthersToSwitchTo && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted px-2 mb-1.5">
                  Available Accounts
                </p>

                <div className="space-y-1.5">
                  {otherAccounts.map((account) => {
                    const meta = ROLE_META[account.role] || ROLE_META.reception;
                    const RoleIcon = meta.icon;
                    const isTarget = switchingToId === account.id;

                    return (
                      <button
                        key={account.id}
                        type="button"
                        disabled={Boolean(switchingToId)}
                        onClick={() => handleSwitch(account)}
                        className="w-full text-left p-2.5 rounded-lg border border-border-subtle/80 hover:border-brand-forest/40 hover:bg-brand-sand/40 transition-all flex items-center justify-between gap-3 group cursor-pointer disabled:opacity-60"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 opacity-90 group-hover:opacity-100 ${meta.avatarBg}`}
                          >
                            {initials(account.full_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-ink group-hover:text-brand-forest truncate leading-tight">
                              {account.full_name}
                            </p>
                            <p className="text-[11px] text-ink-muted truncate mt-0.5">
                              {account.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${meta.badgeClass}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            <span>{meta.label}</span>
                          </span>
                          {isTarget ? (
                            <Loader2 className="w-4 h-4 text-brand-forest animate-spin" />
                          ) : (
                            <span className="text-[11px] font-medium text-brand-forest opacity-0 group-hover:opacity-100 transition-opacity">
                              Switch →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No-switch message for Reception / Housekeeping */}
            {!hasOthersToSwitchTo && (
              <div className="p-3 rounded-lg bg-brand-sand/30 border border-border-subtle text-xs text-ink-muted text-center">
                Account switching is not available for your role.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 bg-brand-sand/30 border-t border-border-subtle flex items-center justify-between gap-2 shrink-0">
            {canManageStaff ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings/staff');
                }}
                className="text-xs text-ink-muted hover:text-brand-forest font-medium flex items-center gap-1.5 py-1 px-2 rounded hover:bg-brand-sand transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Manage Staff</span>
              </button>
            ) : (
              /* Spacer so Sign Out stays right-aligned for non-manager roles */
              <span />
            )}

            <form action={signOut}>
              <button
                type="submit"
                className="text-xs text-status-red hover:text-action-danger font-medium flex items-center gap-1.5 py-1 px-2 rounded hover:bg-status-red/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
