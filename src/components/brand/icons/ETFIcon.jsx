// src/components/icons/ETFIcon.jsx

/**
 * ETF Icon Component
 * 
 * Represents Exchange-Traded Funds with multiple buildings of varying heights
 * Symbolizes diversification and collection of multiple assets
 * Used to differentiate ETFs from individual stocks
 */

const ETFIcon = ({ className = "", size = 20 }) => {
  return (
    <svg 
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="ETF"
    >
      {/* Three buildings of varying heights (diversification) */}
      
      {/* Left building (shortest) */}
      <rect x="3" y="12" width="5" height="8" rx="0.5"/>
      <line x1="4.5" y1="14.5" x2="4.5" y2="15"/>
      <line x1="6.5" y1="14.5" x2="6.5" y2="15"/>
      <line x1="4.5" y1="17" x2="4.5" y2="17.5"/>
      <line x1="6.5" y1="17" x2="6.5" y2="17.5"/>
      
      {/* Middle building (tallest) */}
      <rect x="9.5" y="6" width="5" height="14" rx="0.5"/>
      <line x1="11" y1="8.5" x2="11" y2="9"/>
      <line x1="13" y1="8.5" x2="13" y2="9"/>
      <line x1="11" y1="11.5" x2="11" y2="12"/>
      <line x1="13" y1="11.5" x2="13" y2="12"/>
      <line x1="11" y1="14.5" x2="11" y2="15"/>
      <line x1="13" y1="14.5" x2="13" y2="15"/>
      <line x1="11" y1="17.5" x2="11" y2="18"/>
      <line x1="13" y1="17.5" x2="13" y2="18"/>
      
      {/* Right building (medium) */}
      <rect x="16" y="9" width="5" height="11" rx="0.5"/>
      <line x1="17.5" y1="11.5" x2="17.5" y2="12"/>
      <line x1="19.5" y1="11.5" x2="19.5" y2="12"/>
      <line x1="17.5" y1="14.5" x2="17.5" y2="15"/>
      <line x1="19.5" y1="14.5" x2="19.5" y2="15"/>
      <line x1="17.5" y1="17.5" x2="17.5" y2="18"/>
      <line x1="19.5" y1="17.5" x2="19.5" y2="18"/>
      
      {/* Base line */}
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
};

export default ETFIcon;