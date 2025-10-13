// src/components/TradeModal.jsx - Complete file with tooltips
import { useState } from 'react';
import Tooltip from './Tooltip';
import { getGlossaryContent, formatTermName } from '../utils/glossaryLoader';

function TradeModal({ symbol, stock, availableCash, userShares, onClose, onExecuteTrade, mode = 'buy', userData }) {
  // Store as string to allow empty state during typing
  const [sharesInput, setSharesInput] = useState('1');
  
  const isBuying = mode === 'buy';
  
  // Parse shares for calculations
  const shares = sharesInput === '' ? 0 : parseInt(sharesInput) || 0;
  const total = shares * stock.price;
  const canAfford = isBuying ? total <= availableCash : shares <= (userShares || 0);
  const maxShares = isBuying ? Math.floor(availableCash / stock.price) : (userShares || 0);
  
  const handleSharesChange = (e) => {
    const value = e.target.value;
    
    // Allow empty string
    if (value === '') {
      setSharesInput('');
      return;
    }
    
    // Only allow numbers
    if (/^\d+$/.test(value)) {
      setSharesInput(value);
    }
  };
  
  const handleQuickSelect = (amount) => {
    setSharesInput(amount.toString());
  };
  
  const handleTrade = () => {
    if (shares <= 0) {
      alert('Please enter a valid number of shares');
      return;
    }
    
    if (isBuying && !canAfford) {
      alert('Insufficient virtual funds for this trade');
      return;
    }
    
    if (!isBuying && shares > userShares) {
      alert(`You only own ${userShares} shares of ${symbol}`);
      return;
    }
    
    onExecuteTrade(symbol, shares, stock.price, mode);
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
          <h2 className="text-3xl font-bold text-dark mb-2">
            {isBuying ? 'Buy' : 'Sell'} {symbol}
          </h2>
          <p className="text-gray">{stock.name}</p>
          {!isBuying && (
            <p className="text-sm text-gray mt-1">
              You own: {userShares} shares
            </p>
          )}
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
          
          {/* Quick Select Buttons */}
          <div className="flex gap-2 mb-3">
            {[1, 5, 10, 25, 50].map(num => (
              <button
                key={num}
                onClick={() => handleQuickSelect(num)}
                disabled={isBuying && num > maxShares}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sharesInput === num.toString()
                    ? 'bg-primary text-white'
                    : isBuying && num > maxShares
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-dark hover:bg-primary hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={sharesInput}
              onChange={handleSharesChange}
              placeholder="0"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-lg font-semibold"
            />
            {!isBuying && userShares > 0 && (
              <button
                onClick={() => handleQuickSelect(userShares)}
                className="px-4 py-3 bg-gray-200 text-dark font-semibold rounded-xl hover:bg-gray-300 transition-all whitespace-nowrap"
              >
                All ({userShares})
              </button>
            )}
          </div>
          {maxShares > 0 && (
            <div className="text-sm text-gray mt-2">
              Max: {maxShares} shares
            </div>
          )}
        </div>

        {/* Order Summary - WITH TOOLTIPS */}
        <div className="bg-light rounded-2xl p-5 mb-6">
          <div className="flex justify-between mb-3">
            <span className="text-gray flex items-center">
              {isBuying ? 'Order Total:' : 'You Receive:'}
              {userData && (
                <Tooltip
                  term={formatTermName('market-order')}
                  content={getGlossaryContent('market-order')}
                  userData={userData}
                  position="top"
                />
              )}
            </span>
            <span className={`font-bold text-lg ${!canAfford && isBuying && shares > 0 ? 'text-danger' : 'text-success'}`}>
              ${total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray flex items-center">
              {isBuying ? 'Available Cash:' : 'New Cash Balance:'}
              {userData && (
                <Tooltip
                  term={formatTermName('portfolio')}
                  content={getGlossaryContent('portfolio')}
                  userData={userData}
                  position="top"
                />
              )}
            </span>
            <span className="font-bold text-primary">
              ${isBuying ? availableCash.toFixed(2) : (availableCash + total).toFixed(2)}
            </span>
          </div>
          {!canAfford && shares > 0 && (
            <div className="mt-3 text-danger text-sm font-semibold">
              ⚠️ {isBuying ? 'Insufficient virtual funds' : `You only own ${userShares} shares`}
            </div>
          )}
        </div>

        {/* Practice Mode Banner */}
        <div className={`${isBuying ? 'bg-success' : 'bg-primary'} bg-opacity-10 border-2 ${isBuying ? 'border-success' : 'border-primary'} rounded-xl p-4 mb-6`}>
          <div className={`font-bold ${isBuying ? 'text-success' : 'text-primary'} mb-1`}>
            ✓ Practice Mode Active
          </div>
          <div className="text-sm text-dark">
            {isBuying 
              ? 'This is a simulated trade with virtual money. Perfect for learning!'
              : 'Practice selling to understand how to take profits and manage your portfolio.'}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleTrade}
            disabled={!canAfford || shares <= 0}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              canAfford && shares > 0
                ? `${isBuying ? 'bg-primary hover:bg-primary-dark' : 'bg-danger hover:bg-red-600'} text-white hover:shadow-lg`
                : 'bg-gray-300 text-gray cursor-not-allowed'
            }`}
          >
            {isBuying ? 'Buy' : 'Sell'} {symbol}
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