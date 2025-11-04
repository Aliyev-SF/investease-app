// src/services/marketDataService.js
// Service layer for market data operations using market_data table

import { supabase } from './database/supabase';

/**
 * Get all active stocks and ETFs
 */
export const getAllMarketData = async () => {
  try {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('is_active', true)
      .order('symbol');

    if (error) throw error;

    return data.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: parseFloat(stock.current_price),
      change: parseFloat(stock.change || 0),
      changePercent: parseFloat(stock.change_percent || 0),
      icon: stock.icon || '📊',
      peRatio: stock.pe_ratio ? parseFloat(stock.pe_ratio) : null,
      type: stock.type,
      sector: stock.sector,
      volume: stock.volume,
      marketCap: stock.market_cap
    }));
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

/**
 * Get stocks only (filter out ETFs)
 */
export const getStocks = async () => {
  try {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('is_active', true)
      .eq('type', 'stock')
      .order('symbol');

    if (error) throw error;

    return data.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: parseFloat(stock.current_price),
      change: parseFloat(stock.change || 0),
      changePercent: parseFloat(stock.change_percent || 0),
      icon: stock.icon || '📊',
      peRatio: stock.pe_ratio ? parseFloat(stock.pe_ratio) : null,
      type: stock.type
    }));
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

/**
 * Get ETFs only
 */
export const getETFs = async () => {
  try {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('is_active', true)
      .eq('type', 'etf')
      .order('symbol');

    if (error) throw error;

    return data.map(etf => ({
      symbol: etf.symbol,
      name: etf.name,
      price: parseFloat(etf.current_price),
      change: parseFloat(etf.change || 0),
      changePercent: parseFloat(etf.change_percent || 0),
      icon: etf.icon || '📊',
      type: etf.type,
      description: etf.company_description
    }));
  } catch (error) {
    console.error('Error fetching ETFs:', error);
    throw error;
  }
};

/**
 * Get single stock/ETF by symbol
 */
export const getStockBySymbol = async (symbol) => {
  try {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (error) throw error;

    return {
      symbol: data.symbol,
      name: data.name,
      price: parseFloat(data.current_price),
      change: parseFloat(data.change || 0),
      changePercent: parseFloat(data.change_percent || 0),
      icon: data.icon || '📊',
      peRatio: data.pe_ratio ? parseFloat(data.pe_ratio) : null,
      type: data.type,
      sector: data.sector,
      industry: data.industry,
      marketCap: data.market_cap,
      volume: data.volume,
      week52High: data.week_52_high,
      week52Low: data.week_52_low,
      dividendYield: data.dividend_yield,
      description: data.company_description,
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error);
    throw error;
  }
};

/**
 * Get popular stocks (from view)
 */
export const getPopularStocks = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('popular_stocks')
      .select('*')
      .limit(limit);

    if (error) throw error;

    return data.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: parseFloat(stock.current_price),
      change: parseFloat(stock.change || 0),
      changePercent: parseFloat(stock.change_percent || 0),
      icon: stock.icon || '📊',
      type: stock.type,
      ownerCount: stock.owner_count,
      totalSharesHeld: parseFloat(stock.total_shares_held || 0),
      avgPurchasePrice: parseFloat(stock.avg_purchase_price || 0),
      avgReturn: parseFloat(stock.avg_return_percent || 0)
    }));
  } catch (error) {
    console.error('Error fetching popular stocks:', error);
    // Fallback to regular market data if view fails
    return getAllMarketData();
  }
};

/**
 * Search stocks/ETFs by symbol or name
 */
export const searchMarketData = async (query) => {
  try {
    const searchTerm = query.toUpperCase();
    
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('is_active', true)
      .or(`symbol.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) throw error;

    return data.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: parseFloat(stock.current_price),
      icon: stock.icon || '📊',
      type: stock.type
    }));
  } catch (error) {
    console.error('Error searching market data:', error);
    return [];
  }
};

/**
 * Get market data for multiple symbols (batch fetch)
 */
export const getMultipleStocks = async (symbols) => {
  try {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .in('symbol', symbols);

    if (error) throw error;

    return data.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: parseFloat(stock.current_price),
      change: parseFloat(stock.change || 0),
      icon: stock.icon || '📊',
      type: stock.type
    }));
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    throw error;
  }
};

/**
 * Get price history for a symbol (for charts)
 * Returns last N days of data
 */
export const getPriceHistory = async (symbol, days = 30) => {
  try {
    const { data, error } = await supabase
      .from('market_data_history')
      .select('*')
      .eq('symbol', symbol)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    return data.map(record => ({
      date: record.date,
      open: parseFloat(record.open_price),
      high: parseFloat(record.high_price),
      low: parseFloat(record.low_price),
      close: parseFloat(record.close_price),
      volume: record.volume
    }));
  } catch (error) {
    console.error(`Error fetching price history for ${symbol}:`, error);
    // Return empty array if no history available yet
    return [];
  }
};