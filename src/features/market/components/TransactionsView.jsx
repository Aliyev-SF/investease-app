// src/features/market/components/TransactionsView.jsx
// Transactions View for Portfolio Tab - Shows trading history with performance stats
// Clean, professional design with performance scorecard

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import StockIcon from '../../../components/brand/icons/StockIcon';
import ETFIcon from '../../../components/brand/icons/ETFIcon';

/**
 * TransactionsView Component - Desktop View
 * 
 * Shows transaction history with performance statistics.
 * Performance scorecard at top, transaction list below.
 * 
 * @param {Array} transactions - User's transaction history
 * @param {Object} marketData - Market data to get stock/ETF type for icons
 */
function TransactionsViewDesktop({ transactions, marketData }) {
  // Calculate performance stats
  const totalTrades = transactions.length;
  const buyCount = transactions.filter(t => t.type === 'buy').length;
  const sellCount = transactions.filter(t => t.type === 'sell').length;
  
  const profitableTrades = transactions.filter(
    t => t.type === 'sell' && t.profit_loss > 0
  ).length;
  
  const profitablePercent = sellCount > 0 
    ? ((profitableTrades / sellCount) * 100).toFixed(1) 
    : 0;
  
  const totalProfitLoss = transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + parseFloat(t.profit_loss || 0), 0);
  
  // Find best trade (highest profit)
  const bestTrade = transactions
    .filter(t => t.type === 'sell' && t.profit_loss > 0)
    .sort((a, b) => parseFloat(b.profit_loss) - parseFloat(a.profit_loss))[0];

  // Format date/time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Empty state
  if (totalTrades === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📜</div>
        <div className="text-xl font-bold text-dark mb-2">No transactions yet</div>
        <div className="text-gray mb-6">Make your first investment to see it here</div>
        <Link to="/market?tab=market&view=stocks">
          <Button variant="primary" size="lg">
            Start Investing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Performance Scorecard */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Trades */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-sm text-gray mb-1">Total Trades</div>
          <div className="text-3xl font-bold text-dark">{totalTrades}</div>
          <div className="text-xs text-gray mt-1">
            {buyCount} buys • {sellCount} sells
          </div>
        </div>

        {/* Profitable Investments */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-sm text-gray mb-1">Profitable Investments</div>
          <div className="text-3xl font-bold text-primary">{profitableTrades}</div>
          <div className="text-xs text-gray mt-1">
            {profitablePercent}% win rate
          </div>
        </div>

        {/* Total Profit/Loss */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-sm text-gray mb-1">Total P/L</div>
          <div className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toFixed(2)}
          </div>
          <div className="text-xs text-gray mt-1">
            From {sellCount} {sellCount === 1 ? 'sale' : 'sales'}
          </div>
        </div>

        {/* Best Trade */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-sm text-gray mb-1">Best Trade</div>
          {bestTrade ? (
            <>
              <div className="text-3xl font-bold text-success">
                +${parseFloat(bestTrade.profit_loss).toFixed(2)}
              </div>
              <div className="text-xs text-gray mt-1">
                {bestTrade.symbol} • {bestTrade.shares} shares
              </div>
            </>
          ) : (
            <div className="text-xl text-gray">—</div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const isBuy = transaction.type === 'buy';
          const isSell = transaction.type === 'sell';
          const hasProfit = isSell && transaction.profit_loss;
          const isProfit = hasProfit && parseFloat(transaction.profit_loss) > 0;
          const stock = marketData[transaction.symbol];
          const isEtf = stock?.type === 'etf';

          return (
            <div
              key={transaction.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow px-6 py-4"
            >
              <div className="flex items-center justify-between">
                {/* Left: Icon + Type Badge + Details */}
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {isEtf ? (
                      <ETFIcon size={28} className="text-purple-600" />
                    ) : (
                      <StockIcon size={28} className="text-primary" />
                    )}
                  </div>

                  {/* Type Badge + Symbol */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          isBuy
                            ? 'bg-primary bg-opacity-10 text-primary'
                            : 'bg-danger bg-opacity-10 text-danger'
                        }`}
                      >
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      <span className="font-bold text-lg text-dark">
                        {transaction.symbol}
                      </span>
                    </div>
                    <div className="text-sm text-gray">
                      {transaction.shares} {transaction.shares === 1 ? 'share' : 'shares'} @ $
                      {parseFloat(transaction.price).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Date */}
                <div className="text-right">
                  <div className="font-bold text-lg text-dark mb-1">
                    ${parseFloat(transaction.total).toFixed(2)}
                  </div>
                  
                  {/* Profit/Loss for Sells */}
                  {hasProfit && (
                    <div className={`text-sm font-semibold mb-1 ${isProfit ? 'text-success' : 'text-danger'}`}>
                      {isProfit ? '+' : ''}${Math.abs(parseFloat(transaction.profit_loss)).toFixed(2)} P/L
                    </div>
                  )}
                  
                  <div className="text-xs text-gray">
                    {formatDateTime(transaction.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * TransactionsView Component - Mobile View
 * 
 * Compact card layout for mobile devices
 */
function TransactionsViewMobile({ transactions, marketData }) {
  // Calculate performance stats (same as desktop)
  const totalTrades = transactions.length;
  const sellCount = transactions.filter(t => t.type === 'sell').length;
  
  const profitableTrades = transactions.filter(
    t => t.type === 'sell' && t.profit_loss > 0
  ).length;
  
  const profitablePercent = sellCount > 0 
    ? ((profitableTrades / sellCount) * 100).toFixed(1) 
    : 0;
  
  const totalProfitLoss = transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + parseFloat(t.profit_loss || 0), 0);

  // Format date/time (simplified for mobile)
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Empty state
  if (totalTrades === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📜</div>
        <div className="text-xl font-bold text-dark mb-2">No transactions yet</div>
        <div className="text-gray mb-6">Make your first investment</div>
        <Link to="/market?tab=market&view=stocks">
          <Button variant="primary" size="lg">
            Start Investing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Performance Scorecard - Stacked on Mobile */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Total Trades */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="text-xs text-gray mb-1">Investments</div>
          <div className="text-2xl font-bold text-dark">{totalTrades}</div>
        </div>

        {/* Profitable */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="text-xs text-gray mb-1">Profitable</div>
          <div className="text-2xl font-bold text-primary">{profitablePercent}%</div>
        </div>

        {/* Total P/L - Full Width */}
        <div className="bg-white rounded-2xl p-4 shadow-md col-span-2">
          <div className="text-xs text-gray mb-1">Total Profit/Loss</div>
          <div className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Transactions List - Compact Mobile Cards */}
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const isBuy = transaction.type === 'buy';
          const isSell = transaction.type === 'sell';
          const hasProfit = isSell && transaction.profit_loss;
          const isProfit = hasProfit && parseFloat(transaction.profit_loss) > 0;
          const stock = marketData[transaction.symbol];
          const isEtf = stock?.type === 'etf';

          return (
            <div
              key={transaction.id}
              className="bg-white rounded-2xl p-4 shadow-md"
            >
              {/* Top Row: Badge + Symbol + Amount */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {isEtf ? (
                      <ETFIcon size={24} className="text-purple-600" />
                    ) : (
                      <StockIcon size={24} className="text-primary" />
                    )}
                  </div>

                  {/* Badge + Symbol */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isBuy
                            ? 'bg-primary bg-opacity-10 text-primary'
                            : 'bg-danger bg-opacity-10 text-danger'
                        }`}
                      >
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      <span className="font-bold text-dark">
                        {transaction.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div className="font-bold text-lg text-dark">
                    ${parseFloat(transaction.total).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Details Row */}
              <div className="text-sm text-gray mb-2">
                {transaction.shares} {transaction.shares === 1 ? 'share' : 'shares'} @ $
                {parseFloat(transaction.price).toFixed(2)}
              </div>

              {/* Bottom Row: Date + Profit (if sell) */}
              <div className="flex items-center justify-between text-xs">
                <div className="text-gray">
                  {formatDateTime(transaction.timestamp)}
                </div>
                
                {hasProfit && (
                  <div className={`font-semibold ${isProfit ? 'text-success' : 'text-danger'}`}>
                    P/L: {isProfit ? '+' : ''}${Math.abs(parseFloat(transaction.profit_loss)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main TransactionsView Component - Responsive wrapper
 */
function TransactionsView({ transactions, marketData }) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <TransactionsViewDesktop
          transactions={transactions}
          marketData={marketData}
        />
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden">
        <TransactionsViewMobile
          transactions={transactions}
          marketData={marketData}
        />
      </div>
    </>
  );
}

export default TransactionsView;