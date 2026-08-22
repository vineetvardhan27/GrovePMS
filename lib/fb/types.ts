import {
  FBCustomerType,
  FBBillStatus,
  FBOrderStatus,
  FBPaymentStatus,
  FBDiscountType,
  FoodServiceType,
  FoodType,
  PaymentMode,
  PaymentType,
  TaxTreatment,
} from '../types/database.types';

export interface FBMenuItem {
  id: string;
  hotel_id?: string;
  category_id: string;
  name: string;
  description: string | null;
  base_price?: number;
  selling_price: number;
  gst_rate?: number;
  food_type?: FoodType;
  available_meals?: FoodServiceType[];
  kitchen_area?: string;
  sku?: string | null;
  inventory_item_id?: string | null;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
    display_order?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface FBCartItem {
  cart_item_id: string;
  menu_item_id?: string;
  item_name: string;
  category_name: string;
  meal_type: FoodServiceType;
  food_type: FoodType;
  quantity: number;
  unit_price: number; // Final selling price per unit
  base_price: number;
  gst_rate: number;
  tax_treatment: TaxTreatment;
  notes?: string;
}

export interface FBOrderItemRecord {
  id: string;
  order_id: string;
  bill_id: string;
  hotel_id: string;
  menu_item_id: string | null;
  item_name_snapshot: string;
  category_snapshot: string;
  meal_type: string;
  food_type: FoodType;
  quantity: number;
  unit_price_snapshot: number;
  base_price_snapshot: number;
  tax_treatment: TaxTreatment;
  gst_rate: number;
  taxable_amount: number;
  gst_amount: number;
  total_amount: number;
  notes: string | null;
  status: 'active' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface FBOrderRecord {
  id: string;
  bill_id: string;
  hotel_id: string;
  order_number: string;
  meal_type: FoodServiceType;
  status: FBOrderStatus;
  special_instructions: string | null;
  order_time: string;
  items?: FBOrderItemRecord[];
  created_at: string;
  updated_at: string;
}

export interface FBPaymentRecord {
  id: string;
  bill_id: string;
  hotel_id: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_type: PaymentType;
  reference_number: string | null;
  notes: string | null;
  recorded_by: string | null;
  recorder_name?: string | null;
  created_at: string;
}

export interface FBAuditLogRecord {
  id: string;
  hotel_id: string;
  bill_id: string | null;
  action: string;
  user_id: string | null;
  user_name?: string | null;
  details: any;
  created_at: string;
}

export interface FBBillRecord {
  id: string;
  hotel_id: string;
  bill_number: string;
  invoice_number: string | null;
  invoice_date: string | null;
  customer_type: FBCustomerType;

  // Hotel Guest
  booking_id: string | null;
  room_id: string | null;
  guest_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  table_number: string | null;
  room_number_snapshot: string | null;
  booking_number_snapshot: string | null;

  // Financials
  billing_mode: 'pay_now' | 'charge_to_room';
  bill_status: FBBillStatus;
  payment_status: FBPaymentStatus;

  discount_type: FBDiscountType;
  discount_value: number;
  discount_amount: number;
  discount_reason: string | null;
  discount_authorized_by: string | null;

  subtotal: number; // Gross amount before discount
  taxable_amount: number; // Net taxable amount after discount
  cgst_amount: number;
  sgst_amount: number;
  gst_amount: number;
  grand_total: number;
  total_paid: number;
  balance_due: number;

  special_instructions: string | null;
  remarks: string | null;
  recorded_by: string | null;
  recorder_name?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  orders?: FBOrderRecord[];
  items?: FBOrderItemRecord[];
  payments?: FBPaymentRecord[];
  audit_logs?: FBAuditLogRecord[];
  booking?: any;
}

export interface CreateFBBillInput {
  customer_type: FBCustomerType;
  booking_id?: string | null;
  room_id?: string | null;
  guest_id?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  table_number?: string | null;
  billing_mode: 'pay_now' | 'charge_to_room';

  discount_type?: FBDiscountType;
  discount_value?: number;
  discount_reason?: string | null;

  special_instructions?: string | null;
  remarks?: string | null;

  // Items grouped or list
  items: Array<{
    menu_item_id?: string;
    item_name: string;
    category_name: string;
    meal_type: FoodServiceType;
    food_type?: FoodType;
    quantity: number;
    unit_price: number;
    base_price?: number;
    gst_rate?: number;
    tax_treatment?: TaxTreatment;
    notes?: string;
  }>;

  // Immediate payment if pay_now
  payments?: Array<{
    amount: number;
    payment_mode: PaymentMode;
    payment_type?: PaymentType;
    reference_number?: string | null;
    notes?: string | null;
  }>;
}

export interface FBDashboardSummary {
  today_sales: number;
  today_orders_count: number;
  pending_payments_amount: number;
  room_charges_amount: number;
  walkin_sales_amount: number;
  breakfast_sales: number;
  lunch_sales: number;
  dinner_sales: number;
  snacks_sales: number;
  beverages_sales: number;
  other_sales: number;
  average_order_value: number;
  cash_collected: number;
  upi_collected: number;
  card_collected: number;
  active_kitchen_orders_count: number;
}

export interface FBBillFilter {
  query?: string;
  period?: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom' | 'all';
  start_date?: string;
  end_date?: string;
  meal_type?: FoodServiceType | 'all';
  customer_type?: FBCustomerType | 'all';
  payment_status?: FBPaymentStatus | 'all';
  bill_status?: FBBillStatus | 'all';
  billing_mode?: 'pay_now' | 'charge_to_room' | 'all';
}

export interface FBItemPerformance {
  item_name: string;
  category_name: string;
  quantity_sold: number;
  revenue: number;
  order_count: number;
}

export interface FBReportsData {
  period: string;
  startDate: string;
  endDate: string;
  total_revenue: number;
  total_orders: number;
  total_taxable: number;
  total_cgst: number;
  total_sgst: number;
  total_gst: number;
  total_discount: number;
  total_collected: number;
  total_outstanding: number;
  room_charges_total: number;
  walkin_total: number;
  meals_breakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snacks: number;
    beverages: number;
    other: number;
  };
  payments_breakdown: {
    cash: number;
    upi: number;
    card: number;
    bank_transfer: number;
    room_charge: number;
    other: number;
  };
  top_items: FBItemPerformance[];
  recent_daily_trend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}
