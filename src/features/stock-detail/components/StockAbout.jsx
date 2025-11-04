import React, { useState } from 'react';
import { Building2, ChevronDown, ChevronUp } from 'lucide-react';

const StockAbout = ({ stock, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!stock) return null;

  const hasDescription = stock.company_description && stock.company_description.trim().length > 0;
  const isLongDescription = stock.company_description && stock.company_description.length > 300;
  const shouldTruncate = isLongDescription && !isExpanded;

  const displayDescription = shouldTruncate
    ? stock.company_description.substring(0, 300) + '...'
    : stock.company_description;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-dark">
          About {stock.type === 'etf' ? 'This ETF' : stock.name}
        </h2>
      </div>

      {hasDescription ? (
        <div>
          <p className="text-gray-700 leading-relaxed mb-3">
            {displayDescription}
          </p>

          {isLongDescription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-primary hover:text-purple-700 font-medium text-sm transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Read More</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Beginner-Friendly Summary */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800 font-medium mb-2">
              🎓 In Simple Terms:
            </p>
            <p className="text-sm text-blue-700">
              {stock.type === 'etf' ? (
                <>
                  An ETF (Exchange-Traded Fund) is like a basket of different investments bundled together. 
                  Instead of buying individual stocks, you're buying a piece of many companies at once. 
                  This helps spread out your risk.
                </>
              ) : (
                <>
                  {stock.name} is a company in the {stock.sector || 'various'} sector
                  {stock.industry && ` (specifically ${stock.industry})`}. 
                  When you buy their stock, you own a tiny piece of this company and can benefit from its growth.
                </>
              )}
            </p>
          </div>

          {/* Category Tags */}
          {(stock.sector || stock.industry) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {stock.sector && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {stock.sector}
                </span>
              )}
              {stock.industry && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {stock.industry}
                </span>
              )}
              {stock.type === 'etf' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Diversified ETF
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-sm">
            {stock.type === 'etf' ? (
              <>
                This is an ETF (Exchange-Traded Fund) - a collection of investments bundled together. 
                ETFs are great for beginners because they provide instant diversification.
              </>
            ) : (
              <>
                {stock.name} is a company
                {stock.sector && ` in the ${stock.sector} sector`}. 
                Detailed company information will be added soon.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockAbout;