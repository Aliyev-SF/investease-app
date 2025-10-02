// Contextual coaching messages for different scenarios

export const coachingMessages = {
  welcome: "Welcome to your practice portfolio! You're starting with $10,000 in virtual money. This is a safe space to learn investing without any real risk. Take your time exploring the market below.",
  
  firstTrade: "🎉 Congratulations on your first trade! You've taken an important step in building your investment confidence. Remember, this is practice mode - feel free to experiment and learn.",
  
  diversification: "Great job diversifying! You now own multiple stocks, which helps spread risk. Professional investors recommend holding 10-20 different investments for a well-balanced portfolio.",
  
  etfPurchase: "Smart choice with an ETF (Exchange-Traded Fund)! ETFs automatically give you exposure to many companies at once, making diversification easier. They're often recommended for beginners.",
  
  firstSell: "You've completed your first sell order! Knowing when to sell is just as important as knowing when to buy. Practice helps you develop confidence in both decisions.",
  
  profitTaken: (data) => `Nice work taking a profit! You made $${data.profit} on ${data.symbol}. Remember, in real investing, profits are only 'realized' when you sell. This is how wealth building works!`,
  
  lossSell: "You sold at a loss, but that's okay - it's part of learning! In practice mode, losses help you understand market volatility and the importance of research before buying.",
  
  cashHeavy: "You're holding a lot of cash right now. Remember, money sitting in cash doesn't grow. Consider investing more of your available balance to practice portfolio management.",
  
  fullyInvested: "You're fully invested with minimal cash reserves. In real investing, keeping 5-10% in cash gives you flexibility to take advantage of opportunities.",
  
  marketVolatility: "Notice how stock prices change? This is normal market behavior. Real markets can be more volatile! Use this practice time to get comfortable with price movements."
};

export function getCoachingMessage(scenario, data = {}) {
  const message = coachingMessages[scenario];
  
  // If message is a function, call it with data
  if (typeof message === 'function') {
    return message(data);
  }
  
  return message || coachingMessages.welcome;
}