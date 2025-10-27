// investease Navigation Icons - Portfolio
// Duotone briefcase style with active/inactive states

import React from 'react';

/**
 * Portfolio Navigation Icon
 * 
 * Purpose: View investment holdings and performance
 * User Impact: Sarah's "achievement center" - where she sees her progress and gains
 * Visual: Professional briefcase that feels organized but approachable
 * 
 * @param {number} size - Icon size in pixels (default: 24)
 * @param {string} className - Optional CSS classes
 * @param {boolean} isActive - Whether this nav item is currently active
 * 
 * Usage:
 * <PortfolioIcon size={24} isActive={false} />
 * <PortfolioIcon size={28} isActive={true} className="nav-icon" />
 */
export const PortfolioIcon = ({ 
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
          <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        
        {/* Briefcase body - filled */}
        <path 
          d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" 
          fill="url(#portfolioGradient)"
        />
        
        {/* Handle - filled */}
        <path 
          d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" 
          fill={secondaryColor}
        />
        
        {/* Center divider accent */}
        <rect 
          x="11" 
          y="12" 
          width="2" 
          height="4" 
          rx="1"
          fill="white"
          opacity="0.4"
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
      {/* Briefcase body outline - primary color */}
      <path 
        d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" 
        stroke={primaryColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Handle - secondary color for depth */}
      <path 
        d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" 
        stroke={secondaryColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Center divider line - secondary color */}
      <line 
        x1="12" 
        y1="11" 
        x2="12" 
        y2="16" 
        stroke={secondaryColor} 
        strokeWidth="2" 
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Small document detail inside - adds "holdings" feel */}
      <path 
        d="M7 14H9M15 14H17" 
        stroke={primaryColor} 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
};

export default PortfolioIcon;