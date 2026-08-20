import { Settings, Percent, BedDouble, ArrowRight, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-brand-forest">Settings</h1>
        <p className="text-body text-ink-muted">Property and operational configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Room Categories */}
        <Link
          href="/settings/room-categories"
          className="bg-white rounded-xl border border-border-subtle p-6 space-y-3 hover:border-brand-forest/50 transition-colors shadow-2xs group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-brand-sand rounded-lg text-brand-forest group-hover:bg-brand-forest group-hover:text-white transition-colors">
                <BedDouble className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-brand-forest transition-colors" />
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-ink text-base">Room Categories</h3>
              <p className="text-caption text-ink-muted mt-1">
                Configure room types, weekday & weekend rates, and max occupancy
              </p>
            </div>
          </div>
          <span className="text-xs text-brand-forest font-medium">Manage Categories →</span>
        </Link>

        {/* GST & Taxes */}
        <Link
          href="/settings/gst"
          className="bg-white rounded-xl border border-border-subtle p-6 space-y-3 hover:border-brand-forest/50 transition-colors shadow-2xs group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-brand-sand rounded-lg text-brand-forest group-hover:bg-brand-forest group-hover:text-white transition-colors">
                <Percent className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-brand-forest transition-colors" />
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-ink text-base">GST &amp; Taxes</h3>
              <p className="text-caption text-ink-muted mt-1">
                Configure GST percentage, GSTIN, and tax invoice format in hotels.settings
              </p>
            </div>
          </div>
          <span className="text-xs text-brand-forest font-medium">Configure GST →</span>
        </Link>
        {/* Food Menu Management */}
        <Link
          href="/settings/food-menu"
          className="bg-white rounded-xl border border-border-subtle p-6 space-y-3 hover:border-brand-forest/50 transition-colors shadow-2xs group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-brand-sand rounded-lg text-brand-forest group-hover:bg-brand-forest group-hover:text-white transition-colors">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-brand-forest transition-colors" />
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-ink text-base">Food Menu</h3>
              <p className="text-caption text-ink-muted mt-1">
                Manage restaurant & room-service food items, categories, selling prices, and active availability
              </p>
            </div>
          </div>
          <span className="text-xs text-brand-forest font-medium">Manage Food Menu →</span>
        </Link>
      </div>
    </div>
  );
}

