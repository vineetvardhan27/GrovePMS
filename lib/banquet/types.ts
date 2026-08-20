import {
  BanquetHallStatus,
  BanquetEventType,
  BanquetBookingStatus,
  TaxTreatment,
} from '../types/database.types';

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

export interface BanquetBooking {
  id: string;
  hotel_id?: string;
  banquet_hall_id: string;
  booking_number: string;
  event_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
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
  tax_treatment: TaxTreatment;
  remarks?: string | null;
  recorded_by?: string | null;
  recorder_name?: string | null;
  created_at?: string;
  updated_at?: string;
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
  tax_treatment?: TaxTreatment;
  remarks?: string | null;
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
  total_estimated_revenue: number;
  total_advance_collected: number;
}
