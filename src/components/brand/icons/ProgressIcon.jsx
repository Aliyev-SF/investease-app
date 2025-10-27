// investease Navigation Icons - Progress
// Trophy - celebrating achievements and milestones

import React from 'react';

/**
 * Progress Navigation Icon - Trophy
 * 
 * Purpose: Track achievements, milestones, and learning progress
 * User Impact: Sarah's "celebration hub" - see how far you've come
 * Visual: Trophy = universal symbol of achievement and success
 * 
 * @param {number} size - Icon size in pixels (default: 24)
 * @param {string} className - Optional CSS classes
 * @param {boolean} isActive - Whether this nav item is currently active
 * 
 * Usage:
 * <ProgressIcon size={24} isActive={false} />
 * <ProgressIcon size={28} isActive={true} className="nav-icon" />
 */
export const ProgressIcon = ({ 
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
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        
        {/* Trophy cup body - filled with gradient */}
        <path 
          d="M7 4H17V10C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10V4Z" 
          fill="url(#progressGradient)"
        />
        
        {/* Left handle - secondary color */}
        <path 
          d="M7 6H5C4.44772 6 4 6.44772 4 7V8C4 9.10457 4.89543 10 6 10H7" 
          fill={secondaryColor}
        />
        
        {/* Right handle - secondary color */}
        <path 
          d="M17 6H19C19.5523 6 20 6.44772 20 7V8C20 9.10457 19.1046 10 18 10H17" 
          fill={secondaryColor}
        />
        
        {/* Trophy stem - white */}
        <rect 
          x="11" 
          y="15" 
          width="2" 
          height="4" 
          fill="white"
          opacity="0.8"
        />
        
        {/* Trophy base - secondary color */}
        <rect 
          x="8" 
          y="19" 
          width="8" 
          height="2" 
          rx="1"
          fill={secondaryColor}
        />
        
        {/* Decorative star/sparkle on cup - white */}
        <path 
          d="M12 7L12.5 8.5L14 9L12.5 9.5L12 11L11.5 9.5L10 9L11.5 8.5L12 7Z" 
          fill="white"
          opacity="0.6"
        />
      </svg>
    );
  }
  
  // Inactive state: Outlined trophy with duotone handles
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trophy cup body outline - primary color */}
      <path 
        d="M7 4H17V10C17 12.7614 14.7614 15 12 15C9.23858 15 7 12.7614 7 10V4Z" 
        stroke={primaryColor} 
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Left handle - secondary color for duotone */}
      <path 
        d="M7 6H5C4.44772 6 4 6.44772 4 7V8C4 9.10457 4.89543 10 6 10H7" 
        stroke={secondaryColor} 
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Right handle - secondary color for duotone */}
      <path 
        d="M17 6H19C19.5523 6 20 6.44772 20 7V8C20 9.10457 19.1046 10 18 10H17" 
        stroke={secondaryColor} 
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Trophy stem - primary color */}
      <line 
        x1="12" 
        y1="15" 
        x2="12" 
        y2="19" 
        stroke={primaryColor} 
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Trophy base - secondary color */}
      <rect 
        x="8" 
        y="19" 
        width="8" 
        height="2" 
        rx="1"
        stroke={secondaryColor}
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Decorative star on cup - primary color */}
      <path 
        d="M12 7L12.5 8.5L14 9L12.5 9.5L12 11L11.5 9.5L10 9L11.5 8.5L12 7Z" 
        fill={primaryColor}
        opacity="0.4"
      />
    </svg>
  );
};

export default ProgressIcon;