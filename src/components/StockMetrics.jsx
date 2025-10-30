import React, { useState } from 'react';
import { BarChart3, HelpCircle, X } from 'lucide-react';
import { 
  formatMarketCap, 
  comparePERatio, 
  assessDividend 
} from '../utils/stockCalculations';

const MetricTooltip = ({ title, explanation, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-dark">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="text-gray-700 leading-relaxed">
        {explanation}
      </div>
    </div>
  </div>
);

const StockMetrics = ({ stock, loading }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stock) return null;

  // ETFs don't have individual P/E ratios, market caps, or dividends
  const isETF = stock.type === 'etf';

  if (isETF) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-dark">About ETFs</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          ETFs (Exchange Traded Funds) are baskets of stocks that trade like individual stocks. They don't have individual P/E ratios, market caps, or dividends because they hold multiple companies. Instead, they track an index or sector.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Key ETF metrics to watch:</strong> Expense ratio (management fees), tracking error (how closely it follows its index), and holdings diversity.
          </p>
        </div>
      </div>
    );
  }

  const marketCapInfo = formatMarketCap(stock.market_cap);
  const peComparison = stock.pe_ratio ? comparePERatio(stock.pe_ratio, stock.sector) : null;
  const dividendInfo = assessDividend(stock.dividend_yield);

  const metrics = [
    {
      id: 'pe',
      label: 'P/E Ratio',
      value: stock.pe_ratio ? stock.pe_ratio.toFixed(2) : 'N/A',
      available: !!stock.pe_ratio,
      subtext: peComparison?.assessment || 'Not available',
      color: peComparison?.color || 'text-gray-500',
      explanation: (
        <div>
          <p className="mb-3">
            <strong>P/E Ratio (Price-to-Earnings)</strong> tells you how much you're paying for each dollar the company earns.
          </p>
          <p className="mb-3">
            Think of it like this: If a company has a P/E of 20, you're paying $20 for every $1 of annual earnings.
          </p>
          <p className="mb-3">
            <strong>What it means:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Lower P/E: Stock might be a bargain (or company has challenges)</li>
            <li>Higher P/E: Investors expect growth (or stock might be expensive)</li>
          </ul>
          {peComparison && (
            <p className="text-sm bg-blue-50 p-3 rounded-lg">
              💡 This stock's P/E of {stock.pe_ratio.toFixed(1)} is <strong>{peComparison.assessment}</strong> compared to the {stock.sector || 'industry'} average of {peComparison.avg}. {peComparison.explanation}
            </p>
          )}
        </div>
      )
    },
    {
      id: 'marketcap',
      label: 'Market Cap',
      value: marketCapInfo.value,
      available: !!stock.market_cap,
      subtext: marketCapInfo.size,
      color: marketCapInfo.color,
      explanation: (
        <div>
          <p className="mb-3">
            <strong>Market Cap (Market Capitalization)</strong> is the total value of all the company's shares combined. It tells you how big the company is.
          </p>
          <p className="mb-3">
            <strong>Size categories:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 mb-3">
            <li><strong>Mega-Cap ($200B+):</strong> Huge, stable companies like Apple or Microsoft</li>
            <li><strong>Large-Cap ($10B-$200B):</strong> Big, established companies</li>
            <li><strong>Mid-Cap ($2B-$10B):</strong> Medium-sized, growing companies</li>
            <li><strong>Small-Cap (Under $2B):</strong> Smaller companies with higher growth potential</li>
          </ul>
          <p className="text-sm bg-blue-50 p-3 rounded-lg">
            💡 This is a <strong>{marketCapInfo.size}</strong> company. {marketCapInfo.detail}
          </p>
        </div>
      )
    },
    {
      id: 'dividend',
      label: 'Dividend Yield',
      value: dividendInfo.hasDiv ? dividendInfo.yield : 'None',
      available: dividendInfo.hasDiv,
      subtext: dividendInfo.label,
      color: dividendInfo.color,
      explanation: (
        <div>
          <p className="mb-3">
            <strong>Dividend Yield</strong> tells you how much cash income you'll receive each year as a percentage of the stock price.
          </p>
          <p className="mb-3">
            Think of it like interest on a savings account, but paid by the company to shareholders.
          </p>
          <p className="mb-3">
            <strong>Example:</strong> If you own $1,000 worth of stock with a 3% dividend yield, you'd receive $30 per year in dividend payments.
          </p>
          <p className="mb-3">
            <strong>Types of companies:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li><strong>High dividends:</strong> Mature companies sharing profits (utilities, banks)</li>
            <li><strong>Low/No dividends:</strong> Growth companies reinvesting profits (tech startups)</li>
          </ul>
          {dividendInfo.hasDiv ? (
            <p className="text-sm bg-blue-50 p-3 rounded-lg">
              💡 This stock pays a <strong>{dividendInfo.label}</strong> of {dividendInfo.yield}. {dividendInfo.description}
            </p>
          ) : (
            <p className="text-sm bg-blue-50 p-3 rounded-lg">
              💡 This company doesn't currently pay dividends. They're likely reinvesting profits to grow the business instead.
            </p>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-dark">Key Metrics Explained</h2>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          These numbers help you understand the company's value and performance. Click the ? icon to learn what each metric means.
        </p>

        <div className="space-y-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-dark">{metric.label}</h3>
                    <button
                      onClick={() => setActiveTooltip(metric.id)}
                      className="text-primary hover:text-purple-700 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-dark">
                      {metric.value}
                    </span>
                    {metric.available && (
                      <span className={`text-sm font-medium ${metric.color}`}>
                        {metric.subtext}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>📚 Beginner Tip:</strong> Don't worry if these metrics seem confusing at first! 
            No single number tells the whole story. Click the ? icons to learn more, and remember - 
            you're practicing with virtual money, so this is the perfect time to learn.
          </p>
        </div>
      </div>

      {/* Metric Tooltips */}
      {activeTooltip && (
        <MetricTooltip
          title={metrics.find(m => m.id === activeTooltip)?.label}
          explanation={metrics.find(m => m.id === activeTooltip)?.explanation}
          onClose={() => setActiveTooltip(null)}
        />
      )}
    </>
  );
};

export default StockMetrics;