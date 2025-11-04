import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WatchlistButton from '../../market/components/WatchlistButton';
import StockIcon from '../../../components/brand/icons/StockIcon';
import ETFIcon from '../../../components/brand/icons/ETFIcon';
import { calculatePricePosition, formatCurrency } from '../../../utils/stockCalculations';

const StockHero = ({ stock, communityData, loading, isInWatchlist, onToggleWatchlist }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (!stock) return null;

  const pricePosition = calculatePricePosition(stock);
  const isPositive = stock.change >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      {/* Back Button & Watchlist */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <WatchlistButton
          symbol={stock.symbol}
          isInWatchlist={isInWatchlist}
          onToggle={onToggleWatchlist}
          size={24}
        />
      </div>

      {/* Icon, Name, Symbol */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          {stock.type === 'etf' ? (
            <ETFIcon size={48} className="text-purple-600" />
          ) : (
            <StockIcon size={48} className="text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-dark mb-1">
            {stock.name}
          </h1>
          <div className="flex items-center gap-3 text-gray-600">
            <span className="font-mono font-bold text-lg">{stock.symbol}</span>
            <span className="text-sm">•</span>
            {stock.type === 'etf' && (
              <>
                <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  ETF
                </span>
                <span className="text-sm">•</span>
              </>
            )}
            {stock.sector && (
              <span className="text-sm">{stock.sector}</span>
            )}
            {stock.industry && (
              <>
                <span className="text-sm hidden sm:inline">•</span>
                <span className="text-sm hidden sm:inline">{stock.industry}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-5xl font-bold text-dark">
            {formatCurrency(stock.current_price)}
          </span>
          <div className={`flex items-center gap-1 text-xl font-semibold ${
            isPositive ? 'text-success' : 'text-danger'
          }`}>
            <span>{isPositive ? '+' : ''}{formatCurrency(stock.change)}</span>
            <span>
              ({isPositive ? '+' : ''}{stock.change_percent?.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* 52-Week Position Indicator */}
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-lg">{pricePosition.icon}</span>
          <span className="text-sm font-medium">{pricePosition.label}</span>
          <span className="text-sm">
            (${stock.week_52_low?.toFixed(2)} - ${stock.week_52_high?.toFixed(2)})
          </span>
        </div>
      </div>

      {/* Community Social Proof */}
      {communityData && communityData.owner_count > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-semibold">
                {communityData.owner_count} {communityData.owner_count === 1 ? 'person' : 'people'} on InvestEase {communityData.owner_count === 1 ? 'owns' : 'own'} this
              </p>
              {communityData.avg_return_percent !== null && (
                <p className="text-sm">
                  Average return: {' '}
                  <span className={communityData.avg_return_percent >= 0 ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                    {communityData.avg_return_percent >= 0 ? '+' : ''}
                    {communityData.avg_return_percent?.toFixed(1)}%
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {stock.last_updated && (
        <p className="text-xs text-gray-500 mt-3">
          Last updated: {new Date(stock.last_updated).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default StockHero;