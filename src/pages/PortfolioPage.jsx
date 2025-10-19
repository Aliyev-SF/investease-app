// src/pages/PortfolioPage.jsx (FIXED - Recalculate Total Value)
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { stockData } from '../utils/stockData';
import TradeModal from '../components/TradeModal';
import SuggestionCard from '../components/SuggestionCard';
import { trackPageView } from '../utils/analytics';
import { 
  getSuggestionForContext, 
  trackSuggestionShown, 
  trackSuggestionDismissed,
  trackSuggestionClicked 
} from '../utils/suggestionHelper';

function PortfolioPage({ userData }) {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState('buy');
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
  if (userData?.id) {
    trackPageView(userData.id, 'portfolio'); // Change name per page
  }
}, [userData]);
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

    // Check if this is right after first trade
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

  const handleTradeComplete = () => {
    setSelectedStock(null);
    loadPortfolio();
    loadTransactions();
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

  // ✅ Helper to calculate total value with NEW holdings and cash
  const calculateNewTotalValue = (newCash, newHoldings) => {
    let holdingsValue = 0;
    newHoldings.forEach(holding => {
      const stock = stockData[holding.symbol];
      if (stock) {
        holdingsValue += holding.shares * stock.price;
      }
    });
    return newCash + holdingsValue;
  };

  const handleExecuteTrade = async (symbol, shares, price, mode) => {
    const total = shares * price;
    const timestamp = new Date().toISOString();
    
    if (mode === 'buy') {
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      // Calculate new cash and holdings
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

      // ✅ FIXED: Recalculate total value from scratch with NEW values
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

      alert(`✅ Successfully bought ${shares} shares of ${symbol}!`);
    } else {
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      if (!existingHolding || existingHolding.shares < shares) {
        alert('Error: Insufficient shares to sell');
        return;
      }

      const remainingShares = existingHolding.shares - shares;
      const profit = (price - existingHolding.avgPrice) * shares;

      // Calculate new cash and holdings
      const newCash = portfolio.cash + total;
      const newHoldings = remainingShares > 0
        ? portfolio.holdings.map(h =>
            h.symbol === symbol
              ? { ...h, shares: remainingShares }
              : h
          )
        : portfolio.holdings.filter(h => h.symbol !== symbol);

      // ✅ FIXED: Recalculate total value from scratch with NEW values
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

      const profitText = profit >= 0 ? `profit of $${profit.toFixed(2)}` : `loss of $${Math.abs(profit).toFixed(2)}`;
      alert(`✅ Successfully sold ${shares} shares of ${symbol} for a ${profitText}!`);
    }

    handleTradeComplete();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-2xl font-bold text-primary">Loading portfolio...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray">No portfolio found</div>
      </div>
    );
  }

  const totalValue = portfolio.total_value || 0;
  const investedValue = totalValue - portfolio.cash;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">💼 My Portfolio</h2>
        <p className="text-gray">Manage your investments and track performance</p>
      </div>

      {/* Smart Suggestion Card */}
      {suggestion && (
        <SuggestionCard
          icon={suggestion.icon}
          title={suggestion.title}
          message={suggestion.message}
          lessonTitle={suggestion.lessonTitle}
          lessonSlug={suggestion.lessonSlug}
          lessonDuration={suggestion.lessonDuration}
          lessonCategory={suggestion.lessonCategory}
          variant={suggestion.variant}
          onLearnClick={handleSuggestionLearnClick}
          onDismiss={handleSuggestionDismiss}
        />
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Total Value</div>
          <div className="text-3xl font-bold text-dark">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Available Cash</div>
          <div className="text-3xl font-bold text-success">
            ${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Invested</div>
          <div className="text-3xl font-bold text-primary">
            ${investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-bold text-dark mb-4">
          Your Holdings ({portfolio.holdings.length})
        </h3>

        {portfolio.holdings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-xl font-bold text-dark mb-2">No Holdings Yet</div>
            <div className="text-gray mb-4">Start by buying your first stock!</div>
            <button
              onClick={() => navigate('/market')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
            >
              Browse Stocks
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {portfolio.holdings.map((holding, index) => {
              // Get current price from stock data
              const stockInfo = stockData[holding.symbol];
              
              if (!stockInfo) {
                console.error(`Stock ${holding.symbol} not found in stockData`);
                return null;
              }
              
              const currentPrice = stockInfo.price;
              const currentValue = holding.shares * currentPrice;
              const costBasis = holding.shares * holding.avgPrice;
              const gainLoss = currentValue - costBasis;
              const gainLossPercent = ((gainLoss / costBasis) * 100).toFixed(2);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  <div className="flex-1">
                    <div className="font-bold text-lg text-dark">{holding.symbol}</div>
                    <div className="text-sm text-gray">
                      {holding.shares} shares @ ${holding.avgPrice.toFixed(2)} avg
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <div className="font-bold text-dark">
                      ${currentValue.toFixed(2)}
                    </div>
                    <div className={`text-sm font-semibold ${gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                      {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent}%)
                    </div>
                  </div>

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
        )}
      </div>

      {/* Trade Modal */}
      {selectedStock && stockData[selectedStock] && (
        <TradeModal
          symbol={selectedStock}
          stock={stockData[selectedStock]}
          availableCash={portfolio.cash}
          userShares={portfolio.holdings.find(h => h.symbol === selectedStock)?.shares || 0}
          mode={tradeType}
          onClose={() => setSelectedStock(null)}
          onExecuteTrade={handleExecuteTrade}
          userData={userData}
        />
      )}
    </div>
  );
}

export default PortfolioPage;