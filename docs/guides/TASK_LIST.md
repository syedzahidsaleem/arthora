# Numbered Task List (Dependency Order)

## Phase 1: Foundation (Weeks 1-2)

### Infrastructure & Setup
1. Initialize Next.js 14 project with App Router, TypeScript, Tailwind, ESLint **(frontend only, static export)**
2. Initialize Express.js backend project with TypeScript, ESLint
3. Initialize Flutter project (iOS + Android targets)
4. Configure MongoDB Atlas M0 cluster (Mumbai region `ap-south-1`)
5. Set up Redis via Upstash (free tier)
6. Configure Firebase Auth project (enable Email + Google OAuth, FCM)
7. Create `.env.example` with all required env vars (MONGODB_URI, REDIS_URL, FIREBASE_CONFIG, GEMINI_API_KEY)
8. Set up CI/CD pipeline via GitHub Actions (lint, type-check, test, deploy)
9. Create Dockerfile and docker-compose.yml for local dev (MongoDB + Redis + Express)
10. Set up Vercel project for Next.js static export (connect to Express backend via `NEXT_PUBLIC_API_URL`)

### Database & Models
11. Implement all Mongoose schemas (User, Portfolio, FundMetadata, FundNAVHistory, FundMetrics, FundHoldings, FundSectorAlloc, FundCategoryTop, StockMetadata, StockPriceHistory, StockMetrics, Favorite, SearchHistory, AISuggestionCache, Session, Report)
12. Create all MongoDB indexes (as defined in DATABASE_SCHEMA.md)
13. Set up Redis connection singleton with ioredis
14. Implement MongoDB connection singleton with graceful shutdown
15. Add `users.fcmTokens` array schema with cleanup logic (max 5 tokens per user)

### Auth Middleware (BEFORE auth endpoints — Blocker #5)
16. Implement Firebase Admin SDK initialization (server-side)
17. Build JWT validation middleware (`lib/middleware/authMiddleware.ts`)
18. Build rate limiting middleware (`lib/middleware/rateLimitMiddleware.ts`) — Redis sliding window
19. Build CORS middleware (`lib/middleware/corsMiddleware.ts`)
20. Build error handling middleware (`lib/middleware/errorMiddleware.ts`)
21. Build request validation middleware (Zod schema validation for all request bodies)
22. Wire all middleware into Express app (`main.ts`) — CORS → Helmet → Compression → Rate Limit → Auth → Routes → Error Handler

### Authentication Endpoints (depends on middleware from Tasks 16-22)
23. Build `/auth/register` endpoint (email/password) — **includes unit test**
24. Build `/auth/login` endpoint — **includes unit test**
25. Build `/auth/google` endpoint (Firebase ID token verification) — **includes unit test**
26. Build `/auth/refresh` endpoint — **includes unit test**
27. Build `/auth/logout` endpoint — **includes unit test**
28. Build `/auth/me` GET and PATCH endpoints — **includes unit test per endpoint**
29. Build `/auth/fcm-token` POST endpoint (register/unregister FCM tokens) — **includes unit test**

### Auth UI (Web + Mobile)
30. Build auth UI: Login page, Register page, Google OAuth button (web Next.js)
31. Build auth screens in Flutter (login, register, Google OAuth)
32. Implement Dio HTTP client with AuthInterceptor (auto-inject JWT, auto-refresh on 401)
33. Implement FCM token registration in Flutter app (on app start + onTokenRefresh listener)
34. Implement secure token storage in Flutter (`flutter_secure_storage` for refreshToken, `shared_preferences` for accessToken)

---

## Phase 2: External API Integration (Weeks 2-3)

### mfapi.in Integration
35. Build `lib/external/mfapi.ts` wrapper — fetch all schemes list — **includes unit test with mocked responses**
36. Build mfapi wrapper — fetch NAV for a scheme code — **includes unit test**
37. Build mfapi wrapper — fetch NAV history (date range) — **includes unit test**
38. Build mfapi wrapper — fetch scheme details — **includes unit test**
39. Implement Redis caching for mfapi responses (TTL: 1h for NAV, 24h for metadata)
40. Build bulk NAV import script (fetch all AMFI NAVs, store in MongoDB)
41. Schedule daily NAV sync: BullMQ cron job at 6:00 PM IST

### Yahoo Finance Integration
42. Build `lib/external/yfinance.ts` wrapper using yahoo-finance2 npm package — **includes unit test with mocked responses**
43. Implement stock price fetch (current + history) for `.NS` (NSE) tickers — **includes unit test**
44. Implement stock fundamentals fetch (P/E, P/B, market cap, etc.) — **includes unit test**
45. Implement stock technical data fetch (SMA, RSI, MACD via technicalindicators npm) — **includes unit test**
46. Implement Redis caching for yfinance responses (TTL: 15min during market hours, 24h after)
47. Build bulk stock price sync script for popular tickers (Nifty 50, Nifty Next 50)
48. Schedule stock price sync: BullMQ recurring job every 15min during market hours (9:15-15:30 IST)

### Gemini AI Integration
49. Build `lib/external/gemini.ts` wrapper using `@google/generative-ai` npm package — **includes unit test**
50. Design portfolio suggestion prompt template (Indian funds context, JSON output) — **includes prompt validation test**
51. Design fund explanation prompt template — **includes prompt validation test**
52. Design risk profile prompt template — **includes prompt validation test**
53. Implement AI response parsing and validation (Zod schema for structured output) — **includes unit test with sample Gemini responses**
54. Implement AI suggestion caching (hash-based dedup in MongoDB + Redis)
55. Build fallback rules-based engine (pre-built allocation templates when Gemini is unavailable) — **includes unit test per risk level template**

---

## Phase 3: Core Backend Services (Weeks 3-5)

### Fund Service
56. Implement `/funds/search` endpoint with text index query + pagination — **includes unit test + integration test**
57. Implement `/funds/{schemeCode}` endpoint — **includes unit test**
58. Implement `/funds/{schemeCode}/metrics` endpoint — **includes unit test**
59. Implement `/funds/{schemeCode}/nav-history` endpoint — **includes unit test**
60. Implement `/funds/{schemeCode}/holdings` endpoint — **includes unit test**
61. Implement `/funds/{schemeCode}/sector-allocation` endpoint — **includes unit test**
62. Implement `/funds/{schemeCode}/peers` endpoint — **includes unit test**
63. Implement `/funds/categories` endpoint — **includes unit test**
64. Build `fund_category_top` pre-computed aggregation collection + worker — **includes unit test for aggregation pipeline**

### Stock Service
65. Implement `/stocks/search` endpoint — **includes unit test + integration test**
66. Implement `/stocks/{nseSymbol}` endpoint — **includes unit test**
67. Implement `/stocks/{nseSymbol}/metrics` endpoint — **includes unit test**
68. Implement `/stocks/{nseSymbol}/history` endpoint — **includes unit test**
69. Implement `/stocks/{nseSymbol}/technical` endpoint — **includes unit test**

### Portfolio & AI Service
70. Implement `/portfolios` POST endpoint (create portfolio + trigger AI suggestion) — **includes unit test**
71. Implement `/portfolios` GET endpoint (list user portfolios) — **includes unit test**
72. Implement `/portfolios/{id}` GET/PATCH/DELETE endpoints — **includes unit test per method**
73. Implement `/portfolios/{id}/status` polling endpoint — **includes unit test**
74. Implement `/portfolios/{id}/pin` PATCH endpoint — **includes unit test**
75. Implement `/ai/suggest` standalone endpoint — **includes unit test**
76. Implement `/ai/explain` endpoint — **includes unit test**
77. Integrate BullMQ worker for async AI suggestion processing

### Favorites & Search History & Charts & Onboarding
78. Implement `/favorites` GET/POST endpoints — **includes unit test per method**
79. Implement `/favorites/{id}` DELETE endpoint — **includes unit test**
80. Implement `/search/history` GET endpoint (paginated, reads from search_history collection) — **includes unit test**
81. Implement `/search/history` DELETE endpoint (clear all history) — **includes unit test**
82. Implement `/charts/fund-nav` endpoint — **includes unit test**
83. Implement `/charts/stock-price` endpoint — **includes unit test**
84. Implement `/charts/fund-drawdown` endpoint — **includes unit test**
85. Implement `/onboard/risk-profile` endpoint — **includes unit test**
86. Implement `/reports/fund-analysis` POST endpoint (trigger PDF generation) — **includes unit test**
87. Implement `/reports/{reportId}` GET endpoint (return report status + download URL) — **includes unit test**
88. Implement PDF generation with puppeteer-core + @sparticuz/chromium — **includes unit test with sample HTML**

---

## Phase 4: Financial Calculations (Week 3, parallel with Phase 3)

89. Implement CAGR calculation (`lib/calculations/cagr.ts`) — **includes unit test with known values from AMFI**
90. Implement XIRR calculation using Newton-Raphson method (`lib/calculations/xirr.ts`) — **includes unit test with known SIP XIRR values**
91. Implement Sharpe Ratio calculation (`lib/calculations/sharpe.ts`) — **includes unit test with benchmark values**
92. Implement Sortino Ratio calculation (`lib/calculations/sortino.ts`) — **includes unit test**
93. Implement Alpha & Beta calculation (`lib/calculations/alphaBeta.ts`) — **includes unit test with Nifty 50 benchmark**
94. Implement Standard Deviation calculation (`lib/calculations/stdDev.ts`) — **includes unit test**
95. Implement Max Drawdown calculation (`lib/calculations/maxDrawdown.ts`) — **includes unit test**
96. Implement Rolling Returns calculation (`lib/calculations/rollingReturns.ts`) — **includes unit test**
97. Implement Technical Indicators (RSI, MACD, SMA, Bollinger) using `technicalindicators` npm (`lib/calculations/technicalIndicators.ts`) — **includes unit test per indicator**
98. Implement Monte Carlo simulation for projected portfolio value (`lib/calculations/monteCarlo.ts`) — **includes unit test with deterministic seed**
99. Build metric recalculation worker (daily job to recompute fund/stock metrics from latest data)

---

## Phase 5: Web Frontend (Weeks 5-7)

### Layout & Navigation
100. Build root layout (HTML, fonts, theme provider)
101. Build dashboard layout (sidebar, header, mobile nav)
102. Implement Zustand auth store with Firebase integration
103. Implement theme store (dark/light)
104. Build theme toggle component
105. Implement route guards (redirect to login if unauthenticated)

### AI Mode (Mode 1)
106. Build GoalInputForm component (text input, category selector) — **includes component test**
107. Build RiskSlider component (low/medium/high with descriptions) — **includes component test**
108. Build TimePeriodSelector component (1-30 years slider/dropdown) — **includes component test**
109. Build monthly investment input — **includes component test**
110. Build PortfolioResult component (shows AI suggestion) — **includes component test**
111. Build AllocationPieChart component (Recharts PieChart) — **includes component test**
112. Build ProjectedValueChart component (Monte Carlo bands) — **includes component test**
113. Build AIExplanationCard component (per-fund reason) — **includes component test**
114. Build portfolio list page (/ai) — **includes integration test**
115. Build portfolio detail page (/ai/[portfolioId]) — **includes integration test**

### Research Mode (Mode 2)
116. Build SearchBar component (debounced, with typeahead) — **includes component test**
117. Build SearchResultList component (tabs: Funds / Stocks) — **includes component test**
118. Build FundCard component (summary card) — **includes component test**
119. Build StockCard component (summary card) — **includes component test**
120. Build fund detail page (/research/fund/[schemeCode]) — **includes integration test**
121. Build FundHeader component — **includes component test**
122. Build FundMetricsGrid component — **includes component test**
123. Build FundNAVChart component (Recharts LineChart with timeframe switcher) — **includes component test**
124. Build FundDrawdownChart component — **includes component test**
125. Build FundHoldingsTable component — **includes component test**
126. Build FundSectorPie component (Recharts PieChart) — **includes component test**
127. Build FundRollingReturns component — **includes component test**
128. Build FundPeerComparison component (table) — **includes component test**
129. Build FundManagerInfo component — **includes component test**
130. Build SIPCalculator component — **includes component test**
131. Build stock detail page (/research/stock/[symbol]) — **includes integration test**
132. Build StockHeader component — **includes component test**
133. Build StockMetricsGrid component (P/E, P/B, dividend, market cap) — **includes component test**
134. Build StockPriceChart component (Recharts composed chart) — **includes component test**
135. Build StockTechnicalChart component (SMA, RSI, MACD overlay) — **includes component test**
136. Build StockHoldingPattern component (promoter/FII/DII bars) — **includes component test**
137. Build StockPeerComparison component — **includes component test**

### Watchlist & Settings & Reports
138. Build watchlist page (/watchlist) — **includes integration test**
139. Build settings page (/settings) — **includes component test**
140. Build CompareTable component (side-by-side fund comparison) — **includes component test**
141. Build report download UI (trigger generation, poll status, download link) — **includes component test**

---

## Phase 6: Flutter Mobile App (Weeks 6-8, parallel with Phase 5)

142. Set up Flutter project structure (feature-based, as per PROJECT_STRUCTURE.md)
143. Implement Dio API client with AuthInterceptor, CacheInterceptor, LoggingInterceptor
144. Implement local SQLite database for offline caching (sqflite)
145. Implement GoRouter with all routes
146. Build auth screens (login, register, Google OAuth) — **includes widget test**
147. Build AI goal input screen (text fields, risk selector, time period) — **includes widget test**
148. Build portfolio result screen (allocation list, projected value) — **includes widget test**
149. Build search screen (funds + stocks tabs, debounced search) — **includes widget test**
150. Build fund detail screen (metrics grid, NAV chart via fl_chart) — **includes widget test**
151. Build fund holdings section (table + pie chart) — **includes widget test**
152. Build stock detail screen (metrics, price chart, technicals) — **includes widget test**
153. Build watchlist screen (pull to refresh, swipe to delete) — **includes widget test**
154. Build settings screen (theme, language, logout) — **includes widget test**
155. Implement offline mode: serve cached data when no network
156. Implement FCM token registration flow (on app start + onTokenRefresh) — **includes widget test**
157. Implement push notification handling (foreground + background) — **includes integration test**

---

## Phase 7: Cross-Cutting Concerns & Validation (Weeks 8-9)

158. Data sync validation: verify daily NAV sync produces correct data (spot-check 10 funds against AMFI)
159. Metric cross-verification: compare our calculated CAGR/Sharpe against published AMFI/Morningstar values for top 20 funds
160. Mobile auth flow E2E test: login → token refresh on 401 → logout → redirect to login
161. FCM token lifecycle test: register → verify in DB → unregister → verify removal
162. AI suggestion integration test: create portfolio → poll status → receive suggestion → verify ISINs exist in DB
163. PDF report generation integration test: trigger → poll → download → verify PDF contains data
164. Cross-browser testing (Chrome, Firefox, Safari, Edge)
165. Mobile testing: iOS Simulator + Android Emulator + real devices
166. Accessibility audit (WCAG 2.1 AA)
167. Security audit (OWASP top 10, input validation, rate limiting, JWT expiry)
168. API performance test: response times under 50 concurrent users (k6 or Artillery)
169. Mobile performance test: app startup time < 2s, chart rendering < 500ms

---

## Phase 8: Deployment & Launch (Week 9-10)

170. Deploy Express backend to Railway (Dockerfile with puppeteer-core + @sparticuz/chromium)
171. Deploy BullMQ worker to Railway (separate service)
172. Verify MongoDB Atlas connection from Railway
173. Verify Redis/Upstash connection from Railway
174. Deploy Next.js static export to Vercel
175. Verify Vercel → Railway API connectivity (CORS, env vars)
176. Set up custom domain (optional: arthora.in)
177. Set up SSL/HTTPS (automatic via Vercel + Railway)
178. Build and publish Flutter app to Google Play (internal testing track)
179. Build and publish Flutter app to Apple App Store (TestFlight)
180. Set up Sentry for error tracking (Express + Next.js + Flutter)
181. Set up Vercel Analytics for web performance
182. Set up Uptime Robot (free) for API health monitoring
183. Final smoke test on production
184. Write user-facing documentation (how to use the app)
185. Set up `fund_category_top` aggregation worker on Railway (cron: daily 6:30 PM IST)

---

## Critical Path

```
Tasks 1-15 (Infrastructure + DB)
    ↓
Tasks 16-22 (Auth Middleware) ← MUST come before endpoints
    ↓
Tasks 23-34 (Auth Endpoints + UI) ← Depends on middleware
    ↓
Tasks 35-55 (External APIs + AI) ← Parallel with Tasks 56-69
    ↓
Tasks 56-88 (Backend CRUD + Search History + Reports) ← Parallel with Tasks 89-99
    ↓
Tasks 89-99 (Financial Calculations)
    ↓
Tasks 100-141 (Web Frontend) ← Parallel with Tasks 142-157 (Flutter Mobile)
    ↓
Tasks 158-169 (Cross-Cutting Validation)
    ↓
Tasks 170-185 (Deploy + Launch)
```

**Total: 185 tasks | ~10 weeks for MVP**

### Test Distribution Summary (Blocker #5)
Tests are co-located with each feature task, NOT in a separate "Week 8" phase:
- **Unit tests:** Included in Tasks 23-99 (each endpoint/calculation has its own test)
- **Component tests:** Included in Tasks 106-141 (each React/Flutter component has its own test)
- **Widget tests:** Included in Tasks 146-157 (each Flutter screen has its own test)
- **Integration/E2E tests:** Tasks 158-169 (cross-cutting validation phase)
