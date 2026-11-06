# Product Requirements Document (PRD)

## 1. Overview

**Product Name:** Arthora
**Target Users:** Indian retail investors (individuals) + Personal use
**Platforms:** Web (Next.js), Mobile (Flutter — chosen for single codebase, native performance, free)
**Deployment:** Railway (backend) + Vercel (frontend web) — both have generous free tiers
**Auth:** Email + Google OAuth (Firebase Auth — free tier up to 50K MAU)
**Monetization:** Free MVP (personal use), future: freemium with premium AI insights

## 2. Goals

1. Help Indian retail investors make informed decisions via AI-guided portfolio suggestions
2. Provide comprehensive self-directed research tools for mutual funds and Indian stocks
3. Democratize access to financial data through free APIs
4. Create a visually distinct, accessible fintech experience for Indian market

## 3. Modes Overview

### MODE 1 — AI-Guided Investment Suggestions
- User inputs:
  - Financial goal (free text): "buy a house in 5 years", "child's education in 12 years"
  - Time period: 1 year to 30 years (slider/dropdown)
  - Risk level: Low / Medium / High (with volatility description)
  - Monthly investable amount (optional but recommended)
  - Current age (optional, for goal-based adjustments)
- AI reads the prompt and profile, then outputs:
  - Optimal portfolio model (1-fund to 6-fund portfolio)
  - Specific Indian mutual fund schemes (AMFI registered, with ISIN codes)
  - Specific Indian stocks (NSE/BSE listed, with ticker symbols)
  - Allocation percentages per fund/stock
  - One-liner explanation: "This fund is perfect for you because..."
  - Projected value at goal date (using Monte Carlo simulation)
  - Rebalancing frequency recommendation
- All suggestions link to verified real assets with ISIN/ticker
- Disclaimers: "This is educational guidance, not SEBI-registered investment advice"

### MODE 2 — Self-Directed Research
- Search any mutual fund by name, ISIN, or AMFI scheme code
- Search any Indian stock by name or NSE/BSE ticker
- Display comprehensive metrics (see Features)
- Favorite/watchlist functionality
- Compare multiple funds/stocks side-by-side
- Historical NAV/price charts with technical indicators
- PDF report generation for fund/stock analysis

## 4. Features

### Core Features
- [ ] Email + Google OAuth authentication
- [ ] AI goal-based portfolio builder (Mode 1)
- [ ] Comprehensive mutual fund research (Mode 2)
- [ ] Indian stock research with all key metrics
- [ ] Persistent watchlists and favorites
- [ ] Portfolio tracking and performance monitoring
- [ ] Historical charts and visualizations
- [ ] PDF report export
- [ ] Dark/light mode toggle
- [ ] Responsive mobile web + native mobile app

### Research Features (Mode 2 Detail)
**Mutual Funds:**
- Expense ratio (latest and trend)
- CAGR (1Y, 3Y, 5Y, 10Y)
- XIRR calculation
- Sharpe ratio, Sortino ratio
- Alpha, Beta
- Standard deviation
- Maximum drawdown
- Rolling returns (1Y, 3Y, 5Y rolling windows)
- Fund manager name and tenure
- AUM and AUM trend
- Portfolio holdings breakdown (top 10 + pie chart)
- Sector allocation (pie chart)
- Market cap allocation (large/mid/small cap)
- NAV history graph (timeframes: 1M, 3M, 6M, 1Y, 3Y, 5Y, max)
- Drawdown chart over time
- Peer comparison table (same category funds)
- SIP return calculator
- Lump-sum return calculator
- Exit load details
- Fund category and benchmark

**Stocks:**
- P/E ratio (TTM and forward)
- P/B ratio
- Dividend yield
- Market cap and classification (large/mid/small)
- Revenue and profit (annual and quarterly)
- Debt-to-equity ratio
- ROE, ROCE, ROA
- Promoter holding % (and change)
- FII/DII holding %
- 52-week high/low
- Beta
- EPS (TTM and YoY growth)
- Price history with all timeframes
- Volume analysis
- Technical indicators (RSI, MACD, Moving Averages)
- Similar stocks in same sector

## 5. User Personas

| Persona | Description | Key Need |
|---------|-------------|----------|
| Beginner Ravi | 25yo, first job, wants to start SIP | AI-guided, simple, jargon-free |
| Busy Priya | 35yo, IT professional, no time to research | Quick research, watchlists, mobile-first |
| Analytical Amit | Experienced investor, data-driven | Deep metrics, comparison tools, charts |
| Retired Rao | 65yo, capital preservation focus | Low-risk options, stable returns, easy UI |
| Parent Pooja | Saving for child's education in 10 years | Goal-based planning, projection tools |

## 6. Success Metrics

- Users able to create a goal-based plan in < 2 minutes
- Fund/stock data loads in < 3 seconds (with caching)
- Search returns relevant results in < 500ms
- Full research page renders in < 2 seconds
- Mobile app launch time < 2 seconds
- User retention (7-day) > 30%

## 7. Regulatory Considerations

- Include mandatory disclaimers: "Not SEBI registered investment advisory"
- Data sourced from public APIs (AMFI, Yahoo Finance)
- No P2P lending or transaction execution (informational only)
- GDPR/India DPDP Act compliance for user data
- Secure storage of minimal user data (no PII beyond email/name)

## 8. Future Roadmap

1. SIP calculator with step-up SIP projections
2. Tax-loss harvesting suggestions
3. ELSS (tax-saving fund) recommendations
4. Integration with brokers (Zerodha, Groww) via Kite Connect (paid)
5. Portfolio rebalancing alerts
6. News sentiment analysis for holdings
7. Voice input for goals ("I want to buy a house in Mumbai")

## 9. Non-Functional Requirements

- **Availability:** 99.5% uptime (7.3h downtime/month max on free tier acceptable)
- **Performance:** 90th percentile API response < 500ms (cached), < 3s (uncached)
- **SEO:** Web pages must be SEO-optimized for fund names and stock tickers
- **Accessibility:** WCAG 2.1 AA compliance
- **Internationalization:** English first, Hindi/Marathi/Tamil future
- **Security:** JWT tokens, HTTPS only, no sensitive financial data stored

## 10. Assumptions and Constraints

- mfapi.in remains free and stable
- yfinance/yahoo-finance2 library remains functional for Indian stocks
- No brokerage integration in MVP
- No real-money transactions (view-only app)
- Free tier limits: Railway (500hrs/mo), Vercel (100GB/mo), MongoDB Atlas (M0 cluster)
