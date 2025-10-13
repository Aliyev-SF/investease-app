// src/components/StockCard.jsx - Updated with Tooltips
import Tooltip from './Tooltip';
import { getGlossaryContent, formatTermName } from '../utils/glossaryLoader';

function StockCard({ symbol, stock, onClick, userData }) {
  const changeColor = stock.changePercent >= 0 ? 'text-success' : 'text-danger';
  const bgColor = stock.changePercent >= 0 ? 'bg-success' : 'bg-danger';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-primary"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xl font-bold text-dark">{symbol}</div>
          <div className="text-sm text-gray">{stock.name}</div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${bgColor} bg-opacity-10 ${changeColor}`}>
          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-dark">${stock.price.toFixed(2)}</div>
        <div className={`text-sm font-semibold ${changeColor}`}>
          {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} today
        </div>
      </div>

      {/* Metrics with Tooltips */}
      <div className="pt-3 border-t border-gray-200">
        {stock.peRatio ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray flex items-center">
              P/E Ratio
              <Tooltip
                term={formatTermName('pe-ratio')}
                content={getGlossaryContent('pe-ratio')}
                userData={userData}
                position="top"
              />
            </span>
            <span className="font-semibold text-dark">{stock.peRatio}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray flex items-center">
              ETF
              <Tooltip
                term={formatTermName('etf')}
                content={getGlossaryContent('etf')}
                userData={userData}
                position="top"
              />
            </span>
            <span className="font-semibold text-primary">Diversified</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockCard;