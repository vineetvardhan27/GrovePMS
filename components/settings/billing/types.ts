import { GroveAccessState, HotelAccessResolution } from '../../../lib/subscription/lifecycle';
import { Database, SubscriptionStatus } from '../../../lib/types/database.types';

export type SubscriptionRecord = Database['public']['Tables']['subscriptions']['Row'];
export type PaymentTransactionRecord = Database['public']['Tables']['payment_transactions']['Row'];
export type BillingCustomerRecord = Database['public']['Tables']['billing_customers']['Row'];

export interface BillingDashboardData {
  hotel: {
    id: string;
    name: string;
  };
  user: {
    role: string;
    canManage: boolean;
  };
  subscription: SubscriptionRecord | null;
  access: HotelAccessResolution;
  customer: BillingCustomerRecord | null;
}

