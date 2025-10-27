// investease Navigation Icons - History
// Simple, clean clock - your tracked journey

import React from 'react';

/**
 * History Navigation Icon - Simple Clock
 * 
 * Purpose: View transaction history and past activity
 * User Impact: Sarah's "safety net" - all actions are tracked and reviewable
 * Visual: Clean clock face = time-based records, organized history
 * 
 * @param {number} size - Icon size in pixels (default: 24)
 * @param {string} className - Optional CSS classes
 * @param {boolean} isActive - Whether this nav item is currently active
 * 
 * Usage:
 * <HistoryIcon size={24} isActive={false} />
 * <HistoryIcon size={28} isActive={true} className="nav-icon" />
 */
export const HistoryIcon = ({ 
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
          <linearGradient id="historyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        
        {/* Clock circle - filled with gradient */}
        <circle 
          cx="12" 
          cy="12" 
          r="9" 
          fill="url(#historyGradient)"
        />
        
        {/* Clock hour markers - white dots for detail */}
        <circle cx="12" cy="5" r="1" fill="white" opacity="0.5" />
        <circle cx="16.6" cy="6.4" r="1" fill="white" opacity="0.5" />
        <circle cx="19" cy="12" r="1" fill="white" opacity="0.5" />
        <circle cx="16.6" cy="17.6" r="1" fill="white" opacity="0.5" />
        <circle cx="12" cy="19" r="1" fill="white" opacity="0.5" />
        <circle cx="7.4" cy="17.6" r="1" fill="white" opacity="0.5" />
        <circle cx="5" cy="12" r="1" fill="white" opacity="0.5" />
        <circle cx="7.4" cy="6.4" r="1" fill="white" opacity="0.5" />
        
        {/* Center dot */}
        <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.8" />
        
        {/* Clock hands - white, simple and clear */}
        <line x1="12" y1="12" x2="12" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  
  // Inactive state: Outlined clock with duotone hands
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clock circle outline - primary color */}
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        stroke={primaryColor} 
        strokeWidth="2"
      />
      
      {/* Clock hour markers - primary color dots */}
      <circle cx="12" cy="5" r="1" fill={primaryColor} opacity="0.5" />
      <circle cx="16.6" cy="6.4" r="1" fill={primaryColor} opacity="0.5" />
      <circle cx="19" cy="12" r="1" fill={primaryColor} opacity="0.5" />
      <circle cx="16.6" cy="17.6" r="1" fill={primaryColor} opacity="0.5" />
      <circle cx="12" cy="19" r="1" fill={primaryColor} opacity="0.5" />
      <circle cx="7.4" cy="17.6" r="1" fill={primaryColor} opacity="0.5" />
      <circle cx="5" cy="12" r="1" fill={primaryColor} opacity="0.5" />
      <circle cx="7.4" cy="6.4" r="1" fill={primaryColor} opacity="0.5" />
      
      {/* Center dot */}
      <circle cx="12" cy="12" r="1.5" fill={primaryColor} opacity="0.6" />
      
      {/* Clock hands - hour hand in primary, minute hand in secondary for duotone */}
      <line 
        x1="12" 
        y1="12" 
        x2="12" 
        y2="7" 
        stroke={primaryColor} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <line 
        x1="12" 
        y1="12" 
        x2="16" 
        y2="12" 
        stroke={secondaryColor} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
};

export default HistoryIcon;