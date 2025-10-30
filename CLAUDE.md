# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Architecture Overview

### High-Level Structure
```
src/
├── pages/              # Route-level components
├── components/         # Reusable UI components
│   └── brand/icons/    # Custom SVG icons
├── services/           # External API integrations
├── utils/              # Helper functions
└── App.jsx             # Root component with routing
```

### Data Flow Architecture

**Authentication & User State**
- Supabase Auth manages user sessions
- App.jsx loads user profile on mount
- userData passed as prop to all pages (not context)
- Profile includes: id, email, name, age, experience, confidence_score

**Virtual Trading System**
1. User starts with $10,000 virtual cash in portfolios table
2. Buy/Sell creates transaction record in transactions table
3. Holdings table tracks shares + average_price per symbol
4. Portfolio table updates cash + total_value after each trade
5. Confidence score recalculated after trade using confidenceCalculator.js

**Market Data Integration**
- market_data table: stock/ETF base data (current_price, change, pe_ratio, etc.)
- market_data_history table: historical price data for charts
- Alpha Vantage API fetches real-time prices (rate limited: 5/min, 25/day)
- alphaVantageService.js manages API calls + rate limiting
- Admin-only refresh button updates market_data from API

**Confidence Scoring System**
- Range: 0-10, starts at 3.2 from initial assessment
- Factors: trades (+0.4 ea, cap +2.0), diversification (+0.5/stock, bonus +1.5 for 3+), lessons (+0.3 ea, cap +1.5), profitable trades (+1.0 first), days active (+0.1/day, cap +0.8)
- Stored in profiles.confidence_score
- History tracked in confidence_history table
- recalculateConfidenceAfterTrade() in utils/confidenceCalculator.js

### Key Pages & Purpose

**LoginPage** - Auth entry, checks existing session
**AssessmentPage** - New users: 3 questions → initial confidence score
**DashboardPage** - Overview: portfolio value, top holdings, recent activity
**MarketPage** - Main trading interface with tabs:
  - Market (Stocks/ETFs views with buy/sell)
  - Portfolio (Holdings/Transactions views)
  - Watchlist (tracked stocks)
**StockDetailPage** - Deep dive on single stock with 8 educational sections
**PortfolioPage** - Holdings management
**HistoryPage** - Transaction history
**ProgressPage** - Confidence score + learning progress
**LearnPage** - Educational lessons
**AnalyticsDashboardPage** - Platform analytics (admin)

### Stock Detail Page Architecture

Route: `/stock/:symbol`

**8 Educational Components:**
1. StockHero - Price, change, social proof
2. StockActions - Sticky buy/sell/learn buttons
3. StockAbout - Company description, sector/industry
4. StockPriceContext - 52-week range, today's trading range
5. StockMetrics - P/E ratio, market cap, dividend (with tooltips)
6. StockCommunity - User ownership stats, avg returns
7. StockPersonalized - User's holdings, buying power, suggestions
8. StockRisk - Volatility, loss scenarios, protection strategies

**Navigation:** Clickable stock symbols throughout app (StockTable, StockCardsMobile, WatchlistView, HoldingsView) navigate to `/stock/:symbol`

### Database Schema (Key Tables)

**User & Auth**
- profiles: user_id, email, name, age, experience, confidence_score

**Portfolio System**
- portfolios: user_id, cash, total_value, holdings (JSONB - deprecated), updated_at
- holdings: user_id, symbol, shares, average_price, notes, target_price, alert_enabled
- transactions: user_id, symbol, type (buy/sell), shares, price, total, profit_loss, timestamp

**Market Data**
- market_data: symbol, name, current_price, change, change_percent, pe_ratio, market_cap, dividend_yield, week_52_high, week_52_low, sector, industry, icon, type (stock/etf)
- market_data_history: symbol, date, open_price, high_price, low_price, close_price, volume

**Learning & Progress**
- lessons: slug, title, description, category, difficulty, duration_minutes
- user_lesson_progress: user_id, lesson_slug, completed, time_spent_seconds
- glossary_terms: slug, term, category, difficulty

**Analytics & Tracking**
- page_views: user_id, page_name, page_path, viewed_at
- user_sessions: user_id, session_start, session_end, duration_seconds
- analytics_events: user_id, event_type, event_data (JSONB)
- confidence_history: user_id, score, recorded_at

**Social Features**
- watchlist: user_id, symbol
- lesson_suggestions: user_id, lesson_slug, page, shown_at, clicked, dismissed

**Views (Aggregated Data)**
- popular_stocks: symbol, owner_count, total_shares_held, avg_purchase_price, avg_return_percent
- platform_stats: total_users, total_trades, avg_confidence_score, etc.
- user_portfolio_summary: per-user aggregations
- most_traded_stocks: trading volume metrics

### Supabase RLS Patterns

All user tables use Row Level Security:
```sql
-- Standard pattern for user-scoped tables
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
ON table_name FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON table_name FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

market_data and views: SELECT policy for all authenticated users
Admin operations: Handled outside app (Supabase dashboard)

### Key Services

**alphaVantageService.js**
- fetchStockQuote(symbol) - Get real-time quote
- fetchStockHistory(symbol, range) - Historical data
- Rate limiting: 5 calls/min, 25 calls/day
- Caches in market_data + market_data_history tables

**marketDataService.js**
- getAllMarketData() - Fetch all stocks/ETFs
- getStockBySymbol(symbol) - Single stock lookup
- updateMarketData(symbol, data) - Admin update

**portfolioService.js**
- getPortfolio(userId) - Fetch user portfolio
- buyStock(userId, symbol, shares, price) - Execute buy
- sellStock(userId, symbol, shares, price) - Execute sell
- Handles: transaction creation, holdings update, portfolio balance update

### Key Utilities

**confidenceCalculator.js**
- recalculateConfidenceAfterTrade(userId) - Main calculation
- Factors in: trades, diversification, lessons, profitability, days active
- Updates profiles.confidence_score + confidence_history

**stockCalculations.js**
- calculatePricePosition(current, low, high) - 52-week position
- calculateVolatility(stock) - Low/moderate/high assessment
- calculateAffordableShares(price, cash) - Buying power suggestions
- formatMarketCap(value) - Human-readable format
- calculateLossScenarios(shares, price) - Risk education

**analytics.js**
- trackPageView(userId, pageName, pagePath)
- trackEvent(userId, eventType, eventData)

**suggestionHelper.js**
- getSuggestionForContext(userId, context) - Contextual lesson suggestions
- trackSuggestionShown/Clicked/Dismissed

### Component Patterns

**Desktop vs Mobile**
- Components often split: StockTable (desktop), StockCardsMobile (mobile)
- Responsive wrapper components: `<div className="hidden lg:block">` for desktop, `<div className="lg:hidden">` for mobile
- Tailwind breakpoint: `lg:` = 1024px+

**Trade Modal Pattern**
- TradeModal.jsx: Reusable buy/sell modal
- Props: stock, type (buy/sell), userHoldings, onClose, onSuccess
- Integrated in: MarketPage, StockDetailPage, WatchlistView, HoldingsView

**Watchlist Button Pattern**
- WatchlistButton.jsx: Reusable heart icon toggle
- Optimistic UI updates (updates immediately, syncs to DB)
- Used in: StockTable, StockCardsMobile, WatchlistView, StockHero

### Educational Design Patterns

**Tooltips for Jargon**
- Hover info icon (?) shows explanation
- Example: P/E Ratio tooltip explains price-to-earnings

**Plain Language**
- "Practice investing" not "paper trading"
- "Build confidence" not "learn strategies"
- Concrete examples: "If stock drops 20%, you'd lose $X"

**Social Proof**
- "47 investors own this stock"
- "Average return: +12.3%"
- Builds confidence through community validation

**Progressive Disclosure**
- Start simple (StockHero: just price + change)
- Expand details (StockMetrics: P/E, market cap)
- Advanced concepts last (StockRisk: volatility, scenarios)

### Common Workflows

**User Trading Flow**
1. Browse MarketPage → Click stock symbol
2. Navigate to StockDetailPage
3. Review 8 educational sections
4. Click Buy button → TradeModal opens
5. Enter shares → Preview total cost
6. Confirm → portfolioService.buyStock()
7. Update holdings, portfolio, transactions
8. Recalculate confidence score
9. Show success toast
10. Refresh StockDetailPage data

**Confidence Score Update Flow**
1. User completes action (trade, lesson, login)
2. Call recalculateConfidenceAfterTrade(userId)
3. Query user data: trades, holdings, lessons, profitable trades, account age
4. Calculate new score (0-10 range)
5. Update profiles.confidence_score
6. Insert record in confidence_history
7. Return new score to UI
8. Update confidence badge in navbar

**Market Data Refresh Flow**
1. Admin clicks refresh button (admin only)
2. Loop through symbols in market_data
3. For each: alphaVantageService.fetchStockQuote()
4. Rate limit: wait between calls (5/min limit)
5. Update market_data table
6. Update market_data_history for charting
7. Show success/error messages

### Navigation Structure

App.jsx routes:
- `/` → DashboardPage
- `/market` → MarketPage (with tab/view query params)
- `/stock/:symbol` → StockDetailPage
- `/portfolio` → PortfolioPage
- `/history` → HistoryPage
- `/progress` → ProgressPage
- `/learn` → LearnPage
- `/analytics` → AnalyticsDashboardPage

Query params for MarketPage:
- `?tab=market` (default) | `portfolio` | `watchlist`
- `&view=stocks` (default) | `etfs` | `holdings` | `transactions`

### Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### Common Gotchas

**Import Paths**
- Stock Detail components in `src/components/` (not `src/components/stock-detail/`)
- Supabase client: `import { supabase } from '../utils/supabase'` (not `../supabaseClient`)

**User Data Prop**
- userData passed as prop (not context)
- Contains: id, email, name, age, experience, confidence_score

**Market Data Admin Only**
- Don't modify market_data from user-facing features
- Use admin button for API refresh
- Alpha Vantage rate limits apply

**RLS Testing**
- Always test with fresh user account
- Check Supabase logs for RLS policy errors
- Use `.maybeSingle()` for optional data (e.g., holdings that might not exist)

**Optimistic UI**
- Update UI immediately for better UX
- Sync to Supabase in background
- Revert on error with toast notification

### File Commenting Standard

Every file starts with:
```javascript
// src/path/to/file.jsx
// Brief description of file purpose
// Any special notes (e.g., "UPDATED - Uses new holdings table")
```

Within files, comment:
- Complex logic sections
- Important state management
- Business rules (e.g., "Can't sell more shares than owned")
- API integration points
- Database queries

See existing files for examples.
