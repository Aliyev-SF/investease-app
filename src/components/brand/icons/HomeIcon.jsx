// investease Navigation Icons - Home/Dashboard
// Duotone style with active/inactive states

import React from 'react';

/**
 * Home/Dashboard Navigation Icon
 * 
 * Purpose: Main navigation to user's dashboard/landing page
 * User Impact: Sarah's "safe anchor point" - where she returns when feeling overwhelmed
 * 
 * @param {number} size - Icon size in pixels (default: 24)
 * @param {string} className - Optional CSS classes
 * @param {boolean} isActive - Whether this nav item is currently active
 * 
 * Usage:
 * <HomeIcon size={24} isActive={false} />
 * <HomeIcon size={28} isActive={true} className="nav-icon" />
 */
export const HomeIcon = ({ 
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
          <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        
        {/* House shape - filled */}
        <path 
          d="M3 12L5 10.2V20C5 20.5523 5.44772 21 6 21H10V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V21H18C18.5523 21 19 20.5523 19 20V10.2L21 12L22.5 10.5L12 2L1.5 10.5L3 12Z" 
          fill="url(#homeGradient)"
        />
      </svg>
    );
  }
  
  // Inactive state: Outlined with duotone accent
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* House outline - primary color */}
      <path 
        d="M3 12L5 10.2V20C5 20.5523 5.44772 21 6 21H10V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V21H18C18.5523 21 19 20.5523 19 20V10.2L21 12" 
        stroke={primaryColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Roof - secondary color for depth */}
      <path 
        d="M22.5 10.5L12 2L1.5 10.5" 
        stroke={secondaryColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Door accent - secondary color */}
      <rect 
        x="11" 
        y="15" 
        width="2" 
        height="6" 
        rx="1"
        fill={secondaryColor}
        opacity="0.3"
      />
    </svg>
  );
};

export default HomeIcon;