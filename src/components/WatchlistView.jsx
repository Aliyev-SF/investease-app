// src/components/WatchlistView.jsx
// Watchlist View - Shows stocks user is watching
// Reuses Market tab design pattern (shadow cards)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import StockIcon from './brand/icons/StockIcon';
import ETFIcon from './brand/icons/ETFIcon';
import WatchlistButton from './WatchlistButton';

/**
 * WatchlistView Component - Desktop Table View
 * 
 * Shows user's watchlisted stocks with real-time prices.
 * Reuses StockTable design pattern for consistency.
 * 
 * @param {Array} watchlist - Array of symbols ['AAPL', 'TSLA']
 * @param {Object} marketData - Current market prices for all stocks/ETFs
 * @param {Function} onBuyClick - Handler for Buy button
 * @param {Function} onSellClick - Handler for Sell button
 * @param {Function} getUserShares - Function to get user's shares for a symbol
 * @param {Function} onToggleWatchlist - Handler for removing from watchlist
 */
function WatchlistViewDesktop({ watchlist, marketData, onBuyClick, onSellClick, getUserShares, onToggleWatchlist }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('symbol'); // symbol, price, change
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc

  // Get stock data for watchlist symbols
  const watchlistStocks = watchlist
    .map(symbol => {
      const stock = marketData[symbol];
      if (!stock) return null;
      return { symbol, ...stock };
    })
    .filter(Boolean); // Remove null entries

  // Sort watchlist stocks
  const sortedStocks = [...watchlistStocks].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'symbol':
        compareValue = a.symbol.localeCompare(b.symbol);
        break;
      case 'price':
        compareValue = a.price - b.price;
        break;
      case 'change':
        compareValue = a.change - b.change;
        break;
      default:
        compareValue = 0;
    }
    
    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  // Handle column header click for sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Sort indicator
  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return null;
    return <span className="ml-1 text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  // Empty state
  if (watchlistStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <div className="text-xl font-bold text-dark mb-2">Your watchlist is empty</div>
        <div className="text-gray mb-6">
          Keep track of stocks you're interested in by clicking the heart icon in the Market tab
        </div>
        <Link to="/market?tab=market&view=stocks">
          <Button variant="primary" size="lg">
            Explore Market
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="bg-light rounded-2xl shadow-sm px-6 py-4">
        <div className="grid gap-4 items-center" style={{ 
          gridTemplateColumns: '48px 2fr 1fr 1fr 0.8fr 1.5fr'
        }}>
          <div className="text-center text-sm font-semibold text-gray">
            {/* Empty column for heart button */}
          </div>
          <div 
            className="text-left text-sm font-semibold text-gray cursor-pointer hover:text-primary transition-colors"
            onClick={() => handleSort('symbol')}
          >
            Stock <SortIndicator column="symbol" />
          </div>
          <div 
            className="text-right text-sm font-semibold text-gray cursor-pointer hover:text-primary transition-colors"
            onClick={() => handleSort('price')}
          >
            Price <SortIndicator column="price" />
          </div>
          <div 
            className="text-right text-sm font-semibold text-gray cursor-pointer hover:text-primary transition-colors"
            onClick={() => handleSort('change')}
          >
            Change <SortIndicator column="change" />
          </div>
          <div className="text-center text-sm font-semibold text-gray">
            P/E Ratio
          </div>
          <div className="text-center text-sm font-semibold text-gray">
            Actions
          </div>
        </div>
      </div>

      {/* Stock Rows */}
      {sortedStocks.map((stock) => {
        const userShares = getUserShares(stock.symbol);
        const hasShares = userShares > 0;
        const changePercent = ((stock.change / stock.price) * 100).toFixed(2);
        const isPositive = stock.change >= 0;
        const isEtf = stock.type === 'etf';

        return (
          <div
            key={stock.symbol}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow px-6 py-4"
          >
            <div className="grid gap-4 items-center" style={{ 
              gridTemplateColumns: '48px 2fr 1fr 1fr 0.8fr 1.5fr'
            }}>
              {/* Watchlist Heart Button - Always filled */}
              <div className="flex justify-center">
                <WatchlistButton
                  symbol={stock.symbol}
                  isInWatchlist={true}
                  onToggle={onToggleWatchlist}
                  size={20}
                />
              </div>

              {/* Stock Column */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isEtf ? (
                    <ETFIcon size={24} className="text-purple-600" />
                  ) : (
                    <StockIcon size={24} className="text-primary" />
                  )}
                </div>
                <div
                  className="min-w-0 cursor-pointer"
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark hover:text-primary transition-colors">{stock.symbol}</span>
                    {/* Ownership Badge */}
                    {hasShares && (
                      <div className="relative group inline-block">
                        <div className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary bg-opacity-10 text-primary cursor-help">
                          {userShares}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          You own {userShares} share{userShares !== 1 ? 's' : ''}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-dark"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray truncate max-w-[180px] hover:text-primary transition-colors" title={stock.name}>
                    {stock.name}
                  </div>
                </div>
              </div>

              {/* Price Column */}
              <div className="text-right">
                <div className="font-bold text-lg text-dark">
                  ${stock.price.toFixed(2)}
                </div>
              </div>

              {/* Change Column */}
              <div className="text-right">
                <div className={`font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}${Math.abs(stock.change).toFixed(2)}
                </div>
                <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}{changePercent}%
                </div>
              </div>

              {/* P/E Ratio Column */}
              <div className="text-center">
                {!isEtf && stock.peRatio ? (
                  <span className="font-semibold text-dark">{stock.peRatio}</span>
                ) : (
                  <span className="text-gray text-sm">—</span>
                )}
              </div>

              {/* Actions Column: Buy/Sell Buttons */}
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onBuyClick(stock.symbol)}
                  className="min-w-[90px]"
                >
                  Buy
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onSellClick(stock.symbol)}
                  disabled={!hasShares}
                  className="min-w-[90px]"
                >
                  Sell
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * WatchlistView Component - Mobile Card View
 */
function WatchlistViewMobile({ watchlist, marketData, onBuyClick, onSellClick, getUserShares, onToggleWatchlist }) {
  const navigate = useNavigate();

  // Get stock data for watchlist symbols
  const watchlistStocks = watchlist
    .map(symbol => {
      const stock = marketData[symbol];
      if (!stock) return null;
      return { symbol, ...stock };
    })
    .filter(Boolean);

  // Empty state
  if (watchlistStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <div className="text-xl font-bold text-dark mb-2">Your watchlist is empty</div>
        <div className="text-gray mb-6">
          Keep track of stocks you're interested in by clicking the heart icon in the Market tab
        </div>
        <Link to="/market?tab=market&view=stocks">
          <Button variant="primary" size="lg">
            Explore Market
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {watchlistStocks.map((stock) => {
        const userShares = getUserShares(stock.symbol);
        const hasShares = userShares > 0;
        const changePercent = ((stock.change / stock.price) * 100).toFixed(2);
        const isPositive = stock.change >= 0;
        const isEtf = stock.type === 'etf';

        return (
          <div
            key={stock.symbol}
            className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Top Row: Icon + Symbol/Name + Heart Button */}
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
                onClick={() => navigate(`/stock/${stock.symbol}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-dark hover:text-primary transition-colors">{stock.symbol}</span>
                  {hasShares && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary bg-opacity-10 text-primary">
                      {userShares}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray truncate hover:text-primary transition-colors">{stock.name}</div>
              </div>

              {/* Watchlist Heart Button - Always filled */}
              <div className="flex-shrink-0">
                <WatchlistButton
                  symbol={stock.symbol}
                  isInWatchlist={true}
                  onToggle={onToggleWatchlist}
                  size={22}
                />
              </div>
            </div>

            {/* Middle Row: Price + Change */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-dark">
                ${stock.price.toFixed(2)}
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}${Math.abs(stock.change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent}%)
                </div>
                
                {/* P/E Ratio (if not ETF) OR Empty Spacer (if ETF) */}
                {!isEtf && stock.peRatio ? (
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-gray">P/E Ratio</span>
                    <span className="text-base font-semibold text-dark">{stock.peRatio}</span>
                  </div>
                ) : (
                  <div className="h-6 mt-1" /> // Empty spacer to match height
                )}
              </div>
            </div>

            {/* Action Buttons - Buy and Sell */}
            <div className="flex gap-2 mt-3">
              <Button 
                variant="primary" 
                size="sm" 
                fullWidth 
                onClick={() => onBuyClick(stock.symbol)}
              >
                Buy
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                fullWidth 
                onClick={() => onSellClick(stock.symbol)}
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

/**
 * Main WatchlistView Component - Responsive wrapper
 */
function WatchlistView({ watchlist, marketData, onBuyClick, onSellClick, getUserShares, onToggleWatchlist }) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <WatchlistViewDesktop
          watchlist={watchlist}
          marketData={marketData}
          onBuyClick={onBuyClick}
          onSellClick={onSellClick}
          getUserShares={getUserShares}
          onToggleWatchlist={onToggleWatchlist}
        />
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden">
        <WatchlistViewMobile
          watchlist={watchlist}
          marketData={marketData}
          onBuyClick={onBuyClick}
          onSellClick={onSellClick}
          getUserShares={getUserShares}
          onToggleWatchlist={onToggleWatchlist}
        />
      </div>
    </>
  );
}

export default WatchlistView;