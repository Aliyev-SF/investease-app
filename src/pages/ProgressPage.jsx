import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { trackPageView } from '../utils/analytics';

function ProgressPage({ userData, confidenceScore }) {
  const [achievements, setAchievements] = useState([]);
  const [confidenceHistory, setConfidenceHistory] = useState([]);
  const [statistics, setStatistics] = useState({
    totalTrades: 0,
    winRate: 0,
    bestTrade: 0,
    totalProfit: 0,
    daysActive: 0
  });
  const [loading, setLoading] = useState(true);

  // Available achievement types
  const achievementDefinitions = {
    first_trade: { name: 'First Trade', icon: '🎯', description: 'Made your first trade' },
    diversifier: { name: 'Diversifier', icon: '📊', description: 'Own 3+ different stocks' },
    week_streak: { name: 'Week Warrior', icon: '🔥', description: 'Active for 7 days' },
    profitable_trader: { name: 'Profitable Trader', icon: '💰', description: 'Made a profitable sale' },
    big_win: { name: 'Big Win', icon: '🚀', description: 'Made $100+ profit on a trade' },
    portfolio_milestone: { name: 'Portfolio Builder', icon: '💼', description: 'Portfolio value over $12,000' }
  };

  useEffect(() => {
  if (userData?.id) {
    trackPageView(userData.id, 'progress');
  }
}, [userData]);

  useEffect(() => {
    loadProgressData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProgressData = async () => {
    try {
      // Load achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userData.id)
        .order('earned_at', { ascending: false });

      setAchievements(achievementsData || []);

      // Load confidence history (simulated for now - we'll add real tracking later)
      const { data: historyData } = await supabase
        .from('confidence_history')
        .select('*')
        .eq('user_id', userData.id)
        .order('recorded_at', { ascending: true });

      setConfidenceHistory(historyData || []);

      // Load transaction statistics
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userData.id);

      if (transactions) {
        const sells = transactions.filter(t => t.type === 'sell');
        const profitableTrades = sells.filter(t => t.profit_loss > 0);
        const bestTrade = sells.length > 0 
          ? Math.max(...sells.map(t => t.profit_loss || 0))
          : 0;
        const totalProfit = sells.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

        // Calculate days active
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', userData.id)
          .single();

        const daysActive = profile 
          ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        setStatistics({
          totalTrades: transactions.length,
          winRate: sells.length > 0 ? (profitableTrades.length / sells.length * 100) : 0,
          bestTrade,
          totalProfit,
          daysActive: daysActive || 1
        });

        // Auto-award achievements based on current stats
        await checkAndAwardAchievements(transactions, achievementsData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setLoading(false);
    }
  };

  const checkAndAwardAchievements = async (transactions, currentAchievements) => {
    const earnedTypes = currentAchievements.map(a => a.badge_type);
    const newAchievements = [];

    // First Trade
    if (transactions.length > 0 && !earnedTypes.includes('first_trade')) {
      newAchievements.push({
        user_id: userData.id,
        badge_type: 'first_trade',
        badge_name: achievementDefinitions.first_trade.name,
        badge_icon: achievementDefinitions.first_trade.icon,
        earned_at: new Date().toISOString()
      });
    }

    // Profitable Trader
    const profitableSale = transactions.find(t => t.type === 'sell' && t.profit_loss > 0);
    if (profitableSale && !earnedTypes.includes('profitable_trader')) {
      newAchievements.push({
        user_id: userData.id,
        badge_type: 'profitable_trader',
        badge_name: achievementDefinitions.profitable_trader.name,
        badge_icon: achievementDefinitions.profitable_trader.icon,
        earned_at: new Date().toISOString()
      });
    }

    // Big Win
    const bigWin = transactions.find(t => t.type === 'sell' && t.profit_loss >= 100);
    if (bigWin && !earnedTypes.includes('big_win')) {
      newAchievements.push({
        user_id: userData.id,
        badge_type: 'big_win',
        badge_name: achievementDefinitions.big_win.name,
        badge_icon: achievementDefinitions.big_win.icon,
        earned_at: new Date().toISOString()
      });
    }

    // Save new achievements
    if (newAchievements.length > 0) {
      await supabase.from('achievements').insert(newAchievements);
      setAchievements(prev => [...newAchievements, ...prev]);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">Your Progress</h2>
        <p className="text-gray">Track your investment journey and achievements</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-gray text-sm mb-1">Total Trades</div>
          <div className="text-3xl font-bold text-dark">{statistics.totalTrades}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-gray text-sm mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-primary">{statistics.winRate.toFixed(0)}%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-gray text-sm mb-1">Best Trade</div>
          <div className={`text-3xl font-bold ${statistics.bestTrade >= 0 ? 'text-success' : 'text-danger'}`}>
            ${statistics.bestTrade.toFixed(0)}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-gray text-sm mb-1">Days Active</div>
          <div className="text-3xl font-bold text-warning">{statistics.daysActive}</div>
        </div>
      </div>

      {/* Confidence Score Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-bold text-dark mb-4">Confidence Growth</h3>
        
        {confidenceHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={confidenceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="recorded_at" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value}/10`, 'Confidence']}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ fill: '#667eea', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📈</div>
            <div className="text-gray mb-2">Your confidence journey will appear here</div>
            <div className="text-sm text-gray">Current confidence: <span className="font-bold text-primary">{confidenceScore.toFixed(1)}/10</span></div>
            <div className="text-xs text-gray mt-2">Keep trading to see your progress over time!</div>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-bold text-dark mb-4">
          Achievements ({achievements.length}/{Object.keys(achievementDefinitions).length})
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(achievementDefinitions).map(([type, def]) => {
            const earned = achievements.find(a => a.badge_type === type);
            return (
              <div
                key={type}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  earned
                    ? 'border-primary bg-primary bg-opacity-5'
                    : 'border-gray-200 bg-gray-50 opacity-40'
                }`}
              >
                <div className="text-4xl mb-2">{def.icon}</div>
                <div className={`font-semibold text-sm mb-1 ${earned ? 'text-dark' : 'text-gray'}`}>
                  {def.name}
                </div>
                {earned ? (
                  <div className="text-xs text-gray">
                    {formatDate(earned.earned_at)}
                  </div>
                ) : (
                  <div className="text-xs text-gray">Locked</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-dark mb-4">Recent Unlocks</h3>
          <div className="space-y-3">
            {achievements.slice(0, 5).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-4 p-3 bg-primary bg-opacity-5 rounded-xl">
                <div className="text-3xl">{achievement.badge_icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-dark">{achievement.badge_name}</div>
                  <div className="text-sm text-gray">
                    {achievementDefinitions[achievement.badge_type]?.description}
                  </div>
                </div>
                <div className="text-xs text-gray">
                  {formatDate(achievement.earned_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressPage;