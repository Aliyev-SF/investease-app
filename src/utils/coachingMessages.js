// AI Coaching messages that appear based on user actions
export const coachingMessages = {
  welcome: {
    title: "👋 Welcome to Practice Mode!",
    message: "I'm here to help you learn investing safely. You have $10,000 in virtual money to practice with.",
    tip: "💡 First Step: Try buying an ETF like VTI or SPY for instant diversification!"
  },
  
  firstTrade: {
    title: "🎉 Great job on your first practice trade!",
    message: "Remember, this is virtual money - perfect for learning without risk. Take time to explore different stocks and see how they behave."
  },
  
  etfPurchase: {
    title: "✅ Smart Choice!",
    message: "ETFs (Exchange-Traded Funds) are baskets of many stocks. They're great for beginners because they provide instant diversification - you're not putting all your eggs in one basket!"
  },
  
  diversification: {
    title: "🎯 Excellent Diversification!",
    message: "Nice move! Buying different types of stocks helps spread your risk. Even experienced investors use diversification as a key strategy."
  },
  
  volatileStock: {
    title: "⚠️ Heads Up - Volatile Stock",
    message: "This stock has been volatile lately. Volatility isn't necessarily bad, but it means the price swings more dramatically. Consider your comfort with ups and downs."
  },
  
  lowBalance: {
    title: "💰 Running Low on Cash",
    message: "You're using most of your practice money. In real investing, it's good to keep some cash available for opportunities or emergencies."
  }
};

// Function to get appropriate coaching message based on action
export function getCoachingMessage(action) {
  switch(action) {
    case 'welcome':
      return coachingMessages.welcome;
    case 'firstTrade':
      return coachingMessages.firstTrade;
    case 'etfPurchase':
      return coachingMessages.etfPurchase;
    case 'diversification':
      return coachingMessages.diversification;
    case 'volatileStock':
      return coachingMessages.volatileStock;
    case 'lowBalance':
      return coachingMessages.lowBalance;
    default:
      return null;
  }
}