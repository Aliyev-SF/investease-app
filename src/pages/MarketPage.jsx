import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { stockData as initialStockData, updateStockPrices } from '../utils/stockData';
import StockCard from '../components/StockCard';
import TradeModal from '../components/TradeModal';

function MarketPage({ userData }) {
  const [portfolio, setPortfolio] = useState({
    cash: 10000,
    holdings: [],
    totalValue: 10000
  });
  const [stocks, setStocks] = useState(initialStockData);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleExecuteTrade = async (symbol, shares, price) => {
    const total = shares * price;
    const timestamp = new Date().toISOString();
    const totalValue = calculateTotalValue();
    
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

    setSelectedStock(null);
  };

  const handleBuyStock = (symbol) => {
    setSelectedStock(symbol);
  };

  const getUserShares = (symbol) => {
    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    return holding ? holding.shares : 0;
  };

  const filteredStocks = Object.entries(stocks).filter(([symbol, stock]) => {
    const term = searchTerm.toLowerCase();
    return symbol.toLowerCase().includes(term) || stock.name.toLowerCase().includes(term);
  });

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
        <h2 className="text-3xl font-bold text-dark mb-2">Market</h2>
        <p className="text-gray">Browse and trade practice stocks</p>
      </div>

      {/* Available Cash Banner */}
      <div className="bg-primary bg-opacity-10 rounded-2xl p-4 mb-6 flex justify-between items-center">
        <div>
          <div className="text-sm text-gray mb-1">Available to Trade</div>
          <div className="text-2xl font-bold text-primary">${portfolio.cash.toFixed(2)}</div>
        </div>
        <div className="text-4xl">💰</div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search stocks by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-primary focus:outline-none text-lg"
        />
      </div>

      {/* Stock Grid */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-dark mb-4">
          Available Stocks ({filteredStocks.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map(([symbol, stock]) => (
            <StockCard 
              key={symbol}
              symbol={symbol}
              stock={stock}
              onClick={() => handleBuyStock(symbol)}
            />
          ))}
        </div>

        {filteredStocks.length === 0 && (
          <div className="text-center py-12 text-gray">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-lg mb-2">No stocks found</div>
            <div className="text-sm">Try a different search term</div>
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
          mode="buy"
          onClose={() => setSelectedStock(null)}
          onExecuteTrade={handleExecuteTrade}
        />
      )}
    </div>
  );
}

export default MarketPage;