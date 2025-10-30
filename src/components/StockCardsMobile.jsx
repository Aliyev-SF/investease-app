// src/components/StockCardsMobile.jsx
// Mobile card view with shadow-only separation (no borders)
// ✨ UPDATED: Added WatchlistButton in top right corner

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import StockIcon from './brand/icons/StockIcon';
import ETFIcon from './brand/icons/ETFIcon';
import WatchlistButton from './WatchlistButton';

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
 * @param {Function} isInWatchlist - Function to check if symbol is in watchlist
 * @param {Function} onToggleWatchlist - Function to add/remove from watchlist
 */
function StockCardsMobile({
  stocks,
  getUserShares,
  onBuyClick,
  onSellClick,
  isInWatchlist,
  onToggleWatchlist
}) {
  const navigate = useNavigate();

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
            {/* Top Row: Icon + Symbol/Name + Heart Button (Right) */}
            <div className="flex items-start gap-3 mb-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                {isEtf ? (
                  <ETFIcon size={28} className="text-purple-600" />
                ) : (
                  <StockIcon size={28} className="text-primary" />
                )}
              </div>

              {/* Symbol + Name + Ownership Badge */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/stock/${symbol}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-dark hover:text-primary transition-colors">{symbol}</span>
                  {hasShares && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary bg-opacity-10 text-primary">
                      {userShares}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray truncate hover:text-primary transition-colors">{stock.name}</div>
              </div>

              {/* Watchlist Heart Button - Top Right */}
              <div className="flex-shrink-0">
                <WatchlistButton
                  symbol={symbol}
                  isInWatchlist={isInWatchlist(symbol)}
                  onToggle={onToggleWatchlist}
                  size={22}
                />
              </div>
            </div>

            {/* Middle Row: Price + Change */}
            <div className="flex items-center justify-between mb-3">
              {/* Price */}
              <div>
                <div className="text-2xl font-bold text-dark">
                  ${stock.price.toFixed(2)}
                </div>
              </div>

              {/* Change Badge */}
              <div className="text-right">
                <div className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}${Math.abs(stock.change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent}%)
                </div>
                
                {/* P/E Ratio (if not ETF) OR Empty Spacer (if ETF) */}
                {!isEtf ? (
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-gray">P/E Ratio</span>
                    <span className="text-base font-semibold text-dark">{stock.peRatio}</span>
                  </div>
                ) : (
                  <div className="h-6 mt-1" /> // Empty spacer to match height
                )}
              </div>
            </div>

            {/* Action Buttons - Always show both */}
            <div className="flex gap-2 mt-3">
              <Button 
                variant="primary" 
                size="sm" 
                fullWidth 
                onClick={() => onBuyClick(symbol)}
              >
                Buy
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                fullWidth 
                onClick={() => onSellClick(symbol)}
                disabled={!hasShares}
              >
                Sell
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StockCardsMobile;