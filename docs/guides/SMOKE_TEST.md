# Production Smoke Test Checklist

Run after every production deployment.

## Authentication
- [ ] POST /api/v1/auth/register with new email → 201, tokens returned
- [ ] POST /api/v1/auth/login → 200, access + refresh tokens
- [ ] GET /api/v1/auth/me with valid token → 200, user object
- [ ] GET /api/v1/auth/me with expired/missing token → 401
- [ ] POST /api/v1/auth/refresh → 200, new tokens
- [ ] POST /api/v1/auth/login 11 times rapidly → 429 on 11th

## Fund Data
- [ ] GET /api/v1/funds/search?q=HDFC → 200, results with pagination
- [ ] GET /api/v1/funds/search?q=HDFC (second call) → 200, X-Cache-Hit header or sub-50ms response
- [ ] GET /api/v1/funds/118834 → 200, fund detail with latestNAV
- [ ] GET /api/v1/funds/118834/metrics → 200 or 202 with pollUrl
- [ ] GET /api/v1/funds/118834/nav-history?timeframe=1Y → 200, dates + navs arrays

## Stock Data
- [ ] GET /api/v1/stocks/search?q=RELIANCE → 200, results
- [ ] GET /api/v1/stocks/RELIANCE → 200, stock detail with current price
- [ ] GET /api/v1/stocks/RELIANCE/technical → 200, RSI + MACD data

## AI Portfolio
- [ ] POST /api/v1/portfolios (authenticated) → 202, portfolioId + pollUrl
- [ ] GET /api/v1/portfolios/:id/status → { status: 'pending'|'generating'|'completed' }
- [ ] Wait 30s → GET /api/v1/portfolios/:id/status → { status: 'completed', portfolio: {...} }
- [ ] Portfolio allocation ISINs match pattern IN[A-Z0-9]{10}
- [ ] Portfolio allocationPercent sum = 100

## Watchlist
- [ ] POST /api/v1/favorites with fund → 201
- [ ] POST /api/v1/favorites same fund → 409
- [ ] GET /api/v1/favorites → 200, enriched with NAV
- [ ] DELETE /api/v1/favorites/:id → 204

## Reports
- [ ] POST /api/v1/reports/fund-analysis → 202, reportId
- [ ] GET /api/v1/reports/:reportId → { status: 'pending' }
- [ ] Wait 60s → GET /api/v1/reports/:reportId → { status: 'completed', downloadUrl }
- [ ] GET /api/v1/reports/:reportId/download → PDF file streamed

## Health
- [ ] GET /api/v1/health → { status: 'ok', services: { mongodb: 'connected', redis: 'connected' } }

## Security Headers
Run: curl -I https://api.arthora.in/api/v1/health
- [ ] X-Frame-Options: DENY present
- [ ] X-Content-Type-Options: nosniff present
- [ ] Strict-Transport-Security present

## Web Frontend
- [ ] https://arthora.in loads landing page
- [ ] /login page renders auth form
- [ ] /register → create account → redirect to /ai
- [ ] /ai → GoalInputForm renders
- [ ] Submit goal → PollingLoader shows
- [ ] Portfolio result renders with charts
- [ ] /research → search "HDFC" → fund results appear
- [ ] /research/fund/118834 → fund detail loads with NAV chart
- [ ] /watchlist → shows added favorites
