import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Reusable Skeleton Primitive matching Hotel Greenery View PMS design system.
 * Uses warm off-white/beige tones with hardware-accelerated horizontal shimmer.
 */
export function Skeleton({
  className = '',
  variant = 'rounded',
  width,
  height,
  animate = true,
  style,
  ...props
}: SkeletonProps) {
  const variantClass = {
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-3.5 w-full',
  }[variant];

  return (
    <div
      className={`
        bg-brand-sand-dark/65
        ${animate ? 'pms-skeleton' : ''}
        ${variantClass}
        ${className}
      `}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({
  className = '',
  width = '100%',
  height = '0.875rem',
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      variant="text"
      width={width}
      height={height}
      className={`my-0.5 ${className}`}
      {...props}
    />
  );
}

export function SkeletonBadge({
  className = '',
  width = '4rem',
  height = '1.375rem',
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={height}
      className={`rounded-md ${className}`}
      {...props}
    />
  );
}

export function SkeletonButton({
  className = '',
  width = '6rem',
  height = '2.25rem',
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
