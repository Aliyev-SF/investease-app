// src/utils/suggestionHelper.js
import { supabase } from '../services/database/supabase';

// Suggestion configurations
export const suggestions = {
  firstTrade: {
    id: 'first_trade',
    icon: '🎉',
    title: 'Great Job on Your First Trade!',
    message: 'You just made your first investment! Want to understand what happens next and when to think about selling?',
    lessonTitle: 'Your First Trade Explained',
    lessonSlug: 'first-trade-explained',
    lessonDuration: 4,
    lessonCategory: 'Getting Started',
    variant: 'primary',
    trigger: 'after_first_trade'
  },
  
  portfolioDown: {
    id: 'portfolio_down',
    icon: '💪',
    title: 'Your Portfolio is Down Today - That\'s Normal',
    message: 'Market down days happen to everyone! Even Warren Buffett\'s portfolio goes down sometimes. The key is understanding when to worry (almost never) and when to hold steady.',
    lessonTitle: 'When to Buy vs When to Sell',
    lessonSlug: 'buy-vs-sell-timing',
    lessonDuration: 5,
    lessonCategory: 'Stock Basics',
    variant: 'warning',
    trigger: 'portfolio_decreased'
  },
  
  diversifying: {
    id: 'diversifying',
    icon: '⭐',
    title: 'Nice! You\'re Diversifying',
    message: 'You now own 3 different stocks - that\'s smart! Most beginners put everything in one stock (risky!). You\'re ahead of the game.',
    lessonTitle: 'Understanding Your Portfolio',
    lessonSlug: 'understanding-portfolio',
    lessonDuration: 4,
    lessonCategory: 'Portfolio Management',
    variant: 'success',
    trigger: 'third_stock_purchased'
  },
  
  profitableTrade: {
    id: 'profitable_trade',
    icon: '🎉',
    title: 'Profit! Nice Work',
    message: 'Congratulations on your profitable trade! Knowing when to sell is one of the hardest skills - and you just did it successfully.',
    lessonTitle: 'When to Buy vs When to Sell',
    lessonSlug: 'buy-vs-sell-timing',
    lessonDuration: 5,
    lessonCategory: 'Stock Basics',
    variant: 'success',
    trigger: 'profitable_sale'
  },
  
  browsingMarket: {
    id: 'browsing_market',
    icon: '🤔',
    title: 'Not Sure Which Stock to Pick?',
    message: 'With thousands of stocks available, it\'s normal to feel overwhelmed. The good news? There\'s a simple framework for researching and choosing stocks.',
    lessonTitle: 'How to Pick a Stock',
    lessonSlug: 'how-to-pick-stock',
    lessonDuration: 5,
    lessonCategory: 'Stock Basics',
    variant: 'info',
    trigger: 'browsing_no_action'
  },
  
  firstLesson: {
    id: 'first_lesson',
    icon: '📚',
    title: 'Start Your Learning Journey',
    message: 'Before you start trading, it helps to understand the basics. Learn what investing means and why it matters.',
    lessonTitle: 'What is Investing?',
    lessonSlug: 'what-is-investing',
    lessonDuration: 3,
    lessonCategory: 'Getting Started',
    variant: 'info',
    trigger: 'no_lessons_yet'
  }
};

// Check if user should see a suggestion
export const shouldShowSuggestion = async (suggestionId, userId) => {
  if (!userId) return false;

  try {
    // Check if suggestion was shown recently (within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('lesson_suggestions')
      .select('shown_at, dismissed')
      .eq('user_id', userId)
      .eq('suggestion_id', suggestionId)
      .gte('shown_at', twentyFourHoursAgo)
      .order('shown_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking suggestion:', error);
      return true; // Default to showing on error
    }

    // If no recent record, show the suggestion
    if (!data || data.length === 0) return true;

    // If user dismissed it, don't show again within 24 hours
    if (data[0].dismissed) return false;

    // If shown but not dismissed, don't show again within 24 hours
    return false;
  } catch (error) {
    console.error('Error in shouldShowSuggestion:', error);
    return true; // Default to showing on error
  }
};

// Track when a suggestion is shown
export const trackSuggestionShown = async (suggestionId, userId, page) => {
  if (!userId) return;

  try {
    await supabase.from('lesson_suggestions').insert({
      user_id: userId,
      suggestion_id: suggestionId,
      page: page,
      shown_at: new Date().toISOString(),
      dismissed: false
    });
  } catch (error) {
    console.error('Error tracking suggestion shown:', error);
  }
};

// Track when a suggestion is dismissed
export const trackSuggestionDismissed = async (suggestionId, userId) => {
  if (!userId) return;

  try {
    // Update the most recent record for this suggestion
    const { data: recentSuggestion } = await supabase
      .from('lesson_suggestions')
      .select('id')
      .eq('user_id', userId)
      .eq('suggestion_id', suggestionId)
      .order('shown_at', { ascending: false })
      .limit(1)
      .single();

    if (recentSuggestion) {
      await supabase
        .from('lesson_suggestions')
        .update({ dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', recentSuggestion.id);
    }
  } catch (error) {
    console.error('Error tracking suggestion dismissed:', error);
  }
};

// Track when user clicks to view lesson from suggestion
export const trackSuggestionClicked = async (suggestionId, userId, lessonSlug) => {
  if (!userId) return;

  try {
    // Update the most recent record for this suggestion
    const { data: recentSuggestion } = await supabase
      .from('lesson_suggestions')
      .select('id')
      .eq('user_id', userId)
      .eq('suggestion_id', suggestionId)
      .order('shown_at', { ascending: false })
      .limit(1)
      .single();

    if (recentSuggestion) {
      await supabase
        .from('lesson_suggestions')
        .update({ 
          clicked: true, 
          clicked_at: new Date().toISOString(),
          lesson_slug: lessonSlug
        })
        .eq('id', recentSuggestion.id);
    }
  } catch (error) {
    console.error('Error tracking suggestion clicked:', error);
  }
};

// Determine which suggestion to show based on user state
export const getSuggestionForContext = async (context, userData, portfolioData, transactionsData) => {
  if (!userData) return null;

  // Check transaction count for first trade
  const tradeCount = transactionsData?.length || 0;
  
  // Check unique stocks owned for diversification
  const uniqueStocks = new Set(portfolioData?.holdings?.map(h => h.symbol) || []).size;

  // Check if user completed any lessons
  const { data: completedLessons } = await supabase
    .from('user_lesson_progress')
    .select('lesson_slug')
    .eq('user_id', userData.id)
    .eq('completed', true);

  const hasCompletedLessons = completedLessons && completedLessons.length > 0;

  // Logic for different contexts
  switch (context) {
    case 'portfolio_after_first_trade': {
      if (tradeCount === 1) {
        const shouldShow = await shouldShowSuggestion('first_trade', userData.id);
        return shouldShow ? suggestions.firstTrade : null;
      }
      break;
    }

    case 'portfolio_after_third_stock': {
      if (uniqueStocks === 3) {
        const shouldShow = await shouldShowSuggestion('diversifying', userData.id);
        return shouldShow ? suggestions.diversifying : null;
      }
      break;
    }

    case 'dashboard_portfolio_down': {
      // Check if portfolio value decreased
      const initialValue = 10000; // Starting amount
      const currentValue = portfolioData?.total_value || initialValue;
      if (currentValue < initialValue * 0.95) { // Down more than 5%
        const shouldShow = await shouldShowSuggestion('portfolio_down', userData.id);
        return shouldShow ? suggestions.portfolioDown : null;
      }
      break;
    }

    case 'market_browsing': {
      // Show if no trades yet and no lessons completed
      if (tradeCount === 0) {
        const shouldShow = await shouldShowSuggestion('browsing_market', userData.id);
        return shouldShow ? suggestions.browsingMarket : null;
      }
      break;
    }

    case 'dashboard_no_lessons': {
      if (!hasCompletedLessons && tradeCount > 0) {
        const shouldShow = await shouldShowSuggestion('first_lesson', userData.id);
        return shouldShow ? suggestions.firstLesson : null;
      }
      break;
    }

    default:
      return null;
  }

  return null;
};