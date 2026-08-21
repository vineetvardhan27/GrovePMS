import {
  BanquetHallStatus,
  BanquetEventType,
  BanquetBookingStatus,
  BanquetPaymentStatus,
  BanquetChargeCategory,
  TaxTreatment,
  PaymentMode,
  PaymentType,
} from '../types/database.types';

export type {
  BanquetHallStatus,
  BanquetEventType,
  BanquetBookingStatus,
  BanquetPaymentStatus,
  BanquetChargeCategory,
  TaxTreatment,
  PaymentMode,
  PaymentType,
};

export interface BanquetHall {
  id: string;
  hotel_id?: string;
  name: string;
  capacity: number | null;
  current_status: BanquetHallStatus;
  description?: string | null;
  half_day_rate: number;
  full_day_rate: number;
  amenities: string[];
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BanquetCharge {
  id: string;
  hotel_id?: string;
  banquet_booking_id: string;
  category: BanquetChargeCategory;
  description: string;
  sac_code?: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_treatment: TaxTreatment;
  tax_rate: number;
  taxable_amount: number;
  tax_amount: number;
  total_amount: number;
  notes?: string | null;
  recorded_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BanquetPayment {
  id: string;
  hotel_id?: string;
  banquet_booking_id: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_type: PaymentType;
  reference_number?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  recorder_name?: string | null;
  created_at: string;
}

export interface BanquetBooking {
  id: string;
  hotel_id?: string;
  banquet_hall_id: string;
  booking_number: string;
  event_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_address?: string | null;
  customer_gstin?: string | null;
  payment_status: BanquetPaymentStatus;
  invoice_number?: string | null;
  invoice_date?: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number | null;
  event_type: BanquetEventType;
  booking_status: BanquetBookingStatus;
  rental_amount: number;
  catering_required: boolean;
  catering_notes?: string | null;
  estimated_total: number;
  advance_paid: number;
  subtotal: number;
  tax_amount: number;
  grand_total: number;
  total_paid: number;
  balance_due: number;
  tax_treatment: TaxTreatment;
  remarks?: string | null;
  recorded_by?: string | null;
  recorder_name?: string | null;
  charges?: BanquetCharge[];
  payments?: BanquetPayment[];
  created_at?: string;
  updated_at?: string;
}

export interface BanquetFolio {
  booking: BanquetBooking;
  hall: BanquetHall;
  charges: BanquetCharge[];
  payments: BanquetPayment[];
  subtotal: number;
  taxable_amount: number;
  tax_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  grand_total: number;
  total_paid: number;
  balance_due: number;
  payment_status: BanquetPaymentStatus;
}

export interface BanquetInvoice {
  booking_id: string;
  booking_number: string;
  event_name: string;
  event_type: BanquetEventType;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number | null;
  hall_name: string;
  invoice_number: string;
  invoice_date: string;
  pdf_filename: string;
  amount_in_words: string;

  // Customer
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_gstin: string | null;

  // Charges
  charges: BanquetCharge[];
  subtotal: number;
  taxable_subtotal: number;
  gst_rate: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  total_tax: number;
  grand_total: number;
  total_paid: number;
  balance_due: number;
  payment_status: BanquetPaymentStatus;

  // Payments
  payments: BanquetPayment[];

  // Hotel Info
  hotel_name: string;
  hotel_address: string;
  hotel_city: string;
  hotel_gst_number: string | null;
  hotel_pan_number: string | null;
  hotel_phone: string;
  hotel_email: string;
  generated_at: string;
}

export interface SaveBanquetHallInput {
  id?: string;
  name: string;
  capacity?: number | null;
  current_status: BanquetHallStatus;
  description?: string | null;
  half_day_rate?: number;
  full_day_rate?: number;
  amenities?: string[];
  notes?: string | null;
}

export interface CreateBanquetBookingInput {
  event_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_address?: string | null;
  customer_gstin?: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count?: number | null;
  event_type: BanquetEventType;
  booking_status?: BanquetBookingStatus;
  rental_amount?: number;
  catering_required?: boolean;
  catering_notes?: string | null;
  estimated_total?: number;
  advance_paid?: number;
  payment_mode?: PaymentMode;
  payment_reference?: string | null;
  tax_treatment?: TaxTreatment;
  remarks?: string | null;
  initial_charges?: {
    category: BanquetChargeCategory;
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface AddBanquetChargeInput {
  banquet_booking_id: string;
  category: BanquetChargeCategory;
  description: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  tax_treatment?: TaxTreatment;
  tax_rate?: number;
  notes?: string | null;
}

export interface RecordBanquetPaymentInput {
  banquet_booking_id: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_type?: PaymentType;
  reference_number?: string | null;
  notes?: string | null;
}

export interface UpdateBanquetBookingStatusInput {
  booking_id: string;
  booking_status: BanquetBookingStatus;
}

export interface BanquetSummary {
  hall_name: string;
  hall_capacity: number | null;
  current_status: BanquetHallStatus;
  total_events_month: number;
  upcoming_events_count: number;
  in_progress_count: number;
  todays_events_count: number;
  total_estimated_revenue: number;
  total_advance_collected: number;
  total_outstanding_balance: number;
  total_settled_revenue: number;
}
