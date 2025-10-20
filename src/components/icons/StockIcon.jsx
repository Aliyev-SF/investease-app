// src/components/icons/StockIcon.jsx

/**
 * Stock Icon Component
 * 
 * Represents individual company stocks with a single building icon
 * Used to differentiate stocks from ETFs throughout the application
 */

const StockIcon = ({ className = "", size = 20 }) => {
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
      aria-label="Stock"
    >
      {/* Single building representing one company */}
      <rect x="7" y="4" width="10" height="16" rx="1"/>
      
      {/* Windows (3x3 grid) */}
      <line x1="9.5" y1="7" x2="9.5" y2="7.5"/>
      <line x1="12" y1="7" x2="12" y2="7.5"/>
      <line x1="14.5" y1="7" x2="14.5" y2="7.5"/>
      
      <line x1="9.5" y1="10" x2="9.5" y2="10.5"/>
      <line x1="12" y1="10" x2="12" y2="10.5"/>
      <line x1="14.5" y1="10" x2="14.5" y2="10.5"/>
      
      <line x1="9.5" y1="13" x2="9.5" y2="13.5"/>
      <line x1="12" y1="13" x2="12" y2="13.5"/>
      <line x1="14.5" y1="13" x2="14.5" y2="13.5"/>
      
      {/* Base line */}
      <line x1="5" y1="20" x2="19" y2="20"/>
    </svg>
  );
};

export default StockIcon;