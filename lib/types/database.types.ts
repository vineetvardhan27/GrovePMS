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

export type FoodServiceType =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snacks'
  | 'Beverages'
  | 'Other';

export type TaxTreatment = 'gst' | 'non_gst';

export type InventoryUnit =
  | 'kg'
  | 'gram'
  | 'litre'
  | 'ml'
  | 'piece'
  | 'packet'
  | 'box'
  | 'dozen'
  | 'can'
  | 'bottle'
  | 'pair'
  | 'set';

export type InventoryItemType = 'consumable' | 'reusable_asset';

export type InventoryClassification =
  | 'food_kitchen'
  | 'housekeeping_supplies'
  | 'room_supplies'
  | 'linen'
  | 'hotel_assets'
  | 'other';

export type InventoryTransactionType =
  | 'purchase'
  | 'usage'
  | 'adjustment'
  | 'waste'
  | 'issued'
  | 'returned'
  | 'damaged'
  | 'repaired'
  | 'retired'
  | 'lost'
  | 'replaced';

export type BanquetHallStatus = 'available' | 'reserved' | 'occupied' | 'maintenance';

export type BanquetEventType =
  | 'wedding'
  | 'reception'
  | 'conference'
  | 'birthday'
  | 'anniversary'
  | 'corporate'
  | 'social'
  | 'other';

export type BanquetBookingStatus = 'inquiry' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

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
      property_resources: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          resource_type: string;
          capacity: number;
          status: string;
          description: string | null;
          daily_rate: number | null;
          hourly_rate: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          name: string;
          resource_type?: string;
          capacity?: number;
          status?: string;
          description?: string | null;
          daily_rate?: number | null;
          hourly_rate?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          name?: string;
          resource_type?: string;
          capacity?: number;
          status?: string;
          description?: string | null;
          daily_rate?: number | null;
          hourly_rate?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_categories: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          name: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          name?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          hotel_id: string;
          category_id: string;
          name: string;
          description: string | null;
          selling_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          selling_price: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          selling_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      food_charges: {
        Row: {
          id: string;
          hotel_id: string;
          booking_id: string;
          room_id: string | null;
          guest_id: string | null;
          menu_item_id: string | null;
          item_name_snapshot: string;
          category_snapshot: string;
          service_type: FoodServiceType;
          quantity: number;
          unit_price_snapshot: number;
          tax_treatment: TaxTreatment;
          taxable_amount: number;
          gst_rate: number;
          gst_amount: number;
          total_amount: number;
          remarks: string | null;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          booking_id: string;
          room_id?: string | null;
          guest_id?: string | null;
          menu_item_id?: string | null;
          item_name_snapshot: string;
          category_snapshot: string;
          service_type: FoodServiceType;
          quantity: number;
          unit_price_snapshot: number;
          tax_treatment?: TaxTreatment;
          taxable_amount: number;
          gst_rate?: number;
          gst_amount?: number;
          total_amount: number;
          remarks?: string | null;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          booking_id?: string;
          room_id?: string | null;
          guest_id?: string | null;
          menu_item_id?: string | null;
          item_name_snapshot?: string;
          category_snapshot?: string;
          service_type?: FoodServiceType;
          quantity?: number;
          unit_price_snapshot?: number;
          tax_treatment?: TaxTreatment;
          taxable_amount?: number;
          gst_rate?: number;
          gst_amount?: number;
          total_amount?: number;
          remarks?: string | null;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          category: string;
          unit: InventoryUnit;
          item_type: InventoryItemType;
          inventory_type: InventoryClassification;
          current_stock: number;
          in_use_stock: number;
          damaged_stock: number;
          lost_stock: number;
          repair_stock: number;
          retired_stock: number;
          minimum_stock: number;
          target_stock: number;
          cost_per_unit: number;
          replacement_target_year: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          name: string;
          category: string;
          unit: InventoryUnit;
          item_type?: InventoryItemType;
          inventory_type?: InventoryClassification;
          current_stock?: number;
          in_use_stock?: number;
          damaged_stock?: number;
          lost_stock?: number;
          repair_stock?: number;
          retired_stock?: number;
          minimum_stock?: number;
          target_stock?: number;
          cost_per_unit?: number;
          replacement_target_year?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          name?: string;
          category?: string;
          unit?: InventoryUnit;
          item_type?: InventoryItemType;
          inventory_type?: InventoryClassification;
          current_stock?: number;
          in_use_stock?: number;
          damaged_stock?: number;
          lost_stock?: number;
          repair_stock?: number;
          retired_stock?: number;
          minimum_stock?: number;
          target_stock?: number;
          cost_per_unit?: number;
          replacement_target_year?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_transactions: {
        Row: {
          id: string;
          hotel_id: string;
          item_id: string;
          transaction_type: InventoryTransactionType;
          quantity: number;
          unit: string;
          unit_price: number;
          total_cost: number;
          supplier: string | null;
          reason: string | null;
          room_number: string | null;
          condition_state: string | null;
          notes: string | null;
          recorded_by: string | null;
          transaction_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          item_id: string;
          transaction_type: InventoryTransactionType;
          quantity: number;
          unit: string;
          unit_price?: number;
          total_cost?: number;
          supplier?: string | null;
          reason?: string | null;
          room_number?: string | null;
          condition_state?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          transaction_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          item_id?: string;
          transaction_type?: InventoryTransactionType;
          quantity?: number;
          unit?: string;
          unit_price?: number;
          total_cost?: number;
          supplier?: string | null;
          reason?: string | null;
          room_number?: string | null;
          condition_state?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          transaction_date?: string;
          created_at?: string;
        };
      };
      banquet_halls: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          capacity: number | null;
          current_status: BanquetHallStatus;
          description: string | null;
          half_day_rate: number;
          full_day_rate: number;
          amenities: string[] | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          name?: string;
          capacity?: number | null;
          current_status?: BanquetHallStatus;
          description?: string | null;
          half_day_rate?: number;
          full_day_rate?: number;
          amenities?: string[] | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          name?: string;
          capacity?: number | null;
          current_status?: BanquetHallStatus;
          description?: string | null;
          half_day_rate?: number;
          full_day_rate?: number;
          amenities?: string[] | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      banquet_bookings: {
        Row: {
          id: string;
          hotel_id: string;
          banquet_hall_id: string;
          booking_number: string;
          event_name: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          guest_count: number | null;
          event_type: BanquetEventType;
          booking_status: BanquetBookingStatus;
          rental_amount: number;
          catering_required: boolean;
          catering_notes: string | null;
          estimated_total: number;
          advance_paid: number;
          tax_treatment: TaxTreatment;
          remarks: string | null;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          banquet_hall_id: string;
          booking_number: string;
          event_name: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          guest_count?: number | null;
          event_type?: BanquetEventType;
          booking_status?: BanquetBookingStatus;
          rental_amount?: number;
          catering_required?: boolean;
          catering_notes?: string | null;
          estimated_total?: number;
          advance_paid?: number;
          tax_treatment?: TaxTreatment;
          remarks?: string | null;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          banquet_hall_id?: string;
          booking_number?: string;
          event_name?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          event_date?: string;
          start_time?: string;
          end_time?: string;
          guest_count?: number | null;
          event_type?: BanquetEventType;
          booking_status?: BanquetBookingStatus;
          rental_amount?: number;
          catering_required?: boolean;
          catering_notes?: string | null;
          estimated_total?: number;
          advance_paid?: number;
          tax_treatment?: TaxTreatment;
          remarks?: string | null;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
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
