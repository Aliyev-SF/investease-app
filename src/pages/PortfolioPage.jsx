// src/pages/PortfolioPage.jsx (UPDATED - Uses new holdings + market_data tables)
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
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
  const [holdings, setHoldings] = useState([]); // NEW: Holdings from holdings table
  const [transactions, setTransactions] = useState([]);
  const [marketData, setMarketData] = useState({}); // NEW: Market data from market_data table
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

  // NEW: Load market data from database
  useEffect(() => {
    loadMarketData();
  }, []);

  // Refresh market data every 30 seconds (or keep it static until Alpha Vantage integration)
  useEffect(() => {
    const interval = setInterval(() => {
      loadMarketData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadPortfolio();
    loadHoldings();
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  useEffect(() => {
    // Check for suggestions after data loads
    if (portfolio && transactions && !loading) {
      checkForSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, transactions, loading]);

  // NEW: Load market data from database
  const loadMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Convert to object keyed by symbol for easy lookup
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
          type: stock.type
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
        .select('cash, total_value') // Only need cash now
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

  // NEW: Load holdings from holdings table
  const loadHoldings = async () => {
    if (!userData) return;

    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

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

  const checkForSuggestions = async () => {
    if (!userData || !portfolio) return;

    const context = {
      userId: userData.id,
      page: 'portfolio',
      portfolioValue: portfolio.total_value || 10000,
      holdingsCount: holdings.length,
      transactionCount: transactions.length
    };

    const suggestionsToShow = await getSuggestionForContext(context);
    
    if (suggestionsToShow.length > 0) {
      const suggestion = suggestionsToShow[0];
      setSuggestion(suggestion);
      
      await trackSuggestionShown(
        userData.id,
        suggestion.id,
        'portfolio',
        suggestion.lessonSlug
      );
    }
  };

  const handleSuggestionLearnClick = async (lessonSlug) => {
    if (suggestion) {
      await trackSuggestionClicked(userData.id, suggestion.id);
    }
    navigate(`/learn?lesson=${lessonSlug}`);
  };

  const handleSuggestionDismiss = async () => {
    if (suggestion) {
      await trackSuggestionDismissed(userData.id, suggestion.id);
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

  // Calculate portfolio values
  const cash = portfolio?.cash || 10000;
  const holdingsValue = holdings.reduce((sum, holding) => {
    const stock = marketData[holding.symbol];
    if (!stock) return sum;
    return sum + (parseFloat(holding.shares) * stock.price);
  }, 0);
  const totalValue = cash + holdingsValue;

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
          <div className="text-3xl font-bold text-primary">{formatCurrency(holdingsValue)}</div>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-dark mb-4">Your Holdings</h3>

        {holdings.length > 0 ? (
          <div className="space-y-3">
            {holdings.map((holding) => {
              const stock = marketData[holding.symbol];
              
              if (!stock) {
                console.error(`Stock ${holding.symbol} not found in market data`);
                return null;
              }
              
              const currentPrice = stock.price;
              const currentValue = parseFloat(holding.shares) * currentPrice;
              const costBasis = parseFloat(holding.shares) * parseFloat(holding.average_price);
              const gainLoss = currentValue - costBasis;
              const gainLossPercent = ((gainLoss / costBasis) * 100).toFixed(2);
              const isEtf = stock.type === 'etf';

              return (
                <div
                  key={holding.id}
                  className="bg-light rounded-2xl hover:bg-gray-100 transition-all"
                >
                  {/* Stock Info Row - Desktop: horizontal, Mobile: horizontal */}
                  <div className="flex items-center justify-between p-5 md:p-5 py-3 px-0">
                    {/* Left: Icon + Symbol/Name + Shares */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 px-3 md:px-0">
                      {isEtf ? (
                        <ETFIcon size={32} className="text-purple-600" />
                      ) : (
                        <StockIcon size={32} className="text-primary" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-bold text-base md:text-lg text-dark">{holding.symbol}</div>
                          {isEtf && (
                            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                              ETF
                            </span>
                          )}
                        </div>
                        {/* Mobile: Just shares count, Desktop: shares + average */}
                        <div className="text-xs md:text-sm text-gray">
                          <span className="md:hidden">
                            {parseFloat(holding.shares)} share{parseFloat(holding.shares) !== 1 ? 's' : ''}
                          </span>
                          <span className="hidden md:inline">
                            {parseFloat(holding.shares)} shares @ {formatCurrency(parseFloat(holding.average_price))} avg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Current Value + Gain/Loss */}
                    <div className="text-right px-3 md:px-0 md:mr-4">
                      <div className="font-bold text-dark text-base md:text-lg">
                        {formatCurrency(currentValue)}
                      </div>
                      <div className={`text-xs md:text-sm font-semibold ${gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                        {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent}%)
                      </div>
                    </div>

                    {/* Desktop: Action Buttons (shown on same row) */}
                    <div className="hidden md:flex gap-2">
                      <button
                        onClick={() => handleBuyClick(holding.symbol)}
                        className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => handleSellClick(holding.symbol)}
                        className="px-4 py-2 bg-danger text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                      >
                        Sell
                      </button>
                    </div>
                  </div>

                  {/* Mobile: Action Buttons (shown on separate row below) */}
                  <div className="flex md:hidden gap-2 px-3 pb-3">
                    <button
                      onClick={() => handleBuyClick(holding.symbol)}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all"
                    >
                      Buy More
                    </button>
                    <button
                      onClick={() => handleSellClick(holding.symbol)}
                      className="flex-1 px-4 py-2 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all"
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
      {selectedStock && marketData[selectedStock] && portfolio && (
        <TradeModal
          symbol={selectedStock}
          stock={marketData[selectedStock]}
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