'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Hotel,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  UtensilsCrossed,
  Sparkles,
  PartyPopper,
  BarChart3,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  BedDouble,
  ClipboardList,
  Wallet,
  Warehouse,
  Settings,
  DoorOpen,
  Shield,
  KeyRound,
  UserCheck,
  Menu,
  X,
  MapPin,
  Crown,
  Activity,
  Layers,
  Globe,
  HelpCircle,
  ChevronDown,
  Database,
} from 'lucide-react';
import {
  useInView,
  useReducedMotion,
  useIsMobile,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  FloatingCard,
  AnimatedCounter,
} from './animations';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

/* ══════════════════════════════════════════════
 * BRAND IDENTITY
 * ══════════════════════════════════════════════ */
const PRODUCT_NAME = 'Grove';
const PRODUCT_TAGLINE = 'Hospitality OS';

/* ══════════════════════════════════════════════
 * MODULES DATA
 * ══════════════════════════════════════════════ */
const modules = [
  {
    icon: CalendarCheck,
    name: 'Front Desk',
    desc: 'Real-time room matrix, check-ins, identity verification, keycards, and express checkout.',
  },
  {
    icon: ClipboardList,
    name: 'Reservations',
    desc: 'Centralized booking engine with date search, room availability, and guest profile linking.',
  },
  {
    icon: BedDouble,
    name: 'Room Management',
    desc: 'Room categories, floor plans, status tracking, maintenance logs, and rate management.',
  },
  {
    icon: Users,
    name: 'Guest Management',
    desc: 'Guest profiles, ID records, stay history, preferences, and communication logs.',
  },
  {
    icon: CreditCard,
    name: 'Billing & Folios',
    desc: 'Consolidated guest ledgers, room charges, advance deposits, and automated GST invoicing.',
  },
  {
    icon: Wallet,
    name: 'Payments',
    desc: 'Multi-mode collection — Cash, UPI, Card — with split payments and receipt generation.',
  },
  {
    icon: UtensilsCrossed,
    name: 'F&B Operations',
    desc: 'KOT generation, table orders, room charge posting, walk-in dining, and menu sync.',
  },
  {
    icon: PartyPopper,
    name: 'Banquet & Events',
    desc: 'Hall bookings, decor packages, catering, stage lighting, and standalone event invoicing.',
  },
  {
    icon: Sparkles,
    name: 'Housekeeping',
    desc: 'Room turnaround tracking — dirty, in-progress, inspected, out-of-order — in real time.',
  },
  {
    icon: Warehouse,
    name: 'Inventory',
    desc: 'Stock management, purchase orders, consumption tracking, and low-stock alerts.',
  },
  {
    icon: BarChart3,
    name: 'Reports & Analytics',
    desc: 'ADR, RevPAR, occupancy analytics, shift handovers, and monthly GST return exports.',
  },
  {
    icon: Settings,
    name: 'Hotel Settings',
    desc: 'Tax configuration, staff management, property details, room categories, and access control.',
  },
];

/* ══════════════════════════════════════════════
 * WORKFLOW DATA
 * ══════════════════════════════════════════════ */
const workflowSteps = [
  { label: 'Reservation', icon: ClipboardList, step: '01', desc: 'Direct booking or OTA channel sync', isMajor: true, isFinal: false, x: 55, y: 88 },
  { label: 'Front Desk', icon: CalendarCheck, step: '02', desc: 'Express check-in & keycard assignment', isMajor: true, isFinal: false, x: 165, y: 72 },
  { label: 'Guest Stay', icon: BedDouble, step: '03', desc: 'Active room stay & guest ledger linking', isMajor: false, isFinal: false, x: 275, y: 58 },
  { label: 'Room Charges', icon: CreditCard, step: '04', desc: 'Automated nightly tariff posting', isMajor: false, isFinal: false, x: 385, y: 50 },
  { label: 'F&B / Banquet', icon: UtensilsCrossed, step: '05', desc: 'POS order & event charge ledger sync', isMajor: false, isFinal: false, x: 495, y: 50 },
  { label: 'Billing', icon: Wallet, step: '06', desc: 'Consolidated folio with GST compliance', isMajor: true, isFinal: false, x: 605, y: 58 },
  { label: 'Payment', icon: CheckCircle2, step: '07', desc: 'Multi-mode settlement: UPI, Card, Cash', isMajor: false, isFinal: false, x: 715, y: 72 },
  { label: 'Reports', icon: BarChart3, step: '08', desc: 'Real-time ADR, RevPAR & GST exports', isMajor: true, isFinal: true, x: 825, y: 88 },
];

const FLOW_CURVE_PATH = 'M 55,88 C 125,76 225,58 385,50 C 495,50 655,58 825,88';

/* ══════════════════════════════════════════════
 * ROLES DATA (Unified Forest Green family)
 * ══════════════════════════════════════════════ */
const roles = [
  {
    title: 'Owner',
    desc: 'Full property control, staff management, billing, reports, and hotel settings.',
    icon: Crown,
    iconOpacity: 'opacity-100',
  },
  {
    title: 'Manager',
    desc: 'Operations oversight, reporting, front desk supervision, and booking management.',
    icon: Users,
    iconOpacity: 'opacity-95',
  },
  {
    title: 'Reception',
    desc: 'Front desk operations, reservations, check-ins, check-outs, and guest management.',
    icon: DoorOpen,
    iconOpacity: 'opacity-90',
  },
  {
    title: 'Housekeeping',
    desc: 'Room status updates, cleaning task management, and turnaround tracking.',
    icon: Sparkles,
    iconOpacity: 'opacity-85',
  },
];

/* ══════════════════════════════════════════════
 * FAQ DATA
 * ══════════════════════════════════════════════ */
const faqs = [
  {
    q: 'What is a hotel PMS?',
    a: 'A Property Management System (PMS) is the core operational software that hotels use to coordinate daily workflows — including room inventory, front desk check-ins, reservations, guest ledgers, billing, housekeeping status, and financial reporting.',
  },
  {
    q: 'What can Grove manage?',
    a: 'Grove manages front desk operations, reservations, room matrix, guest profiles, consolidated billing & folios, GST invoices, multi-mode payments (Cash, UPI, Card), restaurant & bar KOTs, banquet/event packages, housekeeping turnaround tracking, inventory consumption, and owner management reports.',
  },
  {
    q: 'Can multiple hotels use the platform?',
    a: 'Yes. Grove is a multi-tenant platform where multiple independent hotel properties operate concurrently. Each hotel has its own dedicated workspace, staff team, and configuration.',
  },
  {
    q: 'How does hotel data isolation work?',
    a: 'Data isolation is enforced at the database level using PostgreSQL Row-Level Security (RLS). Every query automatically scopes data to the authenticated staff member’s hotel_id, ensuring zero data crossover between different properties.',
  },
  {
    q: 'Can hotel owners create staff accounts?',
    a: 'Yes. The hotel owner provisions operational staff accounts directly from Settings → Staff / Users. Public registration for staff is disabled to maintain strict property access control.',
  },
  {
    q: 'What roles are supported?',
    a: 'Grove supports four distinct roles: Owner (full property configuration & reports), Manager (operational oversight & daily reporting), Reception (check-ins, check-outs, room matrix & folios), and Housekeeping (room turnaround & cleaning statuses).',
  },
  {
    q: 'Does the PMS support hotel billing and GST invoices?',
    a: 'Yes. Grove automatically calculates room tariffs, food charges, extra amenities, and applicable GST slabs (e.g. 12%, 18%). It produces sequential GST-compliant invoices with CGST/SGST/IGST breakdowns and provides monthly summaries for tax filing.',
  },
  {
    q: 'Does the PMS support F&B billing?',
    a: 'Yes. The Food & Beverage module handles table orders, Kitchen Order Tickets (KOT), room charge postings directly to guest folios, and standalone restaurant walk-in bills.',
  },
  {
    q: 'Does it include housekeeping?',
    a: 'Yes. Housekeeping staff can view and update room statuses in real-time — transitioning rooms between Dirty, In-Progress, Inspected, and Clean & Available.',
  },
  {
    q: 'Does it support banquet management?',
    a: 'Yes. The Banquet module handles hall bookings, catering packages, event decor, stage/audio charges, advance deposits, and dedicated event invoicing.',
  },
  {
    q: 'Can I register a new hotel?',
    a: 'Yes. New property owners can sign up via the Register Hotel flow to initialize their hotel property, configure room categories, and begin managing operations immediately.',
  },
  {
    q: 'How do I access my PMS account?',
    a: 'Staff and owners access their property via the Sign In portal using their verified email and password. The system automatically verifies your staff role and opens your hotel workspace.',
  },
];

/* ══════════════════════════════════════════════
 * HERO DASHBOARD ANIMATION
 * ══════════════════════════════════════════════ */
function HeroDashboard({ inView }: { inView: boolean }) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const [rooms, setRooms] = useState([
    { num: '101', status: 'occupied' },
    { num: '102', status: 'cleaning' },
    { num: '103', status: 'available' },
    { num: '201', status: 'occupied' },
    { num: '202', status: 'reserved' },
    { num: '203', status: 'occupied' },
    { num: '301', status: 'available' },
    { num: '302', status: 'occupied' },
  ]);

  const [transitioned, setTransitioned] = useState(false);

  useEffect(() => {
    if (!inView || transitioned || reduced) return;
    const timer = setTimeout(() => {
      setRooms((prev) =>
        prev.map((r) => (r.num === '102' ? { num: '102', status: 'available' } : r))
      );
      setTransitioned(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, [inView, transitioned, reduced]);

  const activities = [
    { text: 'Booking #1042 confirmed — Room 301', time: '2m ago' },
    { text: 'Payment ₹4,200 received — UPI', time: '8m ago' },
    { text: 'Room 102 marked clean & inspected', time: 'Just now' },
  ];

  const gridRef = useRef<HTMLDivElement>(null);
  const [nearTiles, setNearTiles] = useState<Set<number>>(new Set());

  const handleGridMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || reduced) return;
      const grid = gridRef.current;
      if (!grid) return;

      const tiles = grid.querySelectorAll('[data-tile-idx]');
      const near = new Set<number>();

      tiles.forEach((tile) => {
        const rect = tile.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
        const idx = parseInt(tile.getAttribute('data-tile-idx') || '0');

        if (dist < 80) {
          near.add(idx);
        }
      });

      setNearTiles(near);
    },
    [isMobile, reduced]
  );

  const handleGridMouseLeave = useCallback(() => {
    setNearTiles(new Set());
  }, []);

  return (
    <div
      className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14 transition-all duration-700"
      style={{
        opacity: inView || reduced ? 1 : 0,
        transform: inView || reduced ? 'translateY(0) scale(1)' : `translateY(${isMobile ? '16px' : '28px'}) scale(0.98)`,
        transitionDelay: isMobile ? '200ms' : '350ms',
      }}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-border-subtle overflow-hidden text-left"
        style={{
          boxShadow: inView || reduced
            ? '0 24px 80px -12px rgba(31, 61, 58, 0.15), 0 8px 24px -8px rgba(0, 0, 0, 0.08)'
            : '0 4px 12px rgba(0, 0, 0, 0.04)',
          transition: 'box-shadow 1s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Product Chrome Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border-subtle bg-brand-sand/30">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-brand-forest rounded-md">
              <Hotel className="w-3 h-3 text-white" />
            </div>
            <span className="text-[11px] text-ink font-semibold tracking-wide">
              {PRODUCT_NAME}
            </span>
            <span className="text-[10px] text-ink-muted hidden sm:inline">
              — Control Centre
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-green/10 border border-status-green/20">
            <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
            <span className="text-[10px] text-status-green font-semibold">Live</span>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { label: 'Occupancy', value: 78, suffix: '%', color: 'text-brand-forest' },
              { label: 'Revenue', value: 24, suffix: 'L', prefix: '₹', color: 'text-brand-forest' },
              { label: 'Arrivals', value: 18, suffix: '', color: 'text-brand-forest' },
              { label: 'Departures', value: 6, suffix: '', color: 'text-brand-forest' },
            ].map((kpi, i) => (
              <div
                key={kpi.label}
                className="bg-brand-sand/40 rounded-xl p-3 sm:p-4"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(10px)',
                  transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${400 + i * (isMobile ? 50 : 90)}ms`,
                }}
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-ink-muted block">
                  {kpi.label}
                </span>
                <div className={`text-lg sm:text-2xl font-serif font-bold mt-0.5 ${kpi.color}`}>
                  <AnimatedCounter
                    target={kpi.value}
                    suffix={kpi.suffix}
                    prefix={kpi.prefix || ''}
                    inView={inView}
                    duration={1400}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Room Matrix & Activity Feed */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div
              className="sm:col-span-3"
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? 'translateX(0)' : `translateX(${isMobile ? '0' : '-12px'})`,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 600ms',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-bold text-ink uppercase tracking-wider">
                  Room Matrix
                </span>
                <span className="text-[10px] text-ink-muted">Floor 1–3</span>
              </div>
              <div
                ref={gridRef}
                className="grid grid-cols-4 gap-2"
                onMouseMove={handleGridMouseMove}
                onMouseLeave={handleGridMouseLeave}
              >
                {rooms.map((room, i) => {
                  const isNear = nearTiles.has(i);
                  const isTransitioning = room.num === '102' && transitioned;
                  return (
                    <div
                      key={room.num}
                      data-tile-idx={i}
                      className={`relative p-2 sm:p-2.5 rounded-lg border text-center transition-all ${
                        room.status === 'occupied'
                          ? 'bg-status-red/8 border-status-red/20'
                          : room.status === 'reserved'
                          ? 'bg-status-blue/8 border-status-blue/20'
                          : room.status === 'cleaning'
                          ? 'bg-status-amber/8 border-status-amber/20'
                          : 'bg-status-green/8 border-status-green/20'
                      } ${isTransitioning ? 'ring-2 ring-status-green/40 ring-offset-1' : ''}`}
                      style={{
                        opacity: inView || reduced ? 1 : 0,
                        transform: inView || reduced
                          ? isNear
                            ? 'scale(1.02) translateY(-2px)'
                            : 'scale(1) translateY(0)'
                          : 'scale(0.92)',
                        boxShadow: isNear
                          ? '0 4px 12px rgba(31, 61, 58, 0.12)'
                          : '0 0 0 transparent',
                        transition: isNear
                          ? 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, opacity 0.4s ease'
                          : `transform 0.3s ease, box-shadow 0.3s ease, opacity 0.4s ease ${700 + i * 50}ms`,
                      }}
                    >
                      <span className="text-xs sm:text-sm font-bold text-ink block">{room.num}</span>
                      <span
                        className={`block text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${
                          room.status === 'occupied'
                            ? 'text-status-red'
                            : room.status === 'reserved'
                            ? 'text-status-blue'
                            : room.status === 'cleaning'
                            ? 'text-status-amber'
                            : 'text-status-green'
                        }`}
                      >
                        {room.status === 'occupied'
                          ? 'OCC'
                          : room.status === 'reserved'
                          ? 'RSV'
                          : room.status === 'cleaning'
                          ? 'CLN'
                          : 'AVL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="sm:col-span-2"
              style={{
                opacity: inView || reduced ? 1 : 0,
                transform: inView || reduced ? 'translateX(0)' : `translateX(${isMobile ? '0' : '12px'})`,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 750ms',
              }}
            >
              <span className="text-[11px] sm:text-xs font-bold text-ink uppercase tracking-wider block mb-2">
                Recent Activity
              </span>
              <div className="space-y-2">
                {activities.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg bg-brand-sand/40"
                    style={{
                      opacity: inView || reduced ? 1 : 0,
                      transform: inView || reduced ? 'translateY(0)' : 'translateY(6px)',
                      transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${850 + i * (isMobile ? 60 : 100)}ms`,
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-green shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-ink leading-tight block truncate">{act.text}</span>
                      <span className="text-[9px] text-ink-muted">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(31,61,58,0.07) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
 * RESPONSIVE WORKFLOW TIMELINE
 * ══════════════════════════════════════════════ */
function OperationalTimeline({ inView }: { inView: boolean }) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const [pulseActive, setPulseActive] = useState(false);
  const [pulseProgress, setPulseProgress] = useState(0);
  const [pathElement, setPathElement] = useState<SVGPathElement | null>(null);

  useEffect(() => {
    if (!inView || isMobile || reduced) return;

    const timer = setTimeout(() => {
      setPulseActive(true);
      const startTime = performance.now();
      const duration = 850;

      function animateDot(now: number) {
        const elapsed = now - startTime;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setPulseProgress(eased);

        if (p < 1) {
          requestAnimationFrame(animateDot);
        } else {
          setTimeout(() => setPulseActive(false), 200);
        }
      }

      requestAnimationFrame(animateDot);
    }, 1600);

    return () => clearTimeout(timer);
  }, [inView, isMobile, reduced]);

  const pulsePoint = useMemo(() => {
    if (!pathElement || !pulseActive) return null;
    try {
      const len = pathElement.getTotalLength();
      const pt = pathElement.getPointAtLength(pulseProgress * len);
      return { x: pt.x, y: pt.y };
    } catch {
      return null;
    }
  }, [pathElement, pulseActive, pulseProgress]);

  return (
    <div>
      {/* ── DESKTOP HORIZONTAL CURVED RAIL (md:block) ── */}
      <div className="hidden md:block w-full overflow-x-auto pb-6 pt-2 scrollbar-none">
        <div className="relative mx-auto" style={{ width: '880px', height: '190px' }}>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 880 190"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="opFlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C8BCAB" stopOpacity="0.7" />
                <stop offset="25%" stopColor="#8DA39F" />
                <stop offset="60%" stopColor="#3B6B63" />
                <stop offset="85%" stopColor="#244B45" />
                <stop offset="100%" stopColor="#1F3D3A" />
              </linearGradient>

              <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={FLOW_CURVE_PATH}
              fill="none"
              stroke="#DDD5C6"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              opacity="0.5"
            />

            <path
              ref={setPathElement}
              d={FLOW_CURVE_PATH}
              fill="none"
              stroke="url(#opFlowGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="800"
              strokeDashoffset={inView || reduced ? 0 : 800}
              style={{
                transition: reduced ? 'none' : 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) 200ms',
              }}
            />

            {pulseActive && pulsePoint && (
              <g
                transform={`translate(${pulsePoint.x}, ${pulsePoint.y})`}
                style={{
                  opacity: pulseProgress > 0.9 ? 1 - (pulseProgress - 0.9) * 10 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                <circle r="9" fill="#2E5A54" opacity="0.3" filter="url(#pulseGlow)" />
                <circle r="4.5" fill="#FFFFFF" stroke="#1F3D3A" strokeWidth="1.5" />
              </g>
            )}
          </svg>

          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="absolute flex flex-col items-center group cursor-pointer"
                style={{
                  left: `${step.x}px`,
                  top: `${step.y}px`,
                  transform: 'translate(-50%, -50%)',
                  opacity: inView || reduced ? 1 : 0,
                  transition: reduced
                    ? 'opacity 0.2s ease'
                    : `opacity 0.5s ease ${300 + i * 100}ms, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${300 + i * 100}ms`,
                }}
              >
                <span className="text-[9px] font-mono font-semibold tracking-wider text-ink-muted/70 uppercase mb-1.5 transition-colors group-hover:text-brand-forest">
                  {step.step}
                </span>

                <div
                  className={`relative rounded-full bg-brand-forest text-white flex items-center justify-center transition-all duration-300 ${
                    step.isFinal
                      ? 'w-14 h-14 shadow-lg shadow-brand-forest/25 ring-4 ring-brand-forest/20 ring-offset-2 ring-offset-brand-sand'
                      : step.isMajor
                      ? 'w-12 h-12 shadow-md shadow-brand-forest/20'
                      : 'w-10 h-10 shadow-sm shadow-brand-forest/15'
                  } group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-brand-forest/30`}
                >
                  <Icon
                    className={`${
                      step.isFinal ? 'w-6 h-6' : step.isMajor ? 'w-5 h-5' : 'w-4 h-4'
                    } text-white transition-transform duration-200 group-hover:scale-110`}
                  />

                  {step.isFinal && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-status-green border-2 border-white flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </span>
                  )}
                </div>

                <span
                  className={`text-xs font-medium text-ink tracking-tight mt-2 text-center leading-tight whitespace-nowrap transition-colors group-hover:text-brand-forest ${
                    step.isFinal ? 'font-semibold text-brand-forest' : ''
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE VERTICAL TIMELINE (<768px) ── */}
      <div className="md:hidden max-w-sm mx-auto pl-4 sm:pl-6 relative">
        <div
          className="absolute left-9 sm:left-11 top-4 bottom-4 w-0.5 rounded-full"
          style={{
            background: 'linear-gradient(to bottom, #C8BCAB 0%, #8DA39F 25%, #3B6B63 60%, #1F3D3A 100%)',
            opacity: inView || reduced ? 1 : 0,
            transform: inView || reduced ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'top',
            transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
          }}
        />

        <div className="space-y-4">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="flex items-center gap-3.5 relative z-10 p-2.5 rounded-xl bg-white/70 border border-border-subtle"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateY(0)' : 'translateY(12px)',
                  transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 60}ms`,
                }}
              >
                <div
                  className={`rounded-full bg-brand-forest text-white flex items-center justify-center shrink-0 ${
                    step.isFinal
                      ? 'w-11 h-11 ring-2 ring-brand-forest/20 ring-offset-2'
                      : 'w-9 h-9'
                  }`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-semibold text-ink-muted uppercase">
                      {step.step}
                    </span>
                    <span className={`text-xs font-semibold text-ink ${step.isFinal ? 'text-brand-forest font-bold' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted truncate mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
 * FINANCIAL CONVERGENCE DIAGRAM
 * ══════════════════════════════════════════════ */
function FinancialConvergence({ inView }: { inView: boolean }) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const inputs = [
    { label: 'Room Charges', icon: BedDouble },
    { label: 'F&B', icon: UtensilsCrossed },
    { label: 'Banquet', icon: PartyPopper },
    { label: 'Payments', icon: Wallet },
  ];

  const outputs = [
    { label: 'Unified Folio', icon: ClipboardList },
    { label: 'GST Invoice', icon: CreditCard },
    { label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col gap-2.5 items-end">
          {inputs.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateX(0)' : `translateX(${isMobile ? '0' : '-16px'})`,
                  transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${200 + i * 80}ms`,
                }}
              >
                <span className="text-[11px] sm:text-xs font-semibold text-ink whitespace-nowrap">
                  {item.label}
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative w-20 sm:w-32 h-36 shrink-0">
          <svg viewBox="0 0 100 140" className="w-full h-full" style={{ overflow: 'visible' }}>
            {[20, 50, 80, 110].map((y, i) => (
              <line
                key={i}
                x1="0"
                y1={y}
                x2="50"
                y2="70"
                stroke="#1F3D3A"
                strokeWidth="1.5"
                strokeDasharray="100"
                strokeDashoffset={inView || reduced ? 0 : 100}
                style={{
                  transition: reduced ? 'none' : `stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${400 + i * 80}ms`,
                }}
              />
            ))}
            <circle
              cx="50"
              cy="70"
              r="5"
              fill="#1F3D3A"
              style={{
                opacity: inView || reduced ? 1 : 0,
                transition: 'opacity 0.3s ease 750ms',
              }}
            />
            {[30, 70, 110].map((y, i) => (
              <line
                key={`out-${i}`}
                x1="50"
                y1="70"
                x2="100"
                y2={y}
                stroke="#1F3D3A"
                strokeWidth={i === 0 ? '2.5' : '1.5'}
                strokeDasharray="80"
                strokeDashoffset={inView || reduced ? 0 : 80}
                style={{
                  transition: reduced ? 'none' : `stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${800 + i * 80}ms`,
                }}
              />
            ))}
          </svg>
        </div>

        <div className="flex flex-col gap-2.5 items-start">
          {outputs.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2"
                style={{
                  opacity: inView || reduced ? 1 : 0,
                  transform: inView || reduced ? 'translateX(0)' : `translateX(${isMobile ? '0' : '16px'})`,
                  transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${900 + i * 80}ms`,
                }}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-brand-forest text-white flex items-center justify-center shrink-0 shadow-xs ${
                    i === 0 ? 'ring-2 ring-brand-forest/20 ring-offset-2' : ''
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-semibold text-ink whitespace-nowrap ${
                    i === 0 ? 'font-bold text-brand-forest' : ''
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
 * MAIN LANDING PAGE CLIENT COMPONENT
 * ══════════════════════════════════════════════ */
export default function LandingPageClient({
  staffName,
  staffRole,
}: {
  staffName?: string;
  staffRole?: string;
}) {
  const isAuthenticated = Boolean(staffName);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Section in-view observers
  const hero = useInView();
  const productIntro = useInView();
  const modulesSection = useInView();
  const workflowSection = useInView();
  const dashboardShowcase = useInView();
  const multiTenant = useInView();
  const securityTrustSection = useInView();
  const customerExample = useInView();
  const securitySection = useInView();
  const rolesSection = useInView();
  const financialSection = useInView();
  const analyticsSection = useInView();
  const faqSection = useInView();
  const ctaSection = useInView();

  return (
    <div className="min-h-screen bg-brand-sand text-ink selection:bg-brand-forest/20 overflow-x-hidden">
      {/* ───────────── 1. STICKY NAVBAR ───────────── */}
      <PublicHeader staffName={staffName} staffRole={staffRole} />

      {/* ───────────── 2. HERO SECTION ───────────── */}
      <section ref={hero.ref} className="pt-24 sm:pt-32 pb-8 sm:pb-12" id="platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <FadeIn inView={hero.inView} delay={0} direction="up" distance={12}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-5 sm:mb-6">
              <Layers className="w-3.5 h-3.5" />
              <span>Unified Hospitality Platform</span>
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn inView={hero.inView} delay={80} direction="up" distance={16}>
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-serif font-bold text-brand-forest tracking-tight max-w-4xl mx-auto leading-[1.12]">
              The Operating System
              <br />
              <span className="text-brand-forest-light">for Modern Hospitality.</span>
            </h1>
          </FadeIn>

          {/* Subheadline */}
          <FadeIn inView={hero.inView} delay={160} direction="up" distance={14}>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
              Manage rooms, reservations, guests, billing, F&B, banquet events, housekeeping, inventory,
              and reporting — from one connected platform.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn inView={hero.inView} delay={240} direction="up" distance={12}>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                href={isAuthenticated ? '/dashboard' : '/register-hotel'}
                className="w-full sm:w-auto bg-brand-forest text-white font-semibold px-7 py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm sm:text-base group transition-all duration-200 hover:bg-brand-forest-light"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-white text-ink font-semibold px-6 py-3.5 rounded-xl border border-border-subtle shadow-2xs flex items-center justify-center text-sm sm:text-base transition-all duration-200 hover:bg-brand-sand/50"
                >
                  Sign In
                </Link>
              )}
            </div>
          </FadeIn>

          {/* Hero Dashboard Component */}
          <HeroDashboard inView={hero.inView} />
        </div>
      </section>

      {/* ───────────── 3. PRODUCT INTRO ───────────── */}
      <section ref={productIntro.ref} className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn inView={productIntro.inView} delay={0} direction="up">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest max-w-3xl mx-auto leading-tight">
              Everything Your Property Needs.
              <br />
              <span className="text-brand-forest-light">One Connected System.</span>
            </h2>
          </FadeIn>
          <FadeIn inView={productIntro.inView} delay={100} direction="up">
            <p className="mt-3.5 sm:mt-5 text-sm sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
              A unified platform designed to connect every part of hotel operations — from the front desk to
              finance, housekeeping, food & beverage, banquets and management reporting.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 4. MODULES GRID ───────────── */}
      <section
        ref={modulesSection.ref}
        className="bg-white border-y border-border-subtle py-16 sm:py-24"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={modulesSection.inView} delay={0}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                Comprehensive Hospitality Modules
              </h2>
            </FadeIn>
            <FadeIn inView={modulesSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                Twelve integrated modules engineered for boutique hotels, resorts, and premium
                hospitality properties.
              </p>
            </FadeIn>
          </div>

          <StaggerContainer
            inView={modulesSection.inView}
            baseDelay={120}
            staggerMs={50}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4"
          >
            {modules.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <StaggerItem key={mod.name} index={i}>
                  <FloatingCard
                    hoverY={-4}
                    className="p-5 rounded-2xl bg-brand-sand/30 border border-border-subtle cursor-default group"
                  >
                    <div
                      className="p-2.5 bg-brand-forest text-white rounded-xl w-fit transition-transform duration-200 group-hover:scale-105"
                      style={{ opacity: 1 - i * 0.01 }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-ink mt-3">{mod.name}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed mt-1.5">{mod.desc}</p>
                  </FloatingCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ───────────── 5. PMS WORKFLOW — Responsive Timeline ───────────── */}
      <section ref={workflowSection.ref} className="py-16 sm:py-20" id="solutions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <FadeIn inView={workflowSection.inView} delay={0}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                One Platform.
                <br />
                <span className="text-brand-forest-light">Every Operation Connected.</span>
              </h2>
            </FadeIn>
            <FadeIn inView={workflowSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                From the moment a reservation is made to the final report, every step flows through one
                system.
              </p>
            </FadeIn>
          </div>

          <OperationalTimeline inView={workflowSection.inView} />

          <FadeIn inView={workflowSection.inView} delay={400} className="mt-6 sm:mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-xs font-semibold text-brand-forest">
              <Activity className="w-3.5 h-3.5" />
              <span>Every action creates a connected audit trail</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 6. DASHBOARD SHOWCASE & ANALYTICS ───────────── */}
      <section ref={dashboardShowcase.ref} className="bg-white border-y border-border-subtle py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={dashboardShowcase.inView} delay={0}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                See Your Property at a Glance.
              </h2>
            </FadeIn>
            <FadeIn inView={dashboardShowcase.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                Real-time operational intelligence — occupancy, revenue, arrivals, room status, pending
                payments, and booking activity — all on one dashboard.
              </p>
            </FadeIn>
          </div>

          <FadeIn
            inView={dashboardShowcase.inView}
            delay={150}
            scale={true}
            className="bg-brand-sand/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border-subtle"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              {[
                { label: 'Occupancy', val: 78, suf: '%' },
                { label: "Today's Revenue", val: 86, suf: 'K', pre: '₹' },
                { label: 'Arrivals', val: 18, suf: '' },
                { label: 'Departures', val: 6, suf: '' },
                { label: 'Pending Payments', val: 3, suf: '' },
                { label: 'Available Rooms', val: 12, suf: '' },
              ].map((kpi, i) => (
                <div
                  key={kpi.label}
                  className="bg-white rounded-xl p-3 sm:p-4 border border-border-subtle"
                  style={{
                    opacity: dashboardShowcase.inView || reduced ? 1 : 0,
                    transform: dashboardShowcase.inView || reduced ? 'translateY(0)' : 'translateY(8px)',
                    transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${250 + i * 50}ms`,
                  }}
                >
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-ink-muted block truncate">
                    {kpi.label}
                  </span>
                  <div className="text-lg sm:text-xl font-serif font-bold mt-0.5 text-brand-forest">
                    <AnimatedCounter
                      target={kpi.val}
                      suffix={kpi.suf}
                      prefix={kpi.pre || ''}
                      inView={dashboardShowcase.inView}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-border-subtle">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    Occupancy Trend
                  </span>
                  <span className="text-[10px] text-status-green font-semibold">+12% ↑</span>
                </div>
                <div className="flex items-end gap-1 sm:gap-1.5 h-20 sm:h-24">
                  {[45, 52, 48, 65, 72, 78, 68, 85, 78, 82, 75, 78].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-brand-forest"
                      style={{
                        height: `${h}%`,
                        transform: dashboardShowcase.inView || reduced ? 'scaleY(1)' : 'scaleY(0)',
                        transformOrigin: 'bottom',
                        opacity: dashboardShowcase.inView || reduced ? (h >= 75 ? 1 : h >= 60 ? 0.7 : 0.4) : 0,
                        transition: reduced
                          ? 'opacity 0.2s ease'
                          : `transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${500 + i * 40}ms, opacity 0.4s ease ${500 + i * 40}ms`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-ink-muted">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F'].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 border border-border-subtle">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    Revenue (₹)
                  </span>
                  <span className="text-[10px] text-brand-forest font-semibold">This Week</span>
                </div>
                <div className="flex items-end gap-2 h-20 sm:h-24">
                  {[35, 48, 72, 55, 88, 65, 92].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-brand-forest"
                      style={{
                        height: `${h}%`,
                        transform: dashboardShowcase.inView || reduced ? 'scaleY(1)' : 'scaleY(0)',
                        transformOrigin: 'bottom',
                        opacity: dashboardShowcase.inView || reduced ? 0.5 + (h / 100) * 0.5 : 0,
                        transition: reduced
                          ? 'opacity 0.2s ease'
                          : `transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${600 + i * 60}ms, opacity 0.4s ease ${600 + i * 60}ms`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-ink-muted">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 7. MULTI-TENANT ARCHITECTURE ───────────── */}
      <section ref={multiTenant.ref} className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={multiTenant.inView} delay={0}>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                Built for Multiple Properties.
                <br />
                <span className="text-brand-forest-light">Isolated by Design.</span>
              </h2>
            </FadeIn>
            <FadeIn inView={multiTenant.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2.5">
                Every property operates in its own secure workspace. Hotel data, staff, bookings,
                billing, reports and settings remain strictly isolated through PostgreSQL Row-Level
                Security.
              </p>
            </FadeIn>
          </div>

          <div className="max-w-3xl mx-auto">
            <FadeIn inView={multiTenant.inView} delay={150} direction="down" className="text-center mb-5">
              <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-brand-forest text-white rounded-2xl shadow-xs">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-serif font-bold text-sm sm:text-base">{PRODUCT_NAME} Platform</span>
              </div>
            </FadeIn>

            <div className="flex justify-center mb-5">
              <svg width="400" height="48" viewBox="0 0 400 48" className="w-full max-w-sm">
                <line
                  x1="200" y1="0" x2="200" y2="24"
                  stroke="#1F3D3A" strokeWidth="1.5"
                  strokeDasharray="24"
                  strokeDashoffset={multiTenant.inView || reduced ? 0 : 24}
                  style={{ transition: reduced ? 'none' : 'stroke-dashoffset 0.4s ease 300ms' }}
                />
                <line
                  x1="66" y1="24" x2="334" y2="24"
                  stroke="#1F3D3A" strokeWidth="1.5"
                  strokeDasharray="268"
                  strokeDashoffset={multiTenant.inView || reduced ? 0 : 268}
                  style={{ transition: reduced ? 'none' : 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 450ms' }}
                />
                {[66, 200, 334].map((x, i) => (
                  <line
                    key={i}
                    x1={x} y1="24" x2={x} y2="48"
                    stroke="#1F3D3A" strokeWidth="1.5"
                    strokeDasharray="24"
                    strokeDashoffset={multiTenant.inView || reduced ? 0 : 24}
                    style={{ transition: reduced ? 'none' : `stroke-dashoffset 0.3s ease ${650 + i * 80}ms` }}
                  />
                ))}
              </svg>
            </div>

            <StaggerContainer
              inView={multiTenant.inView}
              baseDelay={600}
              staggerMs={100}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4"
            >
              {[
                { name: 'Hotel Alpha', location: 'Mumbai' },
                { name: 'Hotel Beta', location: 'Jaipur' },
                { name: 'Hotel Gamma', location: 'Goa' },
              ].map((hotel, i) => (
                <StaggerItem key={hotel.name} index={i}>
                  <FloatingCard
                    hoverY={-4}
                    className="bg-white rounded-2xl border border-border-subtle p-4 sm:p-5 text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-forest flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-ink">{hotel.name}</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">{hotel.location}</p>
                    <div className="mt-3 space-y-1 text-[11px] text-ink-muted pt-2.5 border-t border-border-subtle/60">
                      <div className="flex items-center justify-center gap-1.5">
                        <Crown className="w-3 h-3 text-brand-forest" />
                        <span>Owner</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Users className="w-3 h-3 text-brand-forest/70" />
                        <span>Staff</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Lock className="w-3 h-3 text-brand-forest/50" />
                        <span>Isolated Data</span>
                      </div>
                    </div>
                  </FloatingCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ───────────── 8. SECURITY & DATA PROTECTION TRUST SECTION ───────────── */}
      <section ref={securityTrustSection.ref} className="bg-white border-y border-border-subtle py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={securityTrustSection.inView} delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Trust & Reliability</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                Security & Data Protection
              </h2>
            </FadeIn>
            <FadeIn inView={securityTrustSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                Your hotel&apos;s operational data is separated by property and protected through
                authentication, role-based access controls and database-level tenant isolation.
              </p>
            </FadeIn>
          </div>

          <StaggerContainer
            inView={securityTrustSection.inView}
            baseDelay={120}
            staggerMs={80}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Database,
                title: 'Tenant Isolation',
                desc: 'Hotel data stays strictly separated by property via PostgreSQL Row-Level Security policies.',
              },
              {
                icon: KeyRound,
                title: 'Role-Based Access',
                desc: 'Each staff role (Owner, Manager, Reception, Housekeeping) receives strictly appropriate permissions.',
              },
              {
                icon: Lock,
                title: 'Secure Authentication',
                desc: 'Users authenticate through the PMS authentication system with digitally signed session tokens.',
              },
              {
                icon: Activity,
                title: 'Auditability',
                desc: 'Operational actions (check-ins, check-outs, room charges, payments) generate verifiable audit trails.',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <StaggerItem key={card.title} index={i}>
                  <FloatingCard
                    hoverY={-4}
                    className="p-5 rounded-2xl bg-brand-sand/30 border border-border-subtle h-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center mb-3 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-ink mb-1">{card.title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed">{card.desc}</p>
                  </FloatingCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="text-center mt-8">
            <Link
              href="/security"
              className="text-xs font-semibold text-brand-forest hover:underline inline-flex items-center gap-1"
            >
              <span>Read complete security architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── 9. CUSTOMER CASE STUDY (Hotel Greenery View) ───────────── */}
      <section ref={customerExample.ref} className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <FadeIn inView={customerExample.inView} delay={0}>
              <span className="text-[11px] uppercase tracking-widest font-bold text-brand-forest/60">
                Built for Real Hotel Operations
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest mt-1.5">
                Powering Live Properties Today.
              </h2>
            </FadeIn>
          </div>

          <FadeIn
            inView={customerExample.inView}
            delay={120}
            scale={true}
            className="max-w-lg mx-auto bg-white rounded-3xl border border-border-subtle p-5 sm:p-8 text-center shadow-xs"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-forest text-white flex items-center justify-center mx-auto mb-3.5 shadow-sm">
              <Hotel className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-brand-forest">Hotel Greenery View</h3>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-xs sm:text-sm text-ink-muted">
              <MapPin className="w-3.5 h-3.5 text-brand-forest/70" />
              <span>Gangtok, Sikkim</span>
            </div>
            <p className="text-xs text-ink-muted mt-3 leading-relaxed max-w-sm mx-auto">
              A boutique hospitality property in the foothills of the Eastern Himalayas, running its
              complete operations — front desk, billing, housekeeping, F&B, and reporting — on {PRODUCT_NAME}.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-border-subtle">
              <div>
                <span className="text-base sm:text-lg font-serif font-bold text-brand-forest">19</span>
                <span className="block text-[10px] text-ink-muted">Rooms</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-serif font-bold text-brand-forest">4</span>
                <span className="block text-[10px] text-ink-muted">Staff Roles</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-serif font-bold text-brand-forest">12</span>
                <span className="block text-[10px] text-ink-muted">Modules</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 10. FAQ SECTION ───────────── */}
      <section ref={faqSection.ref} className="bg-white border-y border-border-subtle py-16 sm:py-24" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <FadeIn inView={faqSection.inView} delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-forest/8 border border-brand-forest/15 text-brand-forest text-xs font-semibold mb-3">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest">
                Got Questions? We Have Answers.
              </h2>
            </FadeIn>
            <FadeIn inView={faqSection.inView} delay={80}>
              <p className="text-xs sm:text-sm text-ink-muted mt-2">
                Everything you need to know about Grove&apos;s hotel PMS features, architecture, and onboarding.
              </p>
            </FadeIn>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <FadeIn key={faq.q} inView={faqSection.inView} delay={100 + i * 40}>
                  <div className="rounded-2xl border border-border-subtle bg-brand-sand/30 overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-brand-forest hover:text-brand-forest-light transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-brand-forest' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-ink-muted leading-relaxed border-t border-border-subtle/50 mt-1">
                        <p className="pt-3">{faq.a}</p>
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/faqs"
              className="text-xs font-semibold text-brand-forest hover:underline inline-flex items-center gap-1"
            >
              <span>View full knowledge base & FAQs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── 11. FINAL CTA ───────────── */}
      <section ref={ctaSection.ref} className="py-20 sm:py-28 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(31,61,58,0.04) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeIn inView={ctaSection.inView} delay={0}>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-brand-forest max-w-2xl mx-auto leading-tight">
              Ready to Run Your Property
              <br />
              <span className="text-brand-forest-light">From One Platform?</span>
            </h2>
          </FadeIn>
          <FadeIn inView={ctaSection.inView} delay={80}>
            <p className="mt-3.5 text-xs sm:text-base text-ink-muted max-w-lg mx-auto">
              Bring reservations, operations, billing, housekeeping and reporting into one connected
              system.
            </p>
          </FadeIn>
          <FadeIn inView={ctaSection.inView} delay={160}>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                href="/register-hotel"
                className="w-full sm:w-auto bg-brand-forest text-white font-semibold px-8 py-3.5 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm sm:text-base group transition-all duration-200 hover:bg-brand-forest-light"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white text-ink font-semibold px-7 py-3.5 rounded-xl border border-border-subtle shadow-2xs flex items-center justify-center text-sm sm:text-base transition-all duration-200 hover:bg-brand-sand/50"
              >
                Sign In
              </Link>
            </div>
          </FadeIn>

          {/* Legal Acknowledgement note */}
          <FadeIn inView={ctaSection.inView} delay={220}>
            <p className="text-[11px] text-ink-muted mt-4 max-w-sm mx-auto">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-brand-forest font-medium hover:underline">
                Terms of Service
              </Link>{' '}
              and acknowledge our{' '}
              <Link href="/privacy-policy" className="text-brand-forest font-medium hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ───────────── 12. SAAS FOOTER ───────────── */}
      <PublicFooter />
    </div>
  );
}
