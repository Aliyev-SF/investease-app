// src/utils/stockData.js (Updated with P/E Ratios)

export const stockData = {
  AAPL: {
    name: 'Apple Inc.',
    price: 178.50,
    change: -2.30,
    icon: '🍎',
    peRatio: 28.5
  },
  MSFT: {
    name: 'Microsoft Corporation',
    price: 374.20,
    change: 3.45,
    icon: '💻',
    peRatio: 32.1
  },
  GOOGL: {
    name: 'Alphabet Inc.',
    price: 142.50,
    change: 1.80,
    icon: '🔍',
    peRatio: 22.8
  },
  AMZN: {
    name: 'Amazon.com Inc.',
    price: 148.90,
    change: -1.20,
    icon: '📦',
    peRatio: 48.3
  },
  TSLA: {
    name: 'Tesla Inc.',
    price: 242.80,
    change: 5.60,
    icon: '⚡',
    peRatio: 65.4
  },
  NVDA: {
    name: 'NVIDIA Corporation',
    price: 495.30,
    change: 8.20,
    icon: '🎮',
    peRatio: 78.9
  },
  META: {
    name: 'Meta Platforms Inc.',
    price: 332.40,
    change: -4.10,
    icon: '👤',
    peRatio: 25.6
  },
  NFLX: {
    name: 'Netflix Inc.',
    price: 445.60,
    change: 2.90,
    icon: '🎬',
    peRatio: 38.7
  },
  DIS: {
    name: 'The Walt Disney Company',
    price: 91.30,
    change: -0.80,
    icon: '🏰',
    peRatio: 42.3
  }
};

// Function to simulate price changes
export const updateStockPrices = (stocks) => {
  const newStocks = { ...stocks };
  
  Object.keys(newStocks).forEach(symbol => {
    const stock = newStocks[symbol];
    // Random price change between -2% and +2%
    const changePercent = (Math.random() - 0.5) * 0.04;
    const newPrice = stock.price * (1 + changePercent);
    const priceChange = newPrice - stock.price;
    
    newStocks[symbol] = {
      ...stock,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat(priceChange.toFixed(2))
    };
  });
  
  return newStocks;
};