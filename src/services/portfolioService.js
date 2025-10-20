// src/services/portfolioService.js
// New service layer for portfolio operations using holdings table

import { supabase } from '../utils/supabase';

/**
 * Get user's complete portfolio with current market prices
 * Uses new holdings table + market_data table
 */
export const getPortfolio = async (userId) => {
  try {
    // Get holdings with current market data (JOIN)
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select(`
        *,
        market_data (
          name,
          current_price,
          change,
          change_percent,
          icon,
          type,
          pe_ratio
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (holdingsError) throw holdingsError;

    // Get cash balance
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('cash')
      .eq('user_id', userId)
      .single();

    if (portfolioError) throw portfolioError;

    // Calculate portfolio metrics
    const holdingsValue = holdings.reduce((sum, holding) => {
      const currentPrice = holding.market_data?.current_price || 0;
      return sum + (holding.shares * currentPrice);
    }, 0);

    const totalValue = portfolio.cash + holdingsValue;

    // Calculate daily change
    const dayChange = holdings.reduce((sum, holding) => {
      return sum + (holding.shares * (holding.market_data?.change || 0));
    }, 0);

    const dayChangePercent = holdingsValue > 0 ? (dayChange / holdingsValue) * 100 : 0;

    return {
      cash: portfolio.cash,
      holdings: holdings.map(h => ({
        id: h.id,
        symbol: h.symbol,
        shares: parseFloat(h.shares),
        averagePrice: parseFloat(h.average_price),
        currentPrice: h.market_data?.current_price || 0,
        name: h.market_data?.name || h.symbol,
        icon: h.market_data?.icon || '📊',
        type: h.market_data?.type || 'stock',
        change: h.market_data?.change || 0,
        changePercent: h.market_data?.change_percent || 0,
        peRatio: h.market_data?.pe_ratio || null,
        totalValue: parseFloat(h.shares) * (h.market_data?.current_price || 0),
        totalGain: (parseFloat(h.shares) * (h.market_data?.current_price || 0)) - 
                   (parseFloat(h.shares) * parseFloat(h.average_price)),
        totalGainPercent: ((h.market_data?.current_price || 0) - parseFloat(h.average_price)) / 
                          parseFloat(h.average_price) * 100
      })),
      holdingsValue,
      totalValue,
      dayChange,
      dayChangePercent
    };
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
};

/**
 * Buy stock - creates or updates holding
 */
export const buyStock = async (userId, symbol, shares, price) => {
  try {
    // Check if user already owns this stock
    const { data: existing, error: checkError } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .maybeSingle();

    if (checkError) throw checkError;

    const totalCost = shares * price;

    // Get current cash
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('cash')
      .eq('user_id', userId)
      .single();

    if (portfolioError) throw portfolioError;

    // Check sufficient funds
    if (portfolio.cash < totalCost) {
      throw new Error('Insufficient funds');
    }

    if (existing) {
      // Update existing holding (calculate new average price)
      const totalShares = parseFloat(existing.shares) + shares;
      const newAvgPrice = 
        (parseFloat(existing.shares) * parseFloat(existing.average_price) + shares * price) / 
        totalShares;

      const { error: updateError } = await supabase
        .from('holdings')
        .update({
          shares: totalShares,
          average_price: newAvgPrice
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Create new holding
      const { error: insertError } = await supabase
        .from('holdings')
        .insert({
          user_id: userId,
          symbol,
          shares,
          average_price: price
        });

      if (insertError) throw insertError;
    }

    // Update cash balance
    const { error: cashError } = await supabase
      .from('portfolios')
      .update({ 
        cash: portfolio.cash - totalCost 
      })
      .eq('user_id', userId);

    if (cashError) throw cashError;

    // Record transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        symbol,
        type: 'buy',
        shares,
        price,
        total: totalCost,
        timestamp: new Date().toISOString()
      });

    if (txError) throw txError;

    return { success: true };
  } catch (error) {
    console.error('Error buying stock:', error);
    throw error;
  }
};

/**
 * Sell stock - updates or removes holding
 */
export const sellStock = async (userId, symbol, shares, price) => {
  try {
    // Get current holding
    const { data: holding, error: holdingError } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single();

    if (holdingError) throw holdingError;
    if (!holding) throw new Error('You do not own this stock');
    if (parseFloat(holding.shares) < shares) {
      throw new Error('Insufficient shares');
    }

    const totalRevenue = shares * price;
    const costBasis = shares * parseFloat(holding.average_price);
    const profitLoss = totalRevenue - costBasis;

    // Update or delete holding
    const remainingShares = parseFloat(holding.shares) - shares;

    if (remainingShares > 0) {
      // Update with remaining shares
      const { error: updateError } = await supabase
        .from('holdings')
        .update({ shares: remainingShares })
        .eq('id', holding.id);

      if (updateError) throw updateError;
    } else {
      // Delete holding (sold all shares)
      const { error: deleteError } = await supabase
        .from('holdings')
        .delete()
        .eq('id', holding.id);

      if (deleteError) throw deleteError;
    }

    // Update cash balance
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('cash')
      .eq('user_id', userId)
      .single();

    if (portfolioError) throw portfolioError;

    const { error: cashError } = await supabase
      .from('portfolios')
      .update({ 
        cash: portfolio.cash + totalRevenue 
      })
      .eq('user_id', userId);

    if (cashError) throw cashError;

    // Record transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        symbol,
        type: 'sell',
        shares,
        price,
        total: totalRevenue,
        profit_loss: profitLoss,
        timestamp: new Date().toISOString()
      });

    if (txError) throw txError;

    return { 
      success: true, 
      profitLoss,
      profitLossPercent: (profitLoss / costBasis) * 100
    };
  } catch (error) {
    console.error('Error selling stock:', error);
    throw error;
  }
};

/**
 * Get user's holdings count (for checks)
 */
export const getHoldingsCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('holdings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting holdings count:', error);
    return 0;
  }
};

/**
 * Check if user owns a specific stock
 */
export const ownsStock = async (userId, symbol) => {
  try {
    const { data, error } = await supabase
      .from('holdings')
      .select('shares')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .maybeSingle();

    if (error) throw error;
    return data ? parseFloat(data.shares) : 0;
  } catch (error) {
    console.error('Error checking stock ownership:', error);
    return 0;
  }
};