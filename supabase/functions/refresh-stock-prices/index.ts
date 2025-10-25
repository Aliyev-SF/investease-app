// supabase/functions/refresh-stock-prices/index.ts
// Automatic daily stock price refresh using Alpha Vantage API
// This Edge Function runs in Supabase's cloud and updates stock prices daily

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// List of stocks/ETFs to update
const SYMBOLS = [
  // Stocks
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
  'NVDA', 'META', 'NFLX', 'DIS', 'COST',
  // ETFs
  'SPY', 'QQQ', 'VOO', 'VTI', 'AGG'
];

const ALPHA_VANTAGE_URL = 'https://www.alphavantage.co/query';

// Helper: Wait for X milliseconds
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch single stock quote from Alpha Vantage
async function fetchStockQuote(symbol: string, apiKey: string) {
  const url = `${ALPHA_VANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  
  console.log(`🔍 Fetching ${symbol}...`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data['Error Message']) {
    throw new Error(`Alpha Vantage Error: ${data['Error Message']}`);
  }
  
  if (data['Note']) {
    throw new Error('Rate limit reached');
  }
  
  const quote = data['Global Quote'];
  
  if (!quote || Object.keys(quote).length === 0) {
    throw new Error(`No data returned for ${symbol}`);
  }
  
  return {
    symbol: quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    volume: parseInt(quote['06. volume']),
    lastUpdated: quote['07. latest trading day']
  };
}

// Fetch all stocks with rate limiting
async function fetchAllStocks(apiKey: string) {
  console.log(`📊 Fetching ${SYMBOLS.length} stocks...`);
  
  const results: Record<string, any> = {};
  const errors: any[] = [];
  
  for (let i = 0; i < SYMBOLS.length; i++) {
    const symbol = SYMBOLS[i];
    
    try {
      const quote = await fetchStockQuote(symbol, apiKey);
      results[symbol] = quote;
      console.log(`✅ [${i + 1}/${SYMBOLS.length}] ${symbol}: $${quote.price}`);
      
      // Wait 12 seconds before next call (rate limiting: 5 calls/minute)
      if (i < SYMBOLS.length - 1) {
        console.log('⏳ Waiting 12 seconds (rate limit)...');
        await delay(12000);
      }
    } catch (error: any) {
      console.error(`❌ Failed to fetch ${symbol}:`, error.message);
      errors.push({ symbol, error: error.message });
    }
  }
  
  return { results, errors };
}

// Update market_data table
async function updateMarketData(supabase: any, quotes: Record<string, any>) {
  console.log('💾 Updating market_data table...');
  
  const updates: string[] = [];
  const errors: any[] = [];
  
  for (const [symbol, quote] of Object.entries(quotes)) {
    try {
      const updateResult = await supabase
        .from('market_data')
        .update({
          current_price: quote.price,
          change: quote.change,
          change_percent: quote.changePercent,
          volume: quote.volume,
          last_updated: new Date().toISOString()
        })
        .eq('symbol', symbol);
      
      // Debug: Check if result exists
      if (!updateResult) {
        throw new Error('Update returned undefined');
      }
      
      const { error } = updateResult;
      
      if (error) {
        console.error(`❌ Update error for ${symbol}:`, error);
        throw error;
      }
      
      updates.push(symbol);
      console.log(`✅ Updated ${symbol}: $${quote.price}`);
    } catch (error: any) {
      console.error(`❌ Failed to update ${symbol}:`, error.message || error);
      errors.push({ symbol, error: error.message || String(error) });
    }
  }
  
  console.log(`💾 Database updated: ${updates.length} stocks`);
  
  return { updates, errors };
}

// Save to market_data_history table
async function saveToHistory(supabase: any, quotes: Record<string, any>) {
  console.log('📈 Saving to history...');
  
  const saves: string[] = [];
  const errors: any[] = [];
  const today = new Date().toISOString().split('T')[0];
  
  for (const [symbol, quote] of Object.entries(quotes)) {
    try {
      // Check if entry exists for today
      const existingResult = await supabase
        .from('market_data_history')
        .select('id')
        .eq('symbol', symbol)
        .eq('date', today)
        .maybeSingle();
      
      if (!existingResult) {
        throw new Error('Query returned undefined');
      }
      
      const { data: existing, error: checkError } = existingResult;
      
      if (checkError) {
        console.error(`❌ Check error for ${symbol}:`, checkError);
        throw checkError;
      }
      
      if (existing) {
        // Update existing
        const updateResult = await supabase
          .from('market_data_history')
          .update({
            close_price: quote.price,
            volume: quote.volume
          })
          .eq('id', existing.id);
        
        if (!updateResult) {
          throw new Error('Update returned undefined');
        }
        
        const { error: updateError } = updateResult;
        
        if (updateError) {
          console.error(`❌ History update error for ${symbol}:`, updateError);
          throw updateError;
        }
        
        console.log(`📊 Updated history for ${symbol}`);
      } else {
        // Insert new
        const insertResult = await supabase
          .from('market_data_history')
          .insert({
            symbol,
            date: today,
            open_price: quote.price,
            high_price: quote.price,
            low_price: quote.price,
            close_price: quote.price,
            volume: quote.volume
          });
        
        if (!insertResult) {
          throw new Error('Insert returned undefined');
        }
        
        const { error: insertError } = insertResult;
        
        if (insertError) {
          console.error(`❌ History insert error for ${symbol}:`, insertError);
          throw insertError;
        }
        
        console.log(`✅ Saved history for ${symbol}`);
      }
      
      saves.push(symbol);
    } catch (error: any) {
      console.error(`❌ Failed to save history for ${symbol}:`, error.message || error);
      errors.push({ symbol, error: error.message || String(error) });
    }
  }
  
  console.log(`📈 History saved: ${saves.length} stocks`);
  
  return { saves, errors };
}

serve(async (req) => {
  try {
    console.log('🚀 Starting automatic price refresh...');
    const startTime = Date.now();
    
    // Debug: Check environment variables
    const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔍 Environment check:');
    console.log('  - Alpha Vantage key exists:', !!alphaVantageKey);
    console.log('  - Alpha Vantage key length:', alphaVantageKey?.length || 0);
    console.log('  - Supabase URL exists:', !!supabaseUrl);
    console.log('  - Supabase URL:', supabaseUrl);
    console.log('  - Supabase service key exists:', !!supabaseKey);
    console.log('  - Supabase service key length:', supabaseKey?.length || 0);
    
    if (!alphaVantageKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY is not set');
    }
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not set');
    }
    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    
    // Create Supabase client
    console.log('🔌 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');
    
    // Step 1: Fetch prices from Alpha Vantage
    console.log('📡 Starting Alpha Vantage fetch...');
    const { results: quotes, errors: fetchErrors } = await fetchAllStocks(alphaVantageKey);
    console.log(`📊 Fetched ${Object.keys(quotes).length} stocks successfully`);
    
    // Step 2: Update market_data table
    console.log('💾 Starting database update...');
    const { updates, errors: updateErrors } = await updateMarketData(supabase, quotes);
    console.log(`💾 Updated ${updates.length} stocks in database`);
    
    // Step 3: Save to history
    console.log('📈 Starting history save...');
    const { saves, errors: historyErrors } = await saveToHistory(supabase, quotes);
    console.log(`📈 Saved ${saves.length} stocks to history`);
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('🎉 Market price refresh complete!');
    console.log(`⏱️ Duration: ${duration} seconds`);
    console.log(`✅ Updated: ${updates.length} stocks`);
    console.log(`📈 History saved: ${saves.length} stocks`);
    console.log(`❌ Failed: ${fetchErrors.length + updateErrors.length + historyErrors.length} stocks`);
    
    if (fetchErrors.length > 0) {
      console.log('📋 Fetch errors:', fetchErrors);
    }
    if (updateErrors.length > 0) {
      console.log('📋 Update errors:', updateErrors);
    }
    if (historyErrors.length > 0) {
      console.log('📋 History errors:', historyErrors);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        duration,
        updated: updates.length,
        historySaved: saves.length,
        failed: fetchErrors.length + updateErrors.length + historyErrors.length,
        fetchErrors,
        updateErrors,
        historyErrors
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error: any) {
    console.error('💥 Fatal error:', error);
    console.error('💥 Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error),
        stack: error.stack
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})