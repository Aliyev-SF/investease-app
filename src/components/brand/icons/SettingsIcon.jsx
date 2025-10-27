// investease Navigation Icons - Settings
// Classic symmetric gear/cog - control and customize your experience

import React from 'react';

/**
 * Settings Navigation Icon - Classic Gear/Cog
 * 
 * Purpose: Access app settings, preferences, and account configuration
 * User Impact: Sarah's "control center" - customize your InvestEase experience
 * Visual: Classic symmetric gear = universal settings symbol
 * 
 * @param {number} size - Icon size in pixels (default: 24)
 * @param {string} className - Optional CSS classes
 * @param {boolean} isActive - Whether this nav item is currently active
 * 
 * Usage:
 * <SettingsIcon size={24} isActive={false} />
 * <SettingsIcon size={28} isActive={true} className="nav-icon" />
 */
export const SettingsIcon = ({ 
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
          <linearGradient id="settingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        
        {/* Classic symmetric gear shape - filled with gradient */}
        <path 
          d="M10.5 2H13.5L14 4.5C14.6 4.7 15.2 5 15.7 5.3L18 4L19.5 5.5L18.3 7.8C18.6 8.3 18.9 8.9 19.1 9.5L21.5 10V13L19 13.5C18.8 14.1 18.5 14.7 18.2 15.2L19.5 17.5L18 19L15.7 17.8C15.2 18.1 14.6 18.4 14 18.6L13.5 21H10.5L10 18.5C9.4 18.3 8.8 18 8.3 17.7L6 19L4.5 17.5L5.7 15.2C5.4 14.7 5.1 14.1 4.9 13.5L2.5 13V10L5 9.5C5.2 8.9 5.5 8.3 5.8 7.8L4.5 5.5L6 4L8.3 5.2C8.8 4.9 9.4 4.6 10 4.4L10.5 2Z" 
          fill="url(#settingsGradient)"
        />
        
        {/* Center circle - secondary color for contrast */}
        <circle 
          cx="12" 
          cy="11.5" 
          r="4" 
          fill={secondaryColor}
        />
        
        {/* Inner hole - white for depth */}
        <circle 
          cx="12" 
          cy="11.5" 
          r="2.5" 
          fill="white"
          opacity="0.5"
        />
      </svg>
    );
  }
  
  // Inactive state: Outlined gear with duotone center
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Classic symmetric gear shape - primary color outline */}
      <path 
        d="M10.5 2H13.5L14 4.5C14.6 4.7 15.2 5 15.7 5.3L18 4L19.5 5.5L18.3 7.8C18.6 8.3 18.9 8.9 19.1 9.5L21.5 10V13L19 13.5C18.8 14.1 18.5 14.7 18.2 15.2L19.5 17.5L18 19L15.7 17.8C15.2 18.1 14.6 18.4 14 18.6L13.5 21H10.5L10 18.5C9.4 18.3 8.8 18 8.3 17.7L6 19L4.5 17.5L5.7 15.2C5.4 14.7 5.1 14.1 4.9 13.5L2.5 13V10L5 9.5C5.2 8.9 5.5 8.3 5.8 7.8L4.5 5.5L6 4L8.3 5.2C8.8 4.9 9.4 4.6 10 4.4L10.5 2Z" 
        stroke={primaryColor} 
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Center circle - primary color */}
      <circle 
        cx="12" 
        cy="11.5" 
        r="4" 
        stroke={primaryColor} 
        strokeWidth="2"
      />
      
      {/* Inner hole - secondary color for duotone effect */}
      <circle 
        cx="12" 
        cy="11.5" 
        r="2.5" 
        fill={secondaryColor}
        opacity="0.5"
      />
    </svg>
  );
};

export default SettingsIcon;