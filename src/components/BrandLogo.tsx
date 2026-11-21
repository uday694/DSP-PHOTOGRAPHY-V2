import React from 'react';

interface BrandLogoProps {
  brandName?: string;
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  brandName = 'DSP PHOTOGRAPHY',
  compact = false,
}) => {
  return (
    <div className="inline-flex items-center gap-3.5 select-none group">
      <div className="relative w-11 h-11 flex items-center justify-center rounded-full border border-[#D4AF37]/60 bg-[#0E0E12] shadow-[0_0_25px_rgba(212,175,55,0.22)] group-hover:border-[#F5E6B3] transition-all duration-500">
        <div className="absolute inset-1 rounded-full border border-[#D4AF37]/25" />
        <svg
          viewBox="0 0 64 64"
          className="w-6 h-6 text-[#D4AF37] transition-transform duration-700 group-hover:rotate-90"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <circle cx="32" cy="32" r="25" strokeOpacity="0.45" />
          <circle cx="32" cy="32" r="9.5" />
          <line x1="32" y1="7" x2="40.5" y2="26.5" />
          <line x1="53.6" y1="19.5" x2="37.5" y2="33" />
          <line x1="53.6" y1="44.5" x2="33" y2="41" />
          <line x1="32" y1="57" x2="23.5" y2="37.5" />
          <line x1="10.4" y1="44.5" x2="26.5" y2="31" />
          <line x1="10.4" y1="19.5" x2="31" y2="23" />
        </svg>
      </div>

      {!compact && (
        <div className="flex flex-col text-left">
          <span className="font-display text-lg sm:text-xl font-bold tracking-[0.22em] text-[#F7F6F2] leading-none">
            {brandName}
          </span>
          <span className="text-[9px] uppercase tracking-[0.36em] text-[#D4AF37] mt-1.5">
            Fine Art & Cinema Studio
          </span>
        </div>
      )}
    </div>
  );
};
