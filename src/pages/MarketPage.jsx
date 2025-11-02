// src/pages/MarketPage.jsx - STEP 1: URL Routing Setup
// Tab structure: /market?tab=market|portfolio|watchlist&view=stocks|etfs|holdings|history

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { trackPageView } from '../utils/analytics';
import { recalculateConfidenceAfterTrade } from '../utils/confidenceCalculator';
import { refreshMarketPrices } from '../services/alphaVantageService';

// Components
import StockIcon from '../components/brand/icons/StockIcon';
import ETFIcon from '../components/brand/icons/ETFIcon';
import StockTable from '../components/StockTable';
import StockCardsMobile from '../components/StockCardsMobile';
import HoldingsView from '../components/HoldingsView';
import TransactionsView from '../components/TransactionsView';
import WatchlistButton from '../components/WatchlistButton';
import WatchlistView from '../components/WatchlistView';

// Hooks
import { useToast } from '../components/ToastContainer';
import TradeModal from '../components/TradeModal';

function MarketPage({ userData, onConfidenceUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  
  // Read URL params
  const mainTab = searchParams.get('tab') || 'market';
  const subTab = searchParams.get('view') || (mainTab === 'market' ? 'stocks' : 'holdings');
  
  // State
  const [marketData, setMarketData] = useState({});
  const [holdings, setHoldings] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeMode, setTradeMode] = useState('buy');
  const [transactions, setTransactions] = useState([]);
  const [watchlist, setWatchlist] = useState([])

  // Helper: Update URL params
  const updateTab = (tab, view = null) => {
    const params = { tab };
    if (view) params.view = view;
    setSearchParams(params);
  };

  useEffect(() => {
    if (userData?.id) {
      trackPageView(userData.id, 'market');
    }
  }, [userData]);

  useEffect(() => {
    loadMarketData();
  }, []);

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
      loadTransactions();
      loadWatchlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const loadMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .eq('is_active', true)
        .order('symbol');

      if (error) throw error;

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
  const loadTransactions = async () => {
  if (!userData) return;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userData.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    setTransactions(data || []);
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
};
const loadWatchlist = async () => {
  if (!userData) return;
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('symbol')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Store as array of symbols: ['AAPL', 'TSLA', 'NVDA']
    const symbols = data ? data.map(item => item.symbol) : [];
    setWatchlist(symbols);
    
    console.log('✅ Loaded watchlist:', symbols);
  } catch (error) {
    console.error('Error loading watchlist:', error);
  }
};
const toggleWatchlist = async (symbol) => {
  if (!userData) {
    showToast('Please log in to use watchlist', 'error');
    return;
  }

  const isCurrentlyInWatchlist = watchlist.includes(symbol);

  try {
    if (isCurrentlyInWatchlist) {
      // Remove from watchlist
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userData.id)
        .eq('symbol', symbol);

      if (error) throw error;

      // Update local state (optimistic update)
      setWatchlist(watchlist.filter(s => s !== symbol));
      showToast(`Removed ${symbol} from watchlist`, 'success');
      
      console.log(`❌ Removed ${symbol} from watchlist`);
    } else {
      // Add to watchlist
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: userData.id,
          symbol: symbol
        });

      if (error) throw error;

      // Update local state (optimistic update)
      setWatchlist([...watchlist, symbol]);
      showToast(`Added ${symbol} to watchlist`, 'success');
      
      console.log(`✅ Added ${symbol} to watchlist`);
    }
  } catch (error) {
    console.error('Error toggling watchlist:', error);
    showToast('Failed to update watchlist', 'error');
    
    // Reload to sync state if error occurs
    loadWatchlist();
  }
};

const isInWatchlist = (symbol) => {
  return watchlist.includes(symbol);
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

  // Calculate portfolio summary values
  const cash = portfolio?.cash || 10000;
  
  const holdingsValue = holdings.reduce((sum, holding) => {
    const stock = marketData[holding.symbol];
    if (!stock) return sum;
    return sum + (parseFloat(holding.shares) * stock.price);
  }, 0);

  const totalValue = cash + holdingsValue;

  // Calculate today's change across all holdings
  const todayChange = holdings.reduce((sum, holding) => {
    const stock = marketData[holding.symbol];
    if (!stock) return sum;
    return sum + (parseFloat(holding.shares) * stock.change);
  }, 0);

  const todayChangePercent = holdingsValue > 0 
    ? (todayChange / holdingsValue) * 100 
    : 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleExecuteTrade = async (symbol, shares, price, type) => {
    try {
      const totalCost = shares * price;
      const holding = holdings.find(h => h.symbol === symbol);

      if (type === 'buy') {
        if (portfolio.cash < totalCost) {
          showToast('Insufficient funds', 'error');
          return;
        }

        if (holding) {
          const newShares = parseFloat(holding.shares) + shares;
          const newAvgPrice = 
            (parseFloat(holding.shares) * parseFloat(holding.average_price) + totalCost) / newShares;

          await supabase
            .from('holdings')
            .update({ shares: newShares, average_price: newAvgPrice })
            .eq('id', holding.id);
        } else {
          await supabase
            .from('holdings')
            .insert({
              user_id: userData.id,
              symbol,
              shares,
              average_price: price
            });
        }

        await supabase
          .from('portfolios')
          .update({ cash: portfolio.cash - totalCost })
          .eq('user_id', userData.id);

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

        showToast(`Invested in ${shares} shares of ${symbol}!`, 'success');
      } else {
        if (!holding || parseFloat(holding.shares) < shares) {
          showToast('Insufficient shares', 'error');
          return;
        }

        const costBasis = shares * parseFloat(holding.average_price);
        const profit = totalCost - costBasis;
        const remainingShares = parseFloat(holding.shares) - shares;

        if (remainingShares > 0) {
          await supabase
            .from('holdings')
            .update({ shares: remainingShares })
            .eq('id', holding.id);
        } else {
          await supabase
            .from('holdings')
            .delete()
            .eq('id', holding.id);
        }

        await supabase
          .from('portfolios')
          .update({ cash: portfolio.cash + totalCost })
          .eq('user_id', userData.id);

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

      const newScore = await recalculateConfidenceAfterTrade(userData.id);
      if (newScore && onConfidenceUpdate) {
        onConfidenceUpdate(newScore);
      }

      loadPortfolio();
      loadHoldings();
      setSelectedStock(null);
    } catch (error) {
      console.error('Error executing investment:', error);
      showToast('Investment failed. Please try again.', 'error');
    }
  };

  // Filter assets for Market tab
  const displayedAssets = Object.entries(marketData).filter(([, asset]) => 
    subTab === 'stocks' ? asset.type === 'stock' : asset.type === 'etf'
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Portfolio Summary Header - Responsive */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
        <div>
          <div className="text-xs md:text-sm text-gray mb-1">Total Assets</div>
          <div className="text-base md:text-3xl font-bold text-dark">{formatCurrency(totalValue)}</div>
        </div>
        
        <div>
          <div className="text-xs md:text-sm text-gray mb-1">Today's Change</div>
          <div className={`text-base md:text-3xl font-bold ${todayChange >= 0 ? 'text-success' : 'text-danger'}`}>
            {todayChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(todayChange))}
            <span className="text-xs md:text-xl ml-1 md:ml-2">({todayChange >= 0 ? '+' : ''}{todayChangePercent.toFixed(2)}%)</span>
          </div>
        </div>
        
        <div>
          <div className="text-xs md:text-sm text-gray mb-1">Available Cash</div>
          <div className="text-base md:text-3xl font-bold text-primary">{formatCurrency(cash)}</div>
        </div>
      </div>

      {/* LEVEL 1 TABS - Main Navigation (Subtle Pills) */}
      <div className="flex gap-1 mb-4 bg-gray-50 p-1 rounded-2xl">
        <button
          onClick={() => updateTab('market', 'stocks')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-4 rounded-xl font-semibold transition-all text-sm md:text-base ${
            mainTab === 'market'
              ? 'bg-white shadow-sm text-dark'
              : 'text-gray-500 hover:text-dark'
          }`}
        >
          <span>Market</span>
        </button>

        <button
          onClick={() => updateTab('portfolio', 'holdings')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-4 rounded-xl font-semibold transition-all text-sm md:text-base ${
            mainTab === 'portfolio'
              ? 'bg-white shadow-sm text-dark'
              : 'text-gray-500 hover:text-dark'
          }`}
        >
          <span>My Portfolio</span>
        </button>

        <button
          onClick={() => updateTab('watchlist', 'watchlist')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-4 rounded-xl font-semibold transition-all text-sm md:text-base ${
            mainTab === 'watchlist'
              ? 'bg-white shadow-sm text-dark'
              : 'text-gray-500 hover:text-dark'
          }`}
        >
          <span>Watchlist</span>
        </button>
      </div>

      {/* LEVEL 2 TABS - Context Specific (Bold Tabs in Card) */}
      <div className="bg-white rounded-3xl shadow-lg mb-6 overflow-hidden">
        {mainTab === 'market' && (
          <div className="flex border-b-2 border-light">
            <button
              onClick={() => updateTab('market', 'stocks')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
                subTab === 'stocks'
                  ? 'text-primary border-b-4 border-primary bg-primary bg-opacity-5'
                  : 'text-gray hover:text-primary hover:bg-light'
              }`}
            >
              <StockIcon size={20} className={subTab === 'stocks' ? 'text-primary' : 'text-gray'} />
              <span>Stocks</span>
            </button>

            <button
              onClick={() => updateTab('market', 'etfs')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
                subTab === 'etfs'
                  ? 'text-purple-600 border-b-4 border-purple-600 bg-purple-600 bg-opacity-5'
                  : 'text-gray hover:text-purple-600 hover:bg-light'
              }`}
            >
              <ETFIcon size={20} className={subTab === 'etfs' ? 'text-purple-600' : 'text-gray'} />
              <span>ETFs</span>
            </button>
          </div>
        )}

        {mainTab === 'portfolio' && (
          <div className="flex border-b-2 border-light">
            <button
              onClick={() => updateTab('portfolio', 'holdings')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
                subTab === 'holdings'
                  ? 'text-primary border-b-4 border-primary bg-primary bg-opacity-5'
                  : 'text-gray hover:text-primary hover:bg-light'
              }`}
            >
              <span>Holdings</span>
            </button>

            <button
              onClick={() => updateTab('portfolio', 'history')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all ${
                subTab === 'history'
                  ? 'text-primary border-b-4 border-primary bg-primary bg-opacity-5'
                  : 'text-gray hover:text-primary hover:bg-light'
              }`}
            >
              <span>Transactions</span>
            </button>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="p-6">
          {/* Market Tab Content */}
          {mainTab === 'market' && (
            <>
              {/* Desktop: Table */}
              <div className="hidden lg:block">
                <StockTable 
                  stocks={displayedAssets}
                  getUserShares={getUserShares}
                  onBuyClick={handleBuyClick}
                  onSellClick={handleSellClick}
                  activeTab={subTab}
                  isInWatchlist={isInWatchlist}
                  onToggleWatchlist={toggleWatchlist}
                />
              </div>

              {/* Mobile: Cards */}
              <div className="block lg:hidden">
                <StockCardsMobile 
                  stocks={displayedAssets}
                  getUserShares={getUserShares}
                  onBuyClick={handleBuyClick}
                  onSellClick={handleSellClick}
                  isInWatchlist={isInWatchlist}
                  onToggleWatchlist={toggleWatchlist}
                />
              </div>
            </>
          )}

          {/* Portfolio Tab Content */}
          {mainTab === 'portfolio' && (
            <>
              {/* Holdings View */}
              {subTab === 'holdings' && (
                <HoldingsView
                  holdings={holdings}
                  marketData={marketData}
                  onBuyClick={handleBuyClick}
                  onSellClick={handleSellClick}
                />
              )}

              {/* Transactions View */}
              {subTab === 'history' && (
                <TransactionsView
                  transactions={transactions}
                  marketData={marketData}
                />
              )}

            </>
          )}
          
              {/*Watchlist Tab Content */}
              {mainTab === 'watchlist' && (
                <WatchlistView
                  watchlist={watchlist}
                  marketData={marketData}
                  onBuyClick={handleBuyClick}
                  onSellClick={handleSellClick}
                  getUserShares={getUserShares}
                  onToggleWatchlist={toggleWatchlist}
                />
              )}
        </div>
      </div>

      {/* Admin Button */}
      {userData?.email === 'test10@test.com' && (
        <div className="mb-6">
          <button
            onClick={async () => {
              const allSymbols = [
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 
                'NVDA', 'META', 'NFLX', 'DIS', 'COST',
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
        </div>
      )}

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