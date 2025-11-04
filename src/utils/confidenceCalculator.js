// src/utils/confidenceCalculator.js
import { supabase } from '../services/database/supabase';

/**
 * Confidence Score Calculator
 * 
 * Calculates user confidence score (0-10 scale) based on:
 * - Number of trades made
 * - Portfolio diversification
 * - Educational lessons completed
 * - Profitable trades
 * - Days active on platform
 * 
 * Formula supports InvestEase's mission: building confidence through practice
 */

/**
 * Calculate confidence score based on user activity
 * @param {Object} userData - User profile data
 * @param {Array} transactions - User's transaction history
 * @param {Array} portfolio - User's portfolio holdings
 * @param {Array} completedLessons - User's completed lessons
 * @returns {number} Confidence score (0-10, rounded to 1 decimal)
 */
export const calculateConfidenceScore = async (userData, transactions = [], portfolio = null, completedLessons = []) => {
  // Start with assessment score (default 3.2)
  const baseScore = userData.confidence_score || 3.2;
  
  // If user is brand new with no activity, return base score
  if (transactions.length === 0 && completedLessons.length === 0) {
    return parseFloat(baseScore.toFixed(1));
  }

  let scoreModifiers = 0;

  // ===== 1. TRADE COUNT MODIFIER =====
  // +0.4 per trade, caps at +2.0 (5 trades)
  const tradeCount = transactions.length;
  const tradeModifier = Math.min(tradeCount * 0.4, 2.0);
  scoreModifiers += tradeModifier;

  // ===== 2. DIVERSIFICATION MODIFIER =====
  // Bonus for owning multiple different stocks/ETFs
  let diversificationModifier = 0;
  if (portfolio && portfolio.holdings) {
    const uniqueStocksOwned = portfolio.holdings.length;
    
    if (uniqueStocksOwned >= 3) {
      // Big bonus for good diversification
      diversificationModifier = 1.5;
    } else {
      // Smaller incremental bonus
      diversificationModifier = uniqueStocksOwned * 0.5;
    }
  }
  scoreModifiers += diversificationModifier;

  // ===== 3. EDUCATIONAL PROGRESS MODIFIER =====
  // +0.3 per lesson completed, caps at +1.5 (5 lessons)
  const lessonsCompleted = completedLessons.length;
  const educationModifier = Math.min(lessonsCompleted * 0.3, 1.5);
  scoreModifiers += educationModifier;

  // ===== 4. PROFITABLE TRADE MODIFIER =====
  // +1.0 bonus for making first profitable trade
  const profitableTrades = transactions.filter(t => t.type === 'sell' && t.profit_loss > 0);
  const profitableModifier = profitableTrades.length > 0 ? 1.0 : 0;
  scoreModifiers += profitableModifier;

  // ===== 5. ACTIVITY/TIME MODIFIER =====
  // Bonus for staying active over time
  let activityModifier = 0;
  if (userData.created_at) {
    const accountAge = Math.floor(
      (new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24)
    );
    
    if (accountAge >= 7) {
      // Full bonus for 7+ days active
      activityModifier = 0.8;
    } else {
      // Incremental bonus per day
      activityModifier = accountAge * 0.1;
    }
  }
  scoreModifiers += activityModifier;

  // ===== CALCULATE FINAL SCORE =====
  const finalScore = baseScore + scoreModifiers;
  
  // Cap at 10.0 maximum
  const cappedScore = Math.min(finalScore, 10.0);
  
  // Round to 1 decimal place
  return parseFloat(cappedScore.toFixed(1));
};

/**
 * Update user's confidence score in database
 * Updates both profiles table (current) and confidence_history table (historical tracking)
 * 
 * @param {string} userId - User ID
 * @param {number} newScore - New confidence score
 * @returns {Promise<boolean>} Success status
 */
export const updateConfidenceScore = async (userId, newScore) => {
  if (!userId || newScore === null || newScore === undefined) {
    console.error('Missing userId or newScore in updateConfidenceScore');
    return false;
  }

  try {
    // Round to 1 decimal
    const roundedScore = parseFloat(newScore.toFixed(1));

    // Update current score in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ confidence_score: roundedScore })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Add to confidence history for tracking over time
    const { error: historyError } = await supabase
      .from('confidence_history')
      .insert([{
        user_id: userId,
        score: roundedScore,
        recorded_at: new Date().toISOString()
      }]);

    if (historyError) throw historyError;

    console.log(`✅ Confidence score updated to ${roundedScore} for user ${userId}`);
    return true;

  } catch (error) {
    console.error('Error updating confidence score:', error);
    return false;
  }
};

/**
 * Recalculate and update confidence score after a trade
 * Call this function after every buy/sell transaction
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number|null>} New confidence score, or null if error
 */
export const recalculateConfidenceAfterTrade = async (userId) => {
  try {
    // Fetch all necessary data
    const [profileResult, transactionsResult, portfolioResult, lessonsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('transactions').select('*').eq('user_id', userId),
      supabase.from('portfolios').select('*').eq('user_id', userId).single(),
      supabase.from('user_lesson_progress').select('*').eq('user_id', userId).eq('completed', true)
    ]);

    if (profileResult.error) throw profileResult.error;

    const userData = profileResult.data;
    const transactions = transactionsResult.data || [];
    const portfolio = portfolioResult.data || null;
    const completedLessons = lessonsResult.data || [];

    // Calculate new score
    const newScore = await calculateConfidenceScore(userData, transactions, portfolio, completedLessons);

    // Update in database
    const success = await updateConfidenceScore(userId, newScore);

    if (success) {
      return newScore;
    }

    return null;

  } catch (error) {
    console.error('Error recalculating confidence score:', error);
    return null;
  }
};

/**
 * Get confidence score breakdown for display purposes
 * Useful for showing user what contributes to their score
 * 
 * @param {Object} userData - User profile data
 * @param {Array} transactions - User's transaction history
 * @param {Array} portfolio - User's portfolio holdings
 * @param {Array} completedLessons - User's completed lessons
 * @returns {Object} Score breakdown with details
 */
export const getConfidenceBreakdown = async (userData, transactions = [], portfolio = null, completedLessons = []) => {
  const baseScore = userData.confidence_score || 3.2;
  
  const breakdown = {
    baseScore: parseFloat(baseScore.toFixed(1)),
    tradeCount: transactions.length,
    tradeBonus: parseFloat(Math.min(transactions.length * 0.4, 2.0).toFixed(1)),
    diversification: portfolio?.holdings?.length || 0,
    diversificationBonus: 0,
    lessonsCompleted: completedLessons.length,
    lessonBonus: parseFloat(Math.min(completedLessons.length * 0.3, 1.5).toFixed(1)),
    profitableTrades: transactions.filter(t => t.type === 'sell' && t.profit_loss > 0).length,
    profitableBonus: transactions.filter(t => t.type === 'sell' && t.profit_loss > 0).length > 0 ? 1.0 : 0,
    daysActive: 0,
    activityBonus: 0
  };

  // Calculate diversification bonus
  const uniqueStocks = portfolio?.holdings?.length || 0;
  if (uniqueStocks >= 3) {
    breakdown.diversificationBonus = 1.5;
  } else {
    breakdown.diversificationBonus = parseFloat((uniqueStocks * 0.5).toFixed(1));
  }

  // Calculate activity bonus
  if (userData.created_at) {
    const accountAge = Math.floor(
      (new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24)
    );
    breakdown.daysActive = accountAge;
    
    if (accountAge >= 7) {
      breakdown.activityBonus = 0.8;
    } else {
      breakdown.activityBonus = parseFloat((accountAge * 0.1).toFixed(1));
    }
  }

  // Calculate total
  breakdown.totalScore = parseFloat(Math.min(
    baseScore + 
    breakdown.tradeBonus + 
    breakdown.diversificationBonus + 
    breakdown.lessonBonus + 
    breakdown.profitableBonus + 
    breakdown.activityBonus,
    10.0
  ).toFixed(1));

  return breakdown;
};