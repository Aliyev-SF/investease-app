// src/components/HoldingsView.jsx
// Holdings View for Portfolio Tab - Shows user's current investments
// Reuses Market tab design (shadow cards) but shows owned positions with gain/loss

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import StockIcon from './brand/icons/StockIcon';
import ETFIcon from './brand/icons/ETFIcon';

/**
 * HoldingsView Component - Desktop Table View
 * 
 * Shows user's current holdings with real-time values and gain/loss.
 * Reuses StockTable design pattern for consistency.
 * 
 * @param {Array} holdings - User's holdings from holdings table
 * @param {Object} marketData - Current market prices for all stocks/ETFs
 * @param {Function} onBuyClick - Handler for Buy More button
 * @param {Function} onSellClick - Handler for Sell button
 */
function HoldingsViewDesktop({ holdings, marketData, onBuyClick, onSellClick }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('value'); // symbol, shares, value, gain
  const [sortDirection, setSortDirection] = useState('desc'); // asc, desc

  // Calculate enriched holdings with current values
  const enrichedHoldings = holdings.map(holding => {
    const stock = marketData[holding.symbol];
    if (!stock) return null;

    const shares = parseFloat(holding.shares);
    const avgCost = parseFloat(holding.average_price);
    const currentPrice = stock.price;
    
    const costBasis = shares * avgCost;
    const currentValue = shares * currentPrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = (gainLoss / costBasis) * 100;

    return {
      symbol: holding.symbol,
      name: stock.name,
      icon: stock.icon,
      type: stock.type,
      shares,
      avgCost,
      currentPrice,
      costBasis,
      currentValue,
      gainLoss,
      gainLossPercent,
      stockData: stock
    };
  }).filter(Boolean); // Remove null entries

  // Sort holdings
  const sortedHoldings = [...enrichedHoldings].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'symbol':
        compareValue = a.symbol.localeCompare(b.symbol);
        break;
      case 'shares':
        compareValue = a.shares - b.shares;
        break;
      case 'value':
        compareValue = a.currentValue - b.currentValue;
        break;
      case 'gain':
        compareValue = a.gainLoss - b.gainLoss;
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
  if (enrichedHoldings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📊</div>
        <div className="text-xl font-bold text-dark mb-2">No investments yet</div>
        <div className="text-gray mb-6">Start building your portfolio by trading in the Market tab</div>
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
        <div className="grid gap-4 items-center" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr' }}>
          <div 
            className="text-left text-sm font-semibold text-gray cursor-pointer hover:text-primary transition-colors"
            onClick={() => handleSort('symbol')}
          >
            Asset <SortIndicator column="symbol" />
          </div>
          <div 
            className="text-right text-sm font-semibold text-gray cursor-pointer hover:text-primary transition-colors"
            onClick={() => handleSort('shares')}
          >
            Shares <SortIndicator column="shares" />
          </div>
          <div className="text-right text-sm font-semibold text-gray">
            Avg Cost
          </div>
          <div 
            className="text-right text-sm font-semibold text-gray cursor-pointer hover:text-primary transition-colors"
            onClick={() => handleSort('value')}
          >
            Value <SortIndicator column="value" />
          </div>
          <div 
            className="text-right text-sm font-semibold text-gray cursor-pointer hover:text-primary transition-colors"
            onClick={() => handleSort('gain')}
          >
            Gain/Loss <SortIndicator column="gain" />
          </div>
          <div className="text-center text-sm font-semibold text-gray">
            Actions
          </div>
        </div>
      </div>

      {/* Holdings Rows */}
      {sortedHoldings.map(holding => {
        const isPositive = holding.gainLoss >= 0;
        const isEtf = holding.type === 'etf';

        return (
          <div
            key={holding.symbol}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow px-6 py-4"
          >
            <div className="grid gap-4 items-center" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr' }}>
              {/* Asset Column: Icon + Symbol + Name */}
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
                  onClick={() => navigate(`/stock/${holding.symbol}`)}
                >
                  <div className="font-bold text-dark hover:text-primary transition-colors">{holding.symbol}</div>
                  <div className="text-xs text-gray truncate max-w-[180px] hover:text-primary transition-colors" title={holding.name}>
                    {holding.name}
                  </div>
                </div>
              </div>

              {/* Shares Column */}
              <div className="text-right">
                <div className="font-semibold text-dark">{holding.shares}</div>
              </div>

              {/* Avg Cost Column */}
              <div className="text-right">
                <div className="text-sm text-gray">${holding.avgCost.toFixed(2)}</div>
              </div>

              {/* Value Column */}
              <div className="text-right">
                <div className="font-bold text-lg text-dark">
                  ${holding.currentValue.toFixed(2)}
                </div>
                <div className="text-xs text-gray">@ ${holding.currentPrice.toFixed(2)}</div>
              </div>

              {/* Gain/Loss Column */}
              <div className="text-right">
                <div className={`font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}${Math.abs(holding.gainLoss).toFixed(2)}
                </div>
                <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onBuyClick(holding.symbol)}
                  className="min-w-[90px]"
                >
                  Buy
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onSellClick(holding.symbol)}
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
 * HoldingsView Component - Mobile Card View
 * 
 * Compact card layout for mobile devices
 */
function HoldingsViewMobile({ holdings, marketData, onBuyClick, onSellClick }) {
  const navigate = useNavigate();

  // Calculate enriched holdings
  const enrichedHoldings = holdings.map(holding => {
    const stock = marketData[holding.symbol];
    if (!stock) return null;

    const shares = parseFloat(holding.shares);
    const avgCost = parseFloat(holding.average_price);
    const currentPrice = stock.price;
    
    const costBasis = shares * avgCost;
    const currentValue = shares * currentPrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = (gainLoss / costBasis) * 100;

    return {
      symbol: holding.symbol,
      name: stock.name,
      icon: stock.icon,
      type: stock.type,
      shares,
      avgCost,
      currentPrice,
      costBasis,
      currentValue,
      gainLoss,
      gainLossPercent,
      stockData: stock
    };
  }).filter(Boolean);

  // Sort by value (largest first)
  const sortedHoldings = [...enrichedHoldings].sort((a, b) => b.currentValue - a.currentValue);

  // Empty state
  if (enrichedHoldings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <div className="text-xl font-bold text-dark mb-2">No investments yet</div>
        <div className="text-gray mb-6">Start building your portfolio</div>
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
      {sortedHoldings.map(holding => {
        const isPositive = holding.gainLoss >= 0;
        const isEtf = holding.type === 'etf';

        return (
          <div
            key={holding.symbol}
            className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            {/* Top Row: Icon + Symbol/Shares + Current Price */}
            <div className="flex items-start gap-3 mb-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                {isEtf ? (
                  <ETFIcon size={32} className="text-purple-600" />
                ) : (
                  <StockIcon size={32} className="text-primary" />
                )}
              </div>

              {/* Symbol, Name, Shares */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/stock/${holding.symbol}`)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-dark hover:text-primary transition-colors">{holding.symbol}</span>
                  <span className="text-sm text-gray">• {holding.shares} shares</span>
                </div>
                <div className="text-sm text-gray truncate hover:text-primary transition-colors">{holding.name}</div>
              </div>

              {/* Current Price */}
              <div className="text-right">
                <div className="font-bold text-lg text-dark">${holding.currentPrice.toFixed(2)}</div>
              </div>
            </div>

            {/* Value Row */}
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray mb-1">Current Value</div>
                  <div className="font-bold text-xl text-dark">${holding.currentValue.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray mb-1">Gain/Loss</div>
                  <div className={`font-semibold text-lg ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}${Math.abs(holding.gainLoss).toFixed(2)}
                  </div>
                  <div className={`text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Basis Info */}
            <div className="text-xs text-gray mb-3">
              Invested: ${holding.costBasis.toFixed(2)} @ ${holding.avgCost.toFixed(2)}/share
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button 
                variant="primary" 
                size="sm" 
                fullWidth 
                onClick={() => onBuyClick(holding.symbol)}
              >
                Buy
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                fullWidth 
                onClick={() => onSellClick(holding.symbol)}
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
 * Main HoldingsView Component - Responsive wrapper
 */
function HoldingsView({ holdings, marketData, onBuyClick, onSellClick }) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <HoldingsViewDesktop
          holdings={holdings}
          marketData={marketData}
          onBuyClick={onBuyClick}
          onSellClick={onSellClick}
        />
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden">
        <HoldingsViewMobile
          holdings={holdings}
          marketData={marketData}
          onBuyClick={onBuyClick}
          onSellClick={onSellClick}
        />
      </div>
    </>
  );
}

export default HoldingsView;