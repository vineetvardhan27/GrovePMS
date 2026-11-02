'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Check, AlertCircle } from 'lucide-react';
import { BillingCustomerRecord } from './types';

interface BillingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: BillingCustomerRecord | null;
  onSave: (updatedData: Partial<BillingCustomerRecord>) => Promise<void>;
}

export default function BillingDetailsModal({
  isOpen,
  onClose,
  currentCustomer,
  onSave,
}: BillingDetailsModalProps) {
  const [formData, setFormData] = useState({
    customer_name: currentCustomer?.customer_name || '',
    email: currentCustomer?.email || '',
    phone: currentCustomer?.phone || '',
    billing_address: currentCustomer?.billing_address || '',
    city: currentCustomer?.city || '',
    state: currentCustomer?.state || '',
    gstin: currentCustomer?.gstin || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        customer_name: currentCustomer.customer_name || '',
        email: currentCustomer.email || '',
        phone: currentCustomer.phone || '',
        billing_address: currentCustomer.billing_address || '',
        city: currentCustomer.city || '',
        state: currentCustomer.state || '',
        gstin: currentCustomer.gstin || '',
      });
    }
  }, [currentCustomer]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      setError('Legal entity or contact name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Invoicing email is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update billing details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#1C2D29]/15 shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-5 animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-brand-sand/50 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-forest/10 border border-brand-forest/20 text-brand-forest flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#142320]">
              Update Billing &amp; Tax Profile
            </h3>
            <p className="text-xs text-ink-muted">
              These details will appear on all future GST invoices and tax receipts.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-status-red/10 border border-status-red/25 text-status-red text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer / Legal Name */}
          <div>
            <label className="block font-medium text-ink mb-1">
              Legal Business Name / Property Legal Entity <span className="text-status-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="e.g. Greenery View Hospitality Pvt. Ltd."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#1C2D29]/15 focus:outline-hidden focus:border-brand-forest bg-white/70 text-ink text-xs transition-colors"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">
                Invoicing Email <span className="text-status-red">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="accounts@hotel.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1C2D29]/15 focus:outline-hidden focus:border-brand-forest bg-white/70 text-ink text-xs transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Billing Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1C2D29]/15 focus:outline-hidden focus:border-brand-forest bg-white/70 text-ink text-xs transition-colors"
              />
            </div>
          </div>

          {/* Billing Street Address */}
          <div>
            <label className="block font-medium text-ink mb-1">Registered Street Address</label>
            <input
              type="text"
              value={formData.billing_address}
              onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
              placeholder="Plot No. 42, Civil Lines"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#1C2D29]/15 focus:outline-hidden focus:border-brand-forest bg-white/70 text-ink text-xs transition-colors"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Jaipur"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1C2D29]/15 focus:outline-hidden focus:border-brand-forest bg-white/70 text-ink text-xs transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Rajasthan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#1C2D29]/15 focus:outline-hidden focus:border-brand-forest bg-white/70 text-ink text-xs transition-colors"
              />
            </div>
          </div>

          {/* GSTIN */}
          <div>
            <label className="block font-medium text-ink mb-1">
              GSTIN <span className="text-ink-muted text-[11px]">(Optional for B2B input tax credit)</span>
            </label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              placeholder="08AAACH7409R1ZZ"
              maxLength={15}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#1C2D29]/15 focus:outline-hidden focus:border-brand-forest bg-white/70 text-ink text-xs font-mono uppercase transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#1C2D29]/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-brand-sand/40 text-ink border border-[#1C2D29]/15 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-forest hover:bg-[#15302B] text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

