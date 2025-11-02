// src/pages/DashboardPage.jsx (Updated with compact Practice badge + dismissible coaching)
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import SuggestionCard from '../components/SuggestionCard';
import { trackPageView } from '../utils/analytics';
import { 
  getSuggestionForContext, 
  trackSuggestionShown, 
  trackSuggestionDismissed,
  trackSuggestionClicked 
} from '../utils/suggestionHelper';

function DashboardPage({ userData, confidenceScore }) {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState(null);
  
  // ✨ NEW: State for dismissible coaching card
  const [isCoachingVisible, setIsCoachingVisible] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userData?.id) {
      trackPageView(userData.id, 'dashboard');
    }
    // Check for suggestions after data loads
    if (portfolio && transactions && !loading) {
      checkForSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, transactions, loading, userData]);

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
    const currentValue = portfolio.total_value;
    const isDown = currentValue < initialValue;

    let context = null;
    
    if (transactions.length === 1) {
      context = 'dashboard_after_first_trade';
    } else if (isDown) {
      context = 'dashboard_portfolio_down';
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

  // ✨ Dynamic coaching message based on user progress and assessment
  const getCoachingMessage = () => {
    if (!portfolio || !assessment) return null;

    const tradeCount = transactions.length;
    const holdings = portfolio.holdings?.length || 0;

    if (tradeCount === 0) {
      return {
        icon: '🎯',
        title: 'Ready to Start?',
        message: 'Make your first investment to begin your investing journey! Remember, this is practice mode - a safe place to learn.',
        color: 'from-primary to-purple-600'
      };
    }

    if (tradeCount === 1) {
      return {
        icon: '🎉',
        title: 'Great Start!',
        message: 'You made your first investment! Keep practicing and exploring different stocks.',
        color: 'from-success to-green-600'
      };
    }

    if (holdings >= 3) {
      return {
        icon: '⭐',
        title: 'Nice Diversification!',
        message: 'You\'re spreading your investments across multiple stocks - that\'s smart!',
        color: 'from-warning to-yellow-600'
      };
    }

    return {
      icon: '💪',
      title: 'Keep Going!',
      message: 'You\'re building confidence with every investment. Keep exploring and learning!',
      color: 'from-primary to-purple-600'
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  // Calculate portfolio stats
  const totalValue = portfolio?.total_value || 10000;
  const cash = portfolio?.cash || 10000;
  const invested = totalValue - cash;
  const initialValue = 10000;
  const dayChange = totalValue - initialValue;
  const dayChangePercent = ((dayChange / initialValue) * 100);

  // Get dynamic coaching message
  const coachingMessage = getCoachingMessage();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ✨ NEW: Compact Header with Practice Mode Badge */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          {/* Left: Welcome Message + Practice Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold text-dark">
              Welcome back, {userData?.name?.split(' ')[0] || 'there'}!
            </h2>
            
            
          </div>

          {/* Right: Confidence Score */}
          <div className="text-left sm:text-right">
            <div className="text-sm text-gray mb-1">Confidence Score</div>
            <div className="text-2xl font-bold text-primary">
              {confidenceScore ? confidenceScore.toFixed(1) : '3.2'}/10
            </div>
          </div>
        </div>

        <p className="text-gray">Here's your investment overview</p>
      </div>

      {/* ✨ HYBRID: Dismissible Dynamic Coaching Card */}
      {isCoachingVisible && coachingMessage && (
        <div className={`bg-gradient-to-r ${coachingMessage.color} rounded-3xl p-6 mb-6 relative shadow-lg`}>
          {/* X Button to Close */}
          <button
            onClick={() => setIsCoachingVisible(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
            aria-label="Close coaching message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="flex items-center gap-4 pr-10">
            <div className="text-5xl">{coachingMessage.icon}</div>
            <div className="text-white">
              <h3 className="text-xl font-bold mb-2">{coachingMessage.title}</h3>
              <p className="text-white text-opacity-90">
                {coachingMessage.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Card (Your existing component) */}
      {suggestion && (
        <SuggestionCard
          suggestion={suggestion}
          onLearnClick={handleSuggestionLearnClick}
          onDismiss={handleSuggestionDismiss}
        />
      )}

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Value */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Total Value</div>
          <div className="text-3xl font-bold text-dark mb-1">
            {formatCurrency(totalValue)}
          </div>
          <div className={`text-sm font-semibold ${dayChange >= 0 ? 'text-success' : 'text-danger'}`}>
            {dayChange >= 0 ? '+' : ''}{formatCurrency(dayChange)} ({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)
          </div>
        </div>

        {/* Available Cash */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Available Cash</div>
          <div className="text-3xl font-bold text-success">
            {formatCurrency(cash)}
          </div>
        </div>

        {/* Invested */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-gray mb-2">Invested</div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(invested)}
          </div>
        </div>
      </div>

      {/* Recent Activity and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-dark mb-4">Recent Activity</h3>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-light rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${transaction.type === 'buy' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type === 'buy' ? '📈' : '📉'}
                    </div>
                    <div>
                      <div className="font-bold text-dark">
                        {transaction.type.toUpperCase()} {transaction.symbol}
                      </div>
                      <div className="text-sm text-gray">
                        {transaction.shares} shares @ {formatCurrency(transaction.price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-dark">{formatCurrency(transaction.total)}</div>
                    {transaction.profit_loss !== null && (
                      <div className={`text-sm ${transaction.profit_loss >= 0 ? 'text-success' : 'text-danger'}`}>
                        {transaction.profit_loss >= 0 ? '+' : ''}{formatCurrency(transaction.profit_loss)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📊</div>
              <div className="text-gray">No investments yet</div>
              <div className="text-sm text-gray mt-2">Visit the Market page to start investing!</div>
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-dark mb-4">Recent Achievements</h3>
          
          {achievements.length > 0 ? (
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-4 p-4 bg-primary bg-opacity-5 border-2 border-primary rounded-xl">
                  <div className="text-4xl">{achievement.badge_icon}</div>
                  <div>
                    <div className="font-bold text-dark">{achievement.badge_name}</div>
                    <div className="text-sm text-gray">{formatDate(achievement.earned_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🏆</div>
              <div className="text-gray">No achievements yet</div>
              <div className="text-sm text-gray mt-2">Keep investing to unlock badges!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;