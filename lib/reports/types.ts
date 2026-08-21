import { PaymentMode } from '../types/database.types';
import { BookingWithDetails } from '../bookings/queries';
import { BanquetBooking } from '../banquet/types';

export type ReportPeriod =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year';

export interface NeedsAttentionAlert {
  id: string;
  category: 'finance' | 'rooms' | 'banquet' | 'inventory';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  amount?: number;
}

export interface BusinessSourceBreakdown {
  rooms: {
    billed: number;
    collected: number;
    outstanding: number;
    count: number;
    share_pct: number;
  };
  banquet: {
    billed: number;
    collected: number;
    outstanding: number;
    count: number;
    share_pct: number;
  };
  food_beverage: {
    billed: number;
    collected: number;
    outstanding: number;
    count: number;
    share_pct: number;
  };
  other: {
    billed: number;
    collected: number;
    outstanding: number;
    count: number;
    share_pct: number;
  };
}

export interface PaymentModeBreakdown {
  cash: number;
  upi: number;
  card: number;
  bank_transfer: number;
  other: number;
}

export interface RoomPerformanceStats {
  totalRooms: number;
  occupiedRoomsToday: number;
  occupancyPercentToday: number;
  periodOccupancyPercent: number;
  roomNightsSold: number;
  availableRoomNights: number;
  totalRoomRevenue: number;
  adr: number;    // Average Daily Rate
  revpar: number; // Revenue per Available Room
  totalBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
  avgStayNights: number;
}

export interface BanquetPerformanceStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  totalBilled: number;
  totalCollected: number;
  balanceDue: number;
  avgEventValue: number;
}

export interface FoodBeveragePerformanceStats {
  totalRevenue: number;
  totalCollected: number;
  roomServiceRevenue: number;
  restaurantRevenue: number;
  cateringRevenue: number;
}

export interface InventoryImpactStats {
  totalStockValue: number;
  todayWastage: number;
  monthWastage: number;
  totalDamagedAssets: number;
  replacementsNeeded: number;
  lowStockItemsCount: number;
}

export interface GrowthMetrics {
  revenueGrowthPct: number; // % comparison vs previous period
  collectionGrowthPct: number;
  occupancyGrowthPts: number;
}

export interface OutstandingAccount {
  id: string;
  source: 'room' | 'banquet' | 'food_beverage';
  customerName: string;
  phone?: string;
  reference: string;
  resourceName: string;
  billedAmount: number;
  paidAmount: number;
  balanceDue: number;
  url: string;
}

export interface HotelOwnerIntelligence {
  period: ReportPeriod;
  periodLabel: string;
  startDate: string;
  endDate: string;
  hotelName: string;

  // Executive Snapshot
  totalBusinessValue: number;
  totalCollected: number;
  outstandingDue: number;
  taxesCollected: number;
  refundsIssued: number;
  collectionRate: number; // %

  // Operational Snapshot Today
  todayRevenue: number;
  todayCollections: number;
  todayOutstanding: number;
  inHouseGuestsCount: number;
  arrivalsToday: BookingWithDetails[];
  departuresToday: BookingWithDetails[];
  banquetEventsToday: BanquetBooking[];

  // Growth Comparison (MoM / Period vs Period)
  growth: GrowthMetrics;

  // Domain Breakdowns
  sources: BusinessSourceBreakdown;
  paymentModes: PaymentModeBreakdown;
  roomPerformance: RoomPerformanceStats;
  banquetPerformance: BanquetPerformanceStats;
  fbPerformance: FoodBeveragePerformanceStats;
  inventoryImpact: InventoryImpactStats;

  // Actionable Center & Receivables
  needsAttention: NeedsAttentionAlert[];
  topOutstandingAccounts: OutstandingAccount[];
}
