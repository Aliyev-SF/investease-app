import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

function HistoryPage({ userData }) {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, buy, sell
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userData.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  // Calculate statistics
  const totalTrades = transactions.length;
  const buyCount = transactions.filter(tx => tx.type === 'buy').length;
  const sellCount = transactions.filter(tx => tx.type === 'sell').length;
  const totalProfit = transactions
    .filter(tx => tx.profit_loss !== null)
    .reduce((sum, tx) => sum + parseFloat(tx.profit_loss), 0);
  const profitableTrades = transactions.filter(tx => tx.profit_loss > 0).length;
  const winRate = sellCount > 0 ? ((profitableTrades / sellCount) * 100).toFixed(1) : 0;

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
        <h2 className="text-3xl font-bold text-dark mb-2">Transaction History</h2>
        <p className="text-gray">Review your complete trading activity</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-gray text-sm mb-1">Total Trades</div>
          <div className="text-3xl font-bold text-dark">{totalTrades}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-gray text-sm mb-1">Buys / Sells</div>
          <div className="text-3xl font-bold text-dark">{buyCount} / {sellCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-gray text-sm mb-1">Total P/L</div>
          <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-gray text-sm mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-primary">{winRate}%</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-2xl p-2 mb-6 inline-flex gap-2 shadow-lg">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'text-gray hover:bg-gray-100'
          }`}
        >
          All ({transactions.length})
        </button>
        <button
          onClick={() => setFilter('buy')}
          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
            filter === 'buy'
              ? 'bg-primary text-white'
              : 'text-gray hover:bg-gray-100'
          }`}
        >
          Buys ({buyCount})
        </button>
        <button
          onClick={() => setFilter('sell')}
          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
            filter === 'sell'
              ? 'bg-danger text-white'
              : 'text-gray hover:bg-gray-100'
          }`}
        >
          Sells ({sellCount})
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-dark mb-4">
          {filter === 'all' ? 'All Transactions' : filter === 'buy' ? 'Buy Orders' : 'Sell Orders'}
        </h3>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray">
            <div className="text-5xl mb-4">📊</div>
            <div className="text-lg mb-2">No transactions yet</div>
            <div className="text-sm">Start trading to see your history here!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(tx => (
              <div 
                key={tx.id} 
                className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                  tx.type === 'buy' ? 'bg-primary bg-opacity-5' : 'bg-danger bg-opacity-5'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tx.type === 'buy' 
                        ? 'bg-primary text-white' 
                        : 'bg-danger text-white'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                    <span className="font-bold text-dark text-lg">{tx.symbol}</span>
                  </div>
                  <div className="text-sm text-gray">
                    {tx.shares} shares @ ${parseFloat(tx.price).toFixed(2)} per share
                  </div>
                  <div className="text-xs text-gray mt-1">{formatDate(tx.timestamp)}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-dark text-lg">
                    {tx.type === 'buy' ? '-' : '+'}${parseFloat(tx.total).toFixed(2)}
                  </div>
                  {tx.profit_loss !== null && (
                    <div className={`text-sm font-semibold ${
                      tx.profit_loss >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      P/L: {tx.profit_loss >= 0 ? '+' : ''}${parseFloat(tx.profit_loss).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;