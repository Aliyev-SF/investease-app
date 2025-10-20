// src/pages/PortfolioPage.jsx (FIXED - All features working)
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { allAssets, updateStockPrices, isETF } from '../utils/stockData';
import { useToast } from '../components/ToastContainer';
import TradeModal from '../components/TradeModal';
import SuggestionCard from '../components/SuggestionCard';
import { trackPageView } from '../utils/analytics';
import { 
  getSuggestionForContext, 
  trackSuggestionShown, 
  trackSuggestionDismissed,
  trackSuggestionClicked 
} from '../utils/suggestionHelper';
import { recalculateConfidenceAfterTrade } from '../utils/confidenceCalculator';
import StockIcon from '../components/icons/StockIcon';
import ETFIcon from '../components/icons/ETFIcon';

function PortfolioPage({ userData, onConfidenceUpdate }) {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stocks, setStocks] = useState(allAssets); // ✅ Local state for live prices
  const { showToast } = useToast();
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState('buy');
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (userData?.id) {
      trackPageView(userData.id, 'portfolio');
    }
  }, [userData]);

  // ✅ NEW: Update stock prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => updateStockPrices(prevStocks));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadPortfolio();
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check for suggestions after data loads
    if (portfolio && transactions && !loading) {
      checkForSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, transactions, loading]);

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
    } finally {
      setLoading(false);
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

  const checkForSuggestions = async () => {
    if (!userData || !portfolio || !transactions) return;

    const tradeCount = transactions.length;
    const uniqueStocks = new Set(portfolio.holdings.map(h => h.symbol)).size;

    let context = null;
    
    if (tradeCount === 1) {
      context = 'portfolio_after_first_trade';
    } else if (uniqueStocks === 3) {
      context = 'portfolio_after_third_stock';
    }

    if (context) {
      const suggestedLesson = await getSuggestionForContext(
        context, 
        userData, 
        portfolio, 
        transactions
      );

      if (suggestedLesson) {
        setSuggestion(suggestedLesson);
        await trackSuggestionShown(suggestedLesson.id, userData.id, 'portfolio');
      }
    }
  };

  const handleSuggestionLearnClick = async (lessonSlug) => {
    if (suggestion) {
      await trackSuggestionClicked(suggestion.id, userData.id, lessonSlug);
      navigate(`/learn?lesson=${lessonSlug}`);
    }
  };

  const handleSuggestionDismiss = async () => {
    if (suggestion) {
      await trackSuggestionDismissed(suggestion.id, userData.id);
      setSuggestion(null);
    }
  };

  const handleBuyClick = (symbol) => {
    setSelectedStock(symbol);
    setTradeType('buy');
  };

  const handleSellClick = (symbol) => {
    setSelectedStock(symbol);
    setTradeType('sell');
  };

  const getUserShares = (symbol) => {
    if (!portfolio || !portfolio.holdings) return 0;
    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    return holding ? holding.shares : 0;
  };

  const calculateNewTotalValue = (newCash, newHoldings) => {
    let holdingsValue = 0;
    newHoldings.forEach(holding => {
      const stock = stocks[holding.symbol]; // ✅ Use live prices from state
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

      // ✅ Update confidence score after trade
      const newScore = await recalculateConfidenceAfterTrade(userData.id);
      if (newScore !== null && onConfidenceUpdate) {
        onConfidenceUpdate(newScore);
      }

      showToast(`Successfully bought ${shares} shares of ${symbol}!`, 'success');
    } else {
      // SELL logic
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

      // ✅ Update confidence score after trade
      const newScore = await recalculateConfidenceAfterTrade(userData.id);
      if (newScore !== null && onConfidenceUpdate) {
        onConfidenceUpdate(newScore);
      }

      const profitText = profit >= 0 
        ? `Profit: $${profit.toFixed(2)}` 
        : `Loss: $${Math.abs(profit).toFixed(2)}`;
      showToast(`Sold ${shares} shares of ${symbol}. ${profitText}`, 'success');
    }

    loadPortfolio();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  const holdings = portfolio?.holdings || [];
  const cash = portfolio?.cash || 10000;
  const totalValue = portfolio?.total_value || 10000;
  const invested = totalValue - cash;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">📊 Portfolio</h2>
        <p className="text-gray">View and manage your investments</p>
      </div>

      {/* Suggestion Card */}
      {suggestion && (
        <SuggestionCard
          suggestion={suggestion}
          onLearnClick={handleSuggestionLearnClick}
          onDismiss={handleSuggestionDismiss}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Total Value</div>
          <div className="text-3xl font-bold text-dark">{formatCurrency(totalValue)}</div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Available Cash</div>
          <div className="text-3xl font-bold text-success">{formatCurrency(cash)}</div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Invested</div>
          <div className="text-3xl font-bold text-primary">{formatCurrency(invested)}</div>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-dark mb-4">Your Holdings</h3>

        {holdings.length > 0 ? (
          <div className="space-y-3">
            {holdings.map((holding, index) => {
              const stockInfo = stocks[holding.symbol]; // ✅ Use live prices from state
              
              if (!stockInfo) {
                console.error(`Stock ${holding.symbol} not found in stockData`);
                return null;
              }
              
              const currentPrice = stockInfo.price;
              const currentValue = holding.shares * currentPrice;
              const costBasis = holding.shares * holding.avgPrice;
              const gainLoss = currentValue - costBasis;
              const gainLossPercent = ((gainLoss / costBasis) * 100).toFixed(2);
              const isEtfAsset = isETF(holding.symbol);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-5 bg-light rounded-2xl hover:bg-gray-100 transition-all"
                >
                  {/* Left: Icon + Symbol/Name + Shares */}
                  <div className="flex items-center gap-4 flex-1">
                    {isEtfAsset ? (
                      <ETFIcon size={32} className="text-purple-600" />
                    ) : (
                      <StockIcon size={32} className="text-primary" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-bold text-lg text-dark">{holding.symbol}</div>
                        {isEtfAsset && (
                          <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                            ETF
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray">
                        {holding.shares} shares @ {formatCurrency(holding.avgPrice)} avg
                      </div>
                    </div>
                  </div>

                  {/* Middle: Current Value + Gain/Loss */}
                  <div className="text-right mr-4">
                    <div className="font-bold text-dark text-lg">
                      {formatCurrency(currentValue)}
                    </div>
                    <div className={`text-sm font-semibold ${gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                      {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent}%)
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBuyClick(holding.symbol)}
                      className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                    >
                      Buy More
                    </button>
                    <button
                      onClick={() => handleSellClick(holding.symbol)}
                      className="px-4 py-2 bg-danger text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-xl font-bold text-dark mb-2">No Holdings Yet</div>
            <div className="text-gray mb-4">Start by buying your first stock or ETF!</div>
            <button
              onClick={() => navigate('/market')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
            >
              Browse Market
            </button>
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {selectedStock && stocks[selectedStock] && portfolio && (
        <TradeModal
          symbol={selectedStock}
          stock={stocks[selectedStock]} // ✅ Use live prices from state
          availableCash={portfolio.cash}
          userShares={getUserShares(selectedStock)}
          mode={tradeType}
          onClose={() => setSelectedStock(null)}
          onExecuteTrade={handleExecuteTrade}
        />
      )}
    </div>
  );
}

export default PortfolioPage;