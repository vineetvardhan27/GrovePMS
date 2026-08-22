'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Coffee,
  Sun,
  Moon,
  Cookie,
  UserCheck,
  Building,
  CreditCard,
  ChefHat,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { FBDashboardSummary, FBBillRecord, FBOrderRecord } from '../../lib/fb/types';
import { FB_ROUTES } from '../../lib/fb/routes';
import { formatCurrency } from '../../lib/utils/currency';

interface FBDashboardProps {
  summary: FBDashboardSummary;
  recentBills: FBBillRecord[];
  activeKitchenOrders: Array<FBOrderRecord & { bill: Partial<FBBillRecord> }>;
  userRole: string;
  onOpenNewBill?: (preset?: { mealType?: string; customerType?: string }) => void;
}

export default function FBDashboard({
  summary,
  recentBills,
  activeKitchenOrders,
  userRole,
  onOpenNewBill,
}: FBDashboardProps) {
  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Metric Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-brand-forest" />
            Food & Beverage Overview
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Real-time restaurant sales, room service orders, kitchen tickets, and billing control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={FB_ROUTES.NEW_BILL}
            className="pms-btn-primary flex items-center gap-2 shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Food Bill</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Today's Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
            <span>Today's Sales</span>
            <TrendingUp className="w-3.5 h-3.5 text-brand-forest" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-ink tabular-nums">
              {formatCurrency(summary.today_sales)}
            </div>
            <div className="text-[11px] text-brand-forest font-medium mt-0.5">
              {summary.today_orders_count} Order{summary.today_orders_count === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
            <span>Pending</span>
            <AlertCircle className="w-3.5 h-3.5 text-status-amber" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-status-amber tabular-nums">
              {formatCurrency(summary.pending_payments_amount)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">Unsettled bills</div>
          </div>
        </div>

        {/* Room Charges */}
        <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
            <span>Room Charges</span>
            <Building className="w-3.5 h-3.5 text-status-blue" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-status-blue tabular-nums">
              {formatCurrency(summary.room_charges_amount)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">Posted to folios</div>
          </div>
        </div>

        {/* Walk-in Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
            <span>Walk-in Sales</span>
            <UserCheck className="w-3.5 h-3.5 text-status-green" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-status-green tabular-nums">
              {formatCurrency(summary.walkin_sales_amount)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">Direct restaurant</div>
          </div>
        </div>

        {/* Breakfast Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
            <span>Breakfast</span>
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-ink tabular-nums">
              {formatCurrency(summary.breakfast_sales)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">Morning orders</div>
          </div>
        </div>

        {/* Lunch Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
            <span>Lunch</span>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-ink tabular-nums">
              {formatCurrency(summary.lunch_sales)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">Afternoon orders</div>
          </div>
        </div>

        {/* Dinner Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
            <span>Dinner</span>
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-ink tabular-nums">
              {formatCurrency(summary.dinner_sales)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">Evening orders</div>
          </div>
        </div>

        {/* Snacks & Drinks */}
        <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
            <span>Snacks & Bev</span>
            <Cookie className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-ink tabular-nums">
              {formatCurrency(summary.snacks_sales + summary.beverages_sales)}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">All-day items</div>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Quick Actions — Instant POS Billing
          </span>
          <span className="text-xs text-ink-muted">One-click fast bill presets</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href={FB_ROUTES.NEW_BILL}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-brand-sand/50 hover:bg-brand-forest hover:text-white text-ink font-medium text-xs border border-border-subtle transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-md bg-brand-forest/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-brand-forest group-hover:text-white" />
            </div>
            <div className="truncate">
              <div className="font-semibold truncate">+ New Food Bill</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Empty Cart</div>
            </div>
          </Link>

          <Link
            href={FB_ROUTES.NEW_BILL_WITH_MEAL('Breakfast')}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-brand-sand/50 hover:bg-amber-600 hover:text-white text-ink font-medium text-xs border border-border-subtle transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-md bg-amber-500/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4 text-amber-600 group-hover:text-white" />
            </div>
            <div className="truncate">
              <div className="font-semibold truncate">+ Breakfast</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Morning service</div>
            </div>
          </Link>

          <Link
            href={FB_ROUTES.NEW_BILL_WITH_MEAL('Lunch')}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-brand-sand/50 hover:bg-amber-700 hover:text-white text-ink font-medium text-xs border border-border-subtle transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-md bg-amber-600/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4 text-amber-700 group-hover:text-white" />
            </div>
            <div className="truncate">
              <div className="font-semibold truncate">+ Lunch</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Thalis & curries</div>
            </div>
          </Link>

          <Link
            href={FB_ROUTES.NEW_BILL_WITH_MEAL('Dinner')}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-brand-sand/50 hover:bg-indigo-600 hover:text-white text-ink font-medium text-xs border border-border-subtle transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-md bg-indigo-500/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <Moon className="w-4 h-4 text-indigo-600 group-hover:text-white" />
            </div>
            <div className="truncate">
              <div className="font-semibold truncate">+ Dinner</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Evening service</div>
            </div>
          </Link>

          <Link
            href={FB_ROUTES.NEW_BILL_WITH_TYPE('walk_in')}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-brand-sand/50 hover:bg-status-green hover:text-white text-ink font-medium text-xs border border-border-subtle transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-md bg-status-green/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-status-green group-hover:text-white" />
            </div>
            <div className="truncate">
              <div className="font-semibold truncate">+ Walk-in Order</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Restaurant Guest</div>
            </div>
          </Link>

          <Link
            href={FB_ROUTES.NEW_BILL_WITH_TYPE('room_guest')}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-brand-sand/50 hover:bg-status-blue hover:text-white text-ink font-medium text-xs border border-border-subtle transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-md bg-status-blue/10 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4 text-status-blue group-hover:text-white" />
            </div>
            <div className="truncate">
              <div className="font-semibold truncate">+ Room Guest</div>
              <div className="text-[10px] text-ink-muted group-hover:text-white/80 truncate">Folio posting</div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Live Kitchen Orders & Recent Bills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Kitchen Preparation Queue */}
        <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-brand-forest" />
                <h2 className="text-sm font-bold text-ink">Active Kitchen Orders</h2>
                {activeKitchenOrders.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-status-amber/15 text-status-amber text-xs font-semibold">
                    {activeKitchenOrders.length} Live
                  </span>
                )}
              </div>
              <Link
                href={FB_ROUTES.KITCHEN}
                className="text-xs font-medium text-brand-forest hover:underline flex items-center gap-1"
              >
                <span>Kitchen Display</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeKitchenOrders.length === 0 ? (
              <div className="py-12 text-center text-ink-muted">
                <ChefHat className="w-8 h-8 mx-auto text-ink-muted/40 mb-2" />
                <p className="text-xs font-medium">All kitchen orders are cleared & served!</p>
                <p className="text-[11px] mt-0.5 text-ink-muted/70">New orders will appear here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle mt-2 space-y-1">
                {activeKitchenOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">#{order.order_number}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-sand text-brand-forest">
                          {order.meal_type}
                        </span>
                        <span className="text-ink-muted truncate">
                          {order.bill?.room_number_snapshot ? `Room ${order.bill.room_number_snapshot}` : (order.bill?.customer_name || 'Walk-in')}
                        </span>
                      </div>
                      <p className="text-ink-muted mt-1 truncate">
                        {(order.items || []).map((i) => `${i.quantity} × ${i.item_name_snapshot}`).join(', ')}
                      </p>
                      {order.special_instructions && (
                        <p className="text-status-amber font-medium text-[11px] mt-0.5">
                          Note: {order.special_instructions}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                        order.status === 'preparing'
                          ? 'bg-status-amber/15 text-status-amber animate-pulse'
                          : order.status === 'ready'
                          ? 'bg-status-green/15 text-status-green'
                          : 'bg-brand-sand text-ink'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border-subtle mt-2">
            <Link
              href={FB_ROUTES.KITCHEN}
              className="w-full py-2 bg-brand-sand/60 hover:bg-brand-sand text-brand-forest font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Open Kitchen Preparation Board</span>
            </Link>
          </div>
        </div>

        {/* Recent F&B Bills */}
        <div className="bg-white rounded-xl border border-border-subtle p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-forest" />
                <h2 className="text-sm font-bold text-ink">Recent F&B Bills</h2>
              </div>
              <Link
                href={FB_ROUTES.BILLS}
                className="text-xs font-medium text-brand-forest hover:underline flex items-center gap-1"
              >
                <span>View All Bills</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBills.length === 0 ? (
              <div className="py-12 text-center text-ink-muted">
                <Receipt className="w-8 h-8 mx-auto text-ink-muted/40 mb-2" />
                <p className="text-xs font-medium">No food bills created today yet.</p>
                <Link
                  href={FB_ROUTES.NEW_BILL}
                  className="text-xs text-brand-forest font-semibold hover:underline mt-1 inline-block"
                >
                  Create First Bill
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle mt-2 space-y-1">
                {recentBills.slice(0, 5).map((bill) => (
                  <div key={bill.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{bill.bill_number}</span>
                        <span className="text-[11px] text-ink-muted">
                          {bill.customer_type === 'room_guest' && bill.room_number_snapshot
                            ? `Room ${bill.room_number_snapshot}`
                            : bill.customer_name}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-muted truncate mt-0.5">
                        {bill.billing_mode === 'charge_to_room' ? 'Charged to Room Folio' : `Mode: ${bill.billing_mode}`}
                        {bill.items && bill.items.length > 0 && ` • ${bill.items.length} item${bill.items.length === 1 ? '' : 's'}`}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-ink tabular-nums">
                        {formatCurrency(bill.grand_total)}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                          bill.payment_status === 'paid'
                            ? 'bg-status-green/15 text-status-green'
                            : bill.payment_status === 'charged_to_room'
                            ? 'bg-status-blue/15 text-status-blue'
                            : bill.payment_status === 'partially_paid'
                            ? 'bg-status-amber/15 text-status-amber'
                            : bill.bill_status === 'void'
                            ? 'bg-action-danger/15 text-action-danger'
                            : 'bg-status-amber/15 text-status-amber'
                        }`}
                      >
                        {bill.payment_status === 'charged_to_room' ? 'Charged to Room' : bill.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border-subtle mt-2">
            <Link
              href={FB_ROUTES.BILLS}
              className="w-full py-2 bg-brand-sand/60 hover:bg-brand-sand text-brand-forest font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Browse Full F&B Billing Ledger</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
