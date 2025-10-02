import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { stockData as initialStockData, updateStockPrices } from '../utils/stockData';
import { getCoachingMessage } from '../utils/coachingMessages';
import { Link } from 'react-router-dom';

function DashboardPage({ userData }) {
  const [portfolio, setPortfolio] = useState({
    cash: 10000,
    holdings: [],
    totalValue: 10000
  });
  const [stocks, setStocks] = useState(initialStockData);
  const [transactions, setTransactions] = useState([]);
  const [coachingMessage] = useState(() => 
    getCoachingMessage('welcome')
  );
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      // Load portfolio
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (portfolioData) {
        setPortfolio({
          cash: parseFloat(portfolioData.cash),
          holdings: portfolioData.holdings || [],
          totalValue: parseFloat(portfolioData.total_value)
        });
      }

      // Load recent transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userData.id)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (txData) {
        setTransactions(txData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => updateStockPrices(prevStocks));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate total portfolio value
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

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
        <h2 className="text-3xl font-bold text-dark mb-2">Dashboard</h2>
        <p className="text-gray">Your daily overview and quick actions</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Summary Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-dark mb-4">Portfolio Summary</h3>
            
            <div className="mb-4">
              <div className="text-4xl font-bold text-dark mb-2">
                ${totalValue.toFixed(2)}
              </div>
              <div className={`text-lg font-semibold ${dayChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {dayChange >= 0 ? '+' : ''}${Math.abs(dayChange).toFixed(2)} ({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-light p-4 rounded-xl">
                <div className="text-gray text-sm mb-1">Holdings</div>
                <div className="text-dark font-bold text-xl">{portfolio.holdings.length}</div>
              </div>
              <div className="bg-light p-4 rounded-xl">
                <div className="text-gray text-sm mb-1">Available Cash</div>
                <div className="text-dark font-bold text-xl">${portfolio.cash.toFixed(0)}</div>
              </div>
              <div className="bg-light p-4 rounded-xl">
                <div className="text-gray text-sm mb-1">Total Trades</div>
                <div className="text-dark font-bold text-xl">{transactions.length}</div>
              </div>
            </div>

            <Link 
              to="/portfolio" 
              className="mt-4 inline-block text-primary font-semibold hover:underline"
            >
              View Full Portfolio →
            </Link>
          </div>
        </div>

        {/* AI Coach Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="font-bold text-dark mb-2">Your AI Coach</h3>
              <p className="text-gray leading-relaxed text-sm">{coachingMessage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-dark">Recent Activity</h3>
            <Link to="/history" className="text-primary font-semibold hover:underline text-sm">
              View All
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray">
              No transactions yet. Start trading!
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-3 bg-light rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${tx.type === 'buy' ? 'text-primary' : 'text-danger'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                      <span className="font-semibold text-dark">{tx.symbol}</span>
                    </div>
                    <div className="text-xs text-gray">
                      {tx.shares} shares @ ${parseFloat(tx.price).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray">{formatDate(tx.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-dark text-sm">${parseFloat(tx.total).toFixed(2)}</div>
                    {tx.profit_loss !== null && (
                      <div className={`text-xs font-semibold ${tx.profit_loss >= 0 ? 'text-success' : 'text-danger'}`}>
                        {tx.profit_loss >= 0 ? '+' : ''}${parseFloat(tx.profit_loss).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-dark mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <Link
              to="/market"
              className="block bg-primary text-white p-4 rounded-xl hover:bg-primary-dark transition-all text-center font-semibold"
            >
              🛒 Browse Market & Buy Stocks
            </Link>
            
            <Link
              to="/portfolio"
              className="block bg-gray-200 text-dark p-4 rounded-xl hover:bg-gray-300 transition-all text-center font-semibold"
            >
              💼 Manage Portfolio
            </Link>
            
            <Link
              to="/history"
              className="block bg-gray-200 text-dark p-4 rounded-xl hover:bg-gray-300 transition-all text-center font-semibold"
            >
              📜 View Trade History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;