export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StaffRole = 'owner' | 'manager' | 'reception' | 'housekeeping';

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'arriving_today'
  | 'cleaning'
  | 'maintenance';

export type HousekeepingStatus = 'clean' | 'dirty' | 'inspected';

export type PaymentStatus =
  | 'fully_paid'
  | 'advance_received'
  | 'no_payment'
  | 'credit';

export type BookingStatus =
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type BookingSource =
  | 'direct'
  | 'walk_in'
  | 'phone'
  | 'whatsapp'
  | 'travel_agent'
  | 'other';

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other';

export type PaymentType = 'advance' | 'partial' | 'running' | 'settlement' | 'refund';

export interface HotelSettings {
  gst_enabled: boolean;
  gst_percentage: number;
  checkin_time: string;
  checkout_time: string;
  currency_symbol: string;
  currency_code: string;
  [key: string]: Json | undefined;
}

export interface Database {
  public: {
    Tables: {
      hotels: {
        Row: {
          id: string;
          name: string;
          slug: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          settings: HotelSettings;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          settings?: HotelSettings;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          settings?: HotelSettings;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          hotel_id: string;
          email: string;
          full_name: string;
          role: StaffRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          hotel_id: string;
          email: string;
          full_name: string;
          role: StaffRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          email?: string;
          full_name?: string;
          role?: StaffRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      room_categories: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          description: string | null;
          base_rate: number;
          weekend_rate: number | null;
          max_occupancy: number;
          extra_bed_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          name: string;
          description?: string | null;
          base_rate: number;
          weekend_rate?: number | null;
          max_occupancy?: number;
          extra_bed_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          name?: string;
          description?: string | null;
          base_rate?: number;
          weekend_rate?: number | null;
          max_occupancy?: number;
          extra_bed_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          hotel_id: string;
          category_id: string;
          room_number: string;
          floor: number;
          status: RoomStatus;
          housekeeping_status: HousekeepingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          category_id: string;
          room_number: string;
          floor?: number;
          status?: RoomStatus;
          housekeeping_status?: HousekeepingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          category_id?: string;
          room_number?: string;
          floor?: number;
          status?: RoomStatus;
          housekeeping_status?: HousekeepingStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      guests: {
        Row: {
          id: string;
          hotel_id: string;
          full_name: string;
          phone: string;
          email: string | null;
          id_type: string | null;
          id_number: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          full_name: string;
          phone: string;
          email?: string | null;
          id_type?: string | null;
          id_number?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          id_type?: string | null;
          id_number?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          hotel_id: string;
          booking_number: string;
          room_id: string;
          guest_id: string;
          check_in_date: string;
          check_out_date: string;
          adults: number;
          children: number;
          rate_per_night: number;
          total_amount: number;
          advance_amount: number;
          payment_status: PaymentStatus;
          booking_status: BookingStatus;
          source: BookingSource;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          booking_number: string;
          room_id: string;
          guest_id: string;
          check_in_date: string;
          check_out_date: string;
          adults?: number;
          children?: number;
          rate_per_night: number;
          total_amount: number;
          advance_amount?: number;
          payment_status?: PaymentStatus;
          booking_status?: BookingStatus;
          source?: BookingSource;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          booking_number?: string;
          room_id?: string;
          guest_id?: string;
          check_in_date?: string;
          check_out_date?: string;
          adults?: number;
          children?: number;
          rate_per_night?: number;
          total_amount?: number;
          advance_amount?: number;
          payment_status?: PaymentStatus;
          booking_status?: BookingStatus;
          source?: BookingSource;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          hotel_id: string;
          booking_id: string;
          amount: number;
          payment_mode: PaymentMode;
          payment_type: PaymentType;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          booking_id: string;
          amount: number;
          payment_mode: PaymentMode;
          payment_type?: PaymentType;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          booking_id?: string;
          amount?: number;
          payment_mode?: PaymentMode;
          payment_type?: PaymentType;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_staff_hotel_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_current_staff_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      staff_role: StaffRole;
      room_status: RoomStatus;
      housekeeping_status: HousekeepingStatus;
      payment_status: PaymentStatus;
      booking_status: BookingStatus;
      booking_source: BookingSource;
      payment_mode: PaymentMode;
      payment_type: PaymentType;
    };
  };
}
