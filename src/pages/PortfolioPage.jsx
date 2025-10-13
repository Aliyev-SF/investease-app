import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { stockData as initialStockData, updateStockPrices } from '../utils/stockData';
import TradeModal from '../components/TradeModal';

function PortfolioPage({ userData, confidenceScore, onConfidenceUpdate }) {
  const [portfolio, setPortfolio] = useState({
    cash: 10000,
    holdings: [],
    totalValue: 10000
  });
  const [stocks, setStocks] = useState(initialStockData);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('buy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (error) throw error;

      setPortfolio({
        cash: parseFloat(data.cash),
        holdings: data.holdings || [],
        totalValue: parseFloat(data.total_value)
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      setLoading(false);
    }
  };

  const savePortfolio = async (newPortfolio) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          cash: newPortfolio.cash,
          holdings: newPortfolio.holdings,
          total_value: newPortfolio.totalValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userData.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving portfolio:', error);
      alert('Error saving portfolio. Please try again.');
    }
  };

  const saveTransaction = async (transactionData) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  // Real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => updateStockPrices(prevStocks));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const calculateTotalValue = () => {
    let holdingsValue = 0;
    portfolio.holdings.forEach(holding => {
      holdingsValue += holding.shares * stocks[holding.symbol].price;
    });
    return portfolio.cash + holdingsValue;
  };

  const totalValue = calculateTotalValue();
  const dayChange = totalValue - 10000;
  const dayChangePercent = (dayChange / 10000) * 100;

  const handleExecuteTrade = async (symbol, shares, price, mode) => {
    const total = shares * price;
    const timestamp = new Date().toISOString();
    
    if (mode === 'buy') {
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      const newPortfolio = {
        cash: portfolio.cash - total,
        holdings: existingHolding
          ? portfolio.holdings.map(h =>
              h.symbol === symbol
                ? { 
                    ...h, 
                    shares: h.shares + shares, 
                    avgPrice: ((h.avgPrice * h.shares) + (price * shares)) / (h.shares + shares) 
                  }
                : h
            )
          : [...portfolio.holdings, { symbol, shares, avgPrice: price }],
        totalValue: totalValue
      };

      setPortfolio(newPortfolio);
      await savePortfolio(newPortfolio);
      await saveTransaction({
        user_id: userData.id,
        symbol,
        type: 'buy',
        shares,
        price,
        total,
        profit_loss: null,
        timestamp
      });

      // Update confidence score
      const tradeCount = newPortfolio.holdings.length;
      if (tradeCount === 1) {
        onConfidenceUpdate(confidenceScore + 0.5); // First trade
      } else if (tradeCount >= 3) {
        onConfidenceUpdate(confidenceScore + 0.3); // Diversification
      } else {
        onConfidenceUpdate(confidenceScore + 0.2); // Regular buy
      }
    } else {
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      if (!existingHolding || existingHolding.shares < shares) {
        alert('Error: Insufficient shares to sell');
        return;
      }

      const remainingShares = existingHolding.shares - shares;
      const profit = (price - existingHolding.avgPrice) * shares;

      const newPortfolio = {
        cash: portfolio.cash + total,
        holdings: remainingShares > 0
          ? portfolio.holdings.map(h =>
              h.symbol === symbol
                ? { ...h, shares: remainingShares }
                : h
            )
          : portfolio.holdings.filter(h => h.symbol !== symbol),
        totalValue: totalValue
      };

      setPortfolio(newPortfolio);
      await savePortfolio(newPortfolio);
      await saveTransaction({
        user_id: userData.id,
        symbol,
        type: 'sell',
        shares,
        price,
        total,
        profit_loss: profit,
        timestamp
      });

      // Update confidence score
      onConfidenceUpdate(confidenceScore + 0.1);
    }

    setSelectedStock(null);
  };

  const handleBuyStock = (symbol) => {
    setSelectedStock(symbol);
    setTradeMode('buy');
  };

  const handleSellStock = (symbol) => {
    setSelectedStock(symbol);
    setTradeMode('sell');
  };

  const getUserShares = (symbol) => {
    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    return holding ? holding.shares : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">Portfolio</h2>
        <p className="text-gray">Manage your holdings and track performance</p>
      </div>

      {/* Portfolio Value Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-bold text-dark mb-4">Portfolio Value</h3>
        
        <div className="mb-4">
          <div className="text-4xl font-bold text-dark mb-2">
            ${totalValue.toFixed(2)}
          </div>
          <div className={`text-lg font-semibold ${dayChange >= 0 ? 'text-success' : 'text-danger'}`}>
            {dayChange >= 0 ? '+' : ''}${Math.abs(dayChange).toFixed(2)} ({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-light p-4 rounded-xl">
            <div className="text-gray text-sm mb-1">Holdings Value</div>
            <div className="text-dark font-bold text-xl">${(totalValue - portfolio.cash).toFixed(2)}</div>
          </div>
          <div className="bg-light p-4 rounded-xl">
            <div className="text-gray text-sm mb-1">Available Cash</div>
            <div className="text-dark font-bold text-xl">${portfolio.cash.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-dark mb-4">Your Holdings</h3>

        {portfolio.holdings.length === 0 ? (
          <div className="text-center py-12 text-gray">
            <div className="text-5xl mb-4">📊</div>
            <div className="text-lg mb-2">No holdings yet</div>
            <div className="text-sm">Start trading to build your portfolio!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {portfolio.holdings.map(holding => {
              const stock = stocks[holding.symbol];
              const value = holding.shares * stock.price;
              const gain = value - (holding.shares * holding.avgPrice);
              const gainPercent = (gain / (holding.shares * holding.avgPrice)) * 100;

              return (
                <div key={holding.symbol} className="flex justify-between items-center p-4 bg-light rounded-xl hover:bg-gray-100 transition-all">
                  <div className="flex-1">
                    <div className="font-bold text-dark text-lg">{holding.symbol}</div>
                    <div className="text-sm text-gray">{holding.shares} shares @ ${holding.avgPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray mt-1">Current: ${stock.price.toFixed(2)}</div>
                  </div>
                  <div className="text-right flex-1">
                    <div className="font-bold text-dark text-lg">${value.toFixed(2)}</div>
                    <div className={`text-sm font-semibold ${gain >= 0 ? 'text-success' : 'text-danger'}`}>
                      {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleBuyStock(holding.symbol)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all"
                    >
                      Buy More
                    </button>
                    <button
                      onClick={() => handleSellStock(holding.symbol)}
                      className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {selectedStock && (
        <TradeModal
          symbol={selectedStock}
          stock={stocks[selectedStock]}
          availableCash={portfolio.cash}
          userShares={getUserShares(selectedStock)}
          mode={tradeMode}
          onClose={() => setSelectedStock(null)}
          onExecuteTrade={handleExecuteTrade}
          userData={userData}
        />
      )}
    </div>
  );
}

export default PortfolioPage;