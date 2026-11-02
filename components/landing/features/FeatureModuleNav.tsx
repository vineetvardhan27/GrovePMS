import React from 'react';
import Link from 'next/link';
import {
  BedDouble,
  CalendarCheck,
  CreditCard,
  Users,
  Warehouse,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

interface FeatureModuleNavProps {
  currentSlug: string;
}

const allModules = [
  {
    slug: 'room-management',
    name: 'Room Management',
    desc: 'Visual matrix & housekeeping states',
    icon: BedDouble,
    href: '/features/room-management',
  },
  {
    slug: 'reservations',
    name: 'Reservations',
    desc: 'Tape chart, calendar & deposit tracking',
    icon: CalendarCheck,
    href: '/features/reservations',
  },
  {
    slug: 'billing-and-payments',
    name: 'Billing & Folios',
    desc: 'Automated GST invoices & split payments',
    icon: CreditCard,
    href: '/features/billing-and-payments',
  },
  {
    slug: 'guest-management',
    name: 'Guest CRM',
    desc: 'Verified dossier & stay history',
    icon: Users,
    href: '/features/guest-management',
  },
  {
    slug: 'inventory-management',
    name: 'Inventory & Stock',
    desc: 'Par levels & supplier purchase orders',
    icon: Warehouse,
    href: '/features/inventory-management',
  },
  {
    slug: 'reports',
    name: 'Reports & Analytics',
    desc: 'Manager flash reports & RevPAR metrics',
    icon: BarChart3,
    href: '/features/reports',
  },
];

export default function FeatureModuleNav({ currentSlug }: FeatureModuleNavProps) {
  const otherModules = allModules.filter((m) => m.slug !== currentSlug);

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-[28px] sm:rounded-[36px] bg-white/70 backdrop-blur-xl border border-white/80 p-6 sm:p-10 shadow-[0_12px_40px_rgba(20,28,26,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C2D29]/8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-forest/70 block mb-1">
              Grove Unified Hospitality OS
            </span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-brand-forest">
              Explore Connected Operational Modules
            </h3>
          </div>
          <Link
            href="/hotel-management-software"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-forest hover:text-brand-forest-light transition-colors"
          >
            <span>View All Capabilities Overview</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {otherModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.slug}
                href={mod.href}
                className="group p-4 rounded-2xl bg-white/80 hover:bg-white border border-[#1C2D29]/8 hover:border-brand-forest/30 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-brand-forest/10 text-brand-forest flex items-center justify-center mb-2.5 group-hover:bg-brand-forest group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#142320] group-hover:text-brand-forest transition-colors leading-tight">
                    {mod.name}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-[#1C2D29]/6 flex items-center justify-between text-[11px] font-semibold text-brand-forest">
                  <span>Explore module</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

