'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface GroveButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  withArrow?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  ariaLabel?: string;
  target?: string;
  rel?: string;
}

export default function GroveButton({
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  children,
  icon,
  withArrow = false,
  className = '',
  type = 'button',
  disabled = false,
  ariaLabel,
  target,
  rel,
}: GroveButtonProps) {
  // Size-specific paddings & font styling
  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px]',
    md: 'text-[13px] sm:text-sm px-5 py-2.5 min-h-[44px]',
    lg: 'text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 min-h-[48px]',
  }[size];

  // Variant styling
  const variantClasses = {
    primary: 'cta-primary',
    secondary: 'cta-secondary',
    glass: 'cta-glass',
    text: 'inline-flex items-center gap-1.5 font-semibold text-brand-forest hover:text-brand-forest-light text-xs sm:text-sm transition-colors group p-0 min-h-0',
  }[variant];

  const baseClasses =
    variant === 'text'
      ? `${variantClasses} ${className}`
      : `relative inline-flex items-center justify-center rounded-full select-none text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 motion-reduce:transition-none motion-reduce:transform-none ${sizeClasses} ${variantClasses} ${className} ${
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`;

  const content = (
    <>
      {variant === 'primary' && (
        <span
          className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {withArrow && (
        <ArrowRight
          className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={`group ${baseClasses}`}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={`group ${baseClasses}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
