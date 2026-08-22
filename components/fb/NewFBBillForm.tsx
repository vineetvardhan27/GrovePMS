'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  Trash2,
  Building,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Sun,
  Moon,
  Cookie,
  CreditCard,
  Percent,
  Receipt,
  Printer,
  Sparkles,
  ChevronDown,
  X,
  FileText,
  Clock,
} from 'lucide-react';
import { FBMenuItem, FBCartItem, CreateFBBillInput } from '../../lib/fb/types';
import { FB_ROUTES } from '../../lib/fb/routes';
import { createFBBillAction } from '../../lib/fb/actions';
import { FoodServiceType, FoodType, PaymentMode, TaxTreatment } from '../../lib/types/database.types';
import { formatCurrency } from '../../lib/utils/currency';
import Link from 'next/link';

interface InHouseGuestOption {
  booking_id: string;
  booking_number: string;
  booking_status: string;
  check_in_date: string;
  check_out_date: string;
  room_id: string | null;
  room_number: string;
  room_category: string;
  guest_id: string | null;
  guest_name: string;
  guest_phone: string;
  label: string;
}

interface NewFBBillFormProps {
  menuItems: FBMenuItem[];
  inHouseGuests: InHouseGuestOption[];
  defaultGstRate: number;
  initialMealType?: FoodServiceType;
  initialCustomerType?: 'room_guest' | 'walk_in';
}

const MEAL_TYPES: Array<{ id: FoodServiceType; label: string; icon: any }> = [
  { id: 'Breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'Lunch', label: 'Lunch', icon: Sun },
  { id: 'Dinner', label: 'Dinner', icon: Moon },
  { id: 'Snacks', label: 'Snacks', icon: Cookie },
  { id: 'Beverages', label: 'Beverages', icon: Coffee },
  { id: 'Room Service', label: 'Room Service', icon: Building },
  { id: 'Other', label: 'Other', icon: UtensilsCrossed },
];

const SPECIAL_INSTRUCTION_PRESETS = [
  'Less spicy',
  'No onion / garlic',
  'Extra spicy',
  'Room service delivery',
  'Allergy note: No dairy',
  'Serve piping hot',
  'Pack separately',
];

export default function NewFBBillForm({
  menuItems,
  inHouseGuests,
  defaultGstRate,
  initialMealType = 'Breakfast',
  initialCustomerType = 'room_guest',
}: NewFBBillFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlMeal = (searchParams.get('meal') as FoodServiceType) || initialMealType;
  const urlCust = (searchParams.get('type') as 'room_guest' | 'walk_in') || initialCustomerType;

  // Form State
  const [customerType, setCustomerType] = useState<'room_guest' | 'walk_in'>(urlCust);
  const [selectedBooking, setSelectedBooking] = useState<InHouseGuestOption | null>(
    customerType === 'room_guest' && inHouseGuests.length > 0 ? inHouseGuests[0] : null
  );
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);

  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  // Active Meal selector for adding items
  const [activeMealType, setActiveMealType] = useState<FoodServiceType>(urlMeal);

  // Menu Search & Filter
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'all' | 'veg' | 'non_veg' | 'egg'>('all');

  // Multi-Meal Cart State
  const [cart, setCart] = useState<FBCartItem[]>([]);

  // Item quantity selector helper before adding
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Discount State
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [discountReason, setDiscountReason] = useState<string>('');

  // Billing Mode & Payment State
  const [billingMode, setBillingMode] = useState<'pay_now' | 'charge_to_room'>('charge_to_room');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [splitPayment, setSplitPayment] = useState<Array<{ mode: PaymentMode; amount: string }>>([
    { mode: 'cash', amount: '' },
  ]);
  const [isMultiPayment, setIsMultiPayment] = useState(false);

  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Submission State
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBillId, setSuccessBillId] = useState<string | null>(null);

  // Categories list derived from menuItems
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((i) => {
      if (i.category?.name) set.add(i.category.name);
    });
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.is_active) return false;

      // 1. Text Search
      if (menuSearchQuery.trim()) {
        const q = menuSearchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCategory = item.category?.name.toLowerCase().includes(q);
        const matchSku = item.sku?.toLowerCase().includes(q);
        if (!matchName && !matchCategory && !matchSku) return false;
      }

      // 2. Category Tab
      if (selectedCategory !== 'All') {
        if (item.category?.name !== selectedCategory) return false;
      }

      // 3. Food Type (Veg / Non-Veg / Egg)
      if (foodTypeFilter !== 'all') {
        if (item.food_type !== foodTypeFilter) return false;
      }

      return true;
    });
  }, [menuItems, menuSearchQuery, selectedCategory, foodTypeFilter]);

  // Filtered in-house guests for search dropdown
  const filteredInHouseGuests = useMemo(() => {
    if (!guestSearchQuery.trim()) return inHouseGuests;
    const q = guestSearchQuery.toLowerCase().trim();
    return inHouseGuests.filter((g) => {
      return (
        g.room_number.toLowerCase().includes(q) ||
        g.guest_name.toLowerCase().includes(q) ||
        g.booking_number.toLowerCase().includes(q) ||
        g.guest_phone.includes(q)
      );
    });
  }, [inHouseGuests, guestSearchQuery]);

  // Cart helper functions
  const getItemQtyInput = (itemId: string) => itemQuantities[itemId] || 1;

  const setItemQtyInput = (itemId: string, qty: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, qty),
    }));
  };

  const handleAddToCart = (item: FBMenuItem) => {
    const qtyToAdd = getItemQtyInput(item.id);
    const existingIndex = cart.findIndex(
      (c) => c.menu_item_id === item.id && c.meal_type === activeMealType
    );

    if (existingIndex >= 0) {
      // Update quantity of existing item in active meal group
      setCart((prev) => {
        const copy = [...prev];
        copy[existingIndex].quantity += qtyToAdd;
        return copy;
      });
    } else {
      // Add new cart item
      const newCartItem: FBCartItem = {
        cart_item_id: crypto.randomUUID(),
        menu_item_id: item.id,
        item_name: item.name,
        category_name: item.category?.name || activeMealType,
        meal_type: activeMealType,
        food_type: item.food_type || 'veg',
        quantity: qtyToAdd,
        unit_price: Number(item.selling_price),
        base_price: Number(item.base_price || item.selling_price),
        gst_rate: Number(item.gst_rate ?? defaultGstRate),
        tax_treatment: 'gst',
      };
      setCart((prev) => [...prev, newCartItem]);
    }

    // Reset quantity input to 1
    setItemQtyInput(item.id, 1);
  };

  const handleUpdateCartQty = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cart_item_id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as FBCartItem[];
    });
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.cart_item_id !== cartItemId));
  };

  // Group Cart by Meal Type
  const cartGroupedByMeal = useMemo(() => {
    const groups = new Map<FoodServiceType, FBCartItem[]>();
    for (const item of cart) {
      const existing = groups.get(item.meal_type) || [];
      existing.push(item);
      groups.set(item.meal_type, existing);
    }
    return groups;
  }, [cart]);

  // Financial Calculations
  const subtotal = useMemo(() => {
    return Math.round(cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
  }, [cart]);

  const discountAmount = useMemo(() => {
    const val = Number(discountValue) || 0;
    if (discountType === 'percentage' && val > 0) {
      return Math.round(((subtotal * Math.min(100, val)) / 100) * 100) / 100;
    } else if (discountType === 'fixed' && val > 0) {
      return Math.min(subtotal, Math.round(val * 100) / 100);
    }
    return 0;
  }, [subtotal, discountType, discountValue]);

  const taxableAmount = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  const gstAmount = defaultGstRate > 0
    ? Math.round(((taxableAmount * defaultGstRate) / 100) * 100) / 100
    : 0;
  const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((gstAmount - cgstAmount) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + gstAmount) * 100) / 100;

  // Handle Form Submission
  const handleSubmitBill = () => {
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Please add at least one food item to the bill.');
      return;
    }

    if (customerType === 'room_guest' && !selectedBooking) {
      setErrorMessage('Please search and select an active hotel guest room.');
      return;
    }

    if (customerType === 'walk_in' && billingMode === 'charge_to_room') {
      setErrorMessage('Walk-in customers cannot charge to room. Please select Pay Now.');
      return;
    }

    startTransition(async () => {
      try {
        const payload: CreateFBBillInput = {
          customer_type: customerType,
          booking_id: customerType === 'room_guest' ? selectedBooking?.booking_id : null,
          room_id: customerType === 'room_guest' ? selectedBooking?.room_id : null,
          guest_id: customerType === 'room_guest' ? selectedBooking?.guest_id : null,
          customer_name:
            customerType === 'room_guest'
              ? selectedBooking?.guest_name || 'Room Guest'
              : walkinName.trim() || 'Walk-in Customer',
          customer_phone:
            customerType === 'room_guest'
              ? selectedBooking?.guest_phone || null
              : walkinPhone.trim() || null,
          table_number: tableNumber.trim() || null,
          billing_mode: customerType === 'room_guest' ? billingMode : 'pay_now',
          discount_type: discountType,
          discount_value: Number(discountValue) || 0,
          discount_reason: discountReason.trim() || null,
          special_instructions: specialInstructions.trim() || null,
          items: cart.map((item) => ({
            menu_item_id: item.menu_item_id,
            item_name: item.item_name,
            category_name: item.category_name,
            meal_type: item.meal_type,
            food_type: item.food_type,
            quantity: item.quantity,
            unit_price: item.unit_price,
            base_price: item.base_price,
            gst_rate: item.gst_rate,
            tax_treatment: item.tax_treatment,
            notes: item.notes,
          })),
        };

        // If paying immediately, attach payments
        if (payload.billing_mode === 'pay_now') {
          if (isMultiPayment) {
            payload.payments = splitPayment
              .filter((p) => Number(p.amount) > 0)
              .map((p) => ({
                amount: Number(p.amount),
                payment_mode: p.mode,
                payment_type: 'settlement',
              }));
          } else {
            payload.payments = [
              {
                amount: grandTotal,
                payment_mode: paymentMode,
                payment_type: 'settlement',
              },
            ];
          }
        }

        const res = await createFBBillAction(payload);
        if (res.error) {
          setErrorMessage(res.error);
          return;
        }

        if (res.success && res.bill) {
          setSuccessBillId(res.bill.id);
          router.push(FB_ROUTES.BILL_DETAIL(res.bill.id));
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to generate F&B Bill.');
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href={FB_ROUTES.ROOT} className="hover:text-brand-forest hover:underline">
              Food & Beverage
            </Link>
            <span>/</span>
            <span className="text-brand-forest font-semibold">New Food Bill</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink mt-1 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-brand-forest" />
            Fast POS Food Billing
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={FB_ROUTES.ROOT}
            className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-brand-sand text-ink text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel & Back
          </Link>
          <button
            type="button"
            onClick={() => setCart([])}
            disabled={cart.length === 0}
            className="px-3 py-1.5 rounded-lg border border-border-subtle text-ink-muted hover:text-action-danger text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 bg-action-danger/10 border border-action-danger/30 rounded-xl text-action-danger text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2-Column POS Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =========================================================================
            LEFT COLUMN (7 cols): Customer & Menu Catalog & Item Selection
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Customer Selection Card */}
          <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-forest" />
                Customer Type
              </span>

              {/* Customer Type Toggle */}
              <div className="flex items-center bg-brand-sand/60 p-0.5 rounded-lg border border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType('room_guest');
                    setBillingMode('charge_to_room');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    customerType === 'room_guest'
                      ? 'bg-brand-forest text-white shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Room Guest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType('walk_in');
                    setBillingMode('pay_now');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    customerType === 'walk_in'
                      ? 'bg-brand-forest text-white shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Walk-in Customer
                </button>
              </div>
            </div>

            {/* Room Guest Search Dropdown */}
            {customerType === 'room_guest' ? (
              <div className="space-y-2">
                <div className="relative">
                  <div
                    onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border-subtle bg-brand-sand/20 hover:border-brand-forest text-xs font-medium flex items-center justify-between cursor-pointer transition-colors"
                  >
                    {selectedBooking ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-forest bg-brand-forest/10 px-2 py-0.5 rounded">
                          Room {selectedBooking.room_number}
                        </span>
                        <span className="text-ink font-semibold">{selectedBooking.guest_name}</span>
                        <span className="text-ink-muted text-[11px]">({selectedBooking.booking_number})</span>
                      </div>
                    ) : (
                      <span className="text-ink-muted">Search Room Number / Guest Name...</span>
                    )}
                    <ChevronDown className="w-4 h-4 text-ink-muted" />
                  </div>

                  {isGuestDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-border-subtle shadow-modal z-50 p-2 max-h-64 overflow-y-auto space-y-1">
                      <div className="p-1 sticky top-0 bg-white border-b border-border-subtle">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                          <input
                            type="text"
                            placeholder="Type room #, guest name, phone..."
                            value={guestSearchQuery}
                            onChange={(e) => setGuestSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/30 focus:outline-none focus:border-brand-forest"
                            autoFocus
                          />
                        </div>
                      </div>

                      {filteredInHouseGuests.length === 0 ? (
                        <div className="py-4 text-center text-xs text-ink-muted">
                          No matching active in-house guests found.
                        </div>
                      ) : (
                        filteredInHouseGuests.map((g) => (
                          <div
                            key={g.booking_id}
                            onClick={() => {
                              setSelectedBooking(g);
                              setIsGuestDropdownOpen(false);
                            }}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between hover:bg-brand-sand/60 cursor-pointer transition-colors ${
                              selectedBooking?.booking_id === g.booking_id ? 'bg-brand-forest/10 font-semibold' : ''
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-brand-forest">Room {g.room_number}</span>
                                <span className="text-ink">{g.guest_name}</span>
                              </div>
                              <div className="text-[11px] text-ink-muted mt-0.5">
                                {g.booking_number} • {g.guest_phone || 'No phone'}
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-status-green/15 text-status-green">
                              In-House
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Guest Details Pill */}
                {selectedBooking && (
                  <div className="flex items-center justify-between text-[11px] bg-brand-forest/5 border border-brand-forest/15 px-3 py-1.5 rounded-lg text-ink">
                    <span>
                      Stay: {selectedBooking.check_in_date} to {selectedBooking.check_out_date}
                    </span>
                    <span className="text-brand-forest font-semibold">{selectedBooking.room_category}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Walk-in Customer Inputs */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Table / Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g. Table T-4"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Active Meal Service Selector (Breakfast / Lunch / Dinner / Snacks / Beverages) */}
          <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-brand-forest" />
                Current Meal Order Section
              </span>
              <span className="text-[11px] text-ink-muted">Items added will be tagged to this meal</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {MEAL_TYPES.map((m) => {
                const Icon = m.icon;
                const isSelected = activeMealType === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMealType(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-brand-forest text-white shadow-xs'
                        : 'bg-brand-sand/40 hover:bg-brand-sand text-ink border border-border-subtle'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Fast Food Menu Search & Filter */}
          <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Search food items by name, SKU, or category..."
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              {/* Veg / Non-Veg Quick Filter */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter('all')}
                  className={`px-2 py-1 text-[11px] rounded-md font-medium cursor-pointer ${
                    foodTypeFilter === 'all' ? 'bg-ink text-white' : 'bg-brand-sand/50 text-ink-muted'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter('veg')}
                  className={`px-2 py-1 text-[11px] rounded-md font-medium cursor-pointer ${
                    foodTypeFilter === 'veg' ? 'bg-status-green text-white' : 'bg-status-green/10 text-status-green'
                  }`}
                >
                  🌱 Veg
                </button>
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter('non_veg')}
                  className={`px-2 py-1 text-[11px] rounded-md font-medium cursor-pointer ${
                    foodTypeFilter === 'non_veg' ? 'bg-action-danger text-white' : 'bg-action-danger/10 text-action-danger'
                  }`}
                >
                  🍗 Non-Veg
                </button>
                <button
                  type="button"
                  onClick={() => setFoodTypeFilter('egg')}
                  className={`px-2 py-1 text-[11px] rounded-md font-medium cursor-pointer ${
                    foodTypeFilter === 'egg' ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  🥚 Egg
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-brand-forest/15 text-brand-forest font-semibold border border-brand-forest/30'
                      : 'text-ink-muted hover:text-ink hover:bg-brand-sand/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food Items Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredMenuItems.length === 0 ? (
                <div className="col-span-2 py-10 text-center text-xs text-ink-muted">
                  No matching food items found for "{menuSearchQuery}".
                </div>
              ) : (
                filteredMenuItems.map((item) => {
                  const qty = getItemQtyInput(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-border-subtle hover:border-brand-forest/40 bg-white hover:bg-brand-sand/10 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  item.food_type === 'non_veg'
                                    ? 'bg-action-danger'
                                    : item.food_type === 'egg'
                                    ? 'bg-amber-500'
                                    : 'bg-status-green'
                                }`}
                              />
                              <span className="font-semibold text-ink text-xs truncate">{item.name}</span>
                            </div>
                            <div className="text-[10px] text-ink-muted mt-0.5 truncate">
                              {item.category?.name || 'Food'}
                              {item.description && ` • ${item.description}`}
                            </div>
                          </div>
                          <span className="font-bold text-ink text-xs shrink-0 tabular-nums">
                            {formatCurrency(item.selling_price)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Item Control: [-] qty [+] and Add */}
                      <div className="mt-3 pt-2 border-t border-border-subtle/60 flex items-center justify-between gap-2">
                        <div className="flex items-center border border-border-subtle rounded-md overflow-hidden bg-brand-sand/30">
                          <button
                            type="button"
                            onClick={() => setItemQtyInput(item.id, qty - 1)}
                            className="px-2 py-1 hover:bg-brand-sand text-ink transition-colors cursor-pointer text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-semibold text-ink tabular-nums">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setItemQtyInput(item.id, qty + 1)}
                            className="px-2 py-1 hover:bg-brand-sand text-ink transition-colors cursor-pointer text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="px-3 py-1 rounded-md bg-brand-forest hover:bg-brand-forest/90 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add to {activeMealType}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (5 cols): Multi-Meal Cart, Settlement, Taxes, & Action
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Multi-Meal Cart */}
          <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-card space-y-4 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-forest" />
                  <h2 className="text-sm font-bold text-ink">Current Order Summary</h2>
                </div>
                <span className="text-xs text-ink-muted">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Item
                  {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? '' : 's'}
                </span>
              </div>

              {/* Empty Cart State */}
              {cart.length === 0 ? (
                <div className="py-16 text-center text-ink-muted space-y-2">
                  <UtensilsCrossed className="w-10 h-10 mx-auto text-ink-muted/30" />
                  <p className="text-xs font-medium">Cart is currently empty</p>
                  <p className="text-[11px] text-ink-muted/70 max-w-[200px] mx-auto">
                    Select a meal type, pick food items from the catalog, and click Add.
                  </p>
                </div>
              ) : (
                /* Grouped Meals Display */
                <div className="divide-y divide-border-subtle mt-2 max-h-[260px] overflow-y-auto pr-1 space-y-3">
                  {Array.from(cartGroupedByMeal.entries()).map(([mealType, mealItems]) => (
                    <div key={mealType} className="pt-2 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-brand-forest uppercase tracking-wider bg-brand-sand/50 px-2 py-1 rounded">
                        <span>{mealType}</span>
                        <span className="text-ink-muted font-normal lowercase">
                          {mealItems.length} item{mealItems.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {mealItems.map((cartItem) => (
                        <div
                          key={cartItem.cart_item_id}
                          className="flex items-center justify-between gap-2 py-1 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-ink truncate">{cartItem.item_name}</div>
                            <div className="text-[10px] text-ink-muted">
                              {formatCurrency(cartItem.unit_price)} each
                            </div>
                          </div>

                          {/* In-place Quantity controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center border border-border-subtle rounded bg-brand-sand/20">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(cartItem.cart_item_id, -1)}
                                className="px-1.5 py-0.5 hover:bg-brand-sand text-ink text-xs cursor-pointer"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="px-1.5 text-xs font-bold tabular-nums">{cartItem.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(cartItem.cart_item_id, 1)}
                                className="px-1.5 py-0.5 hover:bg-brand-sand text-ink text-xs cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <span className="font-bold text-ink w-16 text-right tabular-nums">
                              {formatCurrency(cartItem.quantity * cartItem.unit_price)}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveCartItem(cartItem.cart_item_id)}
                              className="text-ink-muted hover:text-action-danger transition-colors p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Instructions & Discount & Taxes */}
            <div className="pt-3 border-t border-border-subtle space-y-3">
              {/* Special Instructions */}
              <div>
                <label className="text-[11px] font-semibold text-ink-muted block mb-1">
                  Special Instructions / Kitchen Notes
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {SPECIAL_INSTRUCTION_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSpecialInstructions((prev) =>
                          prev ? `${prev}, ${preset}` : preset
                        );
                      }}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-brand-sand/50 hover:bg-brand-sand text-ink-muted hover:text-ink cursor-pointer border border-border-subtle"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, pack separately, room delivery..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
                />
              </div>

              {/* Discount Selector */}
              <div className="bg-brand-sand/30 p-2.5 rounded-lg border border-border-subtle space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-brand-forest" />
                    Apply Discount
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDiscountType('none')}
                      className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${
                        discountType === 'none' ? 'bg-ink text-white font-semibold' : 'text-ink-muted'
                      }`}
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percentage')}
                      className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${
                        discountType === 'percentage' ? 'bg-brand-forest text-white font-semibold' : 'text-ink-muted'
                      }`}
                    >
                      % Percent
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${
                        discountType === 'fixed' ? 'bg-brand-forest text-white font-semibold' : 'text-ink-muted'
                      }`}
                    >
                      ₹ Fixed
                    </button>
                  </div>
                </div>

                {discountType !== 'none' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="number"
                      placeholder={discountType === 'percentage' ? 'Discount % (e.g. 10)' : 'Amount ₹ (e.g. 100)'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="px-2 py-1 text-xs rounded border border-border-subtle bg-white focus:outline-none focus:border-brand-forest"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g. Manager approval)"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="px-2 py-1 text-xs rounded border border-border-subtle bg-white focus:outline-none focus:border-brand-forest"
                    />
                  </div>
                )}
              </div>

              {/* Billing Mode (Pay Now vs Charge to Room) */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-ink-muted block">Settlement Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={customerType === 'walk_in'}
                    onClick={() => setBillingMode('charge_to_room')}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      billingMode === 'charge_to_room'
                        ? 'bg-status-blue text-white border-status-blue shadow-xs'
                        : 'bg-brand-sand/30 border-border-subtle text-ink hover:bg-brand-sand/60 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Charge to Room</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingMode('pay_now')}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      billingMode === 'pay_now'
                        ? 'bg-status-green text-white border-status-green shadow-xs'
                        : 'bg-brand-sand/30 border-border-subtle text-ink hover:bg-brand-sand/60'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Immediately</span>
                  </button>
                </div>

                {billingMode === 'pay_now' && (
                  <div className="p-2 bg-brand-sand/40 rounded-lg border border-border-subtle flex items-center gap-2 text-xs">
                    <span className="text-ink-muted text-[11px]">Payment Mode:</span>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="px-2 py-1 rounded border border-border-subtle bg-white text-xs font-semibold text-ink focus:outline-none"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="bank_transfer">Bank Transfer / NEFT</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Authoritative Financial Breakdown Table */}
              <div className="bg-brand-sand/20 p-3 rounded-lg border border-border-subtle space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-ink-muted">
                  <span>Gross Subtotal</span>
                  <span className="font-semibold text-ink tabular-nums">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-action-danger">
                    <span>Discount</span>
                    <span className="font-semibold tabular-nums">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-ink-muted">
                  <span>Net Taxable Amount</span>
                  <span className="font-semibold text-ink tabular-nums">{formatCurrency(taxableAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-ink-muted">
                  <span>GST ({defaultGstRate}%) [CGST + SGST]</span>
                  <span className="font-semibold text-ink tabular-nums">{formatCurrency(gstAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-ink pt-1.5 border-t border-border-subtle">
                  <span>Grand Total</span>
                  <span className="text-base font-bold text-brand-forest tabular-nums">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Main Submit Button */}
              <button
                type="button"
                disabled={isPending || cart.length === 0}
                onClick={handleSubmitBill}
                className="w-full pms-btn-primary py-3 justify-center text-sm font-bold shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Generating & Syncing Bill...
                  </span>
                ) : billingMode === 'charge_to_room' ? (
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Charge {formatCurrency(grandTotal)} to Room {selectedBooking?.room_number || ''}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Food Bill & Print ({formatCurrency(grandTotal)})
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
