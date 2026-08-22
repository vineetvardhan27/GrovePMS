'use client';

import { useState, useTransition } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Building,
  UserCheck,
  RefreshCw,
  Check,
  Flame,
  Utensils,
} from 'lucide-react';
import { FBOrderRecord, FBBillRecord } from '../../lib/fb/types';
import { updateOrderStatusAction } from '../../lib/fb/actions';
import { FBOrderStatus, FoodServiceType } from '../../lib/types/database.types';

interface KitchenDisplayViewProps {
  initialOrders: Array<FBOrderRecord & { bill: Partial<FBBillRecord> }>;
}

export default function KitchenDisplayView({ initialOrders }: KitchenDisplayViewProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [filterMeal, setFilterMeal] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const handleStatusChange = (orderId: string, newStatus: FBOrderStatus) => {
    setActiveOrderId(orderId);
    startTransition(async () => {
      await updateOrderStatusAction(orderId, newStatus);
      setOrders((prev) =>
        prev
          .map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
          .filter((o) => newStatus !== 'completed' && newStatus !== 'cancelled')
      );
      setActiveOrderId(null);
    });
  };

  const filteredOrders = orders.filter((o) => {
    if (filterMeal !== 'all' && o.meal_type !== filterMeal) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2.5">
            <ChefHat className="w-6 h-6 text-brand-forest" />
            Kitchen Preparation Display (KOT)
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Real-time live kitchen tickets for chef & preparation staff. High-visibility status controls.
          </p>
        </div>

        {/* Meal Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1 rounded-xl border border-border-subtle shadow-xs">
          {['all', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilterMeal(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterMeal === m
                  ? 'bg-brand-forest text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-brand-sand/50'
              }`}
            >
              {m === 'all' ? 'All Live Tickets' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Board */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-subtle p-16 text-center shadow-card space-y-3">
          <ChefHat className="w-12 h-12 mx-auto text-brand-forest/30" />
          <h3 className="text-base font-bold text-ink">Kitchen Queue is Empty!</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            All active food and beverage orders have been prepared and served to guests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isProcessing = isPending && activeOrderId === order.id;
            const isRoom = Boolean(order.bill?.room_number_snapshot);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl border shadow-card p-4 flex flex-col justify-between transition-all ${
                  order.status === 'preparing'
                    ? 'border-status-amber ring-2 ring-status-amber/20'
                    : order.status === 'ready'
                    ? 'border-status-green ring-2 ring-status-green/20 bg-status-green/5'
                    : 'border-border-subtle'
                }`}
              >
                <div>
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-ink">#{order.order_number}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-sand text-brand-forest">
                          {order.meal_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-ink font-semibold mt-1">
                        {isRoom ? (
                          <span className="text-brand-forest font-bold flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" />
                            Room {order.bill?.room_number_snapshot}
                          </span>
                        ) : (
                          <span className="text-ink-muted flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            {order.bill?.table_number ? `Table ${order.bill.table_number}` : 'Walk-in Table'}
                          </span>
                        )}
                        <span className="text-ink-muted font-normal">• {order.bill?.customer_name || 'Guest'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'preparing'
                            ? 'bg-status-amber/20 text-status-amber'
                            : order.status === 'ready'
                            ? 'bg-status-green/20 text-status-green'
                            : 'bg-brand-sand text-ink-muted'
                        }`}
                      >
                        {order.status}
                      </span>
                      <div className="text-[10px] text-ink-muted flex items-center gap-1 mt-1 justify-end">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(order.order_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Food Items List */}
                  <div className="py-3 space-y-2">
                    {(order.items || []).map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-brand-sand font-bold text-ink flex items-center justify-center text-xs shrink-0 tabular-nums">
                            {item.quantity}×
                          </span>
                          <span className="font-semibold text-ink text-sm">{item.item_name_snapshot}</span>
                        </div>
                        {item.notes && (
                          <span className="text-[11px] text-status-amber italic shrink-0">({item.notes})</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions / Chef Notes */}
                  {order.special_instructions && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs mt-2 flex items-start gap-1.5">
                      <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Special Note: </span>
                        <span>{order.special_instructions}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kitchen Status Action Buttons */}
                <div className="pt-3 border-t border-border-subtle mt-3 grid grid-cols-2 gap-2">
                  {order.status !== 'preparing' && order.status !== 'ready' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      className="w-full py-2 rounded-lg bg-status-amber text-white hover:bg-amber-600 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      className="w-full py-2 rounded-lg bg-status-green text-white hover:bg-green-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Ready to Serve</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      className="w-full py-2 rounded-lg bg-brand-forest text-white hover:bg-brand-forest/90 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Served & Complete</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleStatusChange(order.id, 'completed')}
                    className="w-full py-2 rounded-lg bg-brand-sand/60 hover:bg-brand-sand text-ink text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Clear / Complete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
