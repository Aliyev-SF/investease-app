// src/components/StockTable.jsx
// Desktop table view for Market Page - shadow card design, modern and clean

import React, { useState } from 'react';
import Button from './Button';
import StockIcon from './brand/icons/StockIcon';
import ETFIcon from './brand/icons/ETFIcon';

/**
 * StockTable Component - Desktop Table View with Shadow Cards
 * 
 * Displays stocks/ETFs in shadow card rows (no borders/lines).
 * Modern, clean design matching mobile aesthetic.
 * 
 * @param {Array} stocks - Array of [symbol, stockData] pairs
 * @param {Function} getUserShares - Function to get user's shares for a symbol
 * @param {Function} onBuyClick - Handler for buy button
 * @param {Function} onSellClick - Handler for sell button
 * @param {string} activeTab - Current active tab ('stocks' or 'etfs')
 */
function StockTable({ stocks, getUserShares, onBuyClick, onSellClick, activeTab }) {
  const [sortBy, setSortBy] = useState('symbol'); // symbol, price, change, owned, pe
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc

  // Sort stocks based on current sort settings
  const sortedStocks = [...stocks].sort((a, b) => {
    const [symbolA, stockA] = a;
    const [symbolB, stockB] = b;
    
    let compareValue = 0;
    
    switch (sortBy) {
      case 'symbol':
        compareValue = symbolA.localeCompare(symbolB);
        break;
      case 'price':
        compareValue = stockA.price - stockB.price;
        break;
      case 'change':
        compareValue = stockA.change - stockB.change;
        break;
      case 'owned':
        compareValue = getUserShares(symbolA) - getUserShares(symbolB);
        break;
      case 'pe': {
        const peA = stockA.peRatio || 0;
        const peB = stockB.peRatio || 0;
        compareValue = peA - peB;
        break;
      }
      default:
        compareValue = 0;
    }
    
    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  // Handle column header click for sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Sort indicator component
  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return null;
    return <span className="ml-1 text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="space-y-3">
      {/* Header Row - Separate card with light background */}
      <div className="bg-light rounded-2xl shadow-sm px-6 py-4">
        <div className="grid gap-4 items-center" style={{ 
          gridTemplateColumns: activeTab === 'etfs' 
            ? '2fr 1fr 1fr 1.5fr' 
            : '2fr 1fr 1fr 0.8fr 1.5fr' 
        }}>
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
          {activeTab !== 'etfs' && (
            <div 
              className="text-center text-sm font-semibold text-gray cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleSort('pe')}
            >
              P/E Ratio <SortIndicator column="pe" />
            </div>
          )}
          <div className="text-center text-sm font-semibold text-gray">
            Actions
          </div>
        </div>
      </div>

      {/* Stock Rows - Individual shadow cards */}
      {sortedStocks.map(([symbol, stock]) => {
        const userShares = getUserShares(symbol);
        const hasShares = userShares > 0;
        const changePercent = ((stock.change / stock.price) * 100).toFixed(2);
        const isPositive = stock.change >= 0;
        const isEtf = stock.type === 'etf';

        return (
          <div
            key={symbol}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow px-6 py-4"
          >
            <div className="grid gap-4 items-center" style={{ 
              gridTemplateColumns: activeTab === 'etfs' 
                ? '2fr 1fr 1fr 1.5fr' 
                : '2fr 1fr 1fr 0.8fr 1.5fr' 
            }}>
              {/* Stock Column: Icon + Symbol + Name + Ownership Badge */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isEtf ? (
                    <ETFIcon size={24} className="text-purple-600" />
                  ) : (
                    <StockIcon size={24} className="text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark">{symbol}</span>
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
                  <div className="text-xs text-gray truncate max-w-[180px]" title={stock.name}>
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

              {/* Change Column: $ + % */}
              <div className="text-right">
                <div className={`font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}${Math.abs(stock.change).toFixed(2)}
                </div>
                <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}{changePercent}%
                </div>
              </div>

              {/* P/E Ratio Column (only for stocks tab) */}
              {activeTab !== 'etfs' && (
                <div className="text-center">
                  {stock.peRatio ? (
                    <div className="relative group inline-block">
                      <div className="font-semibold text-dark cursor-help">
                        {stock.peRatio}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Price-to-Earnings ratio
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-dark"></div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray text-sm">—</span>
                  )}
                </div>
              )}

              {/* Actions Column */}
                <div className="flex gap-2 justify-center">
                <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => onBuyClick(symbol)}
                    className="min-w-[90px]"
                >
                    Buy
                </Button>
                <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => onSellClick(symbol)}
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

export default StockTable;