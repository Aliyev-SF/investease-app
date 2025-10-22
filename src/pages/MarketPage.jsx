// src/pages/MarketPage.jsx (UPDATED - Uses market_data and holdings tables)
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import TradeModal from '../components/TradeModal';
import { useToast } from '../components/ToastContainer';
import { trackPageView } from '../utils/analytics';
import { recalculateConfidenceAfterTrade } from '../utils/confidenceCalculator';
import StockIcon from '../components/icons/StockIcon';
import ETFIcon from '../components/icons/ETFIcon';
import { refreshMarketPrices } from '../services/alphaVantageService';

function MarketPage({ userData, onConfidenceUpdate }) {
  const [activeTab, setActiveTab] = useState('stocks');
  const [marketData, setMarketData] = useState({}); // NEW: From market_data table
  const [holdings, setHoldings] = useState([]); // NEW: From holdings table
  const [portfolio, setPortfolio] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('buy');
  const { showToast } = useToast();

  useEffect(() => {
    if (userData?.id) {
      trackPageView(userData.id, 'market');
    }
  }, [userData]);

  // NEW: Load market data from database
  useEffect(() => {
    loadMarketData();
  }, []);

  // Refresh market data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMarketData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userData) {
      loadPortfolio();
      loadHoldings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  // NEW: Load market data from database
  const loadMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .eq('is_active', true)
        .order('symbol');

      if (error) throw error;

      // Convert to object keyed by symbol
      const dataObj = {};
      data.forEach(stock => {
        dataObj[stock.symbol] = {
          symbol: stock.symbol,
          name: stock.name,
          price: parseFloat(stock.current_price),
          change: parseFloat(stock.change || 0),
          changePercent: parseFloat(stock.change_percent || 0),
          icon: stock.icon || '📊',
          peRatio: stock.pe_ratio ? parseFloat(stock.pe_ratio) : null,
          type: stock.type,
          description: stock.company_description
        };
      });

      setMarketData(dataObj);
    } catch (error) {
      console.error('Error loading market data:', error);
    }
  };

  const loadPortfolio = async () => {
    if (!userData) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('cash')
        .eq('user_id', userData.id)
        .single();

      if (error) throw error;
      setPortfolio(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  // NEW: Load holdings from holdings table
  const loadHoldings = async () => {
    if (!userData) return;

    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userData.id);

      if (error) throw error;
      setHoldings(data || []);
    } catch (error) {
      console.error('Error loading holdings:', error);
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
    const holding = holdings.find(h => h.symbol === symbol);
    return holding ? parseFloat(holding.shares) : 0;
  };

  const handleExecuteTrade = async (symbol, shares, price, type) => {
    try {
      const totalCost = shares * price;
      const holding = holdings.find(h => h.symbol === symbol);

      if (type === 'buy') {
        // Check sufficient funds
        if (portfolio.cash < totalCost) {
          showToast('Insufficient funds', 'error');
          return;
        }

        if (holding) {
          // Update existing holding
          const newShares = parseFloat(holding.shares) + shares;
          const newAvgPrice = 
            (parseFloat(holding.shares) * parseFloat(holding.average_price) + totalCost) / newShares;

          await supabase
            .from('holdings')
            .update({
              shares: newShares,
              average_price: newAvgPrice
            })
            .eq('id', holding.id);
        } else {
          // Create new holding
          await supabase
            .from('holdings')
            .insert({
              user_id: userData.id,
              symbol,
              shares,
              average_price: price
            });
        }

        // Update cash
        await supabase
          .from('portfolios')
          .update({ cash: portfolio.cash - totalCost })
          .eq('user_id', userData.id);

        // Record transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: userData.id,
            symbol,
            type: 'buy',
            shares,
            price,
            total: totalCost,
            timestamp: new Date().toISOString()
          });

        showToast(`Bought ${shares} shares of ${symbol}!`, 'success');
      } else {
        // Sell logic
        if (!holding || parseFloat(holding.shares) < shares) {
          showToast('Insufficient shares', 'error');
          return;
        }

        const costBasis = shares * parseFloat(holding.average_price);
        const profit = totalCost - costBasis;
        const remainingShares = parseFloat(holding.shares) - shares;

        if (remainingShares > 0) {
          // Update holding
          await supabase
            .from('holdings')
            .update({ shares: remainingShares })
            .eq('id', holding.id);
        } else {
          // Delete holding
          await supabase
            .from('holdings')
            .delete()
            .eq('id', holding.id);
        }

        // Update cash
        await supabase
          .from('portfolios')
          .update({ cash: portfolio.cash + totalCost })
          .eq('user_id', userData.id);

        // Record transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: userData.id,
            symbol,
            type: 'sell',
            shares,
            price,
            total: totalCost,
            profit_loss: profit,
            timestamp: new Date().toISOString()
          });

        const profitText = profit >= 0 
          ? `Profit: $${profit.toFixed(2)}` 
          : `Loss: $${Math.abs(profit).toFixed(2)}`;
        showToast(`Sold ${shares} shares of ${symbol}. ${profitText}`, 'success');
      }

      // Recalculate confidence score
      const newScore = await recalculateConfidenceAfterTrade(userData.id);
      if (newScore && onConfidenceUpdate) {
        onConfidenceUpdate(newScore);
      }

      // Reload data
      loadPortfolio();
      loadHoldings();
      setSelectedStock(null);
    } catch (error) {
      console.error('Error executing trade:', error);
      showToast('Trade failed. Please try again.', 'error');
    }
  };

  // Filter assets based on active tab
  const displayedAssets = Object.entries(marketData).filter(([, asset]) => 
    activeTab === 'stocks' ? asset.type === 'stock' : asset.type === 'etf'
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
<div className="mb-6">
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-3xl font-bold text-dark mb-2">📈 Stock Market</h2>
      <p className="text-gray">Browse and trade stocks and ETFs</p>
    </div>
<div className="flex gap-2">

  
  {/* ADMIN: Price Update Button */}
  {userData?.email === 'test10@test.com' && (
        <button
          onClick={async () => {
            const allSymbols = [
              // Stocks
              'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 
              'NVDA', 'META', 'NFLX', 'DIS', 'COST',
              // ETFs
              'SPY', 'QQQ', 'VOO', 'VTI', 'AGG'
            ];
            
            const confirmUpdate = window.confirm(
              `Update all 15 stock/ETF prices?\n\n` +
              `⏱️ Takes ~3 minutes\n` +
              `📊 Uses 15 of your 25 daily API calls\n` +
              `💰 You have ${25 - 15} calls remaining after this\n\n` +
              `Continue?`
            );
            
            if (!confirmUpdate) return;
            
            showToast('Updating prices... This takes ~3 minutes', 'info');
            const result = await refreshMarketPrices(allSymbols);
            
            if (result.success) {
              showToast(
                `✅ Updated ${result.updated.length}/15 stocks in ${Math.round(result.duration/60)}min ${result.duration%60}s`, 
                'success'
              );
              loadMarketData();
            } else {
              showToast('Update failed. Check console for details.', 'error');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
        >
          🔄 Refresh Market Prices
        </button>
  )}
</div>
  </div>
</div>

      {/* Tabs for Stocks/ETFs */}
      <div className="bg-white rounded-3xl shadow-lg mb-6 overflow-hidden">
        <div className="flex border-b-2 border-light">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
              activeTab === 'stocks'
                ? 'text-primary border-b-4 border-primary bg-primary bg-opacity-5'
                : 'text-gray hover:text-primary hover:bg-light'
            }`}
          >
            <StockIcon size={20} className={activeTab === 'stocks' ? 'text-primary' : 'text-gray'} />
            <span>Stocks</span>
          </button>

          <button
            onClick={() => setActiveTab('etfs')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
              activeTab === 'etfs'
                ? 'text-purple-600 border-b-4 border-purple-600 bg-purple-600 bg-opacity-5'
                : 'text-gray hover:text-purple-600 hover:bg-light'
            }`}
          >
            <ETFIcon size={20} className={activeTab === 'etfs' ? 'text-purple-600' : 'text-gray'} />
            <span>ETFs</span>
          </button>
        </div>

        {/* Stock Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedAssets.map(([symbol, stock]) => {
              const userShares = getUserShares(symbol);
              const hasShares = userShares > 0;
              const changePercent = ((stock.change / stock.price) * 100).toFixed(2);
              const isPositive = stock.change >= 0;
              const isEtf = stock.type === 'etf';

              return (
                <div
                  key={symbol}
                  className="bg-light border-2 border-gray-200 rounded-3xl p-5 hover:shadow-lg transition-all"
                >
                 {/* Top Row: Icon + Symbol/Name + Change Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {isEtf ? (
                          <ETFIcon size={32} className="text-purple-600" />
                        ) : (
                          <StockIcon size={32} className="text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg text-dark">{symbol}</div>
                        <div className="text-sm text-gray truncate" title={stock.name}>
                          {stock.name}
                        </div>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      isPositive ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'
                    }`}>
                      {isPositive ? '+' : ''}{changePercent}%
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-dark">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {isPositive ? '+' : ''}${Math.abs(stock.change).toFixed(2)} today
                    </div>
                  </div>

                  {/* Holdings Badge */}
                  {hasShares && (
                    <div className="mb-4 px-3 py-2 bg-primary bg-opacity-10 rounded-lg">
                      <div className="text-xs text-primary font-semibold">
                        You own {userShares} share{userShares !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  {/* P/E Ratio or ETF Badge */}
                  {!isEtf && stock.peRatio && (
                    <div className="mb-4 flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
                      <div className="text-xs text-gray font-semibold relative group">
                        P/E Ratio
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Price-to-Earnings ratio measures stock value
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-dark"></div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-dark">
                        {stock.peRatio}
                      </div>
                    </div>
                  )}

                  {isEtf && (
                    <div className="mb-4">
                      <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ETF
                      </span>
                    </div>
                  )}

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
        </div>
      </div>

      {/* Trade Modal */}
      {selectedStock && marketData[selectedStock] && portfolio && (
        <TradeModal
          symbol={selectedStock}
          stock={marketData[selectedStock]}
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