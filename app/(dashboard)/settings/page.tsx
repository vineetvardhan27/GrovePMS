import { Percent, BedDouble, ArrowRight, UtensilsCrossed, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../../components/shared/PageHeader';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const settingsModules = [
    {
      title: 'Staff & Users',
      description:
        'Manage hotel staff accounts, operational roles (Owner, Manager, Reception, Housekeeping), and access status',
      actionText: 'Manage Staff & Team',
      href: '/settings/staff',
      icon: Users,
      illustration: (
        <svg
          className="w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 select-none pointer-events-none"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Soft background circle */}
          <circle cx="48" cy="48" r="36" fill="#EAF5EE" fillOpacity="0.85" />
          {/* Center Person */}
          <circle cx="48" cy="35" r="10" fill="#A8D8B6" />
          <path
            d="M30 68C30 58.0589 38.0589 50 48 50C57.9411 50 66 58.0589 66 68V72H30V68Z"
            fill="#CDEBD6"
          />
          {/* ID badge lanyard */}
          <path d="M44 50L48 60L52 50" stroke="#2E7D4F" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="45" y="60" width="6" height="8" rx="1" fill="#FFFFFF" stroke="#2E7D4F" strokeWidth="1" />
          {/* Left Person */}
          <circle cx="28" cy="40" r="7" fill="#CDEBD6" />
          <path
            d="M16 66C16 58.5 22 52 29 52C32 52 34 53 36 55C33 58 31 63 31 68H16V66Z"
            fill="#EAF5EE"
          />
          {/* Right Person */}
          <circle cx="68" cy="40" r="7" fill="#CDEBD6" />
          <path
            d="M80 66C80 58.5 74 52 67 52C64 52 62 53 60 55C63 58 65 63 65 68H80V66Z"
            fill="#EAF5EE"
          />
        </svg>
      ),
    },
    {
      title: 'Room Categories',
      description:
        'Configure room types, weekday & weekend rates, and max occupancy',
      actionText: 'Manage Categories',
      href: '/settings/room-categories',
      icon: BedDouble,
      illustration: (
        <svg
          className="w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 select-none pointer-events-none"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Soft background arch */}
          <path
            d="M28 84V40C28 28.9543 36.9543 20 48 20C59.0457 20 68 28.9543 68 40V84H28Z"
            fill="#EBF5EE"
            fillOpacity="0.85"
          />
          {/* Hotel Bed Headboard */}
          <rect x="22" y="46" width="52" height="16" rx="4" fill="#CDEBD6" fillOpacity="0.85" />
          {/* Pillows */}
          <rect x="26" y="50" width="18" height="9" rx="2.5" fill="#FFFFFF" stroke="#A8D8B6" strokeWidth="1.2" />
          <rect x="52" y="50" width="18" height="9" rx="2.5" fill="#FFFFFF" stroke="#A8D8B6" strokeWidth="1.2" />
          {/* Mattress & Duvet */}
          <rect x="18" y="60" width="60" height="18" rx="4" fill="#EAF5EE" />
          <path
            d="M18 64C18 61.7909 19.7909 60 22 60H74C76.2091 60 78 61.7909 78 64V76H18V64Z"
            fill="#CDEBD6"
            fillOpacity="0.9"
          />
          {/* Bed legs */}
          <rect x="22" y="76" width="4" height="6" rx="1" fill="#85C799" />
          <rect x="70" y="76" width="4" height="6" rx="1" fill="#85C799" />
          {/* Star accent */}
          <path d="M72 26L74 32L80 34L74 36L72 42L70 36L64 34L70 32L72 26Z" fill="#A8D8B6" />
        </svg>
      ),
    },
    {
      title: 'GST, Taxes & Hotel Branding',
      description:
        'Configure GST percentage, GSTIN, property address, contact details, and hotel logo',
      actionText: 'Configure Hotel & GST',
      href: '/settings/gst',
      icon: Percent,
      illustration: (
        <svg
          className="w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 select-none pointer-events-none"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Background document */}
          <rect x="22" y="16" width="44" height="58" rx="6" fill="#EBF5EE" fillOpacity="0.75" />
          <rect x="18" y="22" width="44" height="58" rx="6" fill="#FFFFFF" stroke="#CDEBD6" strokeWidth="1.5" />
          {/* Document lines */}
          <rect x="24" y="32" width="20" height="3" rx="1.5" fill="#A8D8B6" />
          <rect x="24" y="40" width="32" height="2" rx="1" fill="#D4EAD9" />
          <rect x="24" y="46" width="28" height="2" rx="1" fill="#D4EAD9" />
          <rect x="24" y="52" width="30" height="2" rx="1" fill="#D4EAD9" />
          {/* Official Tax Stamp */}
          <circle cx="58" cy="62" r="18" fill="#EAF5EE" stroke="#2E7D4F" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="58" cy="62" r="14" fill="#CDEBD6" fillOpacity="0.6" />
          {/* % Symbol */}
          <circle cx="55" cy="57" r="2" fill="#2E7D4F" />
          <circle cx="61" cy="67" r="2" fill="#2E7D4F" />
          <line x1="62" y1="56" x2="54" y2="68" stroke="#2E7D4F" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: 'Food Menu',
      description:
        'Manage restaurant & room-service food items, categories, selling prices, and active availability',
      actionText: 'Manage Food Menu',
      href: '/settings/food-menu',
      icon: UtensilsCrossed,
      illustration: (
        <svg
          className="w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 select-none pointer-events-none"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Soft background plate */}
          <circle cx="48" cy="48" r="34" fill="#EAF5EE" fillOpacity="0.8" />
          {/* Serving Cloche / Cover */}
          <path
            d="M24 64C24 46.3269 34.7452 32 48 32C61.2548 32 72 46.3269 72 64H24Z"
            fill="#CDEBD6"
            fillOpacity="0.85"
          />
          {/* Cloche knob */}
          <circle cx="48" cy="28" r="3.5" fill="#2E7D4F" />
          {/* Cloche tray plate */}
          <rect x="18" y="64" width="60" height="5" rx="2.5" fill="#A8D8B6" />
          {/* Steam aroma curves */}
          <path d="M38 24C37 20 39 17 41 15" stroke="#85C799" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M48 22C47 18 49 15 51 13" stroke="#85C799" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M58 24C57 20 59 17 61 15" stroke="#85C799" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Property, staff credentials, and operational configuration"
        icon={Settings}
      />

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {settingsModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.title}
              href={module.href}
              className="relative overflow-hidden bg-white rounded-xl border border-border-subtle p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-brand-forest/40 hover:-translate-y-0.5 transition-all duration-200 ease-out group flex flex-col justify-between min-h-[170px] sm:min-h-[185px] cursor-pointer"
            >
              {/* Top Content */}
              <div className="space-y-3 z-10">
                {/* Icon & Arrow Row */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-sand/70 border border-border-subtle/60 text-brand-forest flex items-center justify-center group-hover:bg-brand-forest group-hover:text-white transition-colors duration-200 shadow-2xs">
                    <Icon className="w-5 h-5 transition-colors" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-muted/70 group-hover:text-brand-forest group-hover:translate-x-1 transition-all duration-200" />
                </div>

                {/* Title & Description */}
                <div className="pr-12 sm:pr-16">
                  <h2 className="font-serif font-bold text-ink text-base sm:text-lg group-hover:text-brand-forest transition-colors">
                    {module.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action Link */}
              <div className="mt-5 z-10 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-forest group-hover:underline flex items-center gap-1">
                  <span>{module.actionText}</span>
                  <span className="text-xs">→</span>
                </span>
              </div>

              {/* Contextual Vector Illustration in Lower-Right */}
              <div className="absolute right-2 bottom-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0">
                {module.illustration}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


