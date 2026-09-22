'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

/* ══════════════════════════════════════════════════════════════
 * RESPONSIVE MOTION TOKENS & HOOKS
 * ══════════════════════════════════════════════════════════════ */

/** Hook to detect prefers-reduced-motion */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/** Hook to detect mobile viewports (< 768px) for adaptive animation distances */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/** Hook to detect when an element enters the viewport */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setInView(true);
      return;
    }

    // Immediately trigger if element is already within the visible viewport window
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

/* ══════════════════════════════════════════════════════════════
 * ANIMATED COUNTER (Digit-by-digit with ease-out cubic)
 * ══════════════════════════════════════════════════════════════ */
export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 1600,
  inView,
  className = '',
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  inView: boolean;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;

    if (reduced) {
      setCount(target);
      return;
    }

    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      setCount(value);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [inView, target, duration, reduced]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
 * FADE IN / REVEAL ON SCROLL COMPONENT
 * ══════════════════════════════════════════════════════════════ */
export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  inView?: boolean;
  scale?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  distance,
  inView: explicitInView,
  scale = false,
  className = '',
  style,
  ...props
}: FadeInProps) {
  const { ref, inView: observerInView } = useInView();
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const isVisible = explicitInView !== undefined ? explicitInView : observerInView;

  // Responsive translation distance: 14px on mobile, 24px on desktop
  const defaultDist = isMobile ? 14 : 24;
  const dist = distance !== undefined ? (isMobile ? Math.round(distance * 0.6) : distance) : defaultDist;

  // Responsive stagger delay: shorter on mobile
  const actualDelay = isMobile ? Math.round(delay * 0.7) : delay;

  let transformInitial = 'none';
  if (direction === 'up') transformInitial = `translateY(${dist}px)`;
  else if (direction === 'down') transformInitial = `translateY(-${dist}px)`;
  else if (direction === 'left') transformInitial = `translateX(${dist}px)`;
  else if (direction === 'right') transformInitial = `translateX(-${dist}px)`;

  if (scale) {
    transformInitial = `${transformInitial === 'none' ? '' : transformInitial} scale(${isMobile ? 0.98 : 0.96})`;
  }

  const transformFinal = scale ? 'translateY(0) scale(1)' : 'translate(0, 0)';

  return (
    <div
      ref={explicitInView === undefined ? ref : undefined}
      className={className}
      style={{
        opacity: isVisible || reduced ? 1 : 0,
        transform: isVisible || reduced ? transformFinal : transformInitial,
        transition: reduced
          ? 'opacity 0.2s ease'
          : `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${actualDelay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${actualDelay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * STAGGER CONTAINER & ITEMS
 * ══════════════════════════════════════════════════════════════ */
interface StaggerContextType {
  inView: boolean;
  baseDelay: number;
  staggerMs: number;
}

const StaggerContext = createContext<StaggerContextType>({
  inView: false,
  baseDelay: 0,
  staggerMs: 80,
});

export function StaggerContainer({
  children,
  baseDelay = 100,
  staggerMs = 80,
  className = '',
  inView: explicitInView,
  ...props
}: {
  children: React.ReactNode;
  baseDelay?: number;
  staggerMs?: number;
  className?: string;
  inView?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { ref, inView: observerInView } = useInView();
  const isMobile = useIsMobile();
  const inView = explicitInView !== undefined ? explicitInView : observerInView;

  // Responsive stagger on mobile (50ms vs 80ms)
  const actualStagger = isMobile ? Math.max(40, Math.round(staggerMs * 0.65)) : staggerMs;
  const actualBase = isMobile ? Math.round(baseDelay * 0.7) : baseDelay;

  return (
    <StaggerContext.Provider value={{ inView, baseDelay: actualBase, staggerMs: actualStagger }}>
      <div ref={explicitInView === undefined ? ref : undefined} className={className} {...props}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
}

export function StaggerItem({
  children,
  index,
  className = '',
  scale = false,
  direction = 'up',
  distance,
  style,
  ...props
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
  scale?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { inView, baseDelay, staggerMs } = useContext(StaggerContext);
  const delay = baseDelay + index * staggerMs;

  return (
    <FadeIn
      inView={inView}
      delay={delay}
      scale={scale}
      direction={direction}
      distance={distance}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </FadeIn>
  );
}

/* ══════════════════════════════════════════════════════════════
 * FLOATING CARD (Subtle desktop hover elevation, tap-friendly)
 * ══════════════════════════════════════════════════════════════ */
export function FloatingCard({
  children,
  className = '',
  hoverY = -4,
  style,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hoverY?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  return (
    <div
      className={`transition-all duration-300 ${className}`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (isMobile || reduced) return;
        e.currentTarget.style.transform = `translateY(${hoverY}px)`;
        e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(31, 61, 58, 0.12)';
        e.currentTarget.style.borderColor = 'rgba(31, 61, 58, 0.25)';
      }}
      onMouseLeave={(e) => {
        if (isMobile || reduced) return;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '';
      }}
      {...props}
    >
      {children}
    </div>
  );
}
