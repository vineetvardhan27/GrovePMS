'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  Calendar,
  Building,
  UserCheck,
  CreditCard,
  Printer,
  Eye,
  AlertTriangle,
  Plus,
  ArrowUpDown,
  Download,
  FileText,
} from 'lucide-react';
import { FBBillRecord, FBBillFilter } from '../../lib/fb/types';
import { FB_ROUTES } from '../../lib/fb/routes';
import { formatCurrency } from '../../lib/utils/currency';
import RecordFBPaymentModal from './RecordFBPaymentModal';
import VoidFBBillModal from './VoidFBBillModal';

interface FBBillsHistoryProps {
  bills: FBBillRecord[];
  userRole: string;
}

export default function FBBillsHistory({ bills, userRole }: FBBillsHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'room_guest' | 'walk_in'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid' | 'partially_paid' | 'charged_to_room' | 'void'>('all');
  const [mealFilter, setMealFilter] = useState<string>('all');

  // Modals state
  const [paymentModalBill, setPaymentModalBill] = useState<FBBillRecord | null>(null);
  const [voidModalBill, setVoidModalBill] = useState<FBBillRecord | null>(null);

  // Filtered bills calculation
  const filteredBills = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return bills.filter((bill) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = bill.bill_number?.toLowerCase().includes(q) || bill.invoice_number?.toLowerCase().includes(q);
        const matchCustomer = bill.customer_name?.toLowerCase().includes(q) || bill.customer_phone?.includes(q);
        const matchRoom = bill.room_number_snapshot?.toLowerCase().includes(q) || bill.booking_number_snapshot?.toLowerCase().includes(q);
        const matchItems = (bill.items || []).some((i) => i.item_name_snapshot.toLowerCase().includes(q));
        if (!matchNumber && !matchCustomer && !matchRoom && !matchItems) return false;
      }

      // 2. Period Filter
      const billDate = (bill.created_at || '').split('T')[0];
      if (periodFilter === 'today') {
        if (billDate !== todayStr) return false;
      } else if (periodFilter === 'yesterday') {
        const yDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (billDate !== yDate) return false;
      } else if (periodFilter === 'this_week') {
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        if (billDate < weekAgo) return false;
      } else if (periodFilter === 'this_month') {
        const monthPrefix = todayStr.slice(0, 7);
        if (!billDate.startsWith(monthPrefix)) return false;
      }

      // 3. Customer Type
      if (customerFilter !== 'all' && bill.customer_type !== customerFilter) return false;

      // 4. Payment Status
      if (paymentFilter === 'void') {
        if (bill.bill_status !== 'void') return false;
      } else if (paymentFilter !== 'all') {
        if (bill.payment_status !== paymentFilter) return false;
      }

      // 5. Meal Filter
      if (mealFilter !== 'all') {
        const hasMeal = (bill.orders || []).some((o) => o.meal_type === mealFilter) ||
          (bill.items || []).some((i) => i.meal_type === mealFilter);
        if (!hasMeal) return false;
      }

      return true;
    });
  }, [bills, searchQuery, periodFilter, customerFilter, paymentFilter, mealFilter]);

  const totalFilteredRevenue = filteredBills
    .filter((b) => b.bill_status !== 'void')
    .reduce((sum, b) => sum + b.grand_total, 0);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-brand-forest" />
            F&B Bills & Order Ledger
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Comprehensive history of restaurant, room service, and banquet food invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={FB_ROUTES.NEW_BILL}
            className="pms-btn-primary flex items-center gap-1.5 text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Bill</span>
          </Link>
        </div>
      </div>

      {/* Prominent Search & Filter Control Bar */}
      <div className="bg-white rounded-xl border border-border-subtle p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Main Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by Bill #, Guest Name, Room #, Booking #, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 focus:outline-none focus:border-brand-forest"
            />
          </div>

          {/* Customer Filter */}
          <div className="sm:col-span-2">
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 font-medium text-ink focus:outline-none"
            >
              <option value="all">All Customers</option>
              <option value="room_guest">Room Guests</option>
              <option value="walk_in">Walk-in Guests</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 font-medium text-ink focus:outline-none"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="charged_to_room">Charged to Room</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="void">Voided Bills</option>
            </select>
          </div>

          {/* Meal Filter */}
          <div className="sm:col-span-2">
            <select
              value={mealFilter}
              onChange={(e) => setMealFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-border-subtle bg-brand-sand/20 font-medium text-ink focus:outline-none"
            >
              <option value="all">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>
        </div>

        {/* Quick Period Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle/70 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-ink-muted text-[11px] mr-1 hidden sm:inline">Period:</span>
            {(['all', 'today', 'yesterday', 'this_week', 'this_month'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodFilter(p)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                  periodFilter === p
                    ? 'bg-brand-forest text-white shadow-xs font-semibold'
                    : 'bg-brand-sand/40 hover:bg-brand-sand text-ink-muted hover:text-ink'
                }`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="text-right text-[11px] text-ink-muted shrink-0">
            Showing <span className="font-bold text-ink">{filteredBills.length}</span> bills • Total:{' '}
            <span className="font-bold text-brand-forest">{formatCurrency(totalFilteredRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-sand/40 border-b border-border-subtle text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                <th className="py-3 px-4">Bill & Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer / Room</th>
                <th className="py-3 px-4">Meals & Items</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-ink">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-ink-muted">
                    <Receipt className="w-8 h-8 mx-auto text-ink-muted/30 mb-2" />
                    <p className="font-medium text-xs">No F&B bills match the current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const isVoid = bill.bill_status === 'void';
                  const isRoom = bill.customer_type === 'room_guest';

                  return (
                    <tr
                      key={bill.id}
                      className={`hover:bg-brand-sand/15 transition-colors ${
                        isVoid ? 'bg-action-danger/5 opacity-70' : ''
                      }`}
                    >
                      {/* Bill & Invoice */}
                      <td className="py-3 px-4 font-mono">
                        <Link
                          href={FB_ROUTES.BILL_DETAIL(bill.id)}
                          className="font-bold text-brand-forest hover:underline"
                        >
                          {bill.bill_number}
                        </Link>
                        {bill.invoice_number && (
                          <div className="text-[10px] text-ink-muted mt-0.5">{bill.invoice_number}</div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-ink-muted">
                        <div>
                          {new Date(bill.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px]">
                          {new Date(bill.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer / Room */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink flex items-center gap-1.5">
                          {isRoom ? (
                            <span className="text-brand-forest font-bold bg-brand-forest/10 px-1.5 py-0.5 rounded text-[11px]">
                              Room {bill.room_number_snapshot || '—'}
                            </span>
                          ) : (
                            <span className="text-status-green font-bold bg-status-green/10 px-1.5 py-0.5 rounded text-[11px]">
                              Walk-in {bill.table_number ? `(${bill.table_number})` : ''}
                            </span>
                          )}
                          <span className="truncate max-w-[140px]">{bill.customer_name}</span>
                        </div>
                        {bill.customer_phone && (
                          <div className="text-[10px] text-ink-muted mt-0.5">{bill.customer_phone}</div>
                        )}
                      </td>

                      {/* Meals & Items */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(bill.orders || []).map((o) => (
                            <span
                              key={o.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-sand text-ink"
                            >
                              {o.meal_type}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-ink-muted truncate max-w-[200px]">
                          {(bill.items || []).map((i) => `${i.quantity}× ${i.item_name_snapshot}`).join(', ')}
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-4 text-right">
                        <div className={`font-bold tabular-nums text-sm ${isVoid ? 'line-through text-ink-muted' : 'text-ink'}`}>
                          {formatCurrency(bill.grand_total)}
                        </div>
                        {bill.balance_due > 0 && bill.billing_mode !== 'charge_to_room' && (
                          <div className="text-[10px] text-status-amber font-semibold mt-0.5">
                            Due: {formatCurrency(bill.balance_due)}
                          </div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isVoid
                              ? 'bg-action-danger/15 text-action-danger'
                              : bill.payment_status === 'paid'
                              ? 'bg-status-green/15 text-status-green'
                              : bill.payment_status === 'charged_to_room'
                              ? 'bg-status-blue/15 text-status-blue'
                              : bill.payment_status === 'partially_paid'
                              ? 'bg-status-amber/15 text-status-amber'
                              : 'bg-status-amber/15 text-status-amber'
                          }`}
                        >
                          {isVoid ? 'Voided' : bill.payment_status === 'charged_to_room' ? 'Room Folio' : bill.payment_status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={FB_ROUTES.BILL_DETAIL(bill.id)}
                            className="p-1.5 rounded-md hover:bg-brand-sand text-ink-muted hover:text-brand-forest transition-colors cursor-pointer"
                            title="View Invoice & Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {bill.balance_due > 0 && !isVoid && bill.billing_mode !== 'charge_to_room' && (
                            <button
                              type="button"
                              onClick={() => setPaymentModalBill(bill)}
                              className="px-2 py-1 rounded bg-status-green/15 hover:bg-status-green text-status-green hover:text-white font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              + Pay
                            </button>
                          )}

                          {!isVoid && ['owner', 'manager'].includes(userRole) && (
                            <button
                              type="button"
                              onClick={() => setVoidModalBill(bill)}
                              className="p-1.5 rounded-md hover:bg-action-danger/10 text-ink-muted hover:text-action-danger transition-colors cursor-pointer"
                              title="Void / Cancel Bill"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalBill && (
        <RecordFBPaymentModal
          bill={paymentModalBill}
          onClose={() => setPaymentModalBill(null)}
        />
      )}

      {/* Void Bill Modal */}
      {voidModalBill && (
        <VoidFBBillModal
          bill={voidModalBill}
          onClose={() => setVoidModalBill(null)}
        />
      )}
    </div>
  );
}
