'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../../lib/utils/currency';

interface AnimatedKpiValueProps {
  value: number;
  type?: 'currency' | 'number' | 'percent';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * AnimatedKpiValue
 * Smoothly animates numerical KPI values on mount and value changes with ease-out cubic transition.
 * Automatically respects prefers-reduced-motion.
 * Formats numbers according to Indian locale (en-IN) and currency standards.
 */
export default function AnimatedKpiValue({
  value,
  type = 'number',
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedKpiValueProps) {
  const [displayValue, setDisplayValue] = useState<number>(() => {
    // Check for reduced motion preference on initial render if window exists
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return value;
    }
    return 0;
  });

  const prevValueRef = useRef<number>(0);
  const isFirstRenderRef = useRef<boolean>(true);

  useEffect(() => {
    // If reduced motion is enabled, set value directly without animation
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = isFirstRenderRef.current ? 0 : prevValueRef.current;
    isFirstRenderRef.current = false;
    prevValueRef.current = value;

    if (startValue === value) {
      setDisplayValue(value);
      return;
    }

    const duration = 500; // ms
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value]);

  const formatted = (() => {
    if (type === 'currency') {
      return formatCurrency(displayValue);
    }
    if (type === 'percent') {
      const formattedNum = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue);
      return `${prefix}${formattedNum}%${suffix}`;
    }
    // Number type
    const formattedNum =
      decimals > 0
        ? new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(displayValue)
        : new Intl.NumberFormat('en-IN').format(Math.round(displayValue));
    return `${prefix}${formattedNum}${suffix}`;
  })();

  return <span className={`tabular-nums ${className}`}>{formatted}</span>;
}
