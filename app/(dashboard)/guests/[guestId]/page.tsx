import { getGuestById } from '../../../../lib/guests/queries';
import { getGuestDocuments } from '../../../../lib/guests/documents';
import { getBookings } from '../../../../lib/bookings/queries';
import { getCurrentStaff } from '../../../../lib/auth/session';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, MapPin, FileText, Calendar, CreditCard, BedDouble, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatCurrency } from '../../../../lib/utils/currency';
import { formatDate } from '../../../../lib/utils/dates';
import { maskIdNumber } from '../../../../lib/utils/idExtractor';
import GuestDocumentCard from '../../../../components/guests/GuestDocumentCard';

export const dynamic = 'force-dynamic';

interface GuestDetailPageProps {
  params: { guestId: string };
}

export default async function GuestDetailPage({ params }: GuestDetailPageProps) {
  const [guest, guestBookings, documents, staff] = await Promise.all([
    getGuestById(params.guestId),
    getBookings({ guestId: params.guestId }),
    getGuestDocuments(params.guestId),
    getCurrentStaff(),
  ]);

  if (!guest) {
    notFound();
  }

  const canManage = staff?.role === 'owner' || staff?.role === 'manager';
  const validBookings = guestBookings.filter((b) => b.booking_status !== 'cancelled');
  const totalStays = guest.total_stays ?? validBookings.length;
  const totalSpent = guest.total_spent ?? validBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const totalPaid = validBookings.reduce((sum, b) => {
    const payments = b.payments || [];
    return sum + payments.reduce((pSum, p) => pSum + (Number(p.amount) || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border-subtle">
        <Link
          href="/guests"
          className="p-2 rounded-lg bg-white border border-border-subtle text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-display text-brand-forest">{guest.full_name}</h1>
            {totalStays >= 2 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-forest/10 text-brand-forest border border-brand-forest/20">
                Repeat Guest ({totalStays} stays)
              </span>
            )}
          </div>
          <p className="text-body text-ink-muted">Guest profile, ID verification, and stay history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Identity Documents */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center text-brand-forest">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-ink text-base">{guest.full_name}</h2>
                <p className="text-xs text-ink-muted">Member since {formatDate(guest.created_at)}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border-subtle text-xs">
              <div className="flex items-center gap-2 text-ink">
                <Phone className="w-4 h-4 text-ink-muted shrink-0" />
                <span className="font-medium">{guest.phone}</span>
              </div>

              {guest.email && (
                <div className="flex items-center gap-2 text-ink">
                  <Mail className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>{guest.email}</span>
                </div>
              )}

              {guest.address && (
                <div className="flex items-center gap-2 text-ink">
                  <MapPin className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>{guest.address}</span>
                </div>
              )}

              {guest.id_type && (
                <div className="flex items-center gap-2 text-ink">
                  <FileText className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>
                    {guest.id_type}: <strong className="font-mono">{maskIdNumber(guest.id_type, guest.id_number)}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="pt-3 border-t border-border-subtle grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-brand-sand/40 rounded-xl">
                <p className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">Total Stays</p>
                <p className="text-xl font-bold text-ink mt-0.5 tabular-nums">{totalStays}</p>
              </div>
              <div className="p-3 bg-brand-sand/40 rounded-xl">
                <p className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">Total Spent</p>
                <p className="text-xl font-bold text-brand-forest mt-0.5 tabular-nums">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </div>

          {/* Identity Documents Card */}
          <GuestDocumentCard
            guestId={guest.id}
            guestName={guest.full_name}
            initialDocuments={documents}
            idType={guest.id_type}
            idNumber={guest.id_number}
            canManage={canManage}
          />
        </div>

        {/* Stay & Booking History */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-h2 text-ink font-bold">Booking History ({guestBookings.length})</h2>

          {guestBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-subtle p-8 text-center text-ink-muted shadow-2xs">
              No previous bookings recorded for this guest.
            </div>
          ) : (
            <div className="space-y-3">
              {guestBookings.map((b) => {
                const isCheckedIn = b.booking_status === 'checked_in';
                const isCheckedOut = b.booking_status === 'checked_out';
                const isConfirmed = b.booking_status === 'confirmed';

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-border-subtle p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-ink">{b.booking_number}</span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            isCheckedIn
                              ? 'bg-status-green/15 text-status-green border border-status-green/30'
                              : isCheckedOut
                              ? 'bg-ink-muted/15 text-ink-muted border border-ink-muted/30'
                              : 'bg-status-blue/15 text-status-blue border border-status-blue/30'
                          }`}
                        >
                          {b.booking_status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-ink">
                        <span className="font-semibold text-brand-forest font-serif">
                          Room {b.room?.room_number || '—'} ({b.room?.category?.name || 'Standard'})
                        </span>
                        <span className="text-ink-muted">•</span>
                        <span className="text-ink-muted">
                          {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                      <div className="text-right">
                        <p className="text-xs font-bold text-ink tabular-nums">{formatCurrency(b.total_amount)}</p>
                        <p className="text-[11px] text-ink-muted capitalize">{b.payment_status.replace('_', ' ')}</p>
                      </div>

                      <Link
                        href={`/billing/${b.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-brand-sand hover:bg-brand-sand-dark text-ink text-xs font-medium transition-colors"
                      >
                        View Bill
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
