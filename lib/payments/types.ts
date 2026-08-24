import { PaymentMode, PaymentType } from '../types/database.types';

export type PaymentSource = 'rooms' | 'banquet' | 'food_beverage' | 'other';

export interface UnifiedPaymentTransaction {
  id: string;
  hotel_id?: string;
  source: PaymentSource;
  source_label: string;
  source_id: string;
  reference_number: string;
  customer_name: string;
  customer_phone: string;
  resource_name: string;
  event_or_details: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_type: string;
  transaction_reference?: string | null;
  status: 'successful' | 'refunded' | 'failed';
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
  link_url: string;
}

export interface OutstandingReceivable {
  id: string;
  source: PaymentSource;
  source_label: string;
  reference_number: string;
  customer_name: string;
  customer_phone: string;
  resource_name: string;
  event_or_details: string;
  total_billed: number;
  total_paid: number;
  balance_due: number;
  date: string;
  status: string;
  link_url: string;
}

export interface SourceMetric {
  source: PaymentSource;
  label: string;
  amount: number;
  count: number;
  share_pct: number;
}

export interface ModeMetric {
  mode: PaymentMode;
  label: string;
  amount: number;
  count: number;
  share_pct: number;
}

export interface CollectionTrendDay {
  date: string;
  date_label: string;
  total: number;
  rooms: number;
  banquet: number;
  fnb: number;
  count: number;
}

export interface HotelWidePaymentStats {
  today_total: number;
  today_tx_count: number;
  period_total_collected: number;
  period_tx_count: number;
  total_outstanding_receivables: number;
  rooms_outstanding: number;
  banquet_outstanding: number;
  fb_outstanding: number;
  total_business_value: number;
  collection_rate_percent: number;
  sources: SourceMetric[];
  modes: ModeMetric[];
  trend: CollectionTrendDay[];
  outstanding_items: OutstandingReceivable[];
}
