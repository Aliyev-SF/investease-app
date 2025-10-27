// investease Navigation Icons - Market
// Simple, clean globe - global markets made approachable

import React from 'react';

/**
 * Market Navigation Icon - Simple Globe
 * 
 * Purpose: Access live market data and browse investment opportunities
 * User Impact: Sarah's "exploration hub" - global markets made simple and approachable
 * Visual: Clean globe with meridian lines = international markets without intimidation
 * 
 * @param {number} size - Icon size in pixels (default: 24)
 * @param {string} className - Optional CSS classes
 * @param {boolean} isActive - Whether this nav item is currently active
 * 
 * Usage:
 * <MarketIcon size={24} isActive={false} />
 * <MarketIcon size={28} isActive={true} className="nav-icon" />
 */
export const MarketIcon = ({ 
  size = 24, 
  className = "", 
  isActive = false 
}) => {
  // Brand colors from investease guidelines
  const primaryColor = "#667eea";    // Brand Purple
  const secondaryColor = "#764ba2";  // Deep Purple
  
  if (isActive) {
    // Active state: Filled with gradient for clear visual feedback
    return (
      <svg 
        className={className}
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="marketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        
        {/* Globe circle - filled with gradient */}
        <circle 
          cx="12" 
          cy="12" 
          r="9" 
          fill="url(#marketGradient)"
        />
        
        {/* Vertical meridian lines - white overlay for detail */}
        <path 
          d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21M12 3C12 3 15 7 15 12C15 17 12 21 12 21" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          opacity="0.5"
        />
        
        {/* Horizontal equator line - white overlay */}
        <line 
          x1="3" 
          y1="12" 
          x2="21" 
          y2="12" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          opacity="0.5"
        />
        
        {/* Optional: Small continents suggestion (subtle detail) */}
        <circle cx="8" cy="9" r="1.5" fill="white" opacity="0.3" />
        <circle cx="16" cy="10" r="1" fill="white" opacity="0.3" />
        <circle cx="14" cy="15" r="1.2" fill="white" opacity="0.3" />
      </svg>
    );
  }
  
  // Inactive state: Clean outlined globe with duotone
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Globe circle outline - primary color */}
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        stroke={primaryColor} 
        strokeWidth="2"
      />
      
      {/* Vertical meridian lines - primary color */}
      <path 
        d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21M12 3C12 3 15 7 15 12C15 17 12 21 12 21" 
        stroke={primaryColor} 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Horizontal equator line - secondary color for depth */}
      <line 
        x1="3" 
        y1="12" 
        x2="21" 
        y2="12" 
        stroke={secondaryColor} 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Optional: Small continents suggestion (very subtle) */}
      <circle cx="8" cy="9" r="1.5" fill={primaryColor} opacity="0.3" />
      <circle cx="16" cy="10" r="1" fill={primaryColor} opacity="0.3" />
      <circle cx="14" cy="15" r="1.2" fill={primaryColor} opacity="0.3" />
    </svg>
  );
};

export default MarketIcon;