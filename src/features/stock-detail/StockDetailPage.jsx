import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/database/supabase';
import { useToast } from '../../hooks/useToast';
import { buyStock, sellStock } from '../../services/portfolio/portfolioService';
import { recalculateConfidenceAfterTrade } from '../../utils/confidenceCalculator';
import StockHero from './components/StockHero';
import StockActions from './components/StockActions';
import StockAbout from './components/StockAbout';
import StockPriceContext from './components/StockPriceContext';
import StockMetrics from './components/StockMetrics';
import StockCommunity from './components/StockCommunity';
import StockPersonalized from './components/StockPersonalized';
import StockRisk from './components/StockRisk';
import TradeModal from '../trading/components/TradeModal';

const StockDetailPage = ({ userData }) => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [communityData, setCommunityData] = useState(null);
  const [userHoldings, setUserHoldings] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  // Trade Modal State
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState('buy');

  // Fetch all stock data and watchlist
  useEffect(() => {
    if (symbol && userData) {
      loadStockDetails(symbol);
      loadWatchlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, userData]);

  // Load user's watchlist
  const loadWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('symbol')
        .eq('user_id', userData.id);

      if (error) throw error;
      setWatchlist(data.map(item => item.symbol));
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const loadStockDetails = async (symbol) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch stock data from market_data table
      const { data: stock, error: stockError } = await supabase
        .from('market_data')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .single();

      if (stockError) throw stockError;

      if (!stock) {
        setError('Stock not found');
        setLoading(false);
        return;
      }

      setStockData(stock);

      // 2. Fetch community data from popular_stocks view
      const { data: community, error: communityError } = await supabase
        .from('popular_stocks')
        .select('owner_count, total_shares_held, avg_purchase_price, avg_return_percent')
        .eq('symbol', symbol.toUpperCase())
        .maybeSingle();

      // Don't throw error if no community data - just means no one owns it yet
      if (!communityError && community) {
        setCommunityData(community);
      }

      // 3. Fetch user's holdings for this stock
      const { data: holdings, error: holdingsError } = await supabase
        .from('holdings')
        .select('shares, average_price')
        .eq('user_id', userData.id)
        .eq('symbol', symbol.toUpperCase())
        .maybeSingle();

      if (!holdingsError && holdings) {
        setUserHoldings(holdings);
      }

      // 4. Fetch user's portfolio (cash balance and total value)
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('cash, total_value')
        .eq('user_id', userData.id)
        .single();

      if (portfolioError) throw portfolioError;

      setPortfolio(portfolioData);

      setLoading(false);
    } catch (err) {
      console.error('Error loading stock details:', err);
      setError(err.message || 'Failed to load stock details');
      setLoading(false);
    }
  };

  // Handle trade modal actions
  const handleBuyClick = () => {
    setTradeType('buy');
    setShowTradeModal(true);
  };

  const handleSellClick = () => {
    setTradeType('sell');
    setShowTradeModal(true);
  };

  // Execute trade (buy or sell)
  const handleExecuteTrade = async (tradeSymbol, shares, price, type) => {
    try {
      if (type === 'buy') {
        await buyStock(userData.id, tradeSymbol, shares, price);
        showToast(`Successfully bought ${shares} shares of ${tradeSymbol}`, 'success');
      } else {
        await sellStock(userData.id, tradeSymbol, shares, price);
        showToast(`Successfully sold ${shares} shares of ${tradeSymbol}`, 'success');
      }

      // Recalculate confidence score after trade
      await recalculateConfidenceAfterTrade(userData.id);

      // Reload stock details to show updated holdings and portfolio
      await loadStockDetails(symbol);

      // Close modal
      setShowTradeModal(false);
    } catch (error) {
      console.error('Trade execution error:', error);
      showToast(`Trade failed: ${error.message}`, 'error');
    }
  };

  // Toggle watchlist
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

        setWatchlist(watchlist.filter(s => s !== symbol));
        showToast(`Removed ${symbol} from watchlist`, 'success');
      } else {
        // Add to watchlist
        const { error } = await supabase
          .from('watchlist')
          .insert([{ user_id: userData.id, symbol }]);

        if (error) throw error;

        setWatchlist([...watchlist, symbol]);
        showToast(`Added ${symbol} to watchlist`, 'success');
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      showToast('Failed to update watchlist', 'error');
    }
  };

  // Check if symbol is in watchlist
  const isInWatchlist = (symbol) => watchlist.includes(symbol);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-light to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-dark mb-2">Stock Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        
        {/* Hero Section */}
        <StockHero
          stock={stockData}
          communityData={communityData}
          loading={loading}
          isInWatchlist={stockData ? isInWatchlist(stockData.symbol) : false}
          onToggleWatchlist={toggleWatchlist}
        />

        {/* Sticky Action Buttons */}
        <StockActions
          stock={stockData}
          userHoldings={userHoldings}
          onBuyClick={handleBuyClick}
          onSellClick={handleSellClick}
          loading={loading}
        />

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div>
            {/* About Section */}
            <StockAbout 
              stock={stockData} 
              loading={loading} 
            />

            {/* Price Context Section */}
            <StockPriceContext 
              stock={stockData} 
              loading={loading} 
            />

            {/* Key Metrics Section */}
            <StockMetrics 
              stock={stockData} 
              loading={loading} 
            />
          </div>

          {/* Right Column */}
          <div>
            {/* Community Insights Section */}
            <StockCommunity 
              stock={stockData}
              communityData={communityData}
              loading={loading} 
            />

            {/* Personalized Section */}
            <StockPersonalized 
              stock={stockData}
              userHoldings={userHoldings}
              portfolio={portfolio}
              loading={loading} 
            />

            {/* Risk Education Section */}
            <StockRisk 
              stock={stockData}
              userHoldings={userHoldings}
              loading={loading} 
            />
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && stockData && portfolio && (
        <TradeModal
          symbol={stockData.symbol}
          stock={{
            ...stockData,
            price: parseFloat(stockData.current_price)
          }}
          availableCash={portfolio.cash}
          userShares={userHoldings ? parseFloat(userHoldings.shares) : 0}
          mode={tradeType}
          onClose={() => setShowTradeModal(false)}
          onExecuteTrade={handleExecuteTrade}
        />
      )}
    </div>
  );
};

export default StockDetailPage;