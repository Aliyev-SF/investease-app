// investease Navigation Icons - Learn
// Open book with bookmark - accessible knowledge and education

import React from 'react';

/**
 * Learn Navigation Icon - Open Book
 * 
 * Purpose: Access educational resources, guides, and tutorials
 * User Impact: Sarah's "confidence builder" - learning is accessible and empowering
 * Visual: Open book with bookmark = knowledge is waiting for you, not intimidating
 * 
 * @param {number} size - Icon size in pixels (default: 24)
 * @param {string} className - Optional CSS classes
 * @param {boolean} isActive - Whether this nav item is currently active
 * 
 * Usage:
 * <LearnIcon size={24} isActive={false} />
 * <LearnIcon size={28} isActive={true} className="nav-icon" />
 */
export const LearnIcon = ({ 
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
          <linearGradient id="learnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        
        {/* Open book pages - filled with gradient */}
        <path 
          d="M2 3H8C9.5 3 11 4 12 5C13 4 14.5 3 16 3H22V17H16C14.5 17 13 18 12 19C11 18 9.5 17 8 17H2V3Z" 
          fill="url(#learnGradient)"
        />
        
        {/* Center spine/divide - white for definition */}
        <line 
          x1="12" 
          y1="5" 
          x2="12" 
          y2="19" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
          opacity="0.4"
        />
        
        {/* Page lines - left page */}
        <g opacity="0.3">
          <line x1="4" y1="7" x2="9" y2="7" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          <line x1="4" y1="10" x2="9" y2="10" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          <line x1="4" y1="13" x2="9" y2="13" stroke="white" strokeWidth="1" strokeLinecap="round"/>
        </g>
        
        {/* Page lines - right page */}
        <g opacity="0.3">
          <line x1="15" y1="7" x2="20" y2="7" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          <line x1="15" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          <line x1="15" y1="13" x2="20" y2="13" stroke="white" strokeWidth="1" strokeLinecap="round"/>
        </g>
        
        {/* Bookmark ribbon - secondary color, solid */}
        <path 
          d="M12 5L10 3V17L12 15L14 17V3L12 5Z" 
          fill={secondaryColor}
          opacity="0.8"
        />
      </svg>
    );
  }
  
  // Inactive state: Outlined open book with duotone bookmark
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left page outline - primary color */}
      <path 
        d="M2 3H8C9.5 3 11 4 12 5V19C11 18 9.5 17 8 17H2V3Z" 
        stroke={primaryColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Right page outline - primary color */}
      <path 
        d="M22 3H16C14.5 3 13 4 12 5V19C13 18 14.5 17 16 17H22V3Z" 
        stroke={primaryColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Page lines - left page (subtle detail) */}
      <g opacity="0.4">
        <line x1="4" y1="7" x2="9" y2="7" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="4" y1="10" x2="9" y2="10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="4" y1="13" x2="8" y2="13" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      
      {/* Page lines - right page (subtle detail) */}
      <g opacity="0.4">
        <line x1="15" y1="7" x2="20" y2="7" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="15" y1="10" x2="20" y2="10" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="16" y1="13" x2="20" y2="13" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      
      {/* Bookmark ribbon - secondary color for personality */}
      <path 
        d="M12 5L10 3V17L12 15L14 17V3L12 5Z" 
        fill={secondaryColor}
        opacity="0.6"
      />
    </svg>
  );
};

export default LearnIcon;