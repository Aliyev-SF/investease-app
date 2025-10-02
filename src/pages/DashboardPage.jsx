import { useState, useEffect } from 'react';
import { stockData as initialStockData, updateStockPrices } from '../utils/stockData';
import { getCoachingMessage } from '../utils/coachingMessages';
import StockCard from '../components/StockCard';
import TradeModal from '../components/TradeModal';

function DashboardPage({ userData, confidenceScore: initialConfidence }) {
  // Portfolio state
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('investease_portfolio');
    return saved ? JSON.parse(saved) : {
      cash: 10000,
      holdings: [],
      totalValue: 10000
    };
  });

  // Stock data state
  const [stocks, setStocks] = useState(initialStockData);
  
  // UI state
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [coachingMessage, setCoachingMessage] = useState(() => 
    getCoachingMessage('welcome')
  );
  const [confidenceScore, setConfidenceScore] = useState(initialConfidence);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('investease_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Simulate real-time price updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => updateStockPrices(prevStocks));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate total portfolio value
  const calculateTotalValue = () => {
    let holdingsValue = 0;
    portfolio.holdings.forEach(holding => {
      holdingsValue += holding.shares * stocks[holding.symbol].price;
    });
    return portfolio.cash + holdingsValue;
  };

  const totalValue = calculateTotalValue();
  const dayChange = totalValue - 10000;
  const dayChangePercent = (dayChange / 10000) * 100;

  // Execute trade
  const handleExecuteTrade = (symbol, shares, price) => {
    const total = shares * price;
    
    // Update portfolio
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
    
    const newPortfolio = {
      cash: portfolio.cash - total,
      holdings: existingHolding
        ? portfolio.holdings.map(h =>
            h.symbol === symbol
              ? { ...h, shares: h.shares + shares, avgPrice: ((h.avgPrice * h.shares) + (price * shares)) / (h.shares + shares) }
              : h
          )
        : [...portfolio.holdings, { symbol, shares, avgPrice: price }],
      totalValue: totalValue
    };

    setPortfolio(newPortfolio);

    // Update confidence score
    const tradeCount = newPortfolio.holdings.length;
    if (tradeCount === 1) {
      setConfidenceScore(prev => Math.min(10, prev + 0.5));
      setCoachingMessage(getCoachingMessage('firstTrade'));
    } else if (tradeCount > 2) {
      setConfidenceScore(prev => Math.min(10, prev + 0.3));
      setCoachingMessage(getCoachingMessage('diversification'));
    }

    // ETF-specific coaching
    if (stocks[symbol].type === 'etf') {
      setCoachingMessage(getCoachingMessage('etfPurchase'));
    }

    // Close modal
    setSelectedStock(null);
  };

  // Filter stocks based on search
  const filteredStocks = Object.entries(stocks).filter(([symbol, stock]) => {
    const term = searchTerm.toLowerCase();
    return symbol.toLowerCase().includes(term) || stock.name.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-primary text-3xl font-bold">InvestEase</h1>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-gray">Welcome back</div>
                <div className="font-semibold text-dark">{userData.name}</div>
              </div>
              
              <div className="bg-warning text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                PRACTICE MODE
              </div>
              
              <div className="bg-white border-2 border-primary rounded-xl px-4 py-2">
                <div className="text-xs text-gray">Your Confidence</div>
                <div className="text-lg font-bold text-primary">
                  {confidenceScore.toFixed(1)}/10
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - Portfolio & Market */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Card */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark">
                  Your Practice Portfolio
                </h2>
                <div className="tooltip">
                  <span className="text-2xl">💡</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-4xl font-bold text-dark mb-2">
                  ${totalValue.toFixed(2)}
                </div>
                <div className={`text-lg font-semibold ${dayChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  {dayChange >= 0 ? '+' : ''}${Math.abs(dayChange).toFixed(2)} ({dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)
                </div>
              </div>

              {/* Holdings */}
              <div className="mt-6">
                <h3 className="font-bold text-dark mb-4">Your Holdings</h3>
                {portfolio.holdings.length === 0 ? (
                  <div className="text-center py-8 text-gray">
                    You haven't bought any stocks yet. Browse the market below to make your first practice trade!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {portfolio.holdings.map(holding => {
                      const stock = stocks[holding.symbol];
                      const value = holding.shares * stock.price;
                      const gain = value - (holding.shares * holding.avgPrice);
                      const gainPercent = (gain / (holding.shares * holding.avgPrice)) * 100;

                      return (
                        <div key={holding.symbol} className="flex justify-between items-center p-4 bg-light rounded-xl">
                          <div>
                            <div className="font-bold text-dark">{holding.symbol}</div>
                            <div className="text-sm text-gray">{holding.shares} shares</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-dark">${value.toFixed(2)}</div>
                            <div className={`text-sm font-semibold ${gain >= 0 ? 'text-success' : 'text-danger'}`}>
                              {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-dark">Available Cash:</span>
                  <span className="text-xl font-bold text-primary">
                    ${portfolio.cash.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Market View */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-dark mb-6">
                Explore Stocks & ETFs
              </h2>

              {/* Search */}
              <input
                type="text"
                placeholder="Search stocks (try AAPL, VTI, MSFT)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none mb-6"
              />

              {/* Stock Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredStocks.map(([symbol, stock]) => (
                  <StockCard
                    key={symbol}
                    symbol={symbol}
                    stock={stock}
                    onBuyClick={() => setSelectedStock(symbol)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - AI Coach */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg sticky top-24">
              <h3 className="text-xl font-bold text-dark mb-4">AI Coach 🤖</h3>

              {coachingMessage && (
                <div className="bg-gradient-to-br from-primary to-purple-700 text-white rounded-2xl p-5 mb-4">
                  <div className="font-bold mb-2 flex items-center gap-2">
                    <span>{coachingMessage.title}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{coachingMessage.message}</p>
                  {coachingMessage.tip && (
                    <p className="text-sm leading-relaxed mt-3 font-semibold">
                      {coachingMessage.tip}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-light rounded-xl p-4">
                <h4 className="font-semibold text-dark mb-3">Quick Tips:</h4>
                <ul className="space-y-2 text-sm text-gray">
                  <li>• Start with ETFs for instant diversification</li>
                  <li>• Only invest what you could afford to lose</li>
                  <li>• Time in market beats timing the market</li>
                  <li>• Practice different strategies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {selectedStock && (
        <TradeModal
          symbol={selectedStock}
          stock={stocks[selectedStock]}
          availableCash={portfolio.cash}
          onClose={() => setSelectedStock(null)}
          onExecuteTrade={handleExecuteTrade}
        />
      )}
    </div>
  );
}

export default DashboardPage;