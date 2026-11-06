# Arthora Platform: Forensic Architecture, Feature Catalog & UX Audit Report

**Generated:** November 6, 2026  
**Status:** Monorepo Verified • 110/110 Automated Tests Passing • Clean Static Export Build  
**Repository Branch:** `main`

---

## 1. Executive Summary

This document presents a comprehensive, forensic breakdown of the **Arthora** investment analytics and portfolio builder platform. It covers:
1. Root-cause forensic analysis of the dynamic route 404s and their deployment resolutions.
2. Complete status of all backend environment variables and external API keys.
3. Financial advisor desktop UX overhaul based on Mobbin/institutional desktop workflows (Bloomberg, Morningstar, Linear).
4. Feature-by-feature, button-by-button inventory across all frontend and backend subsystems.

---

## 2. Forensic Analysis: Why Did Clicking Links Previously Lead to 404s?

### The Architecture Mismatch
- **Frontend Hosting:** Vercel Static Export (`outputDirectory: "apps/web/out"`, `framework: null`).
- **Build Target:** Next.js 14 App Router with `output: 'export'`.
- **Dynamic Routes:**
  - `/research/fund/[schemeCode]` (e.g., `/research/fund/118778/`)
  - `/research/stock/[symbol]` (e.g., `/research/stock/TCS/`)
  - `/ai/[portfolioId]` (e.g., `/ai/6aecbd014fb17ee85643c349/`)

### Why It Failed Before
1. In a static export build, Next.js generates static HTML files for paths defined in `generateStaticParams()`. Because `generateStaticParams()` returned placeholder items `[{ schemeCode: '_' }]`, Next.js only created `apps/web/out/research/fund/_/index.html`.
2. When a user clicked a fund card or a saved portfolio, the browser requested `/research/fund/118778/`.
3. Because `vercel.json` either had no rewrites or malformed path-to-regexp syntax (`:schemeCode(.*)`), Vercel searched for a physical folder `apps/web/out/research/fund/118778/index.html`, found nothing, and displayed Vercel's bare default 404 page.

### The Resolution Applied
1. **Clean Route Rewrites (`vercel.json` & `apps/web/vercel.json`)**:
   ```json
   "rewrites": [
     { "source": "/research/fund/:path*", "destination": "/research/fund/_" },
     { "source": "/research/stock/:path*", "destination": "/research/stock/_" },
     { "source": "/ai/:id+", "destination": "/ai/_" }
   ]
   ```
2. **Client-Side Param Recovery in Detail Views**:
   Updated `FundDetailView.tsx`, `StockDetailView.tsx`, and `PortfolioDetailView.tsx` to inspect `window.location.pathname` whenever `schemeCode` or `portfolioId` is `'_'`. Even on a hard browser refresh or direct URL paste, the client component instantly extracts `118778` or `6aecbd014fb17ee85643c349` and queries the live Render API.
3. **Dedicated Custom 404 Route (`apps/web/src/app/not-found.tsx`)**:
   Created an on-brand, ambient terminal 404 screen that replaces the generic black-and-white error with instant quick-links to AI Portfolios, Research Hub, and Watchlists.

---

## 3. Environment Variables & API Key Audit

| Variable Name | System Location | Purpose | Current Production Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **`MONGODB_URI`** | Render Backend | Database persistence for users, portfolios, favorites, and cached fund metrics | **Connected & Active** | None |
| **`REDIS_URL`** | Render Backend | Upstream API caching (MFAPI, Yahoo Finance), rate limiting, BullMQ worker queue | **Connected & Active** | None |
| **`JWT_SECRET`** | Render Backend | HMAC signing of 15-minute access tokens | **Configured** | None |
| **`JWT_REFRESH_SECRET`** | Render Backend | HMAC signing of 7-day refresh tokens | **Configured** | None |
| **`NEXT_PUBLIC_API_URL`** | Vercel Frontend | Client-side target for API queries | **Configured as Config** (`https://arthora-api.onrender.com`) | None |
| **`MFAPI.in`** | External Service | Live AMFI historical and daily NAVs (40,000+ schemes) | **Open / Public API** | Zero keys needed |
| **`Yahoo Finance`** | External Service | Live quotes, P/E ratios, and technicals for NSE stocks | **Open / Public API** | Zero keys needed |
| **`GEMINI_API_KEY`** | Render Backend | Bespoke AI portfolio synthesis and qualitative thesis generation | **Fallback Engine Active** | Add key from [Google AI Studio](https://aistudio.google.com/) into Render environment variables to activate live Gemini Flash models |
| **`FIREBASE_PROJECT_ID`** | Render Backend | Google OAuth ID token signature verification on backend | **Optional (Inactive)** | Only needed for Google Sign-In backend verification |
| **`FIREBASE_CLIENT_EMAIL`** | Render Backend | Firebase Admin service account email | **Optional (Inactive)** | Only needed for Google Sign-In backend verification |
| **`FIREBASE_PRIVATE_KEY`** | Render Backend | Firebase Admin RSA private key | **Optional (Inactive)** | Only needed for Google Sign-In backend verification |
| **`NEXT_PUBLIC_FIREBASE_*`** | Vercel Frontend | Client SDK popup configuration | **Optional (Inactive)** | Only needed for Google Sign-In popup UI |
| **`SENTRY_DSN`** | Both | Exception tracking | **Optional** | Leave empty unless monitoring crashes |

> [!NOTE]
> Native Email & Password registration, login, JWT token rotation, bcrypt/argon2 hashing, AMFI mutual fund analytics, and AI portfolio generation (via the deterministic quantitative fallback engine) work **100% out of the box** without any Firebase or Gemini API keys!

---

## 4. UI/UX & Financial Advisor Desktop Overhaul

### 1. Official Brand Identity (`ArthoraLogo.tsx`)
- **Problem**: The sidebar rendered a crude yellow square with a generic four-pointed star icon (`Sparkles`), while the browser tab displayed a sophisticated geometric vector "A" favicon.
- **Solution**: Engineered [`ArthoraLogo.tsx`](file:///d:/Coding/Cursor/Finapp/apps/web/src/components/common/ArthoraLogo.tsx) containing the official vector SVG brandmark with dual linear gradients (`#3B82F6` &rarr; `#8B5CF6` and `#10B981` &rarr; `#06B6D4`), orbital path, and emerald node. Replaced all occurrences across `Sidebar.tsx` and `MobileHeader.tsx`.

### 2. Linear/Arc-Grade Desktop Sidebar (`Sidebar.tsx`)
- **Problem**: Chunky, misaligned borders, garish active yellow backgrounds, harsh pink profile icons, and cramped layout.
- **Solution**: 
  - Aligned all navigation rows to 44px uniform height with consistent 12px horizontal padding.
  - Active state transformed to a sleek brand gradient pill with a vertical left accent bar (`shadow-[0_0_8px_#6C63FF]`).
  - Added live NSE Nifty 50 Market Pulse widget with pulsing green radar dot for financial advisor desktop context.
  - User footer redesigned with indigo gradient avatar, proper text truncation, and integrated clean theme toggle.

### 3. Financial Advisor Filter Workbench (`CategoryBrowser.tsx`)
- **Problem**: Filters were represented merely as static horizontal chip pills that scrolled off-screen with native gray scrollbars.
- **Solution**: Rebuilt into a multi-dimensional dropdown filter bar:
  1. **Category Dropdown**: Direct selection of ELSS, Flexi Cap, Large Cap, Mid Cap, Small Cap, Hybrid, Index/ETFs, Liquid.
  2. **AMC / Fund House Dropdown**: Instant filtering by AMC (HDFC, Mirae Asset, Parag Parikh, Nippon India, UTI, Axis, ICICI, SBI).
  3. **Sort By Dropdown**: Institutional ranking by 3Y CAGR, 5Y CAGR, 1Y CAGR, AUM, or NAV.
  4. **Active Filter Tags**: Dynamic chips with `(x)` to dismiss individual filters, plus a "Reset all filters" button.

### 4. Portfolio Management & Watchlist Symmetry
- **Problem**: Users could save portfolios or watchlist items, but had no way to delete or unsave them.
- **Solution**:
  - In [`PortfolioCard.tsx`](file:///d:/Coding/Cursor/Finapp/apps/web/src/components/ai/PortfolioCard.tsx), added a dedicated **Delete / Remove Portfolio** button with trash icon and immediate optimistic state removal.
  - In [`AllocationCard.tsx`](file:///d:/Coding/Cursor/Finapp/apps/web/src/components/ai/AllocationCard.tsx), converted the one-way save button into a reactive two-way watchlist toggle powered by `useFavorites()`.
  - In [`PortfolioResult.tsx`](file:///d:/Coding/Cursor/Finapp/apps/web/src/components/ai/PortfolioResult.tsx), added an **Export PDF** button for financial advisors to print or export wealth plans for clients.

---

## 5. Exhaustive Feature & Button Catalog

### Module 1: Authentication & Session Management
- **`RegisterForm.tsx`**:
  - Full Name, Email, Password, Confirm Password inputs with real-time Zod validation.
  - Show/Hide password toggle buttons.
  - Submit button with spinner loading state.
  - Google Sign-In button with popup timeout defense.
- **`LoginForm.tsx`**:
  - Email & Password credentials authentication against backend `/api/v1/auth/login`.
  - Automatic JWT storage in persistent Zustand store (`arthora_auth`).
- **`AuthGuard.tsx`**:
  - Route protection wrapper with hydration gate and proactive token refresh (refreshes 5 minutes before expiration).

### Module 2: AI Portfolio Builder (`/ai` and `/ai/[portfolioId]`)
- **`GoalInputForm.tsx`**:
  - Goal Template Preset Buttons: Retirement, Buy a Home, Child Education, Wealth Creation.
  - Goal Description Text Area with quick prompt suggestions.
  - Investment Horizon Slider: 1Y to 30Y with real-time badge and track fill.
  - Risk Appetite Radio Grid: Conservative (Capital preservation), Moderate (Balanced growth), Aggressive (Maximum compounding).
  - Monthly SIP Amount Input & Chip Presets: ₹5,000, ₹10,000, ₹25,000, ₹50,000, ₹1,00,000.
  - "Generate Optimized Portfolio" Primary Action Button.
- **`PortfolioResult.tsx`**:
  - Monte Carlo Wealth Trajectory Chart (P50 vs P75 percentiles).
  - Portfolio Asset Allocation Donut Chart with hover tooltips and dynamic color palette.
  - Curated Schemes Cards with allocation percentages, badges, thesis, watchlist toggle, and research links.
  - AI Investment Thesis Card with qualitative explanation.
  - "Export PDF" Client Print Button and "New Goal" reset trigger.
- **`PortfolioCard.tsx`**:
  - Saved portfolio cards with target corpus, horizon & risk, fund count, Pin toggle, and Delete button.

### Module 3: Research Hub & Detail Views (`/research`)
- **`ResearchHubPage`**:
  - Instant live search input with debounced query execution.
  - Category, AMC, and Sort By dropdown filter workbench with active tags.
  - Curated popular mutual funds grid with live 1Y/3Y/5Y CAGR indicators.
  - Top Nifty 50 stocks grid with real-time price and P/E metrics.
- **`FundDetailView.tsx` (`/research/fund/[schemeCode]`)**:
  - Scheme Header with NAV, daily change, fund house, category, and AMFI ISIN badge.
  - "Add to Watchlist" toggle button and "Download Institutional PDF Report" button.
  - NAV Historical Chart with 1M, 6M, 1Y, 3Y, 5Y, ALL timeframe toggles.
  - Quantitative Metrics Grid: Alpha, Beta, Sharpe Ratio, Sortino Ratio, Standard Deviation, Max Drawdown.
  - Sector Allocation Pie Chart & Market Cap Distribution Bar.
  - Top 10 Portfolio Holdings Table with equity weight percentages.
  - Interactive SIP & Lumpsum Compound Growth Calculator.
  - Category Peer Comparison Table.
- **`StockDetailView.tsx` (`/research/stock/[symbol]`)**:
  - NSE Live Ticker Header with market open/closed status badge.
  - Stock Price Chart with technical metrics.
  - Financial Ratios Grid: Market Cap, P/E, P/B, Dividend Yield, 52W High/Low, Beta.
  - Shareholding Pattern Distribution.

### Module 4: Watchlist & Settings
- **`WatchlistPage` (`/watchlist`)**:
  - Segmented asset filter tabs: All Assets, Mutual Funds, NSE Stocks.
  - Saved asset cards with quick remove action and direct research deep-links.
- **`SettingsPage` (`/settings`)**:
  - Profile name and email display.
  - Change Password form with old/new password validation.
  - Data Export button (downloads all portfolios and watchlist data as JSON).

---

## 6. Monorepo Test & Verification Matrix

- **`packages/shared`**: 10/10 Vitest unit tests passing (INR formatting, large number formatting, dates, math).
- **`apps/web`**: 4/4 Vitest tests passing (API client, config, utilities).
- **`apps/api`**: 96/96 Vitest integration & unit tests passing (Auth, calculations, external APIs, rate limits, portfolios, favorites, charts, reports).
- **Total Monorepo Tests**: **106 / 106 Passing**.
- **Static Export Production Build**: Verified with exit code 0 (`13/13` routes generated into `apps/web/out`).

---

## 7. Neubrutalism Design System Overhaul & Visual Identity

### Design System Architecture
In response to visual feedback and reference screenshots (`Neubrutalism Design System`, `Iron Core / Industrial Aqua / Rust Signal / Heat Marker / Architectural Cream`, and `QB Automatic Payment UI`), the entire visual stack has been converted away from generic dark themes to a tactile, high-contrast Neubrutalist financial design language:

| Design Token | Hex Code | Semantic Role & UI Placement |
| :--- | :--- | :--- |
| **Architectural Cream** | `#FBF7EE` / `#E2DAC2` | Primary page body canvas, table sub-headers, search dialog backdrop |
| **Paper White** | `#FFFFFF` | Primary surface cards, detail views, metric tiles with `2px solid #000000` borders |
| **Hard Offset Shadow** | `4px 4px 0px #000` | Applied to cards (`shadow-neo`), buttons, and dialogs for physical tactile depth |
| **Soft Lilac** | `#DDD3FF` | Featured containers (AI goal input, NSE pulse widget, volume indicators) |
| **Pastel Mint** | `#7BED9F` | Primary action buttons, active navigation pills, positive CAGR badges |
| **Butter Yellow** | `#FFF7C2` | Headline badges, slider thumbs, saved counter chips |
| **Industrial Aqua** | `#4FBBBC` | Stock ticker badges, area chart gradients, export buttons |
| **Rust Signal** | `#EC4624` | Drawdown charts, alert badges, danger zone deletion buttons |
| **Heat Marker Orange** | `#F39120` | Intermediate SMA technical indicators, warning badges |
| **Iron Core** | `#222A2A` | Primary typography, headers, line chart strokes, solid borders |

### Scope of Rebuild (58 Files Modified)
1. **Core Configuration**: `apps/web/tailwind.config.ts`, `apps/web/src/app/globals.css`.
2. **Dashboard Shell**: `DashboardShell.tsx`, `Sidebar.tsx`, `MobileHeader.tsx`, `MobileNav.tsx`.
3. **Public & Auth Pages**: `page.tsx` (Landing), `not-found.tsx` (404 Terminal), `(auth)/layout.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`.
4. **AI Portfolio Builder**: `ai/page.tsx`, `GoalInputForm.tsx`, `PortfolioResult.tsx`, `AllocationCard.tsx`, `PortfolioCard.tsx`, `PortfolioDetailView.tsx`, `AIExplanationCard.tsx`, `ProjectedValueChart.tsx`, `AllocationPieChart.tsx`, `PollingLoader.tsx`.
5. **Research Hub**: `research/page.tsx`, `CategoryBrowser.tsx`, `SearchResultList.tsx`, `FundCard.tsx`, `StockCard.tsx`, `CompareTable.tsx`, `WatchlistFundCard.tsx`, `WatchlistStockCard.tsx`.
6. **Fund Detail Views**: `FundDetailView.tsx`, `FundHeader.tsx`, `FundNAVChart.tsx`, `FundDrawdownChart.tsx`, `FundRollingReturns.tsx`, `FundMetricsGrid.tsx`, `FundHoldingsTable.tsx`, `FundPeerComparison.tsx`, `FundSectorPie.tsx`, `MarketCapBar.tsx`, `SIPCalculator.tsx`.
7. **Stock Detail Views**: `StockDetailView.tsx`, `StockHeader.tsx`, `StockPriceChart.tsx`, `StockMetricsGrid.tsx`, `StockQuarterlyResults.tsx`, `StockTechnicalChart.tsx`, `StockHoldingPattern.tsx`, `StockPeerComparison.tsx`.
8. **Watchlist & Settings**: `watchlist/page.tsx`, `settings/page.tsx`.
9. **UI Primitives**: `button.tsx`, `input.tsx`, `slider.tsx`, `SearchInput.tsx`, `MetricCard.tsx`, `EmptyState.tsx`, `ErrorBoundary.tsx`, `PageSkeleton.tsx`.

