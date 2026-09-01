# Tech Stack with Justification

## Frontend (Web)

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Next.js** | 14.x (App Router) | SSR for SEO on fund/stock pages, ISR for popular pages, free Vercel deployment. App Router enables React Server Components for faster initial loads. **Note: Backend is Express.js, NOT Next.js API routes.** |
| **React** | 18.x | Required by Next.js. Largest ecosystem, component libraries, hiring pool. |
| **TypeScript** | 5.x | Type safety for financial calculations (CAGR, XIRR) prevents costly bugs. Strict null checks essential for handling missing data from APIs. |
| **Tailwind CSS** | 3.x | Utility-first, rapid prototyping, consistent design tokens, dark mode built-in, tiny bundle via PurgeCSS. |
| **shadcn/ui** | latest | Accessible, unstyled components you own (not a dependency). Built on Radix UI primitives. Customizable with Tailwind. |
| **Recharts** | 2.x | React-native charting, composable, SVG-based, responsive. Supports line, area, pie, bar charts needed for NAV/drawdown/sector charts. Lighter than D3 for our use case. |
| **Zustand** | 4.x | Lightweight state management (~1KB). Simpler than Redux for our use case. Middleware for persistence in localStorage. No boilerplate. |
| **React Hook Form** | 7.x | Performant forms with minimal re-renders. Needed for goal input, search, filters. Integrates with Zod for validation. |
| **Zod** | 3.x | Schema validation on both client and server. Single source of truth for request/response types. Infer TypeScript types from Zod schemas. |
| **Firebase Auth (JS SDK)** | 10.x | Free auth (50K MAU). Google OAuth + email/password out of the box. No server-side session management needed. JWT tokens for API auth. |

## Frontend (Mobile)

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Flutter** | 3.x | Single codebase for iOS + Android. High performance (compiled to ARM code). Rich widget library. fl_chart for beautiful charts. Growing Indian dev community. Better than React Native for chart-heavy apps (custom painting is easier with Canvas). |
| **Dart** | 3.x | Required by Flutter. Strong typing, null safety, async/await. |
| **Riverpod** | 2.x | State management. Compile-time safety (better than Provider). AsyncValue handles loading/error states elegantly. |
| **Dio** | 5.x | HTTP client with interceptors (auth token injection, retry, caching). Better than http package for production apps. |
| **GoRouter** | 13.x | Declarative routing with deep links. Supports nested navigation for tab-based app. |
| **fl_chart** | 0.68.x | Beautiful native Flutter charts (line, bar, pie). Touch interactions, animations. |
| **sqflite** | 2.x | Local SQLite for offline fund/stock data caching. Essential for mobile where network is unreliable. |
| **shared_preferences** | 2.x | Key-value storage for auth tokens, user preferences. |
| **Firebase Auth (Flutter SDK)** | latest | Same backend as web. Single user database. |
| **firebase_messaging** | latest | For FCM push notifications |

## Backend (API Layer)

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Express.js** | 4.x | **CHANGED FROM NEXT.JS API ROUTES** - No serverless function timeouts (>10s) for AI calls, persistent process for BullMQ workers, WebSocket support for future real-time features, better CPU utilization for financial calculations and PDF generation. |
| **Node.js** | 20.x | LTS version, excellent performance, massive ecosystem. |
| **MongoDB** | 7.x | Document store fits variable financial data shapes (different metrics per fund type). No rigid schema = fast iteration. Free Atlas M0 cluster (512MB) in Mumbai region. |
| **Mongoose** | 8.x | ODM for MongoDB. Schema validation at application level. TypeScript support with types. Middleware for hooks (e.g., hash password before save). |
| **Redis** | 7.x | In-memory cache for hot data (NAV, stock prices). Rate limiting. Job queues for background workers. Railway free tier or Upstash (free: 10K commands/day). |
| **ioredis** | 5.x | Robust Redis client. Pipeline support. Lua scripts for atomic rate limiting. |
| **BullMQ** | 5.x | Redis-based job queue for background tasks. Daily NAV sync, metric calculations, AI suggestion generation, report generation. Retry logic, rate limiting, scheduling. |
| **puppeteer-core** | 22.x | **ADDED PER BLOCKER #2** - Headless Chrome for PDF generation. Uses @sparticuz/chromium for Railway compatibility (no Chrome binary needed). Generates fund analysis reports as PDF. |
| **@sparticuz/chromium** | 123.x | **ADDED PER BLOCKER #2** - Minimal Chromium build for serverless/container environments. Required for puppeteer-core to work on Railway. |

## External API Integrations

| API | Purpose | Justification |
|-----|---------|---------------|
| **mfapi.in** | Mutual fund NAV, scheme data, holdings | Free, no API key needed, AMFI sourced, daily updates. Only comprehensive free MF data for India. |
| **yahoo-finance2** (npm) | Stock prices, fundamentals, technicals | Free, no API key, NPM package (server-side only). Covers NSE (.NS) and BSE (.BO) tickers. Better than yfinance (Python) since our stack is Node.js. |
| **Google Gemini 1.5 Flash** | AI portfolio suggestions, fund explanations | Free tier: 15 RPM, 1M tokens/min, 1500 RPD. Flash model is fast and cheap. Better than GPT-3.5 for Indian market context. Structured output support. |

## DevOps & Deployment

| Service | Purpose | Justification |
|---------|---------|---------------|
| **Vercel** | Web frontend deployment | Free: 100GB bandwidth, automatic HTTPS, GitHub integration, preview deployments. Hosts only static Next.js export (no serverless functions). |
| **Railway** | Backend + Worker deployment | Free: $5 credit/month. Easy Docker deploys. Runs Express.js server and BullMQ worker as separate services. Built-in Redis and MongoDB addons available. |
| **MongoDB Atlas** | Primary database | Free M0: 512MB, shared RAM, Mumbai region, auto-backups. Sufficient for ~50K fund records. |
| **Upstash Redis** | Alternative free Redis | Free: 10K commands/day, 256MB. Good enough for MVP caching + rate limiting. |
| **Firebase Auth** | Authentication | Free: 50K MAU, Google/email auth, JWT tokens, phone auth (future). |
| **GitHub Actions** | CI/CD | Free: 2000 min/month. Lint, type-check, test, deploy pipelines. |
| **Sentry** (free tier) | Error tracking | Free: 5K errors/month. Track API failures, frontend crashes. |
| **Vercel Analytics** | Web vitals | Free on Hobby plan. Track LCP, FID, CLS for performance. |

## Financial Calculation Libraries

| Library | Purpose | Justification |
|---------|---------|---------------|
| **Custom CAGR/XIRR** | Built in-house | No reliable npm package for Indian market XIRR with daily NAV. Formula is well-documented. Use Newton-Raphson method for XIRR. |
| **technicalindicators** | RSI, MACD, SMA, Bollinger | Lightweight npm package for stock technical indicators. Pure JS, no dependencies. |
| **simple-statistics** | StdDev, correlation, regression | Well-tested statistical functions. Used for portfolio metrics. |
| **mathjs** | Financial formulas | Advanced math library for complex calculations if needed. |

## Key Architecture Decisions (Updated)

### Why Express.js over Next.js API Routes?
1. **No serverless timeouts** — Vercel Hobby tier has 10s timeout. AI calls (Gemini) + processing can exceed this.
2. **Persistent workers** — BullMQ worker needs long-running process, not serverless functions.
3. **WebSocket readiness** — Future real-time price updates need persistent connections.
4. **CPU-intensive tasks** — Financial calculations (rolling returns, Monte Carlo) and PDF generation consume significant CPU.
5. **Separation of concerns** — Frontend and backend deploy independently.

### Why puppeteer-core + @sparticuz/chromium?
- puppeteer-core is the headless Chrome library without bundled Chromium (saves ~100MB)
- @sparticuz/chromium provides Chromium binary built for Linux/container environments (Railway Docker)
- Together they enable PDF generation in constrained environments where full puppeteer fails
- Alternative: Use html-pdf or pdfkit, but puppeteer gives best fidelity for complex financial reports

### Why MongoDB remains the only database (Blocker #8)?
- No PostgreSQL references remain in the architecture
- Document model fits varying fund/stock schemas naturally
- Free tier sufficient for MVP with data pruning strategies
- No need for SQL joins in current feature set
