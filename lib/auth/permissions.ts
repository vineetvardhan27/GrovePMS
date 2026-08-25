import { StaffRole } from '../types/database.types';

/**
 * Centralized Role Permissions Definition for Multi-Tenant PMS
 * Defines exact operational capabilities per role.
 */

export interface RolePermissions {
  canViewDashboard: boolean;
  canManageRooms: boolean;
  canManageBookings: boolean;
  canManageBilling: boolean;
  canManagePayments: boolean;
  canManageFnb: boolean;
  canManageBanquet: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  canManageStaff: boolean;
  canManageHotelSettings: boolean;
  canUpdateHousekeeping: boolean;
}

export const ROLE_PERMISSIONS: Record<StaffRole, RolePermissions> = {
  owner: {
    canViewDashboard: true,
    canManageRooms: true,
    canManageBookings: true,
    canManageBilling: true,
    canManagePayments: true,
    canManageFnb: true,
    canManageBanquet: true,
    canManageInventory: true,
    canViewReports: true,
    canManageStaff: true,
    canManageHotelSettings: true,
    canUpdateHousekeeping: true,
  },
  manager: {
    canViewDashboard: true,
    canManageRooms: true,
    canManageBookings: true,
    canManageBilling: true,
    canManagePayments: true,
    canManageFnb: true,
    canManageBanquet: true,
    canManageInventory: true,
    canViewReports: true,
    canManageStaff: true,
    canManageHotelSettings: false, // Owner only for primary hotel legal/GST settings
    canUpdateHousekeeping: true,
  },
  reception: {
    canViewDashboard: true,
    canManageRooms: false, // View only
    canManageBookings: true,
    canManageBilling: true,
    canManagePayments: true,
    canManageFnb: true,
    canManageBanquet: true,
    canManageInventory: false,
    canViewReports: false,
    canManageStaff: false,
    canManageHotelSettings: false,
    canUpdateHousekeeping: false,
  },
  housekeeping: {
    canViewDashboard: true,
    canManageRooms: false,
    canManageBookings: false,
    canManageBilling: false,
    canManagePayments: false,
    canManageFnb: false,
    canManageBanquet: false,
    canManageInventory: true, // Wastage and damage reporting
    canViewReports: false,
    canManageStaff: false,
    canManageHotelSettings: false,
    canUpdateHousekeeping: true, // Room cleaning status updates
  },
};

/**
 * Route access whitelist per role
 */
export const ROLE_ALLOWED_ROUTES: Record<StaffRole, string[]> = {
  owner: [
    '/dashboard',
    '/rooms',
    '/bookings',
    '/guests',
    '/billing',
    '/payments',
    '/food-beverage',
    '/inventory',
    '/banquet',
    '/reports',
    '/settings',
  ],
  manager: [
    '/dashboard',
    '/rooms',
    '/bookings',
    '/guests',
    '/billing',
    '/payments',
    '/food-beverage',
    '/inventory',
    '/banquet',
    '/reports',
    '/settings',
  ],
  reception: [
    '/dashboard',
    '/rooms',
    '/bookings',
    '/guests',
    '/billing',
    '/payments',
    '/food-beverage',
    '/banquet',
  ],
  housekeeping: [
    '/dashboard',
    '/rooms',
    '/food-beverage',
    '/inventory',
    '/banquet',
  ],
};

// Centralized permission helper functions
export const canViewDashboard = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canViewDashboard ?? false;
export const canManageRooms = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManageRooms ?? false;
export const canManageBookings = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManageBookings ?? false;
export const canManageBilling = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManageBilling ?? false;
export const canManagePayments = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManagePayments ?? false;
export const canManageFnb = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManageFnb ?? false;
export const canManageBanquet = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManageBanquet ?? false;
export const canManageInventory = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManageInventory ?? false;
export const canViewReports = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canViewReports ?? false;
export const canManageStaff = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManageStaff ?? false;
export const canManageHotelSettings = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canManageHotelSettings ?? false;
export const canUpdateHousekeeping = (role: StaffRole): boolean => ROLE_PERMISSIONS[role]?.canUpdateHousekeeping ?? false;

export function hasRoutePermission(role: StaffRole, pathname: string): boolean {
  const allowed = ROLE_ALLOWED_ROUTES[role] || ['/dashboard', '/rooms'];
  return allowed.some(
    (basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`)
  );
}

export function getRolePermissions(role: StaffRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.reception;
}
