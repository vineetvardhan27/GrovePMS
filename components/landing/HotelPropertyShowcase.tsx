'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { useReducedMotion } from './animations';

interface HotelPropertyShowcaseProps {
  className?: string;
}

export default function HotelPropertyShowcase({ className = '' }: HotelPropertyShowcaseProps) {
  const prefersReduced = useReducedMotion();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Normalized coordinates from -0.5 to 0.5
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;

    // Gentle parallax translation (max 10px X, 7px Y)
    setMouseOffset({
      x: Math.round(normX * 12),
      y: Math.round(normY * 8),
    });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden flex flex-col justify-end p-5 sm:p-6 lg:p-7 text-white min-h-[320px] sm:min-h-[380px] lg:min-h-full ${className}`}
    >
      {/* Background Image Container with Gentle Reveal, Parallax & Hover Zoom */}
      <div
        className="absolute inset-[-14px] pointer-events-none transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: prefersReduced
            ? 'none'
            : `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0) scale(${isHovered ? 1.05 : 1.01})`,
        }}
        aria-hidden="true"
      >
        <Image
          src="/images/hotel-greenery-view.jpg"
          alt="Authentic photograph of Hotel Greenery View property in Gangtok, Sikkim"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`object-cover object-[center_18%] transition-all duration-700 ease-out ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          onLoad={() => setImageLoaded(true)}
          priority={false}
        />
      </div>

      {/* Subtle Dark Emerald Gradient at Bottom */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#081C19]/95 via-[#0A221E]/40 via-45% to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Emerald Ambient Light Accent */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Bottom Glassmorphic Overlay: Powered by Grove PMS & Gangtok, Sikkim */}
      <div
        className="relative z-10 flex items-center justify-between gap-2.5 flex-wrap transition-transform duration-500 ease-out"
        style={{
          transform: prefersReduced
            ? 'none'
            : `translate3d(${-mouseOffset.x * 0.25}px, ${-mouseOffset.y * 0.25}px, 0)`,
        }}
      >
        {/* Glassmorphic Badge: Powered by Grove PMS */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-medium shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/35">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)] animate-pulse" />
          <span className="tracking-wide">Powered by Grove PMS</span>
        </div>

        {/* Small Location Label: Gangtok, Sikkim */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white/95 text-xs font-medium shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>Gangtok, Sikkim</span>
        </div>
      </div>
    </div>
  );
}
