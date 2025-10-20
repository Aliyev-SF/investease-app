// src/utils/stockData.js (Updated with ETFs and consistent format)

// STOCKS - Individual companies
export const stockData = {
  AAPL: {
    name: 'Apple Inc.',
    price: 178.50,
    change: 2.30,
    icon: '🍎',
    peRatio: 28.5,
    type: 'stock'
  },
  MSFT: {
    name: 'Microsoft Corporation',
    price: 380.00,
    change: 5.20,
    icon: '💻',
    peRatio: 32.1,
    type: 'stock'
  },
  GOOGL: {
    name: 'Alphabet Inc.',
    price: 142.20,
    change: -1.80,
    icon: '🔍',
    peRatio: 24.8,
    type: 'stock'
  },
  AMZN: {
    name: 'Amazon.com Inc.',
    price: 148.90,
    change: 3.10,
    icon: '📦',
    peRatio: 45.2,
    type: 'stock'
  },
  TSLA: {
    name: 'Tesla Inc.',
    price: 242.50,
    change: -8.30,
    icon: '⚡',
    peRatio: 62.3,
    type: 'stock'
  },
  NVDA: {
    name: 'NVIDIA Corporation',
    price: 495.75,
    change: 12.40,
    icon: '🎮',
    peRatio: 78.9,
    type: 'stock'
  },
  META: {
    name: 'Meta Platforms Inc.',
    price: 352.80,
    change: -3.50,
    icon: '👤',
    peRatio: 25.6,
    type: 'stock'
  },
  NFLX: {
    name: 'Netflix Inc.',
    price: 445.20,
    change: 6.75,
    icon: '🎬',
    peRatio: 38.7,
    type: 'stock'
  },
  DIS: {
    name: 'The Walt Disney Company',
    price: 95.40,
    change: 1.20,
    icon: '🏰',
    peRatio: 42.3,
    type: 'stock'
  },
  COST: {
    name: 'Costco Wholesale Corporation',
    price: 578.30,
    change: 4.50,
    icon: '🛒',
    peRatio: 35.2,
    type: 'stock'
  }
};

// ETFs - Exchange-Traded Funds
export const etfData = {
  SPY: {
    name: 'SPDR S&P 500 ETF Trust',
    price: 456.30,
    change: 2.10,
    icon: '📊',
    peRatio: null,
    type: 'etf',
    description: 'Tracks the S&P 500 index - 500 large U.S. companies'
  },
  QQQ: {
    name: 'Invesco QQQ Trust',
    price: 385.60,
    change: 4.20,
    icon: '💹',
    peRatio: null,
    type: 'etf',
    description: 'Tracks Nasdaq-100 - Heavy tech focus'
  },
  VOO: {
    name: 'Vanguard S&P 500 ETF',
    price: 445.75,
    change: 1.90,
    icon: '📈',
    peRatio: null,
    type: 'etf',
    description: 'Tracks S&P 500 with very low fees'
  },
  VTI: {
    name: 'Vanguard Total Stock Market ETF',
    price: 234.80,
    change: 1.30,
    icon: '🌐',
    peRatio: null,
    type: 'etf',
    description: 'Entire U.S. stock market - Maximum diversification'
  },
  AGG: {
    name: 'iShares Core U.S. Aggregate Bond ETF',
    price: 95.40,
    change: -0.20,
    icon: '🏦',
    peRatio: null,
    type: 'etf',
    description: 'U.S. investment-grade bonds - Adds stability'
  }
};

// Combined data for easy access (backwards compatible)
export const allAssets = {
  ...stockData,
  ...etfData
};

// Helper function to check if symbol is ETF
export const isETF = (symbol) => {
  return etfData[symbol] !== undefined;
};

// Helper function to check if symbol is Stock
export const isStock = (symbol) => {
  return stockData[symbol] !== undefined;
};

// Get asset by symbol (works for both stocks and ETFs)
export const getAsset = (symbol) => {
  return allAssets[symbol] || null;
};

// Function to simulate price changes (KEPT from your original)
export const updateStockPrices = (assets) => {
  const newAssets = { ...assets };
  
  Object.keys(newAssets).forEach(symbol => {
    const asset = newAssets[symbol];
    // Random price change between -2% and +2%
    const changePercent = (Math.random() - 0.5) * 0.04;
    const newPrice = asset.price * (1 + changePercent);
    const priceChange = newPrice - asset.price;
    
    newAssets[symbol] = {
      ...asset,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat(priceChange.toFixed(2))
    };
  });
  
  return newAssets;
};

// Export default for backwards compatibility
export default stockData;