// Mock stock data with realistic prices and movements
export const stockData = {
    'AAPL': {
      name: 'Apple Inc.',
      price: 178.50,
      change: 2.30,
      changePercent: 1.31,
      peRatio: 28.5,
      type: 'stock'
    },
    'GOOGL': {
      name: 'Alphabet Inc.',
      price: 142.20,
      change: -1.80,
      changePercent: -1.25,
      peRatio: 24.8,
      type: 'stock'
    },
    'MSFT': {
      name: 'Microsoft Corp.',
      price: 380.00,
      change: 5.20,
      changePercent: 1.39,
      peRatio: 32.1,
      type: 'stock'
    },
    'AMZN': {
      name: 'Amazon.com Inc.',
      price: 148.90,
      change: 3.10,
      changePercent: 2.13,
      peRatio: 45.2,
      type: 'stock'
    },
    'TSLA': {
      name: 'Tesla Inc.',
      price: 242.50,
      change: -8.30,
      changePercent: -3.31,
      peRatio: 62.3,
      type: 'stock'
    },
    'VTI': {
      name: 'Vanguard Total Stock Market ETF',
      price: 234.80,
      change: 1.90,
      changePercent: 0.82,
      peRatio: null,
      type: 'etf'
    },
    'SPY': {
      name: 'SPDR S&P 500 ETF',
      price: 456.30,
      change: 2.10,
      changePercent: 0.46,
      peRatio: null,
      type: 'etf'
    },
    'QQQ': {
      name: 'Invesco QQQ ETF',
      price: 385.60,
      change: 4.20,
      changePercent: 1.10,
      peRatio: null,
      type: 'etf'
    }
  };
  
  // Function to simulate price movements
  export const updateStockPrices = (currentData) => {
    const updated = { ...currentData };
    
    Object.keys(updated).forEach(symbol => {
      // Random change between -0.5% and +0.5%
      const changePercent = (Math.random() - 0.5) * 1;
      const changeAmount = updated[symbol].price * (changePercent / 100);
      
      updated[symbol].price = parseFloat((updated[symbol].price + changeAmount).toFixed(2));
      updated[symbol].change = parseFloat((updated[symbol].change + changeAmount).toFixed(2));
      updated[symbol].changePercent = parseFloat(
        ((updated[symbol].change / updated[symbol].price) * 100).toFixed(2)
      );
    });
    
    return updated;
  };