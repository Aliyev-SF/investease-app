// src/components/PortfolioSummary.jsx
// Portfolio summary display for Market page header
// Shows total value, today's change, and available cash
// Clickable to navigate to full portfolio page

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/database/supabase';

function PortfolioSummary({ userData }) {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.id) {
      loadPortfolioData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const loadPortfolioData = async () => {
    try {
      // Load cash balance
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('cash')
        .eq('user_id', userData.id)
        .single();

      if (portfolioError) throw portfolioError;
      setPortfolio(portfolioData);

      // Load holdings
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userData.id);

      if (holdingsError) throw holdingsError;
      setHoldings(holdingsData || []);

      // Load market data for price calculations
      const { data: marketDataArray, error: marketError } = await supabase
        .from('market_data')
        .select('*')
        .eq('is_active', true);

      if (marketError) throw marketError;

      // Convert to object keyed by symbol
      const dataObj = {};
      marketDataArray.forEach(stock => {
        dataObj[stock.symbol] = {
          symbol: stock.symbol,
          price: parseFloat(stock.current_price),
          change: parseFloat(stock.change || 0)
        };
      });
      setMarketData(dataObj);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio values
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

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        Loading portfolio...
      </div>
    );
  }

  return (
    <div 
      onClick={() => navigate('/portfolio')}
      className="cursor-pointer hover:opacity-80 transition-opacity text-right"
    >
      {/* Desktop: Horizontal layout matching Stock Market */}
      <div className="hidden md:block">
        <div className="flex items-baseline gap-2 justify-end">
          <h2 className="text-3xl font-bold text-dark">My Portfolio</h2>
          <span className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</span>
          <span className={`text-lg font-semibold ${todayChange >= 0 ? 'text-success' : 'text-danger'}`}>
            {todayChange >= 0 ? '↗️' : '↘️'} {todayChange >= 0 ? '+' : ''}{formatCurrency(todayChange)} 
            ({todayChange >= 0 ? '+' : ''}{todayChangePercent.toFixed(2)}%)
          </span>
        </div>
        <p className="text-gray mt-1">
          Available Cash: {formatCurrency(cash)}
        </p>
      </div>

      {/* Mobile: 2 lines, matching Stock Market size */}
      <div className="block md:hidden">
        <h2 className="text-3xl font-bold text-dark mb-2">My Portfolio</h2>
        <div className="text-sm text-gray">
          <div>{formatCurrency(totalValue)} <span className={todayChange >= 0 ? 'text-success' : 'text-danger'}>↗️ +{formatCurrency(Math.abs(todayChange))}</span></div>
          <div>Cash: {formatCurrency(cash)}</div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioSummary;