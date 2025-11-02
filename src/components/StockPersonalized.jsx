import React from 'react';
import { Wallet, PieChart } from 'lucide-react';
import {
  formatCurrency,
  calculateAffordableShares
} from '../utils/stockCalculations';

const StockPersonalized = ({ stock, userHoldings, portfolio, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stock || !portfolio) return null;

  const hasShares = userHoldings && userHoldings.shares > 0;
  const affordableInfo = calculateAffordableShares(stock.current_price, portfolio.cash);
  
  // Calculate current holdings value if user owns shares
  let currentValue = 0;
  let gainLoss = 0;
  let gainLossPercent = 0;
  
  if (hasShares) {
    currentValue = userHoldings.shares * stock.current_price;
    const costBasis = userHoldings.shares * userHoldings.average_price;
    gainLoss = currentValue - costBasis;
    gainLossPercent = (gainLoss / costBasis) * 100;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-dark">Your Situation</h2>
      </div>

      {/* Current Holdings */}
      {hasShares ? (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">You Currently Own</p>
              <p className="text-3xl font-bold text-dark">
                {userHoldings.shares} {userHoldings.shares === 1 ? 'share' : 'shares'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-dark">
                {formatCurrency(currentValue)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-600">Avg. Purchase Price</p>
              <p className="font-semibold text-dark">{formatCurrency(userHoldings.average_price)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Cost Basis</p>
              <p className="font-semibold text-dark">
                {formatCurrency(userHoldings.shares * userHoldings.average_price)}
              </p>
            </div>
          </div>

          <div className={`p-3 rounded-lg ${gainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Gain/Loss</span>
              <div className="text-right">
                <p className={`font-bold ${gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                  {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                </p>
                <p className={`text-sm ${gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                  ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-600">
            <strong>You don't own this stock yet.</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            See below to find out how many shares you can afford with your available cash.
          </p>
        </div>
      )}

      {/* Available Cash & Buying Power */}
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Available Cash</p>
            <p className="text-2xl font-bold text-dark">{formatCurrency(portfolio.cash)}</p>
          </div>
        </div>

        {affordableInfo.canAfford ? (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              You can afford up to {affordableInfo.max} {affordableInfo.max === 1 ? 'share' : 'shares'}
            </p>
            
            {affordableInfo.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 mb-2">Suggested amounts:</p>
                {affordableInfo.suggestions.map((shares, index) => {
                  const cost = shares * stock.current_price;
                  const percentOfCash = affordableInfo.percentages[index];

                  return (
                    <div key={shares} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div>
                        <span className="font-semibold text-dark">{shares} shares</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({percentOfCash}% of cash)
                        </span>
                      </div>
                      <span className="font-semibold text-primary">
                        {formatCurrency(cost)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Not enough cash</strong>
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              You need {formatCurrency(stock.current_price)} to invest in 1 share.
              You currently have {formatCurrency(portfolio.cash)} available.
            </p>
          </div>
        )}
      </div>

      {/* Portfolio Impact Preview */}
      {affordableInfo.canAfford && affordableInfo.suggestions.length > 0 && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-sm font-semibold text-purple-900 mb-2">
            📊 Portfolio Impact
          </p>
          {affordableInfo.suggestions.map((shares) => {
            const investment = shares * stock.current_price;
            const totalAfter = portfolio.total_value + investment;
            const percentOfPortfolio = (investment / totalAfter) * 100;
            
            return (
              <div key={shares} className="mb-2 last:mb-0">
                <p className="text-xs text-purple-800">
                  If you invest in <strong>{shares} shares</strong>, this stock would be{' '}
                  <strong>{percentOfPortfolio.toFixed(1)}%</strong> of your portfolio
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Diversification Advice */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>💡 Smart Investing Tip:</strong> Financial advisors often recommend not putting more than 5-10% of your portfolio into a single stock. 
          This helps spread risk across different investments.
          {hasShares && (
            <> You already own {userHoldings.shares} shares worth {formatCurrency(currentValue)}.</>
          )}
        </p>
      </div>
    </div>
  );
};

export default StockPersonalized;