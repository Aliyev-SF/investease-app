// src/services/alphaVantageService.js
// Service for fetching real stock prices from Alpha Vantage API

/**
 * Alpha Vantage Integration Service
 * 
 * This service handles fetching real stock prices from Alpha Vantage API
 * and updating our Supabase market_data table.
 * 
 * Free Tier Limits:
 * - 25 API calls per day
 * - 5 calls per minute (we wait 12 seconds between each)
 * 
 * Usage:
 * - Click "Refresh Market Prices" button on Market page (manual)
 * - Updates all 15 stocks/ETFs (~3 minutes)
 * - Rate limiting prevents exceeding API limits
 * 
 * Security:
 * - API key stored in .env file (not in code)
 * - Never commit .env to git
 * 
 * Created: October 20, 2025
 * Last Updated: October 20, 2025
 */
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY; // We'll move this to .env later
const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetch current price for a single stock
 * @param {string} symbol - Stock symbol (e.g., 'AAPL', 'TSLA')
 * @returns {Promise<Object>} Stock data with price, change, etc.
 */
export const fetchStockQuote = async (symbol) => {
  try {
    // Build the API URL
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    console.log(`🔍 Fetching price for ${symbol}...`);
    
    // Make the API call
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check for API errors (like invalid key or rate limit)
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage Error: ${data['Error Message']}`);
    }
    
    if (data['Note']) {
      throw new Error('Rate limit reached. Please wait a minute and try again.');
    }
    
    // Extract the quote data
    const quote = data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No data returned for symbol: ${symbol}`);
    }
    
    // Alpha Vantage returns data with weird keys like "01. symbol"
    // Let's clean it up and make it easier to use
    const cleanData = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      lastUpdated: quote['07. latest trading day']
    };
    
    console.log(`✅ Successfully fetched ${symbol}:`, cleanData);
    
    return cleanData;
    
  } catch (error) {
    console.error(`❌ Error fetching ${symbol}:`, error.message);
    throw error;
  }
};

/**
 * Test function - fetch Apple stock as a test
 * Call this to verify your API key works!
 */
export const testConnection = async () => {
  console.log('🧪 Testing Alpha Vantage connection...');
  
  try {
    const appleData = await fetchStockQuote('AAPL');
    console.log('🎉 Connection successful!');
    console.log('Apple (AAPL) current price:', `${appleData.price}`);
    console.log('Change today:', `${appleData.changePercent > 0 ? '+' : ''}${appleData.changePercent}%`);
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
};

/**
 * Helper function: Wait for X milliseconds
 * Used for rate limiting (Alpha Vantage free tier: 5 calls/minute)
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch quotes for multiple stocks with rate limiting
 * Free tier allows 5 calls per minute, so we wait 12 seconds between each call
 * 
 * @param {Array<string>} symbols - Array of stock symbols (e.g., ['AAPL', 'MSFT', 'GOOGL'])
 * @returns {Promise<Object>} Object with symbols as keys and quote data as values
 */
export const fetchMultipleStocks = async (symbols) => {
  console.log(`📊 Fetching prices for ${symbols.length} stocks...`);
  console.log(`⏱️ This will take ~${Math.ceil(symbols.length * 12 / 60)} minutes (rate limiting)`);
  
  const results = {};
  const errors = [];
  
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    
    try {
      console.log(`[${i + 1}/${symbols.length}] Fetching ${symbol}...`);
      const quote = await fetchStockQuote(symbol);
      results[symbol] = quote;
      
      // Wait 12 seconds before next call (5 calls per minute = 1 call every 12 seconds)
      // Skip the delay after the last stock
      if (i < symbols.length - 1) {
        console.log('⏳ Waiting 12 seconds (rate limit)...');
        await delay(12000);
      }
      
    } catch (error) {
      console.error(`❌ Failed to fetch ${symbol}:`, error.message);
      errors.push({ symbol, error: error.message });
    }
  }
  
  console.log(`✅ Successfully fetched ${Object.keys(results).length}/${symbols.length} stocks`);
  
  if (errors.length > 0) {
    console.warn('⚠️ Errors:', errors);
  }
  
  return { results, errors };
};

/**
 * Update Supabase market_data table with fetched prices
 * 
 * @param {Object} quotes - Object with symbol keys and quote data values
 * @returns {Promise<Object>} Results of the update operation
 */
export const updateMarketData = async (quotes) => {
  // Import Supabase here to avoid circular dependencies
  const { supabase } = await import('../utils/supabase.js');
  
  console.log('💾 Updating database with new prices...');
  
  const updates = [];
  const errors = [];
  
  for (const [symbol, quote] of Object.entries(quotes)) {
    try {
      const { error } = await supabase
        .from('market_data')
        .update({
          current_price: quote.price,
          change: quote.change,
          change_percent: quote.changePercent,
          volume: quote.volume,
          last_updated: new Date().toISOString()
        })
        .eq('symbol', symbol);
      
      if (error) throw error;
      
      updates.push(symbol);
      console.log(`✅ Updated ${symbol}: ${quote.price}`);
      
    } catch (error) {
      console.error(`❌ Failed to update ${symbol}:`, error.message);
      errors.push({ symbol, error: error.message });
    }
  }
  
  console.log(`💾 Database updated: ${updates.length} stocks`);
  
  return { updated: updates, errors };
};

/**
 * Full update: Fetch prices from Alpha Vantage and update database
 * This is the main function you'll use to refresh prices
 * 
 * @param {Array<string>} symbols - Array of stock symbols to update
 * @returns {Promise<Object>} Summary of the update operation
 */
export const refreshMarketPrices = async (symbols) => {
  console.log('🔄 Starting market price refresh...');
  
  const startTime = Date.now();
  
  // Step 1: Fetch from Alpha Vantage
  const { results: quotes, errors: fetchErrors } = await fetchMultipleStocks(symbols);
  
  // Step 2: Update database
  const { updated, errors: updateErrors } = await updateMarketData(quotes);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(0);
  
  console.log('🎉 Market price refresh complete!');
  console.log(`⏱️ Total time: ${duration} seconds`);
  console.log(`✅ Successfully updated: ${updated.length} stocks`);
  console.log(`❌ Failed: ${fetchErrors.length + updateErrors.length} stocks`);
  
  return {
    success: true,
    duration,
    updated,
    fetchErrors,
    updateErrors
  };
};