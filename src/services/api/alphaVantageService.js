// src/services/api/alphaVantageService.js
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
 * Fetch company overview with fundamentals
 * Includes: 52-week high/low, company description, sector, industry, market cap, PE ratio, dividend
 * @param {string} symbol - Stock symbol (e.g., 'AAPL', 'TSLA')
 * @returns {Promise<Object>} Company overview data
 */
export const fetchCompanyOverview = async (symbol) => {
  try {
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    console.log(`🏢 Fetching company overview for ${symbol}...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(`Alpha Vantage Error: ${data['Error Message']}`);
    }

    if (data['Note']) {
      throw new Error('Rate limit reached. Please wait a minute and try again.');
    }

    if (!data.Symbol) {
      throw new Error(`No overview data returned for symbol: ${symbol}`);
    }

    // Extract relevant fields
    const overview = {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: parseInt(data.MarketCapitalization) || null,
      peRatio: parseFloat(data.PERatio) || null,
      dividendYield: parseFloat(data.DividendYield) ? parseFloat(data.DividendYield) * 100 : null, // Convert to percentage
      week52High: parseFloat(data['52WeekHigh']) || null,
      week52Low: parseFloat(data['52WeekLow']) || null,
      type: data.AssetType === 'ETF' ? 'etf' : 'stock'
    };

    console.log(`✅ Successfully fetched overview for ${symbol}`);

    return overview;

  } catch (error) {
    console.error(`❌ Error fetching overview for ${symbol}:`, error.message);
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
  const { supabase } = await import('../database/supabase.js');
  
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
 * Save price to history table for charting
 * Call this alongside updateMarketData to track price over time
 * 
 * @param {Object} quotes - Object with symbol keys and quote data values
 * @returns {Promise<Object>} Results of the history save operation
 */
export const saveToHistory = async (quotes) => {
  // Import Supabase here to avoid circular dependencies
  const { supabase } = await import('../database/supabase.js');
  
  console.log('📈 Saving prices to history...');
  
  const saves = [];
  const errors = [];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  for (const [symbol, quote] of Object.entries(quotes)) {
    try {
      // Check if we already have an entry for today
      const { data: existing, error: checkError } = await supabase
        .from('market_data_history')
        .select('id')
        .eq('symbol', symbol)
        .eq('date', today)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existing) {
        // Update existing entry (in case we refresh multiple times per day)
        const { error: updateError } = await supabase
          .from('market_data_history')
          .update({
            close_price: quote.price,
            volume: quote.volume,
            // We don't have open/high/low from GLOBAL_QUOTE, so we'll use current price
            // When we upgrade to better API endpoint later, we can add these
          })
          .eq('id', existing.id);
        
        if (updateError) throw updateError;
        console.log(`📊 Updated history for ${symbol}`);
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from('market_data_history')
          .insert({
            symbol: symbol,
            date: today,
            open_price: quote.price,  // Using current price as placeholder
            high_price: quote.price,  // Using current price as placeholder
            low_price: quote.price,   // Using current price as placeholder
            close_price: quote.price,
            volume: quote.volume
          });
        
        if (insertError) throw insertError;
        console.log(`✅ Saved history for ${symbol}`);
      }
      
      saves.push(symbol);
      
    } catch (error) {
      console.error(`❌ Failed to save history for ${symbol}:`, error.message);
      errors.push({ symbol, error: error.message });
    }
  }
  
  console.log(`📈 History saved: ${saves.length} stocks`);
  
  return { saved: saves, errors };
};

/**
 * Update company overview data in database
 *
 * @param {Object} overview - Company overview data from fetchCompanyOverview
 * @returns {Promise<Object>} Result of update operation
 */
export const updateCompanyOverview = async (overview) => {
  const { supabase } = await import('../database/supabase.js');

  try {
    const { error } = await supabase
      .from('market_data')
      .update({
        company_description: overview.description,
        sector: overview.sector,
        industry: overview.industry,
        market_cap: overview.marketCap,
        pe_ratio: overview.peRatio,
        dividend_yield: overview.dividendYield,
        week_52_high: overview.week52High,
        week_52_low: overview.week52Low,
        type: overview.type,
        last_updated: new Date().toISOString()
      })
      .eq('symbol', overview.symbol);

    if (error) throw error;

    console.log(`✅ Updated overview for ${overview.symbol}`);
    return { success: true, symbol: overview.symbol };

  } catch (error) {
    console.error(`❌ Failed to update overview for ${overview.symbol}:`, error.message);
    return { success: false, symbol: overview.symbol, error: error.message };
  }
};

/**
 * Fetch and update company overview data for multiple stocks
 *
 * @param {Array<string>} symbols - Array of stock symbols
 * @returns {Promise<Object>} Summary of the operation
 */
export const refreshCompanyOverviews = async (symbols) => {
  console.log(`🏢 Fetching company overviews for ${symbols.length} stocks...`);
  console.log(`⏱️ This will take ~${Math.ceil(symbols.length * 12 / 60)} minutes (rate limiting)`);

  const updated = [];
  const errors = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];

    try {
      console.log(`[${i + 1}/${symbols.length}] Fetching overview for ${symbol}...`);
      const overview = await fetchCompanyOverview(symbol);
      const result = await updateCompanyOverview(overview);

      if (result.success) {
        updated.push(symbol);
      } else {
        errors.push({ symbol, error: result.error });
      }

      // Rate limiting
      if (i < symbols.length - 1) {
        console.log('⏳ Waiting 12 seconds (rate limit)...');
        await delay(12000);
      }

    } catch (error) {
      console.error(`❌ Failed to process ${symbol}:`, error.message);
      errors.push({ symbol, error: error.message });
    }
  }

  console.log(`✅ Successfully updated: ${updated.length}/${symbols.length} overviews`);

  return { updated, errors };
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

// Step 3: Save to history
const { saved, errors: historyErrors } = await saveToHistory(quotes);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(0);

 console.log('🎉 Market price refresh complete!');
console.log(`⏱️ Total time: ${duration} seconds`);
console.log(`✅ Successfully updated: ${updated.length} stocks`);
console.log(`📈 History saved: ${saved.length} stocks`);
console.log(`❌ Failed: ${fetchErrors.length + updateErrors.length + historyErrors.length} stocks`);

return {
  success: true,
  duration,
  updated,
  historySaved: saved,
  fetchErrors,
  updateErrors,
  historyErrors
};
};