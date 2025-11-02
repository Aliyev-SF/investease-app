import React from 'react';
import Button from './Button';

const StockActions = ({
  stock,
  userHoldings,
  onBuyClick,
  onSellClick,
  loading
}) => {
  if (loading || !stock) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate-pulse">
        <div className="flex gap-3">
          <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
          <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
        </div>
      </div>
    );
  }

  const hasSellableShares = userHoldings && userHoldings.shares > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-6 lg:sticky lg:top-4 z-10 fixed bottom-16 left-4 right-4 lg:relative lg:left-auto lg:right-auto lg:bottom-auto">
      <div className="flex gap-3">
        {/* Invest Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onBuyClick}
          className="flex-1"
        >
          Invest
        </Button>

        {/* Sell Button */}
        <Button
          variant="danger"
          size="sm"
          onClick={onSellClick}
          disabled={!hasSellableShares}
          className="flex-1"
        >
          Sell
        </Button>
      </div>
    </div>
  );
};

export default StockActions;