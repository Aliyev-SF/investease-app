// src/pages/DashboardPage.jsx (Updated with Smart Suggestions)
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import SuggestionCard from '../components/SuggestionCard';
import { 
  getSuggestionForContext, 
  trackSuggestionShown, 
  trackSuggestionDismissed,
  trackSuggestionClicked 
} from '../utils/suggestionHelper';

function DashboardPage({ userData }) {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check for suggestions after data loads
    if (portfolio && transactions && !loading) {
      checkForSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, transactions, loading]);

  const loadDashboardData = async () => {
    if (!userData) return;

    try {
      // Load portfolio
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      setPortfolio(portfolioData);

      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userData.id)
        .order('timestamp', { ascending: false })
        .limit(5);

      setTransactions(transactionsData || []);

      // Load achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userData.id)
        .order('earned_at', { ascending: false })
        .limit(3);

      setAchievements(achievementsData || []);

      // Load assessment
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      setAssessment(assessmentData);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForSuggestions = async () => {
    if (!userData || !portfolio || !transactions) return;

    // Check if portfolio is down
    const initialValue = 10000;
    const currentValue = portfolio.total_value || initialValue;
    
    let context = null;

    if (currentValue < initialValue * 0.95) {
      // Portfolio down more than 5%
      context = 'dashboard_portfolio_down';
    } else if (transactions.length > 0) {
      // Has trades but no lessons yet
      context = 'dashboard_no_lessons';
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
        await trackSuggestionShown(suggestedLesson.id, userData.id, 'dashboard');
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

  const getCoachingMessage = () => {
    if (!portfolio || !assessment) return null;

    const tradeCount = transactions.length;
    const holdings = portfolio.holdings?.length || 0;

    if (tradeCount === 0) {
      return {
        icon: '🎯',
        title: 'Ready to Start?',
        message: 'Make your first trade to begin your investing journey! Remember, this is practice mode - a safe place to learn.',
        color: 'primary'
      };
    }

    if (tradeCount === 1) {
      return {
        icon: '🎉',
        title: 'Great Start!',
        message: 'You made your first trade! Keep practicing and exploring different stocks.',
        color: 'success'
      };
    }

    if (holdings >= 3) {
      return {
        icon: '⭐',
        title: 'Nice Diversification!',
        message: 'You\'re spreading your investments across multiple stocks - that\'s smart!',
        color: 'success'
      };
    }

    return {
      icon: '💪',
      title: 'Keep Going!',
      message: 'You\'re building confidence with every trade. Keep exploring and learning!',
      color: 'primary'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-2xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  const totalValue = portfolio?.total_value || 10000;
  const cash = portfolio?.cash || 10000;
  const invested = totalValue - cash;
  const gainLoss = totalValue - 10000;
  const coachingMessage = getCoachingMessage();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-dark mb-2">
          👋 Welcome back, {userData?.email?.split('@')[0] || 'Investor'}!
        </h2>
        <p className="text-gray">Here's your investment overview</p>
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

      {/* Practice Mode Banner */}
      <div className="bg-warning bg-opacity-10 border-2 border-warning rounded-3xl p-4 mb-6 flex items-center gap-3">
        <div className="text-3xl">⚠️</div>
        <div>
          <div className="font-bold text-dark">Practice Mode</div>
          <div className="text-sm text-gray">
            You're using virtual money. All trades are simulated for learning purposes.
          </div>
        </div>
      </div>

      {/* Coaching Message */}
      {coachingMessage && (
        <div className={`bg-${coachingMessage.color} bg-opacity-10 border-2 border-${coachingMessage.color} rounded-3xl p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">{coachingMessage.icon}</div>
            <div>
              <div className="text-xl font-bold text-dark mb-2">{coachingMessage.title}</div>
              <div className="text-gray">{coachingMessage.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Total Value</div>
          <div className="text-3xl font-bold text-dark">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm font-semibold mt-2 ${gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
            {gainLoss >= 0 ? '+' : ''}${Math.abs(gainLoss).toFixed(2)} ({((gainLoss / 10000) * 100).toFixed(2)}%)
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Available Cash</div>
          <div className="text-3xl font-bold text-success">
            ${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Invested</div>
          <div className="text-3xl font-bold text-primary">
            ${invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-dark mb-4">Recent Activity</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-gray">No transactions yet</div>
              <button
                onClick={() => navigate('/market')}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
              >
                Start Trading
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-dark">
                      {txn.type === 'buy' ? '📈' : '📉'} {txn.type.toUpperCase()} {txn.symbol}
                    </div>
                    <div className="text-sm text-gray">
                      {txn.shares} shares @ ${txn.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-dark">${txn.total.toFixed(2)}</div>
                    {txn.profit_loss !== null && (
                      <div className={`text-sm ${txn.profit_loss >= 0 ? 'text-success' : 'text-danger'}`}>
                        {txn.profit_loss >= 0 ? '+' : ''}${txn.profit_loss.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-dark mb-4">Recent Achievements</h3>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-gray">Start trading to earn badges!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="text-4xl">{achievement.badge_icon}</div>
                  <div>
                    <div className="font-semibold text-dark">{achievement.badge_name}</div>
                    <div className="text-sm text-gray">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {achievements.length > 0 && (
            <button
              onClick={() => navigate('/progress')}
              className="mt-4 w-full py-2 text-primary font-semibold hover:bg-primary hover:bg-opacity-10 rounded-xl transition-all"
            >
              View All Achievements →
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/market')}
          className="bg-primary text-white rounded-2xl p-4 font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
        >
          <span>📈</span> Browse Market
        </button>
        <button
          onClick={() => navigate('/portfolio')}
          className="bg-success text-white rounded-2xl p-4 font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
        >
          <span>💼</span> View Portfolio
        </button>
        <button
          onClick={() => navigate('/learn')}
          className="bg-warning text-white rounded-2xl p-4 font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
        >
          <span>📚</span> Learn More
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;