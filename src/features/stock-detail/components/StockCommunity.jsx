import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../utils/stockCalculations';

const StockCommunity = ({ stock, communityData, loading }) => {
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

  if (!stock) return null;

  // If no community data or no owners, show encouraging message
  if (!communityData || communityData.owner_count === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-dark">Community Insights</h2>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-sm text-purple-800 mb-2">
            <strong>🌟 Be the First!</strong>
          </p>
          <p className="text-sm text-purple-700">
            No InvestEase users own this stock yet. You could be the first to explore this opportunity! 
            Remember, this is practice money - a great chance to learn about investing without risk.
          </p>
        </div>
      </div>
    );
  }

  const hasReturnData = communityData.avg_return_percent !== null;
  const hasAvgPrice = communityData.avg_purchase_price !== null;
  const isPositiveReturn = hasReturnData && communityData.avg_return_percent >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-dark">Community Insights</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        See how other InvestEase users are doing with this investment
      </p>

      {/* Owner Count */}
      <div className="mb-4 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">👥</span>
          <div>
            <p className="text-sm text-gray-600">Community Ownership</p>
            <p className="text-2xl font-bold text-dark">
              {communityData.owner_count} {communityData.owner_count === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {communityData.owner_count === 1 ? 'owns' : 'own'} this stock on InvestEase
        </p>
      </div>

      {/* Average Return */}
      {hasReturnData && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className={`w-6 h-6 ${isPositiveReturn ? 'text-success' : 'text-danger'}`} />
            <div>
              <p className="text-sm text-gray-600">Average Return</p>
              <p className={`text-2xl font-bold ${isPositiveReturn ? 'text-success' : 'text-danger'}`}>
                {isPositiveReturn ? '+' : ''}{communityData.avg_return_percent.toFixed(2)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {isPositiveReturn ? (
              <>Most users are seeing gains with this stock 📈</>
            ) : (
              <>Users are currently down on average, but remember - markets fluctuate! 📊</>
            )}
          </p>
        </div>
      )}

      {/* Average Purchase Price */}
      {hasAvgPrice && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Average Purchase Price</p>
          <p className="text-xl font-bold text-dark mb-2">
            {formatCurrency(communityData.avg_purchase_price)}
          </p>
          
          {/* Compare to current price */}
          {stock.current_price && (
            <div className="flex items-center gap-2 text-sm">
              {stock.current_price < communityData.avg_purchase_price ? (
                <>
                  <span className="text-green-600 font-medium">
                    Below average price
                  </span>
                  <span className="text-gray-600">
                    ({(((stock.current_price - communityData.avg_purchase_price) / communityData.avg_purchase_price) * 100).toFixed(1)}%)
                  </span>
                </>
              ) : stock.current_price > communityData.avg_purchase_price ? (
                <>
                  <span className="text-orange-600 font-medium">
                    Above average price
                  </span>
                  <span className="text-gray-600">
                    (+{(((stock.current_price - communityData.avg_purchase_price) / communityData.avg_purchase_price) * 100).toFixed(1)}%)
                  </span>
                </>
              ) : (
                <span className="text-gray-600 font-medium">
                  At average price
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Total Shares Held */}
      {communityData.total_shares_held && (
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Shares Held</span>
            <span className="font-semibold text-dark">
              {communityData.total_shares_held.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>💡 What This Means:</strong> These numbers show you how other learners are doing. 
          {hasReturnData && isPositiveReturn && communityData.owner_count > 10 ? (
            <> With {communityData.owner_count} people seeing positive returns, this stock has been working well for the community.</>
          ) : hasReturnData && !isPositiveReturn ? (
            <> Remember, even experienced investors see losses sometimes. The key is learning from every trade!</>
          ) : (
            <> You're part of a community of learners practicing together!</>
          )}
        </p>
      </div>
    </div>
  );
};

export default StockCommunity;