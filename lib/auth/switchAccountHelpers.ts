import { StaffRole } from '../types/database.types';

/**
 * Centralized hierarchy: defines which roles a given caller role can switch into.
 *
 * - owner   → can switch to any role within their hotel
 * - manager → can switch to manager/reception/housekeeping (NOT owner)
 * - reception/housekeeping → can only see themselves (no switching)
 */
export const SWITCH_ALLOWED_ROLES: Record<StaffRole, StaffRole[]> = {
  owner:        ['owner', 'manager', 'reception', 'housekeeping'],
  manager:      ['manager', 'reception', 'housekeeping'],
  reception:    ['reception'],
  housekeeping: ['housekeeping'],
};

/**
 * Whether the caller role has anyone else to switch to
 * (used to conditionally render or hide the switcher).
 */
export function canSwitchAccounts(callerRole: StaffRole): boolean {
  const allowed = SWITCH_ALLOWED_ROLES[callerRole] ?? [];
  // Has more than just their own role? Owner/Manager do; Reception/HK only see themselves.
  return allowed.length > 1;
}

/**
 * Server-side authorization check: can caller switch to target?
 * Both must belong to the same hotel.
 */
export function canSwitchToAccount(
  callerRole: StaffRole,
  callerHotelId: string,
  targetRole: StaffRole,
  targetHotelId: string
): boolean {
  if (callerHotelId !== targetHotelId) return false;
  const allowed = SWITCH_ALLOWED_ROLES[callerRole] ?? [];
  return allowed.includes(targetRole);
}
