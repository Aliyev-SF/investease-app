// src/components/WatchlistButton.jsx
// Reusable heart button for adding/removing stocks from watchlist
// Uses CSS hearts - no external dependencies needed!

/**
 * WatchlistButton Component
 * 
 * Heart icon button that toggles between outline and filled states.
 * Used in Market tab and Watchlist tab to add/remove stocks.
 * 
 * @param {string} symbol - Stock symbol (e.g., "AAPL")
 * @param {boolean} isInWatchlist - Whether stock is currently in watchlist
 * @param {Function} onToggle - Callback when button is clicked, receives symbol
 * @param {number} size - Icon size in pixels (default: 20)
 * @param {string} className - Additional CSS classes
 */
function WatchlistButton({ 
  symbol, 
  isInWatchlist = false, 
  onToggle, 
  size = 20,
  className = '' 
}) {
  
  const handleClick = (e) => {
    // Prevent event bubbling (important if button is inside a clickable row)
    e.stopPropagation();
    
    // Call parent's toggle function
    if (onToggle) {
      onToggle(symbol);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        group
        p-2 
        rounded-lg 
        transition-all 
        duration-200
        hover:bg-gray-100 
        hover:scale-110
        active:scale-95
        focus:outline-none 
        focus:ring-2 
        focus:ring-red-500 
        focus:ring-opacity-50
        ${className}
      `}
      aria-label={isInWatchlist ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      style={{ width: size + 16, height: size + 16 }} // 16px for padding
    >
      {/* CSS Heart Icon */}
      <div 
        className={`
          transition-all 
          duration-200
          ${isInWatchlist 
            ? 'text-red-500' 
            : 'text-gray-400 group-hover:text-red-400'
          }
        `}
        style={{ fontSize: size }}
      >
        {isInWatchlist ? '❤️' : '🤍'}
      </div>
    </button>
  );
}

export default WatchlistButton;