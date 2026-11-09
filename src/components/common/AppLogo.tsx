// Authentic brand logo component using the official GHC graphic identity.
// Identity: Monogram 'GHC' in Neobank Mint palette with golden tilted crown and delivery truck.
import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const dimensions = {
    sm: { height: 32, imgHeight: 'h-8', fontSize: 'text-sm', subSize: 'text-[10px]' },
    md: { height: 40, imgHeight: 'h-10', fontSize: 'text-base', subSize: 'text-xs' },
    lg: { height: 56, imgHeight: 'h-14', fontSize: 'text-xl', subSize: 'text-sm' },
    xl: { height: 72, imgHeight: 'h-18', fontSize: 'text-2xl', subSize: 'text-base' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official GHC Emblem Image */}
      <img
        src="/images/app-logo.png"
        onError={(e) => {
          // Fallback to jpg if png is not found
          (e.currentTarget as HTMLImageElement).src = '/images/app-logo.jpg';
        }}
        alt="Logo GHC - Giao Hàng TMĐT"
        className={`${dimensions.imgHeight} w-auto object-contain flex-shrink-0 drop-shadow-2xs`}
      />

      {/* Brand Text Identity */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-extrabold text-[#0D3B2E] tracking-tight leading-tight ${dimensions.fontSize}`}>
            Giao Hàng TMĐT
          </div>
          <div className={`text-[#6B8679] font-medium leading-none mt-0.5 ${dimensions.subSize}`}>
            Dịch vụ Giao hàng & Vận chuyển Thông minh
          </div>
        </div>
      )}
    </div>
  );
};
