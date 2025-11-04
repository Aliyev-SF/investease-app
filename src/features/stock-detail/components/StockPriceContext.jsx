import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { calculatePricePosition, formatCurrency, formatLargeNumber } from '../../../utils/stockCalculations';

const StockPriceContext = ({ stock, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stock) return null;

  const pricePosition = calculatePricePosition(stock);
  const todayRange = stock.high_price && stock.low_price
    ? (stock.high_price - stock.low_price).toFixed(2)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-dark">Price Context</h2>
      </div>

      {/* Today's Range */}
      {todayRange && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-dark mb-3">Today's Trading Range</h3>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Low: {formatCurrency(stock.low_price)}</span>
            <span className="text-gray-600">High: {formatCurrency(stock.high_price)}</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-full bg-blue-500 rounded-full"
              style={{
                left: '0%',
                width: '100%'
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Range: ${todayRange} ({((todayRange / stock.low_price) * 100).toFixed(1)}% movement today)
          </p>
        </div>
      )}

      {/* 52-Week Range */}
      <div className="mb-6">
        <h3 className="font-semibold text-dark mb-3">52-Week Range</h3>
        
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="text-left">
            <p className="text-gray-600">Low</p>
            <p className="font-bold text-dark">{formatCurrency(stock.week_52_low)}</p>
          </div>
          <div className="text-center flex-1 mx-4">
            <p className="text-gray-600">Current</p>
            <p className="font-bold text-primary text-lg">{formatCurrency(stock.current_price)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">High</p>
            <p className="font-bold text-dark">{formatCurrency(stock.week_52_high)}</p>
          </div>
        </div>

        {/* Visual Range Slider */}
        <div className="relative h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full mb-2">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow-lg"
            style={{
              left: `calc(${pricePosition.position * 100}% - 8px)`
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <span>52-Week Low</span>
          <span className="font-semibold text-primary">{pricePosition.percentage}% to high</span>
          <span>52-Week High</span>
        </div>

        {/* Price Position Insight */}
        <div className={`p-3 rounded-xl ${
          pricePosition.position > 0.85 ? 'bg-green-50 border border-green-200' :
          pricePosition.position < 0.15 ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <p className="text-sm font-medium mb-1">
            <span className="text-lg mr-1">{pricePosition.icon}</span>
            Price is {pricePosition.label}
          </p>
          <p className="text-xs text-gray-700">
            {pricePosition.position > 0.85 ? (
              <>The stock is trading near its highest price of the past year. This could mean strong momentum, but also less room for growth in the short term.</>
            ) : pricePosition.position < 0.15 ? (
              <>The stock is trading near its lowest price of the past year. This could be a buying opportunity or a sign of ongoing challenges.</>
            ) : pricePosition.position > 0.65 ? (
              <>The stock is in the upper range of its yearly prices, showing recent strength.</>
            ) : pricePosition.position < 0.35 ? (
              <>The stock is in the lower range of its yearly prices, potentially offering value.</>
            ) : (
              <>The stock is trading in the middle of its yearly range, balanced between highs and lows.</>
            )}
          </p>
        </div>
      </div>

      {/* Volume Information */}
      {stock.volume && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Trading Volume</p>
              <p className="font-bold text-dark text-lg">{formatLargeNumber(stock.volume)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Shares traded today</p>
              <p className="text-xs text-gray-600 mt-1">
                High volume means lots of buying and selling activity
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Price Points */}
      {(stock.open_price || stock.previous_close) && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {stock.open_price && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Today's Open</p>
              <p className="font-semibold text-dark">{formatCurrency(stock.open_price)}</p>
            </div>
          )}
          {stock.previous_close && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Previous Close</p>
              <p className="font-semibold text-dark">{formatCurrency(stock.previous_close)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockPriceContext;