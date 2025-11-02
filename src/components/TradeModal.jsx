// src/components/TradeModal.jsx (Compact Header Design)
import { useState, useEffect } from 'react';

function TradeModal({ 
  symbol, 
  stock, 
  availableCash, 
  userShares, 
  mode, 
  onClose, 
  onExecuteTrade 
}) {
  const [shares, setShares] = useState(1);
  const [error, setError] = useState('');

  const isBuyMode = mode === 'buy';
  const currentPrice = stock.price;
  const totalCost = shares * currentPrice;
  const maxBuyShares = Math.floor(availableCash / currentPrice);
  const maxSellShares = userShares || 0;

  useEffect(() => {
    // Reset shares when modal opens or mode changes
    setShares(1);
    setError('');
  }, [mode, symbol]);

  const handleSharesChange = (value) => {
    const numValue = parseInt(value) || 0;
    
    if (isBuyMode) {
      if (numValue > maxBuyShares) {
        setError(`You can only invest in ${maxBuyShares} shares with available cash`);
        setShares(maxBuyShares);
      } else if (numValue < 1) {
        setShares(1);
        setError('');
      } else {
        setShares(numValue);
        setError('');
      }
    } else {
      if (numValue > maxSellShares) {
        setError(`You only own ${maxSellShares} shares`);
        setShares(maxSellShares);
      } else if (numValue < 1) {
        setShares(1);
        setError('');
      } else {
        setShares(numValue);
        setError('');
      }
    }
  };

  const handleQuickSelect = (value) => {
    if (value === 'all') {
      handleSharesChange(isBuyMode ? maxBuyShares : maxSellShares);
    } else {
      handleSharesChange(value);
    }
  };

  const handleExecute = () => {
    if (isBuyMode && totalCost > availableCash) {
      setError('Insufficient funds');
      return;
    }
    
    if (!isBuyMode && shares > maxSellShares) {
      setError('Insufficient shares');
      return;
    }

    onExecuteTrade(symbol, shares, currentPrice, mode);
    onClose();
  };

  const newCashBalance = isBuyMode 
    ? availableCash - totalCost 
    : availableCash + totalCost;

  const newTotalShares = isBuyMode 
    ? userShares + shares 
    : userShares - shares;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Badges */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-5 rounded-t-3xl">
          <div className="flex justify-between items-start gap-4">
            {/* Left: Title */}
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-1 truncate">
                {isBuyMode ? (userShares > 0 ? '' : '') : ''} {symbol}
              </h3>
              <p className="text-white text-opacity-90 text-sm truncate">{stock.name}</p>
            </div>
            
            {/* Right: Badges */}
            <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
              {/* Practice Mode Badge */}
              <div className="bg-white bg-opacity-25 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1">
                <span>✓</span>
                <span>Practice Mode</span>
              </div>
              
              {/* Ownership Badge - Only show if user owns shares */}
              {userShares > 0 && (
                <div className="bg-white bg-opacity-25 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
                  💼 You own {userShares} {userShares === 1 ? 'share' : 'shares'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Current Price */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <div className="text-gray text-sm mb-1">Current Price</div>
            <div className="text-3xl font-bold text-dark">
              ${currentPrice.toFixed(2)}
            </div>
          </div>

          {/* Number of Shares Input */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-dark mb-2">
              Number of Shares {!isBuyMode && 'to Sell'}
            </label>
            
            {/* Quick Select Buttons */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              <button
                onClick={() => handleQuickSelect(1)}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  shares === 1
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray hover:bg-gray-200'
                }`}
              >
                1
              </button>
              <button
                onClick={() => handleQuickSelect(5)}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  shares === 5
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray hover:bg-gray-200'
                }`}
              >
                5
              </button>
              <button
                onClick={() => handleQuickSelect(10)}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  shares === 10
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray hover:bg-gray-200'
                }`}
              >
                10
              </button>
              <button
                onClick={() => handleQuickSelect(25)}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  shares === 25
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray hover:bg-gray-200'
                }`}
              >
                25
              </button>
              <button
                onClick={() => handleQuickSelect('all')}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  shares === (isBuyMode ? maxBuyShares : maxSellShares)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray hover:bg-gray-200'
                }`}
              >
                {isBuyMode ? 'Max' : 'All'}
              </button>
            </div>

            {/* Input Field with Max Label */}
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={isBuyMode ? maxBuyShares : maxSellShares}
                value={shares}
                onChange={(e) => handleSharesChange(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-semibold focus:border-primary focus:outline-none transition-all"
              />
              <span className="text-sm text-gray whitespace-nowrap">
                Max: {isBuyMode ? maxBuyShares : maxSellShares} {(isBuyMode ? maxBuyShares : maxSellShares) === 1 ? 'share' : 'shares'}
              </span>
            </div>

            {error && (
              <div className="mt-2 text-danger text-sm font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* Summary Info */}
          <div className="space-y-2 mb-5">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray">
                {isBuyMode ? 'You Pay' : 'You Receive'}
              </span>
              <span className={`font-semibold ${isBuyMode ? 'text-dark' : 'text-success'}`}>
                ${totalCost.toFixed(2)}
              </span>
            </div>

            {userShares > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray">
                  {isBuyMode ? 'New Total Shares' : 'Remaining Shares'}
                </span>
                <span className="font-semibold text-dark">
                  {newTotalShares} {newTotalShares === 1 ? 'share' : 'shares'}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray">New Cash Balance</span>
              <span className="font-semibold text-success">
                ${newCashBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={error !== ''}
            className={`flex-[2] px-6 py-3 rounded-xl font-semibold transition-all ${
              isBuyMode
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-danger text-white hover:bg-red-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isBuyMode ? 'Invest Now' : 'Sell'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradeModal;