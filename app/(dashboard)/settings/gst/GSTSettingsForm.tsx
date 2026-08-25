'use client';

import { useState } from 'react';
import { Percent, Check, AlertCircle, Building2, Receipt, Phone, Mail, MapPin } from 'lucide-react';
import { HotelSettings } from '../../../../lib/hotels/queries';
import { updateHotelSettingsAction } from '../../../../lib/hotels/actions';
import HotelLogoUpload from '../../../../components/settings/HotelLogoUpload';

interface GSTSettingsFormProps {
  hotelId: string;
  initialSettings: HotelSettings;
  hotelName: string;
}

export default function GSTSettingsForm({
  hotelId,
  initialSettings,
  hotelName,
}: GSTSettingsFormProps) {
  const [settings, setSettings] = useState<HotelSettings>(initialSettings);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialSettings.logo_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const gst_enabled = formData.get('gst_enabled') === 'on';
    const gst_percentage = Number(formData.get('gst_percentage')) || 12;
    const gst_number = formData.get('gst_number') as string;
    const pan_number = formData.get('pan_number') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const pin_code = formData.get('pin_code') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const formLogoUrl = (formData.get('logo_url') as string) || logoUrl || null;

    const payload: Partial<HotelSettings> = {
      gst_enabled,
      gst_percentage,
      gst_rate: gst_percentage,
      gst_number: gst_number.trim() || null,
      pan_number: pan_number.trim() || null,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pin_code: pin_code.trim(),
      phone: phone.trim(),
      email: email.trim(),
      logo_url: formLogoUrl ? formLogoUrl.trim() : null,
    };

    const result = await updateHotelSettingsAction(hotelId, payload);
    setIsSaving(false);

    if (result.success && result.settings) {
      setSettings(result.settings);
      setLogoUrl(result.settings.logo_url || null);
      setMessage({
        type: 'success',
        text: 'GST and tax settings saved successfully. All future bills will automatically use this configuration.',
      });
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Failed to save GST settings.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-status-green/10 border-status-green/30 text-status-green'
              : 'bg-action-danger/10 border-action-danger/30 text-action-danger'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tax Configuration Panel */}
      <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
          <Percent className="w-5 h-5 text-brand-forest" />
          <h2 className="text-h2 text-ink font-bold">GST &amp; Tax Rate</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-brand-sand/50 rounded-xl border border-border-subtle">
            <div>
              <label htmlFor="gst_enabled" className="text-sm font-bold text-ink block cursor-pointer">
                Enable GST Billing by Default
              </label>
              <p className="text-xs text-ink-muted">
                When enabled, checkout invoices calculate and display GST automatically.
              </p>
            </div>
            <input
              id="gst_enabled"
              name="gst_enabled"
              type="checkbox"
              defaultChecked={settings.gst_enabled ?? true}
              className="w-5 h-5 text-brand-forest rounded border-border-subtle focus:ring-brand-forest cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gst_percentage" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                GST Percentage (%) *
              </label>
              <input
                id="gst_percentage"
                name="gst_percentage"
                type="number"
                min="0"
                max="28"
                step="0.5"
                required
                defaultValue={settings.gst_percentage ?? settings.gst_rate ?? 12}
                className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink font-bold text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
              <p className="text-[11px] text-ink-muted mt-1">Standard hotel rate in India is typically 12% or 18%.</p>
            </div>

            <div>
              <label htmlFor="gst_number" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                GSTIN / Tax Number
              </label>
              <input
                id="gst_number"
                name="gst_number"
                type="text"
                defaultValue={settings.gst_number || ''}
                placeholder="e.g. 07AAACH7409R1ZZ"
                className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
              <p className="text-[11px] text-ink-muted mt-1">Appears on printable guest invoices.</p>
            </div>
          </div>

          <div>
            <label htmlFor="pan_number" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              PAN Number (Optional)
            </label>
            <input
              id="pan_number"
              name="pan_number"
              type="text"
              defaultValue={settings.pan_number || ''}
              placeholder="e.g. AAACH7409R"
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>
        </div>
      </div>

      {/* Hotel Branding & Logo Configuration Panel */}
      <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
          <Building2 className="w-5 h-5 text-brand-forest" />
          <div>
            <h2 className="text-h2 text-ink font-bold">Property Branding &amp; Logo</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Directly upload your official hotel logo. It will automatically be used on your PMS dashboard, guest folios, restaurant bills, banquet invoices, and PDF reports.
            </p>
          </div>
        </div>

        {/* Hidden input to preserve logo_url when saving general GST form */}
        <input type="hidden" name="logo_url" value={logoUrl || ''} />

        {/* Direct Upload Component */}
        <HotelLogoUpload
          currentLogoUrl={logoUrl}
          hotelName={hotelName}
          onLogoChange={(newLogoUrl) => {
            setLogoUrl(newLogoUrl);
            setSettings((prev) => ({ ...prev, logo_url: newLogoUrl }));
          }}
        />
      </div>

      {/* Invoice Header Details */}
      <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
          <MapPin className="w-5 h-5 text-brand-forest" />
          <h2 className="text-h2 text-ink font-bold">Property Invoice Header Details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Street Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={settings.address || 'Nature Valley Road, Green Hills'}
              className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                defaultValue={settings.city || 'Mussoorie'}
                className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                defaultValue={settings.state || 'Uttarakhand'}
                className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
            <div>
              <label htmlFor="pin_code" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                PIN Code
              </label>
              <input
                id="pin_code"
                name="pin_code"
                type="text"
                defaultValue={settings.pin_code || '248179'}
                className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Contact Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                defaultValue={settings.phone || '+91 98765 43210'}
                className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Contact Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={settings.email || 'contact@hotelgreeneryview.com'}
                className="w-full px-3.5 py-2.5 bg-brand-sand/30 border border-border-subtle rounded-lg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest min-h-touch"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-forest hover:bg-brand-forest-light text-white text-sm font-medium transition-colors cursor-pointer min-h-touch flex items-center justify-center gap-2"
        >
          {isSaving ? <span>Saving Settings...</span> : <span>Save GST &amp; Tax Settings</span>}
        </button>
      </div>
    </form>
  );
}
