import * as React from 'react';
import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { Database } from '../types/database.types';

const serverCache =
  typeof (React as any).cache === 'function'
    ? (React as any).cache
    : (<T extends (...args: any[]) => any>(fn: T): T => fn);

export type SubscriptionRecord = Database['public']['Tables']['subscriptions']['Row'];
export type PaymentTransactionRecord = Database['public']['Tables']['payment_transactions']['Row'];
export type BillingCustomerRecord = Database['public']['Tables']['billing_customers']['Row'];

import {
  resolveSubscriptionAccess,
  HotelAccessResolution,
  GroveAccessState,
} from './lifecycle';

export type { HotelAccessResolution, GroveAccessState };

/**
 * Fetch the latest subscription record for a hotel property.
 * Deduplicated per-request via serverCache.
 */
export const getHotelSubscription = serverCache(
  async function getHotelSubscription(hotelId?: string): Promise<SubscriptionRecord | null> {
    try {
      const staff = await getCurrentStaff();
      const activeHotelId = hotelId || staff?.hotel_id;
      if (!activeHotelId) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('hotel_id', activeHotelId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching hotel subscription:', error.message);
        return null;
      }

      return data as SubscriptionRecord | null;
    } catch (err) {
      console.error('Exception in getHotelSubscription:', err);
      return null;
    }
  }
);

/**
 * Resolves comprehensive Grove PMS access state for a hotel property,
 * separating Razorpay gateway state from effective tenant access,
 * handling grace periods, and respecting paid-through dates on cancellations.
 */
export const getHotelAccessResolution = serverCache(
  async function getHotelAccessResolution(
    hotelId?: string
  ): Promise<HotelAccessResolution> {
    const sub = await getHotelSubscription(hotelId);
    return resolveSubscriptionAccess(sub);
  }
);

/**
 * Check whether a hotel currently has effective paid/authorized SaaS access.
 * Returns true for active plans, active grace periods, and paid-through cancelled subscriptions.
 */
export const isHotelSubscriptionActive = serverCache(
  async function isHotelSubscriptionActive(hotelId?: string): Promise<boolean> {
    const sub = await getHotelSubscription(hotelId);
    return resolveSubscriptionAccess(sub).isAccessAllowed;
  }
);

/**
 * Fetch payment transaction history for a hotel property.
 */
export const getHotelPaymentTransactions = serverCache(
  async function getHotelPaymentTransactions(
    hotelId?: string
  ): Promise<PaymentTransactionRecord[]> {
    try {
      const staff = await getCurrentStaff();
      const activeHotelId = hotelId || staff?.hotel_id;
      if (!activeHotelId) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('hotel_id', activeHotelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment transactions:', error.message);
        return [];
      }

      return (data || []) as PaymentTransactionRecord[];
    } catch (err) {
      console.error('Exception in getHotelPaymentTransactions:', err);
      return [];
    }
  }
);

/**
 * Fetch billing customer tax profile for a hotel property.
 */
export const getHotelBillingCustomer = serverCache(
  async function getHotelBillingCustomer(
    hotelId?: string
  ): Promise<BillingCustomerRecord | null> {
    try {
      const staff = await getCurrentStaff();
      const activeHotelId = hotelId || staff?.hotel_id;
      if (!activeHotelId) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('billing_customers')
        .select('*')
        .eq('hotel_id', activeHotelId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching billing customer:', error.message);
        return null;
      }

      return data as BillingCustomerRecord | null;
    } catch (err) {
      console.error('Exception in getHotelBillingCustomer:', err);
      return null;
    }
  }
);

