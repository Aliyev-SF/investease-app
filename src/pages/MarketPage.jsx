// src/pages/MarketPage.jsx (Updated with new stock cards)
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { stockData, updateStockPrices } from '../utils/stockData';
import TradeModal from '../components/TradeModal';
import { useToast } from '../components/ToastContainer';
import { trackPageView } from '../utils/analytics';

function MarketPage({ userData }) {
  const [stocks, setStocks] = useState(stockData);
  const [portfolio, setPortfolio] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('buy');
  const { showToast } = useToast();

  useEffect(() => {
  if (userData?.id) {
    trackPageView(userData.id, 'market'); // Change name per page
  }
}, [userData]);

  useEffect(() => {
    // Update prices every 5 seconds
    const interval = setInterval(() => {
      setStocks(prevStocks => updateStockPrices(prevStocks));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const loadPortfolio = async () => {
    if (!userData) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (error) throw error;
      setPortfolio(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  const handleBuyClick = (symbol) => {
    setSelectedStock(symbol);
    setTradeMode('buy');
  };

  const handleSellClick = (symbol) => {
    setSelectedStock(symbol);
    setTradeMode('sell');
  };

  const getUserShares = (symbol) => {
    if (!portfolio || !portfolio.holdings) return 0;
    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    return holding ? holding.shares : 0;
  };

  const calculateNewTotalValue = (newCash, newHoldings) => {
    let holdingsValue = 0;
    newHoldings.forEach(holding => {
      const stock = stocks[holding.symbol];
      if (stock) {
        holdingsValue += holding.shares * stock.price;
      }
    });
    return newCash + holdingsValue;
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
      showToast('Error saving portfolio. Please try again.', 'error');
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

  const handleExecuteTrade = async (symbol, shares, price, mode) => {
    const total = shares * price;
    const timestamp = new Date().toISOString();
    
    if (mode === 'buy') {
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      const newCash = portfolio.cash - total;
      const newHoldings = existingHolding
        ? portfolio.holdings.map(h =>
            h.symbol === symbol
              ? { 
                  ...h, 
                  shares: h.shares + shares, 
                  avgPrice: ((h.avgPrice * h.shares) + (price * shares)) / (h.shares + shares) 
                }
              : h
          )
        : [...portfolio.holdings, { symbol, shares, avgPrice: price }];

      const newPortfolio = {
        cash: newCash,
        holdings: newHoldings,
        totalValue: calculateNewTotalValue(newCash, newHoldings)
      };

      setPortfolio({ ...portfolio, ...newPortfolio });
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

      showToast(`Successfully bought ${shares} shares of ${symbol}!`, 'success');
    } else {
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      if (!existingHolding || existingHolding.shares < shares) {
        showToast('Error: Insufficient shares to sell', 'error');
        return;
      }

      const remainingShares = existingHolding.shares - shares;
      const profit = (price - existingHolding.avgPrice) * shares;

      const newCash = portfolio.cash + total;
      const newHoldings = remainingShares > 0
        ? portfolio.holdings.map(h =>
            h.symbol === symbol
              ? { ...h, shares: remainingShares }
              : h
          )
        : portfolio.holdings.filter(h => h.symbol !== symbol);

      const newPortfolio = {
        cash: newCash,
        holdings: newHoldings,
        totalValue: calculateNewTotalValue(newCash, newHoldings)
      };

      setPortfolio({ ...portfolio, ...newPortfolio });
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

      const profitText = profit >= 0 
        ? `Profit: $${profit.toFixed(2)}` 
        : `Loss: $${Math.abs(profit).toFixed(2)}`;
      showToast(`Sold ${shares} shares of ${symbol}. ${profitText}`, 'success');
    }

    loadPortfolio();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">📈 Stock Market</h2>
        <p className="text-gray">Browse and trade available stocks</p>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(stocks).map(([symbol, stock]) => {
          const userShares = getUserShares(symbol);
          const hasShares = userShares > 0;
          const changePercent = ((stock.change / stock.price) * 100).toFixed(2);
          const isPositive = stock.change >= 0;

          return (
            <div
              key={symbol}
              className="bg-white border-2 border-gray-200 rounded-3xl p-5 hover:shadow-lg transition-all"
            >
              {/* Top Row: Symbol/Name + Change Badge */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-2xl font-bold text-dark">{symbol}</div>
                  <div className="text-sm text-gray">{stock.name}</div>
                </div>
                <div className={`px-3 py-1 rounded-xl font-semibold text-sm ${
                  isPositive 
                    ? 'bg-success bg-opacity-10 text-success' 
                    : 'bg-danger bg-opacity-10 text-danger'
                }`}>
                  {isPositive ? '📈' : '📉'} {isPositive ? '+' : ''}{changePercent}%
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-dark mb-1">
                  ${stock.price.toFixed(2)}
                </div>
                <div className={`text-base font-semibold ${
                  isPositive ? 'text-success' : 'text-danger'
                }`}>
                  ${isPositive ? '+' : ''}{stock.change.toFixed(2)} today
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 my-4"></div>

              {/* P/E Ratio */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm text-gray">
                  <span>P/E Ratio</span>
                  <div className="relative group">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help">
                      ?
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Price-to-Earnings ratio measures stock value
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-dark"></div>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-dark">
                  {stock.peRatio}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {hasShares ? (
                  <>
                    <button
                      onClick={() => handleBuyClick(symbol)}
                      className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                    >
                      Buy More
                    </button>
                    <button
                      onClick={() => handleSellClick(symbol)}
                      className="flex-1 px-4 py-3 bg-danger text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                    >
                      Sell
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleBuyClick(symbol)}
                    className="w-full px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                  >
                    Buy
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trade Modal */}
      {selectedStock && stocks[selectedStock] && portfolio && (
        <TradeModal
          symbol={selectedStock}
          stock={stocks[selectedStock]}
          availableCash={portfolio.cash}
          userShares={getUserShares(selectedStock)}
          mode={tradeMode}
          onClose={() => setSelectedStock(null)}
          onExecuteTrade={handleExecuteTrade}
        />
      )}
    </div>
  );
}

export default MarketPage;