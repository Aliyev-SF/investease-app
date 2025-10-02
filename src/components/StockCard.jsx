function StockCard({ symbol, stock, onBuyClick }) {
    const isPositive = stock.changePercent >= 0;
    
    return (
      <div 
        onClick={() => onBuyClick(symbol)}
        className="bg-white border-2 border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xl font-bold text-dark">{symbol}</div>
            <div className="text-sm text-gray mt-1">{stock.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-dark">
              ${stock.price.toFixed(2)}
            </div>
            <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
  
        {/* Info */}
        <div className="pt-4 border-t border-gray-200">
          {stock.peRatio ? (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray">P/E Ratio:</span>
              <span className="text-sm font-semibold text-dark">{stock.peRatio}</span>
            </div>
          ) : (
            <div className="text-sm text-gray">
              ETF - Instant Diversification 🎯
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default StockCard;