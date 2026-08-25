'use client';

import React from 'react';

import { useAuth } from '../providers/AuthProvider';

export interface HotelInvoiceHeaderProps {
  hotelName?: string;
  logoUrl?: string | null;
  subtitle?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  gstNumber?: string | null;
  panNumber?: string | null;
  rightContent?: React.ReactNode;
  className?: string;
}

/**
 * Shared Authoritative Hotel Invoice & Bill Header
 * Dynamically renders the current hotel's custom logoUrl and name across all PMS billing documents
 * (Room Billing Invoices, Guest Folios, F&B Invoices, Banquet Invoices, and Payment Receipts).
 */
export default function HotelInvoiceHeader({
  hotelName = 'HOTEL GREENERY VIEW',
  logoUrl,
  subtitle = 'BOUTIQUE HOSPITALITY & LUXURY STAY',
  address,
  city,
  phone,
  email,
  gstNumber,
  panNumber,
  rightContent,
  className = '',
}: HotelInvoiceHeaderProps) {
  const { hotelLogoUrl } = useAuth();
  const displayAddress = address || 'Hotel Greenery View, ICAR Road, Lingding Post Office Tadong, Pin 737102, Gangtok, Sikkim, India';
  const displayCity = city || 'Gangtok';
  const displayPhone = phone || '+91 9732378888';
  const displayEmail = email || 'hotelgreeneryview@gmail.com';
  const displayLogo = logoUrl || hotelLogoUrl || '/logo.png';

  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-border-subtle ${className}`}
    >
      {/* Left: Official Hotel Logo & Branding */}
      <div className="flex items-start gap-3.5 max-w-lg">
        <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center p-1 border border-border-subtle shrink-0 shadow-2xs overflow-hidden">
          {displayLogo ? (
            <img
              src={displayLogo}
              alt={hotelName}
              className="max-h-full max-w-full object-contain"
              loading="eager"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-brand-forest text-white font-bold font-serif text-sm flex items-center justify-center">
              {hotelName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-forest tracking-tight leading-tight">
            {hotelName}
          </h2>
          {subtitle && (
            <p className="text-[10px] sm:text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              {subtitle}
            </p>
          )}
          <p className="text-xs text-ink-muted pt-0.5 leading-relaxed">
            {displayAddress}
            {city && !displayAddress.includes(city) ? `, ${city}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted pt-0.5">
            {displayPhone && <span><strong>Ph:</strong> {displayPhone}</span>}
            {displayEmail && <span>• <strong>Email:</strong> {displayEmail}</span>}
          </div>

          {(gstNumber || panNumber) && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
              {gstNumber && (
                <span className="bg-brand-forest/10 text-brand-forest px-2 py-0.5 rounded font-semibold">
                  GSTIN: {gstNumber}
                </span>
              )}
              {panNumber && (
                <span className="bg-brand-sand px-2 py-0.5 rounded text-ink font-medium border border-border-subtle">
                  PAN: {panNumber}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Invoice Metadata Slot */}
      {rightContent && (
        <div className="w-full sm:w-auto sm:text-right space-y-1 shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
}
