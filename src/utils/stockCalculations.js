/**
 * Stock Detail Page - Calculation Utilities
 * 
 * Helper functions for calculating derived metrics and providing context
 * for stock data displayed on the detail page.
 */

/**
 * Calculate where current price sits in 52-week range
 * @param {Object} stock - Stock data object
 * @returns {Object} { position: 0.85, label: 'near high', percentage: 85 }
 */
export const calculatePricePosition = (stock) => {
  if (!stock.week_52_high || !stock.week_52_low || !stock.current_price) {
    return { position: 0.5, label: 'mid-range', percentage: 50 };
  }

  const range = stock.week_52_high - stock.week_52_low;
  const position = (stock.current_price - stock.week_52_low) / range;
  const percentage = Math.round(position * 100);

  let label = 'mid-range';
  let icon = '━';
  
  if (position > 0.85) {
    label = 'near 52-week high';
    icon = '▲';
  } else if (position < 0.15) {
    label = 'near 52-week low';
    icon = '▼';
  } else if (position > 0.65) {
    label = 'upper range';
    icon = '↗';
  } else if (position < 0.35) {
    label = 'lower range';
    icon = '↘';
  }

  return { position, label, percentage, icon };
};

/**
 * Calculate volatility percentage and level
 * @param {Object} stock - Stock data object
 * @returns {Object} { percent: 38.5, level: 'moderate', description: '...' }
 */
export const calculateVolatility = (stock) => {
  if (!stock.week_52_high || !stock.week_52_low) {
    return { 
      percent: 0, 
      level: 'unknown', 
      description: 'Not enough data to calculate volatility',
      color: 'text-gray-500'
    };
  }

  const volatilityPercent = 
    ((stock.week_52_high - stock.week_52_low) / stock.week_52_low) * 100;

  let level = 'moderate';
  let description = 'Typical price movement for this type of investment';
  let color = 'text-yellow-600';

  if (volatilityPercent > 50) {
    level = 'high';
    description = 'Large price swings are common - higher risk and reward potential';
    color = 'text-red-600';
  } else if (volatilityPercent < 20) {
    level = 'low';
    description = 'Relatively stable with smaller price movements';
    color = 'text-green-600';
  }

  return { 
    percent: volatilityPercent.toFixed(1), 
    level, 
    description,
    color 
  };
};

/**
 * Calculate how many shares user can afford and provide suggestions
 * @param {number} price - Current stock price
 * @param {number} availableCash - User's available cash
 * @returns {Object} Affordable shares info with suggestions
 */
export const calculateAffordableShares = (price, availableCash) => {
  if (!price || !availableCash || price <= 0) {
    return {
      max: 0,
      suggestions: [],
      percentages: [],
      canAfford: false
    };
  }

  const maxShares = Math.floor(availableCash / price);
  
  // Provide smart suggestions based on max affordable
  let suggestions = [];
  if (maxShares >= 10) {
    suggestions = [5, 10, 20].filter(n => n <= maxShares);
  } else if (maxShares >= 5) {
    suggestions = [1, 5, 10].filter(n => n <= maxShares);
  } else if (maxShares >= 1) {
    suggestions = [1, 2, 3].filter(n => n <= maxShares);
  }

  const percentages = suggestions.map(n => 
    ((n * price) / availableCash) * 100
  );

  return {
    max: maxShares,
    suggestions,
    percentages: percentages.map(p => p.toFixed(1)),
    canAfford: maxShares > 0
  };
};

/**
 * Calculate worst-case loss scenarios for risk education
 * @param {number} shares - Number of shares
 * @param {number} price - Current price per share
 * @returns {Object} Loss scenarios at different drop percentages
 */
export const calculateLossScenarios = (shares, price) => {
  if (!shares || !price) {
    return {
      drop10: { percent: 10, loss: 0 },
      drop20: { percent: 20, loss: 0 },
      drop50: { percent: 50, loss: 0 }
    };
  }

  const investment = shares * price;

  return {
    investment,
    drop10: { 
      percent: 10, 
      loss: investment * 0.10,
      newValue: investment * 0.90
    },
    drop20: { 
      percent: 20, 
      loss: investment * 0.20,
      newValue: investment * 0.80
    },
    drop50: { 
      percent: 50, 
      loss: investment * 0.50,
      newValue: investment * 0.50
    }
  };
};

/**
 * Format market cap into readable string with size category
 * @param {number} marketCap - Market capitalization
 * @returns {Object} Formatted value with size category and description
 */
export const formatMarketCap = (marketCap) => {
  if (!marketCap || marketCap <= 0) {
    return {
      value: 'N/A',
      size: 'unknown',
      description: 'Market cap not available',
      color: 'text-gray-500'
    };
  }

  if (marketCap >= 1e12) {
    return {
      value: '$' + (marketCap / 1e12).toFixed(2) + 'T',
      size: 'Mega-Cap',
      description: 'One of the world\'s largest companies',
      color: 'text-blue-600',
      detail: 'These industry giants are typically very stable'
    };
  } else if (marketCap >= 1e11) {
    return {
      value: '$' + (marketCap / 1e9).toFixed(0) + 'B',
      size: 'Large-Cap',
      description: 'Large, established company',
      color: 'text-blue-500',
      detail: 'Typically stable with steady growth'
    };
  } else if (marketCap >= 1e10) {
    return {
      value: '$' + (marketCap / 1e9).toFixed(1) + 'B',
      size: 'Mid-Cap',
      description: 'Medium-sized company',
      color: 'text-purple-500',
      detail: 'Balance of growth potential and stability'
    };
  } else if (marketCap >= 2e9) {
    return {
      value: '$' + (marketCap / 1e9).toFixed(1) + 'B',
      size: 'Small-Cap',
      description: 'Smaller company',
      color: 'text-orange-500',
      detail: 'Higher growth potential but more volatile'
    };
  } else {
    return {
      value: '$' + (marketCap / 1e6).toFixed(0) + 'M',
      size: 'Micro-Cap',
      description: 'Very small company',
      color: 'text-red-500',
      detail: 'Highest risk and reward potential'
    };
  }
};

/**
 * Compare P/E ratio to sector average and provide context
 * @param {number} peRatio - Stock's P/E ratio
 * @param {string} sector - Stock's sector
 * @returns {Object} Comparison with sector average and assessment
 */
export const comparePERatio = (peRatio, sector) => {
  // Simplified sector averages (in production, this would come from database)
  const sectorAverages = {
    'Technology': 30,
    'Healthcare': 25,
    'Financial Services': 15,
    'Energy': 20,
    'Consumer Cyclical': 22,
    'Consumer Defensive': 20,
    'Industrials': 18,
    'Real Estate': 25,
    'Utilities': 16,
    'Communication Services': 20,
    'Basic Materials': 15,
    'default': 20
  };

  if (!peRatio || peRatio <= 0) {
    return {
      avg: sectorAverages[sector] || sectorAverages['default'],
      diff: 0,
      assessment: 'P/E ratio not available',
      explanation: 'Some companies don\'t have a P/E ratio',
      color: 'text-gray-500'
    };
  }

  const avg = sectorAverages[sector] || sectorAverages['default'];
  const diff = ((peRatio - avg) / avg) * 100;

  let assessment = 'about average for the sector';
  let explanation = 'Priced similarly to other companies in ' + (sector || 'this industry');
  let color = 'text-gray-700';

  if (diff > 30) {
    assessment = 'above sector average';
    explanation = 'Investors expect higher growth than peers';
    color = 'text-orange-600';
  } else if (diff > 10) {
    assessment = 'slightly above average';
    explanation = 'Priced at a slight premium to peers';
    color = 'text-yellow-600';
  } else if (diff < -30) {
    assessment = 'well below sector average';
    explanation = 'Could be undervalued or facing challenges';
    color = 'text-green-600';
  } else if (diff < -10) {
    assessment = 'slightly below average';
    explanation = 'Priced at a slight discount to peers';
    color = 'text-green-500';
  }

  return { 
    avg: avg.toFixed(1), 
    diff: diff.toFixed(1), 
    assessment, 
    explanation,
    color 
  };
};

/**
 * Calculate diversification impact if user buys this stock
 * @param {number} shares - Shares to buy
 * @param {number} price - Price per share
 * @param {number} totalPortfolioValue - Current total portfolio value
 * @param {number} currentHoldingsCount - Number of different stocks owned
 * @returns {Object} Diversification analysis
 */
export const calculateDiversificationImpact = (
  shares,
  price,
  totalPortfolioValue
) => {
  if (!shares || !price || !totalPortfolioValue) {
    return {
      percentage: 0,
      advice: 'Not enough information',
      color: 'text-gray-500'
    };
  }

  const investment = shares * price;
  const percentage = (investment / totalPortfolioValue) * 100;

  let advice = '';
  let color = 'text-green-600';
  let icon = '✓';

  if (percentage > 50) {
    advice = 'This would be over half your portfolio - consider buying less for better diversification';
    color = 'text-red-600';
    icon = '⚠️';
  } else if (percentage > 25) {
    advice = 'This is a large position - make sure you\'re comfortable with the risk';
    color = 'text-orange-600';
    icon = '⚡';
  } else if (percentage > 15) {
    advice = 'Moderate position size - reasonable for a concentrated portfolio';
    color = 'text-yellow-600';
    icon = '💡';
  } else if (percentage > 5) {
    advice = 'Good position size for diversification';
    color = 'text-green-600';
    icon = '✓';
  } else {
    advice = 'Small position - low risk but also limited impact on returns';
    color = 'text-blue-600';
    icon = 'ℹ️';
  }

  return {
    percentage: percentage.toFixed(1),
    advice,
    color,
    icon
  };
};

/**
 * Format currency for display
 * @param {number} value - Dollar amount
 * @param {boolean} showCents - Whether to show cents
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, showCents = true) => {
  if (value === null || value === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(value);
};

/**
 * Format large numbers (for volume, shares, etc.)
 * @param {number} value - Number to format
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (value) => {
  if (!value) return '0';
  
  if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + 'B';
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M';
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  
  return value.toLocaleString();
};

/**
 * Determine if dividend yield is notable
 * @param {number} dividendYield - Dividend yield percentage
 * @returns {Object} Assessment of dividend
 */
export const assessDividend = (dividendYield) => {
  if (!dividendYield || dividendYield <= 0) {
    return {
      hasDiv: false,
      label: 'No Dividend',
      description: 'This company doesn\'t currently pay dividends',
      color: 'text-gray-500'
    };
  }

  let label = '';
  let description = '';
  let color = '';

  if (dividendYield > 4) {
    label = 'High Yield';
    description = 'Above-average dividend income';
    color = 'text-green-600';
  } else if (dividendYield > 2) {
    label = 'Moderate Yield';
    description = 'Provides some dividend income';
    color = 'text-blue-600';
  } else {
    label = 'Low Yield';
    description = 'Pays a small dividend';
    color = 'text-gray-600';
  }

  return {
    hasDiv: true,
    label,
    description,
    color,
    yield: dividendYield.toFixed(2) + '%'
  };
};