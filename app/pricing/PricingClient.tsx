'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import {
  useInView,
  useReducedMotion,
  useIsMobile,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  FloatingCard,
} from '@/components/landing/animations';
import {
  Check,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CalendarCheck2,
  Users,
  Receipt,
  PackageCheck,
  UtensilsCrossed,
  PartyPopper,
  BarChart3,
  Layers,
  CheckCircle2,
  Building2,
  PhoneCall,
  ArrowUpRight,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';

/* ══════════════════════════════════════════════
 * TYPES & STATIC DATA
 * ══════════════════════════════════════════════ */

interface PricingClientProps {
  staffName?: string;
  staffRole?: string;
}

const faqsList = [
  {
    q: 'Is the ₹10,000 onboarding payment recurring?',
    a: 'No. The ₹10,000 onboarding fee is strictly a one-time investment. Once your hotel is fully configured, tested, and operational, you only pay the monthly subscription of ₹999.',
  },
  {
    q: 'What is the monthly subscription fee?',
    a: 'Grove PMS is ₹999 per month for the complete hotel operating system. There are no surprise per-booking commissions or percentage cuts of your hotel revenue.',
  },
  {
    q: 'What exactly is included in the white-glove onboarding?',
    a: 'Our hospitality specialists configure your entire property setup: room inventory & floor mapping, seasonal tariff slabs, staff role permissions, hotel branding & invoice letterheads, GSTIN/SAC tax rules, data migration of existing guest records, and hands-on staff training.',
  },
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes. There are no mandatory multi-year lock-in contracts. You can cancel your monthly subscription according to standard terms with full data export options.',
  },
  {
    q: 'Is Grove suitable for boutique hotels, homestays, and guesthouses?',
    a: 'Grove was purpose-built for independent hotels, boutique properties, homestays, and boutique chains (typically 5 to 100+ rooms) that need enterprise-grade power without enterprise complexity.',
  },
  {
    q: 'Can multiple staff members use Grove simultaneously?',
    a: 'Yes. Grove provides role-based access for Owners, General Managers, Front Desk Receptionists, and Housekeeping staff with isolated privilege controls.',
  },
  {
    q: 'Does Grove generate GST-compliant tax invoices?',
    a: 'Yes. Grove features native Indian GST support: automated CGST, SGST, and IGST calculations, SAC codes, state tax jurisdiction rules, serial numbering, and monthly GSTR summary exports.',
  },
  {
    q: 'How is our hotel data secured and backed up?',
    a: 'Grove runs on PostgreSQL with strict tenant-isolated Row-Level Security (RLS) policies. All communication is encrypted via TLS/HTTPS, and automated off-site backups run continuously.',
  },
  {
    q: 'What about Channel Manager and OTA integrations?',
    a: 'Direct OTA two-way synchronization and Channel Manager integrations are currently in active development as part of our upcoming Growth and Pro tiers.',
  },
  {
    q: 'Do you provide live training for our front desk team?',
    a: 'Yes. As part of your white-glove onboarding, we conduct live interactive training sessions for your front desk and management staff to ensure everyone is confident on day one.',
  },
];

const coreFeatureRows = [
  [
    'Reservations & room availability',
    'Express check-in / check-out',
  ],
  [
    'Guest profiles & folios',
    'GST-ready invoicing',
  ],
  [
    'Multi-mode payments',
    'Inventory & stock tracking',
  ],
  [
    'Daily revenue reports',
    'Cloud backups & security',
  ],
];

const onboardingServices = [
  {
    step: '01',
    title: 'Property & Policies',
    desc: 'Hotel identity, check-in/out policies, operational defaults, and cancellation rules.',
  },
  {
    step: '02',
    title: 'Room & Floor Mapping',
    desc: 'Room numbers, floor layouts, categories, bed types, and base tariff setup.',
  },
  {
    step: '03',
    title: 'Staff Roles & Access',
    desc: 'Owner, Manager, Reception, and Housekeeping accounts with granular permissions.',
  },
  {
    step: '04',
    title: 'Branding & Invoicing',
    desc: 'Hotel logo, contact coordinates, bank payment details, and custom letterheads.',
  },
  {
    step: '05',
    title: 'GST & Tax Configuration',
    desc: 'GSTIN, SAC codes, CGST/SGST/IGST tax slabs, and invoice serial sequencing.',
  },
  {
    step: '06',
    title: 'Data Migration Support',
    desc: 'Assistance importing your existing guest ledgers, room lists, and operational data.',
  },
  {
    step: '07',
    title: 'Staff Training Walkthrough',
    desc: 'Hands-on guided walkthrough for front desk and management so your team is day-one ready.',
  },
  {
    step: '08',
    title: 'Production Setup & Go-Live',
    desc: 'Dedicated tenant cloud database instance with automated encrypted backups.',
  },
];

/* ══════════════════════════════════════════════
 * SMOOTH FAQ ACCORDION ITEM
 * ══════════════════════════════════════════════ */
function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  id,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`border-b border-border-subtle transition-colors duration-200 ${
        isOpen ? 'border-brand-forest/30 bg-brand-sand/30' : 'hover:border-border-subtle/80'
      }`}
    >
      <button
        type="button"
        id={`faq-btn-${id}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${id}`}
        onClick={onToggle}
        className="w-full py-5 sm:py-6 px-3 sm:px-4 text-left flex items-center justify-between gap-4 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest/40 focus-visible:ring-offset-2 rounded-lg"
      >
        <span
          className={`font-serif text-base sm:text-lg transition-colors duration-200 leading-snug ${
            isOpen ? 'font-bold text-brand-forest' : 'font-semibold text-ink group-hover:text-brand-forest'
          }`}
        >
          {question}
        </span>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
            isOpen
              ? 'bg-brand-forest text-white border-brand-forest rotate-180'
              : 'border-border-subtle text-ink-muted group-hover:border-brand-forest/40 group-hover:text-brand-forest'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      <div
        id={`faq-panel-${id}`}
        role="region"
        aria-labelledby={`faq-btn-${id}`}
        style={{ height: `${height}px` }}
        className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div ref={contentRef} className="px-3 sm:px-4 pb-5 sm:pb-6 pt-1">
          <p
            className={`text-sm sm:text-[15px] text-ink-muted leading-relaxed max-w-3xl transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
 * HOW IT WORKS — SCROLL-LINKED HORIZONTAL TIMELINE
 * ══════════════════════════════════════════════ */
function HowItWorks({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const rafRef = useRef<number>(0);

  const steps = [
    {
      num: '01',
      eyebrow: 'CONFIGURE',
      title: 'Property & Rooms',
      desc: 'We map your hotel rooms, floor plans, tax slabs, rate categories, and operational policies.',
    },
    {
      num: '02',
      eyebrow: 'IMPORT',
      title: 'Data & Staff',
      desc: 'We help import current guest registries, room data, and establish role-based staff accounts.',
    },
    {
      num: '03',
      eyebrow: 'TRAIN',
      title: 'Team Walkthrough',
      desc: 'Hands-on guided walkthrough for reception and managers on check-ins, folios, and GST billing.',
    },
    {
      num: '04',
      eyebrow: 'GO LIVE',
      title: 'Seamless Transition',
      desc: 'Your property starts running on Grove with dedicated live support during your first shift.',
    },
  ];

  // Node positions as fractions: 0%, 33.33%, 66.66%, 100%
  const nodePositions = [0, 33.33, 66.66, 100];

  // Scroll-linked progress: synced to when the section enters/exits viewport
  useEffect(() => {
    if (reduced) {
      setScrollProgress(100);
      setIsCardRevealed(true);
      return;
    }

    const el = sectionRef.current;
    if (!el) return;

    const handleScroll = () => {
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Start when section enters bottom of viewport (amount: 0.4)
        // End when section is 40% past the top of viewport
        const start = windowHeight;
        const end = -rect.height * 0.4;
        const current = rect.top;

        if (current >= start) {
          setScrollProgress(0);
        } else if (current <= end) {
          setScrollProgress(100);
        } else {
          const ratio = ((start - current) / (start - end)) * 100;
          setScrollProgress(Math.min(100, Math.max(0, ratio)));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  // Reveal the onboarding card when all 4 steps are reached
  useEffect(() => {
    if (scrollProgress >= 95 || reduced) {
      setIsCardRevealed(true);
    }
  }, [scrollProgress, reduced]);

  // Safety fallback: if inView for a while but card not yet revealed
  useEffect(() => {
    if (inView && !isCardRevealed) {
      const fallback = setTimeout(() => {
        setIsCardRevealed(true);
      }, 3000);
      return () => clearTimeout(fallback);
    }
  }, [inView, isCardRevealed]);

  // Check if a node is reached based on scroll progress
  const isNodeReached = (position: number) => scrollProgress >= position || reduced;
  // Check if a node is just recently reached (for glow effect)
  const isNodeActive = (position: number) =>
    scrollProgress >= position && scrollProgress < position + 12 && !reduced;

  return (
    <div ref={sectionRef} className="w-full">
      {/* ──────────────────────────────────────────
       * DESKTOP HORIZONTAL TIMELINE (≥ 900px)
       * ────────────────────────────────────────── */}
      <div className="hidden min-[900px]:block relative max-w-4xl mx-auto pt-8 pb-4">
        {/* === TRACK CONTAINER === */}
        <div className="relative" style={{ height: '36px' }}>
          {/* Background muted track line */}
          <div
            className="absolute top-1/2 left-[6%] right-[6%] h-[3px] rounded-full -translate-y-1/2"
            style={{ backgroundColor: '#d8d3c8' }}
          />

          {/* Animated green fill overlay line */}
          <div
            className="absolute top-1/2 left-[6%] right-[6%] h-[3px] rounded-full -translate-y-1/2 origin-left"
            style={{
              backgroundColor: '#1f3b32',
              transform: `scaleX(${reduced ? 1 : scrollProgress / 100})`,
              transition: reduced ? 'none' : 'transform 120ms ease-out',
            }}
          />

          {/* 4 Step Nodes positioned along the line */}
          {steps.map((step, i) => {
            const pos = nodePositions[i];
            const reached = isNodeReached(pos);
            const active = isNodeActive(pos);

            return (
              <div
                key={step.num}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                style={{ left: `calc(6% + ${pos}% * 0.88)` }}
              >
                {/* Node Circle */}
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: '36px',
                    height: '36px',
                  }}
                >
                  {/* Glow ring — appears when node is reached */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: reached
                        ? active
                          ? '0 0 0 6px rgba(31, 59, 50, 0.12), 0 0 20px rgba(31, 59, 50, 0.15)'
                          : '0 0 0 4px rgba(31, 59, 50, 0.06)'
                        : 'none',
                      transition: 'box-shadow 150ms ease-out',
                    }}
                  />

                  {/* Main circle */}
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: reached ? '28px' : '24px',
                      height: reached ? '28px' : '24px',
                      backgroundColor: reached ? '#1f3b32' : '#ffffff',
                      border: reached ? '3px solid #1f3b32' : '2.5px solid #d8d3c8',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    {/* Checkmark icon — fades in when reached */}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      style={{
                        opacity: reached ? 1 : 0,
                        transform: reached ? 'scale(1)' : 'scale(0.5)',
                        transition: 'opacity 150ms ease-out, transform 150ms ease-out',
                      }}
                    >
                      <path
                        d="M3.5 7L6 9.5L10.5 5"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* === STEP CONTENT CARDS === */}
        <div className="grid grid-cols-4 gap-5 mt-6 relative z-10">
          {steps.map((step, i) => {
            const pos = nodePositions[i];
            const reached = isNodeReached(pos);
            const cardDelay = i * 150; // 0.15s stagger

            return (
              <div
                key={step.num}
                className="text-center group cursor-default rounded-2xl p-4 transition-all duration-200"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(20px)',
                  transition: reduced
                    ? 'none'
                    : `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${cardDelay}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${cardDelay}ms`,
                }}
                onMouseEnter={(e) => {
                  if (isMobile || reduced) return;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(31, 61, 58, 0.10)';
                  e.currentTarget.style.backgroundColor = 'rgba(246, 242, 236, 0.5)';
                }}
                onMouseLeave={(e) => {
                  if (isMobile || reduced) return;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Eyebrow label */}
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.18em] block transition-colors duration-300 ${
                    reached ? 'text-brand-forest' : 'text-ink-muted/50'
                  }`}
                >
                  {step.eyebrow}
                </span>

                {/* Title */}
                <h4
                  className={`font-serif font-bold text-base sm:text-lg mt-1.5 transition-colors duration-300 ${
                    reached ? 'text-brand-forest' : 'text-ink-muted/70'
                  }`}
                >
                  {step.title}
                </h4>

                {/* Description */}
                <p
                  className={`text-xs mt-2 leading-relaxed max-w-[200px] mx-auto transition-all duration-300 ${
                    reached ? 'text-ink-muted opacity-100' : 'text-ink-muted/50 opacity-70'
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────
       * MOBILE / TABLET VERTICAL TIMELINE (< 900px)
       * ────────────────────────────────────────── */}
      <div className="min-[900px]:hidden relative pl-12 pr-2 py-4 max-w-md mx-auto">
        {/* Vertical background track */}
        <div className="absolute left-[17px] top-6 bottom-6 w-[3px] rounded-full" style={{ backgroundColor: '#d8d3c8' }}>
          {/* Animated green fill */}
          <div
            className="w-full rounded-full origin-top"
            style={{
              backgroundColor: '#1f3b32',
              height: '100%',
              transform: `scaleY(${reduced ? 1 : scrollProgress / 100})`,
              transition: reduced ? 'none' : 'transform 120ms ease-out',
            }}
          />
        </div>

        {/* Vertical Step Items */}
        <div className="space-y-8">
          {steps.map((step, i) => {
            const pos = nodePositions[i];
            const reached = isNodeReached(pos);
            const active = isNodeActive(pos);
            const cardDelay = i * 150;

            return (
              <div
                key={step.num}
                className="relative cursor-default"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(20px)',
                  transition: reduced
                    ? 'none'
                    : `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${cardDelay}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${cardDelay}ms`,
                }}
              >
                {/* Left Node Circle */}
                <div className="absolute left-[-44px] top-1 w-[36px] h-[36px] flex items-center justify-center z-10">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: reached
                        ? active
                          ? '0 0 0 5px rgba(31, 59, 50, 0.12), 0 0 16px rgba(31, 59, 50, 0.15)'
                          : '0 0 0 3px rgba(31, 59, 50, 0.06)'
                        : 'none',
                      transition: 'box-shadow 150ms ease-out',
                    }}
                  />
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: reached ? '26px' : '22px',
                      height: reached ? '26px' : '22px',
                      backgroundColor: reached ? '#1f3b32' : '#ffffff',
                      border: reached ? '3px solid #1f3b32' : '2.5px solid #d8d3c8',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      style={{
                        opacity: reached ? 1 : 0,
                        transform: reached ? 'scale(1)' : 'scale(0.5)',
                        transition: 'opacity 150ms ease-out, transform 150ms ease-out',
                      }}
                    >
                      <path
                        d="M3.5 7L6 9.5L10.5 5"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Right Content */}
                <div className="pt-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono text-xs font-bold tracking-wider ${
                        reached ? 'text-brand-forest' : 'text-ink-muted/50'
                      }`}
                    >
                      {step.num}
                    </span>
                    <span className="text-border-subtle text-xs">·</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                        reached ? 'text-brand-forest' : 'text-ink-muted/60'
                      }`}
                    >
                      {step.eyebrow}
                    </span>
                  </div>
                  <h4
                    className={`text-sm sm:text-base font-serif font-bold transition-colors duration-300 ${
                      reached ? 'text-ink' : 'text-ink-muted/70'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────
       * WHITE-GLOVE ONBOARDING CARD (PREMIUM FLOATING PANEL)
       * ────────────────────────────────────────── */}
      <div
        onMouseEnter={() => !isMobile && setIsCardHovered(true)}
        onMouseLeave={() => !isMobile && setIsCardHovered(false)}
        className="mt-12 sm:mt-16 bg-white rounded-[26px] sm:rounded-[32px] border border-[#DDD5C6]/90 overflow-hidden relative transition-all duration-500 will-change-transform"
        style={{
          opacity: isCardRevealed || reduced ? 1 : 0,
          transform: reduced
            ? 'none'
            : !isCardRevealed
            ? 'translateY(24px) scale(0.985)'
            : isCardHovered && !isMobile
            ? 'translateY(-4px) scale(1)'
            : 'translateY(0) scale(1)',
          boxShadow:
            isCardHovered && !reduced && !isMobile
              ? '0 4px 8px rgba(31, 61, 58, 0.04), 0 18px 42px -6px rgba(31, 61, 58, 0.09), 0 40px 84px -14px rgba(31, 61, 58, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.95)'
              : '0 2px 4px rgba(31, 61, 58, 0.03), 0 12px 32px -4px rgba(31, 61, 58, 0.06), 0 30px 70px -12px rgba(31, 61, 58, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          transition: reduced
            ? 'opacity 0.2s ease'
            : isCardHovered && !isMobile
            ? 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 550ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 550ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Subtle light highlight near top-left edge */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.06) 24%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="p-6 sm:p-9 lg:p-10 relative z-10">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-6 sm:pb-8 border-b border-border-subtle/80">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 text-brand-forest text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs"
                style={{
                  opacity: isCardRevealed || reduced ? 1 : 0,
                  transform: isCardRevealed || reduced ? 'translateY(0)' : 'translateY(12px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 0ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 0ms',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>White-Glove Onboarding</span>
              </div>
              <h3
                className="font-serif font-bold text-2xl sm:text-3xl lg:text-[2.2rem] text-brand-forest tracking-tight leading-[1.18]"
                style={{
                  opacity: isCardRevealed || reduced ? 1 : 0,
                  transform: isCardRevealed || reduced ? 'translateY(0)' : 'translateY(12px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms',
                }}
              >
                We configure Grove
                <br className="hidden sm:inline" /> around your property.
              </h3>
              <p
                className="text-xs sm:text-[13px] text-ink-muted mt-2 leading-relaxed max-w-xl"
                style={{
                  opacity: isCardRevealed || reduced ? 1 : 0,
                  transform: isCardRevealed || reduced ? 'translateY(0)' : 'translateY(12px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 180ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 180ms',
                }}
              >
                Dedicated implementation engineering with zero guesswork for your team.
              </p>
            </div>

            <div
              className="text-left sm:text-right shrink-0 lg:pl-8 lg:border-l lg:border-border-subtle/70 sm:self-center"
              style={{
                opacity: isCardRevealed || reduced ? 1 : 0,
                transform: isCardRevealed || reduced ? 'translateY(0)' : 'translateY(12px)',
                transition: reduced
                  ? 'none'
                  : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 250ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 250ms',
              }}
            >
              <span className="font-serif font-bold text-3xl sm:text-4xl lg:text-[2.6rem] text-brand-forest tracking-tight tabular-nums block leading-none">
                ₹10,000
              </span>
              <span className="text-xs text-ink-muted block mt-1.5 font-medium">
                one-time onboarding investment
              </span>
            </div>
          </div>

          {/* 2-Column Feature Grid (1-Column on Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-3 sm:gap-y-4 pt-6 sm:pt-8">
            {onboardingServices.map((service, i) => (
              <div
                key={service.step}
                className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-sand/35 cursor-default group"
                style={{
                  opacity: isCardRevealed || reduced ? 1 : 0,
                  transform: isCardRevealed || reduced ? 'translateY(0)' : 'translateY(10px)',
                  transition: reduced
                    ? 'none'
                    : `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 55}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 55}ms`,
                }}
              >
                <div className="w-5 h-5 rounded-[6px] bg-status-green/10 text-status-green flex items-center justify-center shrink-0 mt-0.5 shadow-2xs transition-all duration-200 group-hover:bg-status-green group-hover:text-white group-hover:scale-105">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-xs sm:text-[13px] font-bold text-ink group-hover:text-brand-forest transition-colors">
                      {service.title}
                    </h4>
                    <span className="text-[10px] font-mono font-semibold text-ink-muted/50 tracking-wider shrink-0">
                      {service.step}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-ink-muted leading-relaxed mt-1">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Bar: READY TO GO LIVE */}
          <div
            className="mt-8 pt-6 border-t border-border-subtle/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            style={{
              opacity: isCardRevealed || reduced ? 1 : 0,
              transform: isCardRevealed || reduced ? 'translateY(0)' : 'translateY(8px)',
              transition: reduced
                ? 'none'
                : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 750ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 750ms',
            }}
          >
            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3.5">
              {/* Status Pill: ✓ READY TO GO LIVE */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-green/10 text-status-green border border-status-green/25 font-bold text-[10px] uppercase tracking-wider shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                <span>✓ Ready to Go Live</span>
              </span>

              <span className="text-border-subtle hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5 text-ink-muted font-medium">
                <Clock className="w-3.5 h-3.5 text-brand-forest shrink-0" />
                <span>Typical turnaround: <strong>48–72 hours</strong></span>
              </div>

              <span className="text-border-subtle hidden lg:inline">•</span>

              <span className="text-ink-muted hidden lg:inline">
                Dedicated onboarding specialist assigned to your property
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-serif font-bold text-brand-forest text-base sm:text-lg tabular-nums">
                ₹10,000
              </span>
              <span className="text-[11px] text-ink-muted block sm:inline sm:ml-1.5 font-medium">
                one-time onboarding
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
 * PREMIUM 3D PRICING & ONBOARDING CARD
 * ══════════════════════════════════════════════ */
function PremiumPricing3DCard({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      setIsTouchDevice(isTouch);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Normalizing between -1 and 1
    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    // Subtle, calm cursor depth effect (max ~1.2 deg)
    const maxDeg = 1.2;
    const rotateX = -normY * maxDeg;
    const rotateY = normX * maxDeg;

    setTilt({ rotateX, rotateY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
  };

  // Card transform calculation
  const getCardTransform = () => {
    if (reduced) return 'none';
    if (!inView) {
      return 'perspective(1200px) translateY(30px) scale(0.98)';
    }
    if (tilt.isHovered && !isTouchDevice) {
      return `perspective(1200px) translateY(-4px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale(1)`;
    }
    return 'perspective(1200px) translateY(0px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  // Layered physical 3D shadows
  const getCardShadow = () => {
    if (tilt.isHovered && !reduced) {
      return '0 2px 4px rgba(31, 61, 58, 0.04), 0 14px 32px -4px rgba(31, 61, 58, 0.09), 0 32px 70px -12px rgba(31, 61, 58, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
    }
    return '0 1px 3px rgba(31, 61, 58, 0.04), 0 10px 28px -4px rgba(31, 61, 58, 0.07), 0 24px 60px -12px rgba(31, 61, 58, 0.11), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
  };

  return (
    <div
      style={{ perspective: '1200px' }}
      className="w-full relative transition-all duration-300"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative bg-white rounded-[26px] sm:rounded-[32px] md:rounded-[34px] border border-[#DDD5C6]/90 overflow-hidden will-change-transform"
        style={{
          opacity: inView || reduced ? 1 : 0,
          transform: getCardTransform(),
          boxShadow: getCardShadow(),
          transition: reduced
            ? 'opacity 0.2s ease'
            : tilt.isHovered && !isTouchDevice
            ? 'transform 180ms ease-out, box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 750ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 550ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Subtle light highlight near top-left edge */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.08) 25%, transparent 60%)',
          }}
          aria-hidden="true"
        />


        <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
          {/* ══════════════════════════════════════════════
           * LEFT COLUMN: PRICING SIDE
           * ══════════════════════════════════════════════ */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-9 xl:p-10 flex flex-col justify-between space-y-6 bg-white relative overflow-hidden">
            {/* Subtle architectural grid texture */}
            <div
              className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
              aria-hidden="true"
            />

            <div className="relative z-10">
              {/* Top label & active status */}
              <div
                className="flex items-center justify-between pb-3.5 border-b border-border-subtle/70"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(10px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms',
                }}
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-forest">
                  ACTIVE OPERATING SYSTEM
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-green/10 text-status-green border border-status-green/20 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                  <span>Ready Today</span>
                </span>
              </div>

              {/* Product Name & Short Description */}
              <div
                className="mt-4"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(12px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1) 140ms, transform 550ms cubic-bezier(0.16, 1, 0.3, 1) 140ms',
                }}
              >
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-forest tracking-tight">
                  Grove PMS
                </h2>
                <p className="text-xs sm:text-[13px] text-ink-muted mt-1.5 leading-relaxed">
                  Complete hotel management platform engineered for day-to-day front desk and back-office efficiency.
                </p>
              </div>

              {/* PRIMARY FOCAL POINT: ₹999 / month */}
              <div
                className="mt-6 pt-5 border-t border-border-subtle/70"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(14px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 180ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 180ms',
                }}
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="text-5xl sm:text-6xl font-serif font-bold text-brand-forest tracking-tight tabular-nums">
                    ₹999
                  </span>
                  <span className="text-sm sm:text-base text-ink-muted font-medium">
                    / month
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1.5 font-medium">
                  Simple monthly subscription · No long-term lock-in
                </p>
              </div>

              {/* ONBOARDING INSET PANEL (Second Layer Surface) */}
              <div
                className="mt-5 p-4 rounded-[18px] bg-[#F8F5EE] border border-border-subtle transition-all duration-200 hover:border-brand-forest/30 relative overflow-hidden"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(12px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1) 250ms, transform 550ms cubic-bezier(0.16, 1, 0.3, 1) 250ms',
                }}
              >
                {/* Architectural grid texture */}
                <div
                  className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
                  aria-hidden="true"
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-forest">
                      WHITE-GLOVE SETUP
                    </span>
                    <span className="font-serif font-bold text-brand-forest text-base sm:text-lg tabular-nums">
                      ₹10,000
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    White-glove property setup, GST mapping, room configuration, and staff training handled by our team.
                  </p>
                </div>
              </div>

              {/* CORE FEATURES (Compact Two-Column Feature List) */}
              <div className="mt-6 pt-5 border-t border-border-subtle/70 space-y-2.5">
                {coreFeatureRows.map((row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-[13px] text-ink"
                    style={{
                      opacity: inView || reduced ? 1 : 0,
                      transform: inView || reduced ? 'translateX(0)' : 'translateX(-8px)',
                      transition: reduced
                        ? 'none'
                        : `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${320 + rowIdx * 50}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${320 + rowIdx * 50}ms`,
                    }}
                  >
                    {row.map((item) => (
                      <div key={item} className="flex items-center gap-2 group/feat">
                        <div className="w-3.5 h-3.5 rounded-full bg-status-green/15 text-status-green flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                        <span className="leading-tight group-hover/feat:text-brand-forest transition-colors">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* PHYSICAL 3D BUTTON & WALKTHROUGH LINK */}
            <div
              className="pt-5 border-t border-border-subtle/70 space-y-2.5 relative z-10"
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? 'translateY(0)' : 'translateY(12px)',
                transition: reduced
                  ? 'none'
                  : 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1) 480ms, transform 550ms cubic-bezier(0.16, 1, 0.3, 1) 480ms',
              }}
            >
              <Link
                href="/register-hotel"
                className="w-full bg-brand-forest hover:bg-brand-forest-light text-white font-semibold py-3.5 sm:py-4 px-6 rounded-[13px] transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base group cursor-pointer select-none shadow-[0_3px_0_#142826,0_6px_14px_rgba(20,40,38,0.18)] hover:-translate-y-0.5 hover:shadow-[0_4px_0_#142826,0_10px_20px_rgba(20,40,38,0.24)] active:translate-y-[1px] active:shadow-[0_1px_0_#142826,0_3px_8px_rgba(20,40,38,0.14)]"
              >
                <span>Start with Grove</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <div className="text-center pt-1">
                <Link
                  href="/contact"
                  className="text-xs font-semibold text-brand-forest hover:underline inline-flex items-center gap-1 group py-1"
                >
                  <span>Schedule a Property Walkthrough</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
           * RIGHT COLUMN: ONBOARDING PANEL (WARMER SURFACE)
           * ══════════════════════════════════════════════ */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 xl:p-10 bg-[#F8F5EE] border-t lg:border-t-0 lg:border-l border-border-subtle/80 flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Subtle architectural grid texture */}
            <div
              className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
              aria-hidden="true"
            />

            <div className="relative z-10">
              {/* Top Header */}
              <div
                className="flex items-center justify-between pb-3.5 border-b border-border-subtle/70"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(10px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 150ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 150ms',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[7px] bg-brand-forest text-white flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-forest">
                    WHITE-GLOVE IMPLEMENTATION
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-ink-muted">Turnkey Setup</span>
              </div>

              <div
                className="mt-4"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(12px)',
                  transition: reduced
                    ? 'none'
                    : 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 550ms cubic-bezier(0.16, 1, 0.3, 1) 200ms',
                }}
              >
                <h3 className="text-2xl sm:text-[1.75rem] font-serif font-bold text-brand-forest leading-tight">
                  What&apos;s included in onboarding?
                </h3>
                <p className="text-xs sm:text-[13px] text-ink-muted mt-1.5 leading-relaxed max-w-xl">
                  We don&apos;t just hand you a login. We configure Grove around your property and prepare your team for day one.
                </p>
              </div>

              {/* 2 × 4 STRUCTURED GRID OF 8 ONBOARDING CARDS */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {onboardingServices.map((service, i) => (
                  <div
                    key={service.step}
                    className="group relative p-3.5 sm:p-4 rounded-[16px] bg-white border border-border-subtle/80 shadow-[0_1px_3px_rgba(31,61,58,0.04),0_3px_8px_rgba(31,61,58,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-forest/35 hover:shadow-[0_4px_12px_rgba(31,61,58,0.08)] cursor-default overflow-hidden"
                    style={{
                      opacity: inView || reduced ? 1 : 0,
                      transform: inView || reduced ? 'translateY(0)' : 'translateY(14px)',
                      transition: reduced
                        ? 'none'
                        : `opacity 450ms cubic-bezier(0.16, 1, 0.3, 1) ${260 + i * 65}ms, transform 450ms cubic-bezier(0.16, 1, 0.3, 1) ${260 + i * 65}ms`,
                    }}
                  >
                    {/* Architectural grid texture */}
                    <div
                      className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
                      aria-hidden="true"
                    />
                    <div className="relative z-10 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-[7px] bg-status-green/10 text-status-green flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-status-green group-hover:text-white transition-all duration-200">
                        <Check className="w-3 h-3 stroke-[2.5] transition-transform duration-200 group-hover:scale-105" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-ink leading-snug group-hover:text-brand-forest transition-colors">
                            {service.title}
                          </h4>
                          <span className="text-[10px] font-mono font-semibold text-ink-muted/50 group-hover:text-brand-forest/50 transition-colors">
                            {service.step}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* READY TO GO LIVE AREA (STATUS PILL + TURNAROUND) */}
            <div
              className="pt-5 border-t border-border-subtle/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10"
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? 'translateY(0)' : 'translateY(8px)',
                transition: reduced
                  ? 'none'
                  : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 750ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 750ms',
              }}
            >
              <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <Clock className="w-3.5 h-3.5 text-brand-forest shrink-0" />
                  <span>Typical turnaround: <strong>48–72 hours</strong></span>
                </div>

                <span className="text-border-subtle hidden sm:inline">•</span>

                {/* Status Pill: ✓ READY TO GO LIVE with slow 2.8s pulse */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-green/10 text-status-green border border-status-green/25 font-bold text-[10px] uppercase tracking-wider shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-[pulse_2.8s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                  <span>✓ Ready to Go Live</span>
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-serif font-bold text-brand-forest text-base sm:text-lg tabular-nums">
                  ₹10,000
                </span>
                <span className="text-[11px] text-ink-muted block sm:inline sm:ml-1 font-medium">
                  one-time onboarding
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
 * MAIN PRICING CLIENT COMPONENT
 * ══════════════════════════════════════════════ */
export default function PricingClient({ staffName, staffRole }: PricingClientProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const reduced = useReducedMotion();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Viewport observers for clean on-scroll reveals
  const hero = useInView();
  const pricingCard = useInView();
  const featuresSection = useInView();
  const whyGrove = useInView();
  const onboardingSection = useInView();
  const noSurprises = useInView();
  const roadmapSection = useInView();
  const faqSection = useInView();
  const ctaSection = useInView();

  const isHeroVisible = hero.inView || isMounted;

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 overflow-x-hidden flex flex-col justify-between relative">
      {/* Page-wide subtle architectural grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 grove-grid-texture"
        aria-hidden="true"
      />

      {/* Existing Public Navigation (Fixed Header with proper z-index) */}
      <PublicHeader staffName={staffName} staffRole={staffRole} />

      <main className="w-full flex-1 relative z-[1]">
        {/* ═══════════════════════════════════════════════════════
         * SECTION 1 — HERO SECTION
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={hero.ref}
          className="relative pt-32 sm:pt-40 lg:pt-44 pb-16 sm:pb-24 overflow-hidden"
        >
          {/* Subtle hospitality architectural background texture */}
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at 50% 20%, rgba(31, 61, 58, 0.035) 0%, transparent 68%)',
            }}
          />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Step 1: Small editorial eyebrow label */}
            <FadeIn inView={isHeroVisible} delay={0} direction="up" distance={12}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-6 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                <span className="uppercase tracking-[0.16em] text-[11px] font-semibold">
                  Transparent Hospitality Pricing
                </span>
              </div>
            </FadeIn>

            {/* Step 2: Main Display Serif Heading */}
            <FadeIn inView={isHeroVisible} delay={100} direction="up" distance={16}>
              <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
                Simple, Powerful
                <br />
                <span className="text-brand-forest-light">Hotel Management.</span>
              </h1>
            </FadeIn>

            {/* Step 3: Supporting Description */}
            <FadeIn inView={isHeroVisible} delay={200} direction="up" distance={14}>
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
                Run your hotel&apos;s reservations, rooms, guests, billing, payments, inventory,
                and daily operations from one simple platform.
              </p>
            </FadeIn>

            {/* Step 4: Premium Pricing Capsule */}
            <FadeIn inView={isHeroVisible} delay={300} direction="up" distance={12} scale>
              <div className="mt-8 sm:mt-10 inline-flex flex-col sm:flex-row items-center justify-center bg-white border border-border-subtle rounded-2xl shadow-card overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border-subtle relative">
                {/* Architectural grid texture */}
                <div
                  className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] grove-grid-texture"
                  aria-hidden="true"
                />
                {/* Monthly fee */}
                <div className="px-8 sm:px-10 py-4 sm:py-5 flex items-baseline gap-2.5 relative z-10">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-forest tracking-tight">
                    ₹999
                  </span>
                  <span className="text-sm text-ink-muted font-medium">/ month</span>
                </div>

                {/* One-time setup & zero commission note */}
                <div className="px-7 sm:px-9 py-3.5 sm:py-4 text-center sm:text-left bg-brand-sand/30 w-full sm:w-auto relative z-10">
                  <span className="text-xs sm:text-sm text-ink-muted block font-medium">
                    + <strong className="text-ink font-bold">₹10,000</strong> one-time setup
                  </span>
                  <span className="text-[11px] text-status-green font-semibold mt-0.5 inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>No per-booking commission</span>
                  </span>
                </div>
              </div>
            </FadeIn>

            {/* Step 5: CTA Buttons with Micro-interactions */}
            <FadeIn inView={isHeroVisible} delay={400} direction="up" distance={12}>
              <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                <Link
                  href="/register-hotel"
                  className="w-full sm:w-auto bg-brand-forest text-white font-semibold px-8 py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm sm:text-base group transition-all duration-200 hover:bg-brand-forest-light hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto bg-white text-ink font-semibold px-7 py-3.5 rounded-xl border border-border-subtle shadow-2xs flex items-center justify-center gap-2 text-sm sm:text-base transition-all duration-200 hover:bg-brand-sand/60 hover:border-ink/30 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-brand-forest" />
                  <span>Book a Demo</span>
                </Link>
              </div>
            </FadeIn>

            {/* Step 6: Trust text */}
            <FadeIn inView={isHeroVisible} delay={500} direction="up" distance={10}>
              <p className="mt-7 text-xs sm:text-sm text-ink-muted max-w-lg mx-auto font-medium">
                Built for independent hotels, boutique properties, homestays, and growing hospitality businesses.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
         * SECTION 2 — ASYMMETRIC PRODUCT CARD PRESENTATION
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={pricingCard.ref}
          className="pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-border-subtle"
        >
          <div className="max-w-5xl mx-auto">
            <PremiumPricing3DCard inView={pricingCard.inView} />

            {/* No commission assurance statement */}
            <FadeIn inView={pricingCard.inView} delay={300} direction="up" distance={8}>
              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-ink-muted font-medium inline-flex items-center flex-wrap justify-center gap-2 sm:gap-4">
                  <span>✓ No per-booking commission</span>
                  <span className="text-border-subtle hidden sm:inline">•</span>
                  <span>✓ No percentage of hotel turnover</span>
                  <span className="text-border-subtle hidden sm:inline">•</span>
                  <span>✓ Your property keeps 100% of guest revenue</span>
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
         * SECTION 3 — EDITORIAL FEATURE GRID ("Everything Your Hotel Needs")
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={featuresSection.ref}
          className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border-subtle"
        >
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <FadeIn inView={featuresSection.inView} delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
                <span className="uppercase tracking-[0.16em] text-[10px] font-bold">
                  01 · Operational Suite
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-serif font-bold text-brand-forest leading-tight">
                Everything Your Hotel Needs
              </h2>
            </FadeIn>
            <FadeIn inView={featuresSection.inView} delay={80}>
              <p className="text-sm sm:text-base text-ink-muted mt-3 leading-relaxed">
                One cohesive operating system designed for the daily rhythms that keep your hotel running smoothly.
              </p>
            </FadeIn>
          </div>

          {/* Asymmetric Tier 1: Large Featured Core Engines */}
          <StaggerContainer
            inView={featuresSection.inView}
            baseDelay={120}
            staggerMs={80}
            className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6"
          >
            {/* Core Card 1: Reservations */}
            <StaggerItem index={0}>
              <FloatingCard className="bg-white rounded-2xl sm:rounded-3xl border border-border-subtle p-7 sm:p-8 cursor-default group h-full">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105">
                    <CalendarCheck2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-brand-sand text-brand-forest border border-border-subtle">
                    Core Engine
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl sm:text-2xl text-brand-forest">
                  Reservations & Room Matrix
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-1.5 mb-6 leading-relaxed">
                  Complete booking lifecycle management with real-time room availability, quick check-in, key assignment, and double-booking prevention.
                </p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm text-ink border-t border-border-subtle/70 pt-5">
                  {[
                    'Visual Room Status Matrix',
                    'Express Check-In & Check-Out',
                    'Room Availability Calendar',
                    'Guest History Auto-Link',
                    'Advance Booking Deposit Tracking',
                    'Overbooking Protection Guard',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-status-green shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </FloatingCard>
            </StaggerItem>

            {/* Core Card 2: Billing & Payments */}
            <StaggerItem index={1}>
              <FloatingCard className="bg-white rounded-2xl sm:rounded-3xl border border-border-subtle p-7 sm:p-8 cursor-default group h-full">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full bg-brand-sand text-brand-forest border border-border-subtle">
                    GST-Compliant
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl sm:text-2xl text-brand-forest">
                  Billing, Folios & Payments
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-1.5 mb-6 leading-relaxed">
                  GST-ready guest folios, automatic tax slab allocation, multiple settlement modes, split invoices, and print-ready tax documents.
                </p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm text-ink border-t border-border-subtle/70 pt-5">
                  {[
                    'CGST, SGST & IGST Slabs',
                    'A4 Tax Invoice PDF Printing',
                    'Multi-Mode Payments (UPI, Cash, Card)',
                    'Split Folios & Group Billing',
                    'Advance Payments & Refunds',
                    'Shift Settlement Summaries',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-status-green shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </FloatingCard>
            </StaggerItem>
          </StaggerContainer>

          {/* Asymmetric Tier 2: Medium Operational Pillars */}
          <StaggerContainer
            inView={featuresSection.inView}
            baseDelay={260}
            staggerMs={70}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mt-5 sm:mt-6"
          >
            {/* Pillar 1: Guest CRM */}
            <StaggerItem index={0}>
              <FloatingCard className="bg-white rounded-2xl border border-border-subtle p-6 sm:p-7 cursor-default group h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-lg text-brand-forest">
                        Guest Profiles & CRM
                      </h3>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-brand-sand text-ink-muted">
                        CRM
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1 mb-4 leading-relaxed">
                      Comprehensive guest profiles, identity documentation, past stay records, and special guest preferences.
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-ink">
                      {[
                        'Verified ID & KYC Records',
                        'Historical Stay Logs',
                        'Corporate & GST Billing Linking',
                        'Special Guest Notes',
                      ].map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-status-green shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </StaggerItem>

            {/* Pillar 2: Inventory & Supplies */}
            <StaggerItem index={1}>
              <FloatingCard className="bg-white rounded-2xl border border-border-subtle p-6 sm:p-7 cursor-default group h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-lg text-brand-forest">
                        Stock & Inventory
                      </h3>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-brand-sand text-ink-muted">
                        Supplies
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1 mb-4 leading-relaxed">
                      Track hotel supplies, linen, toiletries, purchase orders, vendor contacts, and low-stock alerts.
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-ink">
                      {[
                        'Stock In / Out Adjustments',
                        'Vendor & Purchase Management',
                        'Low-Stock Threshold Alerts',
                        'Departmental Consumption Logs',
                      ].map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-status-green shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </StaggerItem>
          </StaggerContainer>

          {/* Asymmetric Tier 3: Specialized Hospitality Modules */}
          <StaggerContainer
            inView={featuresSection.inView}
            baseDelay={400}
            staggerMs={60}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-5 sm:mt-6"
          >
            {[
              {
                icon: UtensilsCrossed,
                name: 'Food & Beverage',
                badge: 'POS & KOT',
                desc: 'Menu items, room service orders, KOT printing, and seamless guest folio posting.',
              },
              {
                icon: PartyPopper,
                name: 'Banquet & Events',
                badge: 'Event Hall',
                desc: 'Conference bookings, decor packages, catering folios, and standalone invoices.',
              },
              {
                icon: BarChart3,
                name: 'Reports & Analytics',
                badge: 'Audit & GSTR',
                desc: 'Occupancy statistics, ADR, RevPAR, revenue summaries, and monthly GST return exports.',
              },
              {
                icon: ShieldCheck,
                name: 'Staff & Security',
                badge: 'Access Control',
                desc: 'Role permissions (Owner, Manager, Reception), staff audit logs, and secure tenant isolation.',
              },
            ].map((mod, i) => {
              const Icon = mod.icon;
              return (
                <StaggerItem key={mod.name} index={i}>
                  <FloatingCard className="bg-white rounded-2xl border border-border-subtle p-5 sm:p-6 cursor-default group h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="w-9 h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-brand-sand text-ink-muted">
                          {mod.badge}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-brand-forest">
                        {mod.name}
                      </h4>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle/60 flex items-center gap-1.5 text-[11px] font-semibold text-status-green">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Included in Starter Plan</span>
                    </div>
                  </FloatingCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
         * SECTION 4 — WHY GROVE? (Editorial Horizontal Numbered Layout)
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={whyGrove.ref}
          className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border-subtle"
        >
          <FadeIn inView={whyGrove.inView} delay={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
              <span className="uppercase tracking-[0.16em] text-[10px] font-bold">
                02 · Philosophy
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest max-w-2xl leading-tight">
              Everything you need.
              <br />
              <span className="text-brand-forest-light">Nothing you don&apos;t.</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mt-12 sm:mt-16">
            {[
              {
                num: '01',
                title: 'SIMPLE',
                desc: 'Designed around how hotel staff actually work. Clean, uncluttered screens with zero bloat so new staff learn in minutes.',
              },
              {
                num: '02',
                title: 'AFFORDABLE',
                desc: 'Professional hotel management without enterprise complexity or exorbitant price tags. Predictable ₹999/month pricing.',
              },
              {
                num: '03',
                title: 'CLOUD-BASED',
                desc: 'Your property accessible securely from any browser. No bulky local servers, hardware maintenance, or physical downtime.',
              },
              {
                num: '04',
                title: 'BUILT FOR INDIA',
                desc: 'GST-ready invoicing, SAC compliance, Indian payment collection (UPI/Cards), and local hotel operational standards.',
              },
            ].map((item, i) => (
              <FadeIn
                key={item.num}
                inView={whyGrove.inView}
                delay={100 + i * 90}
                direction="up"
                distance={18}
              >
                <div
                  className={`py-6 sm:py-0 sm:px-6 lg:px-8 group ${
                    i > 0 ? 'border-t sm:border-t-0 sm:border-l border-border-subtle' : ''
                  } ${i === 0 ? 'sm:pl-0' : ''}`}
                >
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-brand-forest/20 group-hover:text-brand-forest/35 transition-colors duration-200 block mb-3">
                    {item.num}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-forest block mb-2">
                    {item.title}
                  </span>
                  <p className="text-sm text-ink-muted leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
         * SECTION 5 — ONBOARDING SECTION ("We set up Grove for you")
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={onboardingSection.ref}
          className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border-subtle"
        >
          <div className="text-center mb-12 sm:mb-16">
            <FadeIn inView={onboardingSection.inView} delay={0} direction="up" distance={10}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
                <span className="uppercase tracking-[0.16em] text-[10px] font-bold">
                  03 · Implementation
                </span>
              </div>
            </FadeIn>
            <FadeIn inView={onboardingSection.inView} delay={100} direction="up" distance={14}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-forest leading-[1.15] tracking-tight max-w-2xl mx-auto">
                We set up Grove
                <br className="hidden sm:inline" /> for you.
              </h2>
            </FadeIn>
            <FadeIn inView={onboardingSection.inView} delay={200} direction="up" distance={12}>
              <p className="text-sm sm:text-base text-ink-muted mt-4 max-w-2xl mx-auto leading-relaxed">
                Transitioning software shouldn&apos;t risk front desk chaos. Our dedicated implementation team
                handles the configuration so your staff can start operating smoothly from day one.
              </p>
            </FadeIn>
          </div>

          {/* Unified Implementation Journey & White-Glove Onboarding */}
          <FadeIn inView={onboardingSection.inView} delay={350} direction="up" distance={16}>
            <HowItWorks inView={onboardingSection.inView} />
          </FadeIn>
        </section>

        {/* ═══════════════════════════════════════════════════════
         * SECTION 6 — NO SURPRISES (Typographic Treatment)
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={noSurprises.ref}
          className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-border-subtle"
        >
          {/* Subtle typographic background watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none -z-0 overflow-hidden"
            aria-hidden="true"
          >
            <span className="text-[10rem] sm:text-[16rem] lg:text-[20rem] font-serif font-bold text-brand-forest/[0.03] tracking-tighter leading-none">
              ₹999
            </span>
          </div>

          <div className="text-center relative z-10">
            <FadeIn inView={noSurprises.inView} delay={0} direction="up" distance={16}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-4">
                <span className="uppercase tracking-[0.16em] text-[10px] font-bold">
                  04 · Honest Pricing Guarantee
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest tracking-tight leading-[1.1]">
                Simple pricing.
                <br />
                No surprises.
              </h2>
            </FadeIn>

            <FadeIn inView={noSurprises.inView} delay={100} direction="up" distance={12}>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-ink-muted text-sm sm:text-base font-medium">
                <span className="font-serif font-bold text-2xl sm:text-3xl text-brand-forest">
                  ₹999
                </span>
                <span className="text-ink-muted">/ month</span>
                <span className="text-border-subtle hidden sm:inline">+</span>
                <span className="text-ink font-semibold">₹10,000 one-time onboarding</span>
              </div>
            </FadeIn>

            <StaggerContainer
              inView={noSurprises.inView}
              baseDelay={200}
              staggerMs={50}
              className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3.5 max-w-xl mx-auto text-left"
            >
              {[
                'No per-booking commissions',
                'No percentage of hotel revenue',
                'No surprise setup charges later',
                'No mandatory long-term contracts',
                'Software updates included',
                'Cloud hosting & backups included',
                'Security & bug fixes included',
                'Zero hidden fees or surcharges',
              ].map((item, i) => (
                <StaggerItem key={item} index={i}>
                  <div className="flex items-center gap-3 py-1">
                    <Check className="w-4 h-4 text-status-green shrink-0" />
                    <span className="text-xs sm:text-sm text-ink font-medium">{item}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
         * SECTION 7 — ROADMAP & FUTURE EDITIONS (Honest Disclosure)
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={roadmapSection.ref}
          className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border-subtle"
        >
          <div className="text-center mb-10 sm:mb-14">
            <FadeIn inView={roadmapSection.inView} delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
                <span className="uppercase tracking-[0.16em] text-[10px] font-bold">
                  05 · Future Editions & Roadmap
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                Start Small. Scale With Grove.
              </h2>
            </FadeIn>
            <FadeIn inView={roadmapSection.inView} delay={80}>
              <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl mx-auto leading-relaxed">
                Grove PMS Starter includes everything required to run your hotel operations today.
                Advanced editions with OTA channel syncing and multi-property management are in active development.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {/* Active Available Tier: Starter */}
            <FadeIn inView={roadmapSection.inView} delay={100} direction="up" distance={16}>
              <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-brand-forest p-6 sm:p-7 relative shadow-card h-full flex flex-col justify-between">
                <div className="absolute -top-3 left-6 bg-brand-forest text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Available Now
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-brand-forest pt-1">
                    Starter
                  </h3>
                  <p className="text-xs text-ink-muted mt-1">
                    For independent hotels, boutique stays, and homestays
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-4">
                    <span className="text-3xl font-serif font-bold text-brand-forest">₹999</span>
                    <span className="text-xs text-ink-muted font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    + ₹10,000 one-time onboarding
                  </p>
                  <div className="mt-5 space-y-2 text-xs text-ink border-t border-border-subtle/70 pt-4">
                    {[
                      'Reservations & Room Matrix',
                      'Guest Management & Folios',
                      'GST Invoicing & Payments',
                      'Stock & Inventory Tracking',
                      'Daily Financial Reports',
                      'Single Property Deployment',
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-status-green shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/register-hotel"
                  className="mt-6 w-full bg-brand-forest hover:bg-brand-forest-light text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-xs hover:-translate-y-0.5 group cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </FadeIn>

            {/* Coming Soon Tier 1: Growth */}
            <FadeIn inView={roadmapSection.inView} delay={180} direction="up" distance={16}>
              <div className="bg-white/70 rounded-2xl sm:rounded-3xl border border-border-subtle p-6 sm:p-7 relative opacity-85 h-full flex flex-col justify-between">
                <div className="absolute -top-3 left-6 bg-brand-sand text-ink-muted text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-border-subtle">
                  Coming Soon
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-ink pt-1">
                    Growth
                  </h3>
                  <p className="text-xs text-ink-muted mt-1">
                    For expanding boutique hotels requiring automation
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-4">
                    <span className="text-3xl font-serif font-bold text-ink/75">₹1,999</span>
                    <span className="text-xs text-ink-muted font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Planned upcoming tier
                  </p>
                  <div className="mt-5 space-y-2 text-xs text-ink-muted border-t border-border-subtle/70 pt-4">
                    <p className="font-semibold text-ink text-xs mb-1">Includes Starter plus:</p>
                    {[
                      'F&B KOT & Table Order Posting',
                      'Banquet & Event Invoicing',
                      'Automated WhatsApp Guest Alerts',
                      'Multiple Staff Shift Audits',
                      'Advanced Analytics & Forecasts',
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-ink-muted/50 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/contact?plan=growth"
                  className="mt-6 w-full bg-brand-sand hover:bg-brand-sand-dark text-ink-muted font-semibold py-3 rounded-xl border border-border-subtle transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span>Notify Me at Launch</span>
                </Link>
              </div>
            </FadeIn>

            {/* Coming Soon Tier 2: Pro */}
            <FadeIn inView={roadmapSection.inView} delay={260} direction="up" distance={16}>
              <div className="bg-white/70 rounded-2xl sm:rounded-3xl border border-border-subtle p-6 sm:p-7 relative opacity-85 h-full flex flex-col justify-between">
                <div className="absolute -top-3 left-6 bg-brand-sand text-ink-muted text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-border-subtle">
                  Coming Soon
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-ink pt-1">
                    Pro
                  </h3>
                  <p className="text-xs text-ink-muted mt-1">
                    For multi-property groups and resort operations
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-4">
                    <span className="text-3xl font-serif font-bold text-ink/75">₹3,999</span>
                    <span className="text-xs text-ink-muted font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Planned upcoming tier
                  </p>
                  <div className="mt-5 space-y-2 text-xs text-ink-muted border-t border-border-subtle/70 pt-4">
                    <p className="font-semibold text-ink text-xs mb-1">Includes Growth plus:</p>
                    {[
                      'Two-Way OTA Channel Manager',
                      'Multi-Property Central Dashboard',
                      'Developer REST API & Webhooks',
                      'Dedicated Priority Support',
                      'Custom Accounting Integrations',
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-ink-muted/50 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/contact?plan=pro"
                  className="mt-6 w-full bg-brand-sand hover:bg-brand-sand-dark text-ink-muted font-semibold py-3 rounded-xl border border-border-subtle transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Inquire for Multi-Property</span>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
         * SECTION 8 — FAQ ACCORDION SECTION
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={faqSection.ref}
          className="py-16 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border-subtle"
        >
          <div className="mb-10 sm:mb-14">
            <FadeIn inView={faqSection.inView} delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
                <span className="uppercase tracking-[0.16em] text-[10px] font-bold">
                  06 · Clarifications
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest">
                Frequently Asked Questions
              </h2>
            </FadeIn>
            <FadeIn inView={faqSection.inView} delay={80}>
              <p className="text-sm sm:text-base text-ink-muted mt-2">
                Straightforward answers regarding Grove PMS pricing, onboarding, and subscription policies.
              </p>
            </FadeIn>
          </div>

          <FadeIn inView={faqSection.inView} delay={120}>
            <div>
              {faqsList.map((faq, index) => (
                <FaqAccordionItem
                  key={faq.q}
                  id={`pricing-${index}`}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFaqIndex === index}
                  onToggle={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                />
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ═══════════════════════════════════════════════════════
         * SECTION 9 — FINAL CALL-TO-ACTION (CTA)
         * ═══════════════════════════════════════════════════════ */}
        <section
          ref={ctaSection.ref}
          className="py-20 sm:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(31, 61, 58, 0.035) 0%, transparent 68%)',
            }}
          />

          <FadeIn inView={ctaSection.inView} delay={0} direction="up" distance={16}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-5">
              <Building2 className="w-3.5 h-3.5" />
              <span className="uppercase tracking-[0.14em] text-[10px] font-bold">
                Modernize Your Property
              </span>
            </div>
          </FadeIn>

          <FadeIn inView={ctaSection.inView} delay={100} direction="up" distance={16}>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-brand-forest tracking-tight max-w-2xl mx-auto leading-[1.14]">
              Ready to simplify your hotel operations?
            </h2>
          </FadeIn>

          <FadeIn inView={ctaSection.inView} delay={200} direction="up" distance={12}>
            <p className="text-base sm:text-lg text-ink-muted max-w-xl mx-auto leading-relaxed mt-4">
              Start managing reservations, guests, billing, payments, and daily hotel operations with Grove.
            </p>
          </FadeIn>

          <FadeIn inView={ctaSection.inView} delay={300} direction="up" distance={12}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto mt-8">
              <Link
                href="/register-hotel"
                className="w-full sm:w-auto bg-brand-forest hover:bg-brand-forest-light text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-xs flex items-center justify-center gap-2 group text-sm sm:text-base hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto bg-white text-ink font-semibold py-3.5 px-7 rounded-xl border border-border-subtle transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-2xs hover:bg-brand-sand/60 hover:border-ink/30 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-brand-forest" />
                <span>Book a Demo</span>
              </Link>
            </div>
          </FadeIn>

          <FadeIn inView={ctaSection.inView} delay={400} direction="up" distance={8}>
            <p className="mt-6 text-xs text-ink-muted font-medium">
              ₹999/month + ₹10,000 one-time onboarding · Zero per-booking commissions
            </p>
          </FadeIn>
        </section>
      </main>

      {/* Existing Public Footer */}
      <PublicFooter />
    </div>
  );
}
