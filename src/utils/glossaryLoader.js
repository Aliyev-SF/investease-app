// src/utils/glossaryLoader.js

// Glossary content - short definitions for tooltips
// In production, you'd load these from Markdown files
// For now, we'll keep them simple and inline

export const glossaryContent = {
  'stock': `
    <p>A <strong>stock</strong> is a small piece of ownership in a company.</p>
    <p class="mt-2">When you buy a stock, you become a shareholder and can profit if the company grows!</p>
  `,
  
  'etf': `
    <p>An <strong>ETF</strong> (Exchange-Traded Fund) is a basket of many stocks bundled together.</p>
    <p class="mt-2"><strong>Example:</strong> The SPY ETF contains 500 large US companies in one purchase!</p>
  `,
  
  'portfolio': `
    <p>Your <strong>portfolio</strong> is your collection of all investments - stocks, ETFs, and cash.</p>
    <p class="mt-2">Think of it as your investment basket. Diversify it to reduce risk!</p>
  `,
  
  'market-cap': `
    <p><strong>Market Cap</strong> is the total value of all a company's shares.</p>
    <p class="mt-2"><strong>Formula:</strong> Share Price × Total Shares</p>
    <p class="mt-2">Tells you if a company is large-cap (stable) or small-cap (higher risk/reward).</p>
  `,
  
  'pe-ratio': `
    <p><strong>P/E Ratio</strong> compares stock price to company earnings.</p>
    <p class="mt-2"><strong>Formula:</strong> Stock Price ÷ Earnings Per Share</p>
    <p class="mt-2">Lower = potentially undervalued, Higher = growth expectations</p>
  `,
  
  'dividend': `
    <p>A <strong>dividend</strong> is cash that some companies pay shareholders from their profits.</p>
    <p class="mt-2">It's like getting paid just for owning the stock! Not all companies pay dividends.</p>
  `,
  
  'volatility': `
    <p><strong>Volatility</strong> measures how much a stock's price jumps around.</p>
    <p class="mt-2">High volatility = wild swings (risky but potentially profitable)</p>
    <p class="mt-2">Low volatility = steady and predictable (safer for beginners)</p>
  `,
  
  'diversification': `
    <p><strong>Diversification</strong> means spreading money across different investments.</p>
    <p class="mt-2">Don't put all eggs in one basket! Own 3-5+ stocks in different industries to reduce risk.</p>
  `,
  
  'bull-market': `
    <p>A <strong>Bull Market</strong> is when prices are rising and confidence is high.</p>
    <p class="mt-2">Bulls charge upward! Usually lasts 2-5 years. Great time to invest (but stay cautious).</p>
  `,
  
  'bear-market': `
    <p>A <strong>Bear Market</strong> is when prices fall 20%+ from recent highs.</p>
    <p class="mt-2">Bears swipe down! Don't panic - these are temporary and create buying opportunities.</p>
  `,
  
  'limit-order': `
    <p>A <strong>Limit Order</strong> lets you set the exact price to buy/sell.</p>
    <p class="mt-2">Trade only happens if price reaches your limit. More control, but might not execute.</p>
  `,
  
  'market-order': `
    <p>A <strong>Market Order</strong> buys/sells immediately at current price.</p>
    <p class="mt-2">Fast and simple! Great for beginners. Trade happens within seconds.</p>
  `,
  
  'stop-loss': `
    <p>A <strong>Stop Loss</strong> automatically sells if price drops to a set level.</p>
    <p class="mt-2">Protects from big losses! Set it 10-15% below buy price as a safety net.</p>
  `,
  
  'average-cost': `
    <p><strong>Average Cost</strong> is the average price you paid for all shares of a stock.</p>
    <p class="mt-2">If you bought at different prices, this averages them out. Helps track profit/loss.</p>
  `,
  
  'gain-loss': `
    <p><strong>Gain/Loss</strong> shows how much you've made or lost on an investment.</p>
    <p class="mt-2"><em>Unrealized</em> = still own it (paper profit)</p>
    <p class="mt-1"><em>Realized</em> = sold it (actual profit/loss)</p>
  `
};

// Helper to get term content
export const getGlossaryContent = (termSlug) => {
  return glossaryContent[termSlug] || '<p>Term definition not found.</p>';
};

// Helper to format term name from slug
export const formatTermName = (termSlug) => {
  const termMap = {
    'stock': 'Stock',
    'etf': 'ETF',
    'portfolio': 'Portfolio',
    'market-cap': 'Market Cap',
    'pe-ratio': 'P/E Ratio',
    'dividend': 'Dividend',
    'volatility': 'Volatility',
    'diversification': 'Diversification',
    'bull-market': 'Bull Market',
    'bear-market': 'Bear Market',
    'limit-order': 'Limit Order',
    'market-order': 'Market Order',
    'stop-loss': 'Stop Loss',
    'average-cost': 'Average Cost',
    'gain-loss': 'Gain/Loss'
  };
  
  return termMap[termSlug] || termSlug;
};