export interface BuilderCategory {
  id: string;
  name: string;
  description: string;
  base_rate: number;
  weekend_rate: number | null;
  weekend_adjustment_type: 'fixed' | 'percent';
  weekend_adjustment_val: number;
  extra_bed_rate: number;
  child_charge: number;
  max_occupancy: number;
  adult_capacity: number;
  child_capacity: number;
  bed_count: number;
  bed_type: 'King' | 'Queen' | 'Twin' | 'Single' | 'Double';
  amenities: string[];
  color: 'forest' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate';
}

export interface FloorAllocation {
  id: string;
  categoryId: string;
  quantity: number;
}

export interface BuilderFloor {
  id: string;
  floorNumber: number;
  name: string;
  startingRoomNumber: number;
  allocations: FloorAllocation[];
}

export interface GeneratedRoom {
  id: string;
  roomNumber: string;
  floor: number;
  floorName: string;
  categoryId: string;
  categoryName: string;
  baseRate: number;
  weekendRate: number | null;
  isCustomOverride?: boolean;
}

export interface PropertySummaryStats {
  totalFloors: number;
  totalRooms: number;
  totalCategories: number;
  categoryDistribution: Array<{
    id: string;
    name: string;
    count: number;
    percentage: number;
    rate: number;
    color: string;
  }>;
  floorDistribution: Array<{
    floorId: string;
    floorNumber: number;
    floorName: string;
    count: number;
  }>;
  minRate: number;
  maxRate: number;
  estimatedNightlyRevenue: number;
}

export const AMENITIES_CATALOG = [
  'High-Speed Wi-Fi',
  'Mountain / Scenic View',
  'Private Balcony',
  'Air Conditioning',
  'Smart LED TV',
  'Minibar / Refrigerator',
  'Ensuite Luxury Bathroom',
  'Electric Kettle & Tea Kit',
  'Dedicated Work Desk',
  'In-Room Safe Locker',
  '24/7 Room Service',
  'Soundproof Windows',
];

export const DEFAULT_PRESET_CATEGORIES: BuilderCategory[] = [
  {
    id: 'cat-deluxe',
    name: 'Deluxe Room',
    description: 'Spacious guest room with scenic mountain views and king-size bedding.',
    base_rate: 3500,
    weekend_rate: 4200,
    weekend_adjustment_type: 'fixed',
    weekend_adjustment_val: 700,
    extra_bed_rate: 800,
    child_charge: 400,
    max_occupancy: 3,
    adult_capacity: 2,
    child_capacity: 1,
    bed_count: 1,
    bed_type: 'King',
    amenities: ['High-Speed Wi-Fi', 'Mountain / Scenic View', 'Smart LED TV', 'Ensuite Luxury Bathroom', 'Electric Kettle & Tea Kit'],
    color: 'forest',
  },
  {
    id: 'cat-super-deluxe',
    name: 'Super Deluxe Room',
    description: 'Upgraded luxury room with private balcony and premium hospitality amenities.',
    base_rate: 5000,
    weekend_rate: 6000,
    weekend_adjustment_type: 'fixed',
    weekend_adjustment_val: 1000,
    extra_bed_rate: 1000,
    child_charge: 500,
    max_occupancy: 3,
    adult_capacity: 2,
    child_capacity: 1,
    bed_count: 1,
    bed_type: 'King',
    amenities: ['High-Speed Wi-Fi', 'Private Balcony', 'Air Conditioning', 'Smart LED TV', 'Minibar / Refrigerator', 'Ensuite Luxury Bathroom'],
    color: 'emerald',
  },
  {
    id: 'cat-suite',
    name: 'Executive Suite',
    description: 'Ultra-luxurious suite featuring private lounge, panoramic valley views, and master bath.',
    base_rate: 8500,
    weekend_rate: 10200,
    weekend_adjustment_type: 'percent',
    weekend_adjustment_val: 20,
    extra_bed_rate: 1500,
    child_charge: 750,
    max_occupancy: 4,
    adult_capacity: 3,
    child_capacity: 1,
    bed_count: 2,
    bed_type: 'King',
    amenities: ['High-Speed Wi-Fi', 'Mountain / Scenic View', 'Private Balcony', 'Air Conditioning', 'Smart LED TV', 'Minibar / Refrigerator', 'Dedicated Work Desk', 'In-Room Safe Locker'],
    color: 'amber',
  },
  {
    id: 'cat-standard',
    name: 'Standard Room',
    description: 'Comfortable, well-appointed guest room ideal for solo travelers and brief stays.',
    base_rate: 2500,
    weekend_rate: 2900,
    weekend_adjustment_type: 'fixed',
    weekend_adjustment_val: 400,
    extra_bed_rate: 600,
    child_charge: 300,
    max_occupancy: 2,
    adult_capacity: 2,
    child_capacity: 0,
    bed_count: 1,
    bed_type: 'Queen',
    amenities: ['High-Speed Wi-Fi', 'Smart LED TV', 'Ensuite Luxury Bathroom', 'Electric Kettle & Tea Kit'],
    color: 'slate',
  },
];

export const DEFAULT_PRESET_FLOORS: BuilderFloor[] = [
  {
    id: 'floor-1',
    floorNumber: 1,
    name: 'Ground Floor',
    startingRoomNumber: 101,
    allocations: [
      { id: 'alloc-1-1', categoryId: 'cat-deluxe', quantity: 4 },
      { id: 'alloc-1-2', categoryId: 'cat-standard', quantity: 2 },
    ],
  },
  {
    id: 'floor-2',
    floorNumber: 2,
    name: 'First Floor',
    startingRoomNumber: 201,
    allocations: [
      { id: 'alloc-2-1', categoryId: 'cat-deluxe', quantity: 4 },
      { id: 'alloc-2-2', categoryId: 'cat-super-deluxe', quantity: 2 },
    ],
  },
  {
    id: 'floor-3',
    floorNumber: 3,
    name: 'Second Floor',
    startingRoomNumber: 301,
    allocations: [
      { id: 'alloc-3-1', categoryId: 'cat-super-deluxe', quantity: 2 },
      { id: 'alloc-3-2', categoryId: 'cat-suite', quantity: 1 },
    ],
  },
];

