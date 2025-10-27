// investease Brand Components - Logo System
// React components for the investease logo variations

import React from 'react';

// ============================================================
// LOGO COMPONENTS
// ============================================================

/**
 * Full Stacked Logo - IE mark on top, wordmark below
 * Use in: Login pages, splash screens, centered layouts
 * @param {string} className - Optional CSS classes
 * @param {number} width - Width in pixels (default: 180)
 * @param {number} height - Height in pixels (default: 120)
 */
export const LogoStacked = ({ className = "", width = 180, height = 120 }) => (
  <svg 
    className={className}
    width={width} 
    height={height} 
    viewBox="0 0 180 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(50, 10)">
      <rect x="10" y="18" width="10" height="35" rx="5" fill="#667eea"/>
      <circle cx="15" cy="10" r="5" fill="#667eea"/>
      <rect x="30" y="46" width="30" height="7" rx="3.5" fill="#764ba2"/>
      <rect x="30" y="32" width="36" height="7" rx="3.5" fill="#667eea"/>
      <rect x="30" y="18" width="42" height="7" rx="3.5" fill="#667eea"/>
    </g>
    <text 
      x="90" 
      y="95" 
      textAnchor="middle" 
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
      fontSize="32" 
      fontWeight="600" 
      fill="#1a202c" 
      letterSpacing="-0.5">
      investease
    </text>
  </svg>
);

/**
 * Full Stacked Logo (Dark Background Version)
 * Use in: Dark mode, colored backgrounds
 */
export const LogoStackedDark = ({ className = "", width = 180, height = 120 }) => (
  <svg 
    className={className}
    width={width} 
    height={height} 
    viewBox="0 0 180 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(50, 10)">
      <rect x="10" y="18" width="10" height="35" rx="5" fill="#667eea"/>
      <circle cx="15" cy="10" r="5" fill="#667eea"/>
      <rect x="30" y="46" width="30" height="7" rx="3.5" fill="#764ba2"/>
      <rect x="30" y="32" width="36" height="7" rx="3.5" fill="#667eea"/>
      <rect x="30" y="18" width="42" height="7" rx="3.5" fill="#667eea"/>
    </g>
    <text 
      x="90" 
      y="95" 
      textAnchor="middle" 
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
      fontSize="32" 
      fontWeight="600" 
      fill="white" 
      letterSpacing="-0.5">
      investease
    </text>
  </svg>
);

/**
 * Icon Only - Just the IE mark (NO text)
 * Use in: App icons, favicons, avatars, small spaces
 * @param {number} size - Size in pixels (default: 70)
 */
export const LogoIcon = ({ className = "", size = 70 }) => (
  <svg 
    className={className}
    width={size} 
    height={size} 
    viewBox="0 0 80 70" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(8, 8)">
      <rect x="10" y="18" width="10" height="35" rx="5" fill="#667eea"/>
      <circle cx="15" cy="10" r="5" fill="#667eea"/>
      <rect x="30" y="46" width="30" height="7" rx="3.5" fill="#764ba2"/>
      <rect x="30" y="32" width="36" height="7" rx="3.5" fill="#667eea"/>
      <rect x="30" y="18" width="42" height="7" rx="3.5" fill="#667eea"/>
    </g>
  </svg>
);

/**
 * Icon Only (White Version)
 * Use in: Colored backgrounds, gradient backgrounds
 */
export const LogoIconWhite = ({ className = "", size = 70 }) => (
  <svg 
    className={className}
    width={size} 
    height={size} 
    viewBox="0 0 80 70" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(8, 8)">
      <rect x="10" y="18" width="10" height="35" rx="5" fill="white"/>
      <circle cx="15" cy="10" r="5" fill="white"/>
      <rect x="30" y="46" width="30" height="7" rx="3.5" fill="rgba(255,255,255,0.85)"/>
      <rect x="30" y="32" width="36" height="7" rx="3.5" fill="white"/>
      <rect x="30" y="18" width="42" height="7" rx="3.5" fill="white"/>
    </g>
  </svg>
);

/**
 * Wordmark Only - Just the text (no icon)
 * Use in: When icon is shown separately, text-only contexts
 * @param {number} width - Width in pixels (default: 280)
 */
export const LogoWordmark = ({ className = "", width = 280 }) => (
  <svg 
    className={className}
    width={width} 
    height={60} 
    viewBox="0 0 280 60" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <text 
      x="10" 
      y="45" 
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
      fontSize="48" 
      fontWeight="600" 
      fill="#1a202c" 
      letterSpacing="-1">
      investease
    </text>
  </svg>
);

/**
 * Wordmark Only (White Version)
 * Use in: Dark backgrounds
 */
export const LogoWordmarkWhite = ({ className = "", width = 280 }) => (
  <svg 
    className={className}
    width={width} 
    height={60} 
    viewBox="0 0 280 60" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <text 
      x="10" 
      y="45" 
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
      fontSize="48" 
      fontWeight="600" 
      fill="white" 
      letterSpacing="-1">
      investease
    </text>
  </svg>
);

// ============================================================
// USAGE EXAMPLES
// ============================================================

/**
 * Example: Login Page with Stacked Logo
 */
export const ExampleLoginPage = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}>
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '40px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
    }}>
      {/* Centered stacked logo */}
      <div style={{ marginBottom: '32px' }}>
        <LogoStacked width={140} height={100} />
      </div>
      
      <h2 style={{ marginBottom: '24px' }}>Welcome Back</h2>
      
      {/* Login form would go here */}
    </div>
  </div>
);

/**
 * Example: App Header with Icon + Wordmark (Horizontal)
 */
export const ExampleHeader = () => (
  <header style={{
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: 'white',
  }}>
    {/* Icon on left */}
    <LogoIcon size={40} />
    
    {/* Wordmark next to icon */}
    <LogoWordmark width={160} />
  </header>
);

/**
 * Example: Mobile App Header (Centered Stacked)
 */
export const ExampleMobileHeader = () => (
  <header style={{
    textAlign: 'center',
    padding: '20px',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
  }}>
    <LogoStacked width={120} height={80} />
  </header>
);

/**
 * Example: Splash Screen / Loading
 */
export const ExampleSplashScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}>
    <LogoStackedDark width={200} height={140} />
    <div style={{
      marginTop: '32px',
      width: '200px',
      height: '4px',
      background: 'rgba(255,255,255,0.3)',
      borderRadius: '999px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: '50%',
        height: '100%',
        background: 'white',
        animation: 'loading 1.5s ease-in-out infinite',
      }} />
    </div>
  </div>
);

// Export all components as default
export default {
  LogoStacked,
  LogoStackedDark,
  LogoIcon,
  LogoIconWhite,
  LogoWordmark,
  LogoWordmarkWhite,
  ExampleLoginPage,
  ExampleHeader,
  ExampleMobileHeader,
  ExampleSplashScreen,
};