// src/utils/lessonLoader.js

// Lesson metadata - matches Supabase
export const lessonMetadata = {
  'what-is-investing': {
    id: 'what-is-investing',
    title: 'What is Investing?',
    slug: 'what-is-investing',
    category: 'getting-started',
    difficulty: 'beginner',
    duration: 3,
    order: 1,
    description: 'Learn the basics of what investing means and why it matters',
    icon: '🎓'
  },
  'first-trade-explained': {
    id: 'first-trade-explained',
    title: 'Your First Trade Explained',
    slug: 'first-trade-explained',
    category: 'getting-started',
    difficulty: 'beginner',
    duration: 4,
    order: 2,
    description: 'Understand what just happened when you made your first trade',
    icon: '🎯'
  },
  'how-to-pick-stock': {
    id: 'how-to-pick-stock',
    title: 'How to Pick a Stock',
    slug: 'how-to-pick-stock',
    category: 'stock-basics',
    difficulty: 'beginner',
    duration: 5,
    order: 3,
    description: 'Learn the fundamentals of researching and choosing stocks',
    icon: '🔍'
  },
  'buy-vs-sell-timing': {
    id: 'buy-vs-sell-timing',
    title: 'When to Buy vs When to Sell',
    slug: 'buy-vs-sell-timing',
    category: 'stock-basics',
    difficulty: 'intermediate',
    duration: 5,
    order: 4,
    description: 'Understand timing strategies and decision-making',
    icon: '⏰'
  },
  'understanding-portfolio': {
    id: 'understanding-portfolio',
    title: 'Understanding Your Portfolio',
    slug: 'understanding-portfolio',
    category: 'portfolio-management',
    difficulty: 'beginner',
    duration: 4,
    order: 5,
    description: 'Learn how to read and analyze your portfolio performance',
    icon: '📊'
  }
};

// Category metadata
export const categories = {
  'getting-started': {
    name: 'Getting Started',
    icon: '🎓',
    description: 'Essential basics for new investors',
    color: 'primary'
  },
  'stock-basics': {
    name: 'Stock Basics',
    icon: '📈',
    description: 'Learn how to research and trade stocks',
    color: 'success'
  },
  'portfolio-management': {
    name: 'Portfolio Management',
    icon: '💼',
    description: 'Manage your investments effectively',
    color: 'warning'
  }
};

// Get all lessons
export const getAllLessons = () => {
  return Object.values(lessonMetadata);
};

// Get lessons by category
export const getLessonsByCategory = (category) => {
  return Object.values(lessonMetadata).filter(lesson => lesson.category === category);
};

// Get lesson by slug
export const getLessonBySlug = (slug) => {
  return lessonMetadata[slug];
};

// Get next lesson
export const getNextLesson = (currentSlug) => {
  const allLessons = getAllLessons().sort((a, b) => a.order - b.order);
  const currentIndex = allLessons.findIndex(l => l.slug === currentSlug);
  return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
};

// Get previous lesson
export const getPreviousLesson = (currentSlug) => {
  const allLessons = getAllLessons().sort((a, b) => a.order - b.order);
  const currentIndex = allLessons.findIndex(l => l.slug === currentSlug);
  return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
};

// Lesson content (in a real app, these would be loaded from markdown files)
// For now, we'll use simplified content
export const lessonContent = {
  'what-is-investing': `
    <h1>What is Investing?</h1>
    <p class="lead">Welcome to your investing journey! 🎉</p>
    
    <h2>The Big Picture</h2>
    <p><strong>Investing</strong> means using your money to buy things that might grow in value over time. Instead of just saving money in a bank account, you put it to work.</p>
    
    <p>Think of it like planting a seed:</p>
    <ul>
      <li>💰 <strong>Saving</strong> = Putting seeds in a jar (they stay the same)</li>
      <li>🌱 <strong>Investing</strong> = Planting seeds in soil (they can grow!)</li>
    </ul>

    <h2>Why Do People Invest?</h2>
    
    <h3>1. Beat Inflation</h3>
    <p>Your $100 today won't buy as much in 10 years. Investing helps your money grow faster than prices rise.</p>
    
    <h3>2. Build Wealth</h3>
    <p>Small amounts invested regularly can grow into large amounts over time thanks to <strong>compound growth</strong> (earning money on your earnings!).</p>
    
    <h3>3. Reach Goals</h3>
    <p>Investing can help you afford:</p>
    <ul>
      <li>A home down payment</li>
      <li>Retirement</li>
      <li>Your kids' education</li>
      <li>Financial freedom</li>
    </ul>

    <h2>What Can You Invest In?</h2>
    
    <h3>Stocks 📈</h3>
    <p>Own a piece of a company. If the company does well, your stock value goes up!</p>
    <p><strong>Example:</strong> Buying Apple stock = owning a tiny piece of Apple</p>
    
    <h3>ETFs 🎯</h3>
    <p>A basket of many stocks bundled together. Great for beginners because it spreads risk.</p>
    <p><strong>Example:</strong> S&P 500 ETF = owning pieces of 500 big companies at once</p>

    <h2>The Most Important Thing: Time</h2>
    <p>The earlier you start investing, the more time your money has to grow. Even $50/month invested at age 25 can become over $100,000 by retirement!</p>

    <h2>Key Takeaways</h2>
    <ul>
      <li>✅ Investing = Putting money to work to grow over time</li>
      <li>✅ It helps beat inflation and build wealth</li>
      <li>✅ Stocks and ETFs are great places to start</li>
      <li>✅ Time is your best friend - start early!</li>
      <li>✅ You don't need a lot of money to begin</li>
    </ul>

    <p class="text-center mt-6">
      <strong>Ready to Start?</strong><br>
      You're already practicing with virtual money on InvestEase! This is the perfect way to learn without risk.
    </p>
  `,
  
  'first-trade-explained': `
    <h1>Your First Trade Explained</h1>
    <p class="lead">Congratulations on making your first trade! 🎉 Let's break down exactly what just happened.</p>

    <h2>What You Just Did</h2>
    <p>When you clicked "Buy" on a stock, here's what happened behind the scenes:</p>

    <h3>Step 1: You Placed an Order</h3>
    <p>You told the market: "I want to buy X shares of this company at the current price."</p>

    <h3>Step 2: The Trade Executed</h3>
    <p>Your order was matched with someone willing to sell. Money exchanged hands (virtually!).</p>

    <h3>Step 3: You Became a Shareholder</h3>
    <p>You now own a piece of that company! You're a shareholder. 🎊</p>

    <h2>Understanding Your Purchase</h2>
    <p>Let's say you bought <strong>5 shares of AAPL at $150 each</strong>:</p>
    <ul>
      <li><strong>Total Cost:</strong> $750 (5 × $150)</li>
      <li><strong>You Now Own:</strong> 5 shares of Apple</li>
      <li><strong>Your Cash:</strong> Decreased by $750</li>
      <li><strong>Your Portfolio Value:</strong> Stays the same (you traded cash for stock)</li>
    </ul>

    <h2>What Happens Next?</h2>
    
    <h3>The Stock Price Will Move</h3>
    <p>Stock prices change constantly based on:</p>
    <ul>
      <li>Company news</li>
      <li>Earnings reports</li>
      <li>Market sentiment</li>
      <li>Economic conditions</li>
    </ul>

    <h3>You Might Make Money... Or Lose Some</h3>
    <ul>
      <li>📈 <strong>Price goes up:</strong> You have an <strong>unrealized gain</strong> (profit on paper)</li>
      <li>📉 <strong>Price goes down:</strong> You have an <strong>unrealized loss</strong> (loss on paper)</li>
    </ul>
    <p><strong>Important:</strong> You only actually gain or lose money when you <strong>sell</strong>!</p>

    <h2>Should You Check the Price Every Day?</h2>
    <p><strong>Short answer:</strong> No! 😅</p>
    <p>Here's why:</p>
    <ul>
      <li>Stocks go up and down daily - that's normal</li>
      <li>Long-term investors think in years, not days</li>
      <li>Checking constantly can cause stress and bad decisions</li>
      <li>Focus on the company's fundamentals, not daily noise</li>
    </ul>

    <h2>Key Takeaways</h2>
    <ul>
      <li>✅ You're now a shareholder - congratulations!</li>
      <li>✅ Prices will fluctuate - that's completely normal</li>
      <li>✅ You only gain/lose money when you sell</li>
      <li>✅ Don't check prices obsessively</li>
      <li>✅ Focus on the long-term</li>
    </ul>

    <p class="text-center mt-6">
      <strong>Practice Makes Perfect</strong><br>
      Remember, you're using virtual money right now. This is the PERFECT time to make mistakes and learn!
    </p>
  `,
  
  'how-to-pick-stock': `
    <h1>How to Pick a Stock</h1>
    <p class="lead">Picking stocks can feel overwhelming, but with a simple framework, you can make informed decisions! 🎯</p>

    <h2>The 5-Question Framework</h2>
    <p>Before buying any stock, ask yourself these 5 questions:</p>

    <h3>1. Do I Understand What This Company Does?</h3>
    <p><strong>Why this matters:</strong> Never invest in something you don't understand.</p>
    <p><strong>Good signs:</strong></p>
    <ul>
      <li>✅ You can explain their business in one sentence</li>
      <li>✅ You use their products/services</li>
      <li>✅ Their revenue model makes sense</li>
    </ul>

    <h3>2. Is the Company Growing?</h3>
    <p><strong>Why this matters:</strong> Growing companies tend to have rising stock prices.</p>
    <p><strong>What to check:</strong></p>
    <ul>
      <li>📈 Revenue increasing year-over-year</li>
      <li>📈 Growing customer base</li>
      <li>📈 Expanding into new markets</li>
    </ul>

    <h3>3. Is the Company Profitable?</h3>
    <p><strong>Why this matters:</strong> Profitable companies can reinvest in growth and reward shareholders.</p>

    <h3>4. Is the Stock Price Reasonable?</h3>
    <p><strong>Simple checks:</strong></p>
    <ul>
      <li>P/E Ratio compared to competitors</li>
      <li>Price compared to historical averages</li>
      <li>Analyst price targets</li>
    </ul>

    <h3>5. Does It Fit My Strategy?</h3>
    <p><strong>Questions to ask:</strong></p>
    <ul>
      <li>Am I investing for 5+ years?</li>
      <li>Do I want steady dividends?</li>
      <li>Can I handle volatility?</li>
      <li>Does this diversify my portfolio?</li>
    </ul>

    <h2>The Beginner-Friendly Approach</h2>
    
    <h3>Start With What You Know</h3>
    <p><strong>Good first stocks:</strong></p>
    <ul>
      <li>Companies whose products you love</li>
      <li>Brands you trust</li>
      <li>Industries you understand</li>
    </ul>

    <h3>Consider ETFs First</h3>
    <p><strong>Why ETFs are great for beginners:</strong></p>
    <ul>
      <li>✅ Instant diversification (100+ companies in one purchase)</li>
      <li>✅ Lower risk than individual stocks</li>
      <li>✅ Professional management</li>
      <li>✅ Easy to understand (S&P 500 = top 500 US companies)</li>
    </ul>

    <h2>Key Takeaways</h2>
    <ul>
      <li>✅ Use the 5-Question Framework</li>
      <li>✅ Only invest in companies you understand</li>
      <li>✅ Check growth, profitability, and price</li>
      <li>✅ Start with companies you know</li>
      <li>✅ Consider ETFs for instant diversification</li>
    </ul>
  `,
  
  'buy-vs-sell-timing': `
    <h1>When to Buy vs When to Sell</h1>
    <p class="lead">Timing is one of the hardest parts of investing. Let's learn smart strategies! ⏰</p>

    <h2>The Truth About Timing</h2>
    <p>Nobody can predict the market. Even professional investors can't time it perfectly.</p>
    <p><strong>The good news:</strong> You don't need perfect timing to make money. You just need good strategy.</p>

    <h2>When to BUY</h2>

    <h3>Strategy 1: Dollar-Cost Averaging (DCA)</h3>
    <p><strong>What it is:</strong> Invest the same amount regularly (weekly, monthly) regardless of price.</p>
    <p><strong>Why it works:</strong></p>
    <ul>
      <li>✅ Removes emotion from decisions</li>
      <li>✅ You buy more shares when prices are low</li>
      <li>✅ Averages out market volatility</li>
    </ul>

    <h3>Strategy 2: Buy the Dip</h3>
    <p><strong>What it is:</strong> Wait for price drops, then buy quality stocks "on sale."</p>
    <p><strong>When to do it:</strong></p>
    <ul>
      <li>Market has a temporary panic</li>
      <li>Good company drops for no fundamental reason</li>
      <li>Overall market correction (10-20% drop)</li>
    </ul>

    <h2>When to SELL</h2>

    <h3>Good Reason #1: Your Investment Thesis Changed</h3>
    <p>The reason you bought the stock is no longer true.</p>
    <p><strong>Examples:</strong></p>
    <ul>
      <li>Company loses its competitive advantage</li>
      <li>Management makes terrible decisions</li>
      <li>Industry is dying</li>
    </ul>

    <h3>Good Reason #2: Need the Money</h3>
    <p><strong>When it's okay:</strong></p>
    <ul>
      <li>Emergency fund depleted</li>
      <li>Planned expense (house down payment, tuition)</li>
      <li>Retirement and you need income</li>
    </ul>

    <h3>BAD Reasons to Sell ❌</h3>
    <ul>
      <li>Panic selling: Price dropped and you're scared</li>
      <li>Daily volatility: Stock went down today</li>
      <li>Envy: Another stock is performing better</li>
      <li>Boredom: Stock hasn't moved in months</li>
    </ul>

    <h2>The "Hold" Strategy</h2>
    <p>Sometimes the best action is NO action!</p>
    <p><strong>When to just hold:</strong></p>
    <ul>
      <li>✅ Company fundamentals are still strong</li>
      <li>✅ Your investment thesis hasn't changed</li>
      <li>✅ You're investing for the long term</li>
      <li>✅ You don't need the money right now</li>
    </ul>

    <h2>Key Takeaways</h2>
    <ul>
      <li>✅ Nobody can time the market perfectly</li>
      <li>✅ <strong>Buy:</strong> Use dollar-cost averaging</li>
      <li>✅ <strong>Sell:</strong> When your investment thesis changes</li>
      <li>✅ <strong>Hold:</strong> Most of the time, if fundamentals are strong</li>
      <li>✅ <strong>Avoid:</strong> Emotional decisions and panic moves</li>
    </ul>
  `,
  
  'understanding-portfolio': `
    <h1>Understanding Your Portfolio</h1>
    <p class="lead">Your portfolio is like a garden - it needs attention, but not constant fussing! 🌱</p>

    <h2>What is a Portfolio?</h2>
    <p>Your <strong>portfolio</strong> is the complete collection of all your investments:</p>
    <ul>
      <li>Stocks you own</li>
      <li>ETFs you hold</li>
      <li>Cash available to invest</li>
    </ul>

    <h2>Key Portfolio Metrics</h2>

    <h3>1. Total Portfolio Value</h3>
    <p><strong>What it is:</strong> The current worth of everything you own.</p>
    <p><strong>Formula:</strong> Total Value = Cash + (Shares × Current Stock Prices)</p>

    <h3>2. Total Gain/Loss</h3>
    <p><strong>What it is:</strong> How much money you've made or lost overall.</p>
    <p><strong>Formula:</strong> Total Gain/Loss = Current Value - Total Invested</p>

    <h3>3. Daily Change</h3>
    <p><strong>What it is:</strong> How much your portfolio value changed today.</p>
    <p><strong>Important:</strong> Don't obsess over it!</p>

    <h2>Portfolio Diversification</h2>
    <p><strong>Diversification</strong> = Not putting all eggs in one basket 🥚</p>

    <h3>Why It Matters</h3>
    <ul>
      <li>✅ Reduces risk</li>
      <li>✅ Smooths out volatility</li>
      <li>✅ Exposes you to different growth opportunities</li>
      <li>✅ Helps you sleep better at night!</li>
    </ul>

    <h3>Good Diversification for Beginners</h3>
    <p><strong>Simple Portfolio:</strong></p>
    <ul>
      <li>60% S&P 500 ETF (diversification in one!)</li>
      <li>30% Individual stocks you researched (3-5 companies)</li>
      <li>10% Cash (for opportunities and safety)</li>
    </ul>

    <h2>How Often Should You Check?</h2>
    <ul>
      <li>Daily? ❌ Too much!</li>
      <li>Weekly? 🟡 Maybe</li>
      <li>Monthly? ✅ Perfect!</li>
      <li>Quarterly? ✅ Also great!</li>
    </ul>

    <h2>Portfolio Health Checklist</h2>
    <ul>
      <li>✅ Diversified across 5-10 positions</li>
      <li>✅ Mix of stable and growth investments</li>
      <li>✅ 5-10% cash for opportunities</li>
      <li>✅ Matches your risk tolerance</li>
      <li>✅ You understand every holding</li>
      <li>✅ Rebalanced annually</li>
    </ul>

    <h2>Key Takeaways</h2>
    <ul>
      <li>✅ Portfolio = All your investments combined</li>
      <li>✅ Track total value, gains/losses, and individual positions</li>
      <li>✅ Diversify across companies, industries, and asset types</li>
      <li>✅ Check monthly or quarterly, not daily</li>
      <li>✅ Rebalance once or twice a year</li>
      <li>✅ Keep 5-10% in cash</li>
    </ul>

    <p class="text-center mt-6">
      <strong>Congratulations! You've completed the course! 🎉</strong>
    </p>
  `
};

// Get lesson content
export const getLessonContent = (slug) => {
  return lessonContent[slug] || '<p>Lesson content not found.</p>';
};