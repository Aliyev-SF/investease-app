// src/components/StockCardsMobile.jsx
// Mobile card view with shadow-only separation (no borders)

import React from 'react';
import Button from './Button';
import StockIcon from './brand/icons/StockIcon';
import ETFIcon from './brand/icons/ETFIcon';

/**
 * StockCardsMobile Component - Shadow-Only Mobile Card View
 * 
 * Alternative version using shadows for separation instead of borders.
 * Modern, airy feel with floating card appearance.
 * 
 * @param {Array} stocks - Array of [symbol, stockData] pairs
 * @param {Function} getUserShares - Function to get user's shares for a symbol
 * @param {Function} onBuyClick - Handler for buy button
 * @param {Function} onSellClick - Handler for sell button
 */
function StockCardsMobile({ stocks, getUserShares, onBuyClick, onSellClick }) {
  return (
    <div className="space-y-3">
      {stocks.map(([symbol, stock]) => {
        const userShares = getUserShares(symbol);
        const hasShares = userShares > 0;
        const changePercent = ((stock.change / stock.price) * 100).toFixed(2);
        const isPositive = stock.change >= 0;
        const isEtf = stock.type === 'etf';

        return (
          <div
            key={symbol}
            className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow active:shadow-xl"
          >
            {/* Top Row: Icon + Symbol/Name + Change Badge */}
            <div className="flex items-start gap-3 mb-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                {isEtf ? (
                  <ETFIcon size={32} className="text-purple-600" />
                ) : (
                  <StockIcon size={32} className="text-primary" />
                )}
              </div>

              {/* Symbol + Name */}
              <div className="flex-1 min-w-0">
                {/* Symbol + Ownership Badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-dark">{symbol}</span>
                  
                  {/* Ownership Badge - next to ticker, clickable on mobile */}
                  {hasShares && (
                    <button
                      className="relative group px-2 py-1 rounded-md text-xs font-semibold bg-primary bg-opacity-10 text-primary active:bg-opacity-20 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const tooltip = e.currentTarget.querySelector('.tooltip');
                        if (tooltip) {
                          tooltip.classList.toggle('opacity-0');
                          tooltip.classList.toggle('opacity-100');
                        }
                      }}
                    >
                      {userShares}
                      <div className="tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 transition-opacity pointer-events-none z-10">
                        You own {userShares} share{userShares !== 1 ? 's' : ''}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-dark"></div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Company Name */}
                <div className="text-sm text-gray truncate">
                  {stock.name}
                </div>
              </div>

              {/* Right Side: Price + Combined Change (stacked) */}
              <div className="flex flex-col items-end gap-1">
                {/* Price */}
                <div className="text-xl font-bold text-dark">
                  ${stock.price.toFixed(2)}
                </div>
                
                {/* Combined Dollar + Percentage Change */}
                <div className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}${Math.abs(stock.change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent}%)
                </div>
                
                {/* P/E Ratio (if not ETF) OR Empty Spacer (if ETF) */}
                {!isEtf ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray">P/E Ratio</span>
                    <span className="text-base font-semibold text-dark">{stock.peRatio}</span>
                  </div>
                ) : (
                  <div className="h-6 mt-1" /> // Empty spacer to match height
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {hasShares ? (
                <>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth 
                    onClick={() => onBuyClick(symbol)}
                  >
                    Buy More
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    fullWidth 
                    onClick={() => onSellClick(symbol)}
                  >
                    Sell
                  </Button>
                </>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  fullWidth 
                  onClick={() => onBuyClick(symbol)}
                >
                  Buy
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StockCardsMobile;