import { useState } from 'react';

function TradeModal({ symbol, stock, availableCash, onClose, onExecuteTrade }) {
  const [shares, setShares] = useState(1);
  
  const total = shares * stock.price;
  const canAfford = total <= availableCash;
  
  const handleTrade = () => {
    if (shares <= 0) {
      alert('Please enter a valid number of shares');
      return;
    }
    
    if (!canAfford) {
      alert('Insufficient virtual funds for this trade');
      return;
    }
    
    onExecuteTrade(symbol, shares, stock.price);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-dark mb-2">Buy {symbol}</h2>
          <p className="text-gray">{stock.name}</p>
        </div>

        {/* Price Info */}
        <div className="bg-light rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray mb-1">Current Price</div>
              <div className="text-2xl font-bold text-dark">
                ${stock.price.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray mb-1">Today's Change</div>
              <div className={`text-lg font-semibold ${stock.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Shares Input */}
        <div className="mb-6">
          <label className="block text-dark font-semibold mb-2">
            Number of Shares
          </label>
          <input
            type="number"
            min="1"
            value={shares}
            onChange={(e) => setShares(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-lg font-semibold"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-light rounded-2xl p-5 mb-6">
          <div className="flex justify-between mb-3">
            <span className="text-gray">Order Total:</span>
            <span className={`font-bold text-lg ${!canAfford ? 'text-danger' : 'text-dark'}`}>
              ${total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray">Available Cash:</span>
            <span className="font-bold text-primary">
              ${availableCash.toFixed(2)}
            </span>
          </div>
          {!canAfford && (
            <div className="mt-3 text-danger text-sm font-semibold">
              ⚠️ Insufficient virtual funds
            </div>
          )}
        </div>

        {/* Practice Mode Banner */}
        <div className="bg-success bg-opacity-10 border-2 border-success rounded-xl p-4 mb-6">
          <div className="font-bold text-success mb-1">
            ✓ Practice Mode Active
          </div>
          <div className="text-sm text-dark">
            This is a simulated trade with virtual money. Perfect for learning!
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleTrade}
            disabled={!canAfford}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              canAfford
                ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg'
                : 'bg-gray-300 text-gray cursor-not-allowed'
            }`}
          >
            Buy {symbol}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl font-bold bg-gray-200 text-dark hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradeModal;