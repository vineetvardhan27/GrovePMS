import { localPaymentsStore } from '../../../lib/bookings/queries';
import { localBookingsStore } from '../../../lib/bookings/queries';
import PaymentsList from '../../../components/payments/PaymentsList';

export default async function PaymentsPage() {
  // Build enriched payment records with booking/guest context
  const payments = localPaymentsStore.map((p) => {
    const booking = localBookingsStore.find((b) => b.id === p.booking_id);
    return {
      ...p,
      booking_number: booking?.booking_number ?? '—',
      guest_name: booking?.guest.full_name ?? 'Unknown Guest',
      guest_phone: booking?.guest.phone ?? '',
      room_number: booking?.room.room_number ?? '—',
    };
  });

  // Today's collection
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotal = payments
    .filter((p) => p.created_at.startsWith(todayStr))
    .reduce((sum, p) => sum + p.amount, 0);

  const allTimeTotal = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Payments & Collections</h1>
        <p className="text-body text-ink-muted">
          All payment transactions — advances, partial payments, and settlements
        </p>
      </div>

      <PaymentsList
        payments={payments}
        todayTotal={todayTotal}
        allTimeTotal={allTimeTotal}
      />
    </div>
  );
}
