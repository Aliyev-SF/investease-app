// src/pages/AnalyticsDashboardPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// Admin email whitelist
const ADMIN_EMAILS = [
  'test10@test.com', // REPLACE WITH YOUR ACTUAL EMAIL
  // Add more admin emails here
];

function AnalyticsDashboardPage({ userData }) {
  const [dateRange, setDateRange] = useState(30); // days
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Check admin access
  const isAdmin = ADMIN_EMAILS.includes(userData?.email);

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, isAdmin]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - dateRange);
    const filterDate = dateFilter.toISOString();

    try {
      // Platform Overview
      const [usersResult, tradesResult, lessonsResult, suggestionsResult] = await Promise.all([
        supabase.from('profiles').select('id, email, created_at'),
        supabase.from('transactions').select('*').gte('created_at', filterDate),
        supabase.from('user_lesson_progress').select('*').eq('completed', true).gte('completed_at', filterDate),
        supabase.from('lesson_suggestions').select('*').gte('shown_at', filterDate)
      ]);

      // Page Views
      const pageViewsResult = await supabase
        .from('page_views')
        .select('*')
        .gte('viewed_at', filterDate);

      // User Sessions
      const sessionsResult = await supabase
        .from('user_sessions')
        .select('*')
        .gte('session_start', filterDate);

      // User Activity Summary
      const activityResult = await supabase
        .from('user_activity_summary')
        .select('*');

      // Calculate metrics
      const users = usersResult.data || [];
      const trades = tradesResult.data || [];
      const lessons = lessonsResult.data || [];
      const suggestions = suggestionsResult.data || [];
      const pageViews = pageViewsResult.data || [];
      const sessions = sessionsResult.data || [];
      const activities = activityResult.data || [];

      // Active users (users who viewed pages in date range)
      const activeUsers = new Set(pageViews.map(pv => pv.user_id)).size;

      // Most traded stocks
      const stockCounts = {};
      trades.forEach(trade => {
        if (!stockCounts[trade.symbol]) {
          stockCounts[trade.symbol] = { buy: 0, sell: 0, total: 0, volume: 0 };
        }
        stockCounts[trade.symbol][trade.type]++;
        stockCounts[trade.symbol].total++;
        stockCounts[trade.symbol].volume += trade.total;
      });

      const mostTradedStocks = Object.entries(stockCounts)
        .map(([symbol, data]) => ({ symbol, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Page views by page
      const pageCounts = {};
      pageViews.forEach(pv => {
        pageCounts[pv.page_name] = (pageCounts[pv.page_name] || 0) + 1;
      });

      const popularPages = Object.entries(pageCounts)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count);

      // Suggestion performance
      const suggestionStats = {};
      suggestions.forEach(s => {
        if (!suggestionStats[s.suggestion_id]) {
          suggestionStats[s.suggestion_id] = { shown: 0, clicked: 0, dismissed: 0 };
        }
        suggestionStats[s.suggestion_id].shown++;
        if (s.clicked) suggestionStats[s.suggestion_id].clicked++;
        if (s.dismissed) suggestionStats[s.suggestion_id].dismissed++;
      });

      const suggestionPerformance = Object.entries(suggestionStats)
        .map(([id, stats]) => ({
          id,
          ...stats,
          ctr: stats.shown > 0 ? ((stats.clicked / stats.shown) * 100).toFixed(1) : 0,
          dismissalRate: stats.shown > 0 ? ((stats.dismissed / stats.shown) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.ctr - a.ctr);

      // Lesson engagement
      const lessonCounts = {};
      lessons.forEach(l => {
        lessonCounts[l.lesson_slug] = (lessonCounts[l.lesson_slug] || 0) + 1;
      });

      const popularLessons = Object.entries(lessonCounts)
        .map(([slug, count]) => ({ slug, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Average session duration
      const avgSessionDuration = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length
        : 0;

      setMetrics({
        overview: {
          totalUsers: users.length,
          activeUsers,
          totalTrades: trades.length,
          lessonsCompleted: lessons.length,
          avgSessionDuration: Math.round(avgSessionDuration / 60) // minutes
        },
        trading: {
          buyCount: trades.filter(t => t.type === 'buy').length,
          sellCount: trades.filter(t => t.type === 'sell').length,
          totalVolume: trades.reduce((sum, t) => sum + t.total, 0),
          mostTradedStocks
        },
        pages: popularPages,
        suggestions: suggestionPerformance,
        lessons: popularLessons,
        users: activities.map(a => ({
          ...a,
          displayId: a.user_id.substring(0, 8) + '...',
          totalActions: (a.page_views || 0) + (a.total_trades || 0) + (a.lessons_completed || 0)
        })).sort((a, b) => b.totalActions - a.totalActions).slice(0, 10)
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-dark mb-2">Access Denied</h2>
          <p className="text-gray">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold text-primary">Loading analytics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-3xl p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span>📊</span>
          <span>InvestEase Analytics</span>
        </h1>
        <p className="opacity-90 mb-4">Comprehensive platform metrics and insights</p>
        
        {/* Date Filter */}
        <div className="flex gap-3">
          <button
            onClick={() => setDateRange(7)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              dateRange === 7
                ? 'bg-white text-primary'
                : 'bg-white bg-opacity-25 text-white hover:bg-opacity-35'
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setDateRange(30)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              dateRange === 30
                ? 'bg-white text-primary'
                : 'bg-white bg-opacity-25 text-white hover:bg-opacity-35'
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setDateRange(90)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              dateRange === 90
                ? 'bg-white text-primary'
                : 'bg-white bg-opacity-25 text-white hover:bg-opacity-35'
            }`}
          >
            Last 90 days
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-gray text-sm font-semibold mb-2">Total Users</div>
          <div className="text-3xl font-bold text-dark">{metrics.overview.totalUsers}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-gray text-sm font-semibold mb-2">Active Users</div>
          <div className="text-3xl font-bold text-success">{metrics.overview.activeUsers}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-gray text-sm font-semibold mb-2">Total Trades</div>
          <div className="text-3xl font-bold text-primary">{metrics.overview.totalTrades}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-gray text-sm font-semibold mb-2">Lessons Done</div>
          <div className="text-3xl font-bold text-warning">{metrics.overview.lessonsCompleted}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="text-gray text-sm font-semibold mb-2">Avg Session</div>
          <div className="text-3xl font-bold text-dark">{metrics.overview.avgSessionDuration}m</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trading Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-dark mb-4">📈 Trading Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray">Buy Trades</span>
              <span className="font-bold text-success">{metrics.trading.buyCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray">Sell Trades</span>
              <span className="font-bold text-danger">{metrics.trading.sellCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray">Total Volume</span>
              <span className="font-bold text-dark">${metrics.trading.totalVolume.toFixed(2)}</span>
            </div>
          </div>

          <h4 className="text-md font-bold text-dark mt-6 mb-3">Most Traded Stocks</h4>
          <div className="space-y-2">
            {metrics.trading.mostTradedStocks.map((stock, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 text-center font-bold text-gray">{i + 1}</div>
                <div className="flex-1">
                  <div className="font-semibold text-dark">{stock.symbol}</div>
                  <div className="text-xs text-gray">{stock.buy} buy · {stock.sell} sell</div>
                </div>
                <div className="font-bold text-primary">{stock.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Page Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-dark mb-4">📄 Page Performance</h3>
          <div className="space-y-2">
            {metrics.pages.map((page, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-semibold text-dark capitalize">{page.page}</span>
                <span className="font-bold text-primary">{page.count} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestion Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h3 className="text-xl font-bold text-dark mb-4">💡 Suggestion Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-bold text-gray">Suggestion</th>
                <th className="text-center py-3 px-4 text-sm font-bold text-gray">Shown</th>
                <th className="text-center py-3 px-4 text-sm font-bold text-gray">Clicked</th>
                <th className="text-center py-3 px-4 text-sm font-bold text-gray">CTR</th>
                <th className="text-center py-3 px-4 text-sm font-bold text-gray">Dismissed</th>
              </tr>
            </thead>
            <tbody>
              {metrics.suggestions.map((sugg, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-primary">{sugg.id}</td>
                  <td className="py-3 px-4 text-center">{sugg.shown}</td>
                  <td className="py-3 px-4 text-center text-success font-semibold">{sugg.clicked}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${
                      parseFloat(sugg.ctr) >= 70 ? 'text-success' :
                      parseFloat(sugg.ctr) >= 50 ? 'text-warning' : 'text-danger'
                    }`}>
                      {sugg.ctr}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray">{sugg.dismissed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Most Active Users */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-dark mb-4">👥 Most Active Users</h3>
        <div className="space-y-3">
          {metrics.users.map((user, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
              onClick={() => setSelectedUser(selectedUser?.user_id === user.user_id ? null : user)}
            >
              <div className="flex-1">
                <div className="font-semibold text-dark">
                  User #{user.displayId}
                </div>
                {selectedUser?.user_id === user.user_id && (
                  <div className="text-sm text-primary mt-1">{user.email}</div>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray text-xs">Actions</div>
                  <div className="font-bold text-dark">{user.totalActions}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray text-xs">Trades</div>
                  <div className="font-bold text-primary">{user.total_trades || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray text-xs">Lessons</div>
                  <div className="font-bold text-success">{user.lessons_completed || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboardPage;