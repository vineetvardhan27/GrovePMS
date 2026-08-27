'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Users,
  Calendar,
  Clock,
} from 'lucide-react';

interface PropertyStatusCardsProps {
  stats: {
    available: number;
    occupied: number;
    reserved: number;
    arrivingToday: number;
  };
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const duration = 600; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (value - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function PropertyStatusCards({ stats }: PropertyStatusCardsProps) {
  const cards = [
    {
      label: 'AVAILABLE ROOMS',
      value: stats.available,
      subtitle: 'Rooms available',
      href: '/rooms',
      textColor: 'text-status-green',
      icon: CheckCircle2,
      iconBadgeBg: 'bg-[#EBF5EE] text-status-green border border-[#D4EAD9]',
      illustration: (
        <svg
          className="w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 select-none pointer-events-none"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Arch doorway background */}
          <path
            d="M26 80V34C26 21.8497 35.8497 12 48 12C60.1503 12 70 21.8497 70 34V80H26Z"
            fill="#EAF5EE"
            fillOpacity="0.9"
          />
          {/* Open door panel */}
          <path
            d="M44 26L64 30V78L44 74V26Z"
            fill="#CDEBD6"
            fillOpacity="0.85"
          />
          <circle cx="60" cy="53" r="1.75" fill="#2E7D4F" fillOpacity="0.7" />
          {/* Potted plant beside door */}
          <path
            d="M13 78H23L21 64H15L13 78Z"
            fill="#E0D7D0"
          />
          <path
            d="M18 64C18 64 12 55 13 46C14 38 18 36 18 36C18 36 22 38 23 46C24 55 18 64 18 64Z"
            fill="#A8D8B6"
          />
          <path
            d="M18 55C18 55 9 49 11 41C13 35 18 39 18 39"
            stroke="#85C799"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M18 55C18 55 27 49 25 41C23 35 18 39 18 39"
            stroke="#85C799"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: 'OCCUPIED ROOMS',
      value: stats.occupied,
      subtitle: 'Rooms currently occupied',
      href: '/rooms',
      textColor: 'text-status-red',
      icon: Users,
      iconBadgeBg: 'bg-[#FDF0EE] text-status-red border border-[#F9D6D2]',
      illustration: (
        <svg
          className="w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 select-none pointer-events-none"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Headboard */}
          <rect
            x="14"
            y="32"
            width="52"
            height="18"
            rx="4"
            fill="#FCDAD6"
            fillOpacity="0.75"
          />
          {/* Pillows */}
          <rect
            x="18"
            y="37"
            width="18"
            height="10"
            rx="3"
            fill="#FFFFFF"
            stroke="#F7B8B0"
            strokeWidth="1.5"
          />
          <rect
            x="44"
            y="37"
            width="18"
            height="10"
            rx="3"
            fill="#FFFFFF"
            stroke="#F7B8B0"
            strokeWidth="1.5"
          />
          {/* Mattress & Duvet */}
          <rect
            x="10"
            y="48"
            width="60"
            height="20"
            rx="4"
            fill="#FDF0EE"
          />
          <path
            d="M10 54C10 51.7909 11.7909 50 14 50H66C68.2091 50 70 51.7909 70 54V68H10V54Z"
            fill="#FCDAD6"
            fillOpacity="0.8"
          />
          {/* Bed legs */}
          <rect x="14" y="68" width="4" height="6" rx="1" fill="#E68C83" />
          <rect x="62" y="68" width="4" height="6" rx="1" fill="#E68C83" />
        </svg>
      ),
    },
    {
      label: 'RESERVED ROOMS',
      value: stats.reserved,
      subtitle: 'Rooms reserved',
      href: '/bookings',
      textColor: 'text-status-blue',
      icon: Calendar,
      iconBadgeBg: 'bg-[#EEF5FB] text-status-blue border border-[#D5E6F6]',
      illustration: (
        <svg
          className="w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 select-none pointer-events-none"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Background card offset */}
          <rect
            x="22"
            y="18"
            width="44"
            height="50"
            rx="6"
            fill="#D5E6F6"
            fillOpacity="0.6"
          />
          {/* Main calendar card */}
          <rect
            x="16"
            y="24"
            width="48"
            height="48"
            rx="6"
            fill="#FFFFFF"
            stroke="#D5E6F6"
            strokeWidth="1.5"
          />
          {/* Top header strip */}
          <path
            d="M16 30C16 26.6863 18.6863 24 22 24H58C61.3137 24 64 26.6863 64 30V35H16V30Z"
            fill="#EEF5FB"
          />
          {/* Calendar spiral rings */}
          <rect x="26" y="20" width="4" height="8" rx="2" fill="#2B5C8A" fillOpacity="0.6" />
          <rect x="50" y="20" width="4" height="8" rx="2" fill="#2B5C8A" fillOpacity="0.6" />
          {/* Calendar date grid */}
          <rect x="23" y="42" width="6" height="5" rx="1.5" fill="#A8CEF0" />
          <rect x="37" y="42" width="6" height="5" rx="1.5" fill="#A8CEF0" />
          <rect x="51" y="42" width="6" height="5" rx="1.5" fill="#2B5C8A" fillOpacity="0.8" />
          <rect x="23" y="53" width="6" height="5" rx="1.5" fill="#A8CEF0" />
          <rect x="37" y="53" width="6" height="5" rx="1.5" fill="#A8CEF0" />
          <rect x="51" y="53" width="6" height="5" rx="1.5" fill="#A8CEF0" />
        </svg>
      ),
    },
    {
      label: 'ARRIVING TODAY',
      value: stats.arrivingToday,
      subtitle: 'Check-ins today',
      href: '/bookings',
      textColor: 'text-status-amber',
      icon: Clock,
      iconBadgeBg: 'bg-[#FEF7EC] text-status-amber border border-[#FCE6C7]',
      illustration: (
        <svg
          className="w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 select-none pointer-events-none"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Trolley handle */}
          <path
            d="M48 20V12C48 10.8954 48.8954 10 50 10H58C59.1046 10 60 10.8954 60 12V20"
            stroke="#D68A2C"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Main trolley suitcase */}
          <rect
            x="42"
            y="20"
            width="24"
            height="48"
            rx="5"
            fill="#FEEFD8"
            stroke="#FCDFB5"
            strokeWidth="1.5"
          />
          {/* Ribbed lines on suitcase */}
          <line x1="46" y1="32" x2="62" y2="32" stroke="#F8CCA0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="46" y1="44" x2="62" y2="44" stroke="#F8CCA0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="46" y1="56" x2="62" y2="56" stroke="#F8CCA0" strokeWidth="1.5" strokeLinecap="round" />
          {/* Trolley wheels */}
          <circle cx="47" cy="70" r="2.5" fill="#A88B74" />
          <circle cx="61" cy="70" r="2.5" fill="#A88B74" />

          {/* Small duffel / carry-on in front */}
          <rect
            x="18"
            y="46"
            width="22"
            height="22"
            rx="4"
            fill="#FFF8F0"
            stroke="#FCDFB5"
            strokeWidth="1.5"
          />
          <path
            d="M25 46V41C25 40.1 25.7 39.4 26.6 39.4H31.4C32.3 39.4 33 40.1 33 41V46"
            stroke="#D68A2C"
            strokeWidth="1.5"
          />
          <line x1="18" y1="57" x2="40" y2="57" stroke="#FCDFB5" strokeWidth="1.5" />
          <circle cx="22" cy="70" r="2" fill="#A88B74" />
          <circle cx="36" cy="70" r="2" fill="#A88B74" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
        Current Property Status
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="relative overflow-hidden bg-white rounded-xl border border-border-subtle p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-ink-muted/30 transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[124px] sm:min-h-[136px]"
            >
              {/* Top Row: Label & Status Icon */}
              <div className="flex items-start justify-between gap-2 z-10">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-ink">
                  {card.label}
                </span>
                <div
                  className={`p-1.5 rounded-full shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105 ${card.iconBadgeBg}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* Middle Row: Large Tabular Number */}
              <div className="my-1 z-10">
                <p className={`text-2xl sm:text-3xl lg:text-[32px] font-bold font-sans tabular-nums leading-none ${card.textColor}`}>
                  <AnimatedNumber value={card.value} />
                </p>
              </div>

              {/* Bottom Row: Supporting Subtitle */}
              <div className="z-10">
                <p className="text-[11px] sm:text-xs text-ink-muted font-normal truncate">
                  {card.subtitle}
                </p>
              </div>

              {/* Contextual Illustration in Bottom Right */}
              <div className="absolute right-1.5 bottom-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0">
                {card.illustration}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
