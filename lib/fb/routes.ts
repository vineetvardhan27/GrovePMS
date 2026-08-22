/**
 * Centralized Route Definitions for Food & Beverage (F&B) Module
 * Single Source of Truth to prevent route mismatches and 404 errors.
 */

export const FB_ROUTES = {
  ROOT: '/food-beverage',
  OVERVIEW: '/food-beverage?tab=overview',
  BILLS: '/food-beverage?tab=bills',
  KITCHEN: '/food-beverage?tab=kitchen',
  MENU: '/food-beverage?tab=menu',
  REPORTS: '/food-beverage?tab=reports',
  NEW_BILL: '/food-beverage/new',
  NEW_BILL_WITH_MEAL: (meal: string) => `/food-beverage/new?meal=${encodeURIComponent(meal)}`,
  NEW_BILL_WITH_TYPE: (type: string) => `/food-beverage/new?type=${encodeURIComponent(type)}`,
  BILL_DETAIL: (id: string) => `/food-beverage/${id}`,
} as const;
