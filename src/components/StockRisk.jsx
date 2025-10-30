import React, { useState } from 'react';
import { AlertTriangle, Shield, Info } from 'lucide-react';
import { 
  calculateVolatility, 
  calculateLossScenarios,
  formatCurrency 
} from '../utils/stockCalculations';

const StockRisk = ({ stock, userHoldings, loading }) => {
  const [selectedShares, setSelectedShares] = useState(
    userHoldings?.shares || 5
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stock) return null;

  const volatility = calculateVolatility(stock);
  const lossScenarios = calculateLossScenarios(selectedShares, stock.current_price);
  const hasUserShares = userHoldings && userHoldings.shares > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-orange-600" />
        <h2 className="text-xl font-bold text-dark">Understanding Risk</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Every investment has risk. Let's understand what could happen so you can make informed decisions.
      </p>

      {/* Volatility Assessment */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-start gap-3 mb-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-dark mb-1">Volatility Level</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-2xl font-bold ${volatility.color}`}>
                {volatility.level.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                ({volatility.percent}% range)
              </span>
            </div>
            <p className="text-sm text-gray-700">{volatility.description}</p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-white rounded-lg">
          <p className="text-xs text-gray-600 mb-1">52-Week Price Range</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-danger font-semibold">
              Low: {formatCurrency(stock.week_52_low)}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-success font-semibold">
              High: {formatCurrency(stock.week_52_high)}
            </span>
          </div>
        </div>
      </div>

      {/* Loss Scenarios Calculator */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Worst-Case Scenarios
        </h3>

        <p className="text-sm text-red-800 mb-4">
          Let's be realistic: prices can go down. Here's what losses could look like with specific dollar amounts:
        </p>

        {/* Share Selector */}
        <div className="mb-4 p-3 bg-white rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calculate risk for how many shares?
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="1000"
              value={selectedShares}
              onChange={(e) => setSelectedShares(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="text-sm text-gray-600">
              shares = {formatCurrency(lossScenarios.investment)} invested
            </span>
          </div>
          {hasUserShares && (
            <button
              onClick={() => setSelectedShares(userHoldings.shares)}
              className="mt-2 text-xs text-primary hover:text-purple-700 font-medium"
            >
              Use my current {userHoldings.shares} shares
            </button>
          )}
        </div>

        {/* Loss Scenarios */}
        <div className="space-y-3">
          {/* 10% Drop */}
          <div className="p-3 bg-white rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">
                If price drops 10% →
              </span>
              <span className="text-yellow-700 font-bold">
                - {formatCurrency(lossScenarios.drop10.loss)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Your {selectedShares} shares would be worth {formatCurrency(lossScenarios.drop10.newValue)}
            </p>
          </div>

          {/* 20% Drop */}
          <div className="p-3 bg-white rounded-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">
                If price drops 20% →
              </span>
              <span className="text-orange-700 font-bold">
                - {formatCurrency(lossScenarios.drop20.loss)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Your {selectedShares} shares would be worth {formatCurrency(lossScenarios.drop20.newValue)}
            </p>
          </div>

          {/* 50% Drop */}
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">
                If price drops 50% →
              </span>
              <span className="text-red-700 font-bold">
                - {formatCurrency(lossScenarios.drop50.loss)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Your {selectedShares} shares would be worth {formatCurrency(lossScenarios.drop50.newValue)}
            </p>
          </div>
        </div>

        <p className="text-xs text-red-700 mt-3 p-2 bg-red-100 rounded">
          ⚠️ <strong>Reality Check:</strong> These scenarios can and do happen. Markets fluctuate. 
          Only invest money you can afford to lose (or in this case, practice losing!).
        </p>
      </div>

      {/* Protection Strategies */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          How to Protect Yourself
        </h3>

        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold text-lg">1.</span>
            <div>
              <p className="text-sm font-medium text-gray-800">Don't invest money you can't afford to lose</p>
              <p className="text-xs text-gray-600">Keep emergency savings separate from investments</p>
            </div>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold text-lg">2.</span>
            <div>
              <p className="text-sm font-medium text-gray-800">Diversify across multiple stocks</p>
              <p className="text-xs text-gray-600">Don't put all your eggs in one basket</p>
            </div>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold text-lg">3.</span>
            <div>
              <p className="text-sm font-medium text-gray-800">Think long-term</p>
              <p className="text-xs text-gray-600">Short-term drops are normal; focus on years, not days</p>
            </div>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold text-lg">4.</span>
            <div>
              <p className="text-sm font-medium text-gray-800">Start small and learn</p>
              <p className="text-xs text-gray-600">Build confidence before investing larger amounts</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Practice Money Reminder */}
      <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
        <p className="text-sm text-blue-900 font-semibold mb-2">
          🎓 This is Practice Money!
        </p>
        <p className="text-sm text-blue-800">
          Remember, you're using <strong>virtual money</strong> on InvestEase. This is the perfect, risk-free 
          environment to learn about investing, experience market ups and downs, and build your confidence before 
          investing real money. Feel free to experiment and learn from any "losses" you might see!
        </p>
      </div>
    </div>
  );
};

export default StockRisk;