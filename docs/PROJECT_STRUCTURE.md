# Project Structure

## Web App (Next.js)

```
arthora/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACT.md
│   ├── PROJECT_STRUCTURE.md
│   ├── TECH_STACK.md
│   ├── TASK_LIST.md
│   ├── DATA_FLOW.md
│   └── RISKS.md
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── og-image.png
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Tailwind + custom CSS
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── ai/
│   │   │   │   ├── page.tsx          # AI goal input form
│   │   │   │   └── [portfolioId]/
│   │   │   │       └── page.tsx      # Portfolio result view
│   │   │   ├── research/
│   │   │   │   ├── page.tsx          # Search page
│   │   │   │   ├── fund/
│   │   │   │   │   └── [schemeCode]/
│   │   │   │   │       └── page.tsx  # Fund detail page
│   │   │   │   └── stock/
│   │   │   │       └── [symbol]/
│   │   │   │           └── page.tsx  # Stock detail page
│   │   │   ├── watchlist/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── api/                      # API routes (backend)
│   │       ├── auth/
│   │       │   ├── register/
│   │       │   │   └── route.ts
│   │       │   ├── login/
│   │       │   │   └── route.ts
│   │       │   ├── google/
│   │       │   │   └── route.ts
│   │       │   ├── refresh/
│   │       │   │   └── route.ts
│   │       │   ├── logout/
│   │       │   │   └── route.ts
│   │       │   └── me/
│   │       │       └── route.ts
│   │       ├── funds/
│   │       │   ├── search/
│   │       │   │   └── route.ts       # GET /funds/search
│   │       │   ├── [schemeCode]/
│   │       │   │   ├── route.ts       # GET /funds/{schemeCode}
│   │       │   │   ├── metrics/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── nav-history/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── holdings/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── sector-allocation/
│   │       │   │   │   └── route.ts
│   │       │   │   └── peers/
│   │       │   │       └── route.ts
│   │       │   └── categories/
│   │       │       └── route.ts       # GET /funds/categories
│   │       ├── stocks/
│   │       │   ├── search/
│   │       │   │   └── route.ts
│   │       │   ├── [symbol]/
│   │       │   │   ├── route.ts       # GET /stocks/{symbol}
│   │       │   │   ├── metrics/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── history/
│   │       │   │   │   └── route.ts
│   │       │   │   └── technical/
│   │       │   │       └── route.ts
│   │       │   └── sectors/
│   │       │       └── route.ts
│   │       ├── portfolios/
│   │       │   ├── route.ts           # GET+POST /portfolios
│   │       │   └── [portfolioId]/
│   │       │       ├── route.ts       # GET+PATCH+DELETE
│   │       │       └── status/
│   │       │           └── route.ts
│   │       ├── ai/
│   │       │   ├── suggest/
│   │       │   │   └── route.ts
│   │       │   └── explain/
│   │       │       └── route.ts
│   │       ├── favorites/
│   │       │   ├── route.ts           # GET+POST
│   │       │   └── [favoriteId]/
│   │       │       └── route.ts       # DELETE
│   │       ├── charts/
│   │       │   ├── fund-nav/
│   │       │   │   └── route.ts
│   │       │   ├── stock-price/
│   │       │   │   └── route.ts
│   │       │   └── fund-drawdown/
│   │       │       └── route.ts
│   │       ├── onboard/
│   │       │   └── risk-profile/
│   │       │       └── route.ts
│   │       └── reports/
│   │           └── fund-analysis/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/                        # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── GoogleAuthButton.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── ai/
│   │   │   ├── GoalInputForm.tsx
│   │   │   ├── RiskSlider.tsx
│   │   │   ├── TimePeriodSelector.tsx
│   │   │   ├── PortfolioResult.tsx
│   │   │   ├── AllocationPieChart.tsx
│   │   │   ├── ProjectedValueChart.tsx
│   │   │   └── AIExplanationCard.tsx
│   │   ├── research/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FundCard.tsx
│   │   │   ├── StockCard.tsx
│   │   │   ├── SearchResultList.tsx
│   │   │   └── CompareTable.tsx
│   │   ├── fund/
│   │   │   ├── FundHeader.tsx
│   │   │   ├── FundMetricsGrid.tsx
│   │   │   ├── FundNAVChart.tsx
│   │   │   ├── FundDrawdownChart.tsx
│   │   │   ├── FundHoldingsTable.tsx
│   │   │   ├── FundSectorPie.tsx
│   │   │   ├── FundRollingReturns.tsx
│   │   │   ├── FundPeerComparison.tsx
│   │   │   ├── FundManagerInfo.tsx
│   │   │   └── SIPCalculator.tsx
│   │   ├── stock/
│   │   │   ├── StockHeader.tsx
│   │   │   ├── StockMetricsGrid.tsx
│   │   │   ├── StockPriceChart.tsx
│   │   │   ├── StockTechnicalChart.tsx
│   │   │   ├── StockHoldingPattern.tsx
│   │   │   ├── StockQuarterlyResults.tsx
│   │   │   └── StockPeerComparison.tsx
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   ├── CandlestickChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── DrawdownChart.tsx
│   │   │   └── ChartTimeSwitcher.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── DisclaimerBanner.tsx
│   │       ├── MetricCard.tsx
│   │       └── Pagination.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # Fetch wrapper with auth + error handling
│   │   │   └── endpoints.ts           # API endpoint constants
│   │   ├── external/
│   │   │   ├── mfapi.ts              # mfapi.in wrapper
│   │   │   ├── yfinance.ts           # Yahoo Finance wrapper (server-side only)
│   │   │   └── gemini.ts             # Google Gemini AI wrapper
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Portfolio.ts
│   │   │   ├── FundMetadata.ts
│   │   │   ├── FundNAVHistory.ts
│   │   │   ├── FundMetrics.ts
│   │   │   ├── FundHoldings.ts
│   │   │   ├── StockMetadata.ts
│   │   │   ├── StockPriceHistory.ts
│   │   │   ├── StockMetrics.ts
│   │   │   ├── Favorite.ts
│   │   │   ├── SearchHistory.ts
│   │   │   └── AISuggestionCache.ts
│   │   ├── calculations/
│   │   │   ├── cagr.ts
│   │   │   ├── xirr.ts
│   │   │   ├── sharpe.ts
│   │   │   ├── sortino.ts
│   │   │   ├── alphaBeta.ts
│   │   │   ├── stdDev.ts
│   │   │   ├── maxDrawdown.ts
│   │   │   ├── rollingReturns.ts
│   │   │   ├── technicalIndicators.ts
│   │   │   └── monteCarlo.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── fundService.ts
│   │   │   ├── stockService.ts
│   │   │   ├── portfolioService.ts
│   │   │   ├── aiService.ts
│   │   │   ├── chartService.ts
│   │   │   ├── reportService.ts
│   │   │   └── cacheService.ts
│   │   ├── validators/
│   │   │   ├── auth.ts               # Zod schemas
│   │   │   ├── portfolio.ts
│   │   │   ├── fund.ts
│   │   │   ├── stock.ts
│   │   │   └── common.ts
│   │   ├── prompts/
│   │   │   ├── portfolioSuggestion.ts
│   │   │   ├── fundExplanation.ts
│   │   │   └── riskProfile.ts
│   │   ├── workers/
│   │   │   ├── navSyncWorker.ts      # Daily AMFI NAV sync
│   │   │   ├── priceSyncWorker.ts   # Stock price sync
│   │   │   ├── metricCalcWorker.ts   # Metrics recompute
│   │   │   └── workerRunner.ts
│   │   ├── constants/
│   │   │   ├── fundCategories.ts
│   │   │   ├── riskProfiles.ts
│   │   │   ├── goalTemplates.ts
│   │   │   └── cacheConfig.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── rateLimitMiddleware.ts
│   │   │   ├── corsMiddleware.ts
│   │   │   └── errorMiddleware.ts
│   │   ├── db/
│   │   │   ├── connection.ts          # MongoDB connection singleton
│   │   │   └── indexes.ts            # Collection indexes setup
│   │   └── utils/
│   │       ├── formatters.ts         # INR formatting, percentage, date
│   │       ├── validators.ts
│   │       ├── dateUtils.ts
│   │       └── logger.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFund.ts
│   │   ├── useStock.ts
│   │   ├── usePortfolio.ts
│   │   ├── useFavorites.ts
│   │   ├── useSearch.ts
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   ├── store/
│   │   ├── authStore.ts              # Zustand stores
│   │   ├── portfolioStore.ts
│   │   ├── searchStore.ts
│   │   └── themeStore.ts
│   └── types/
│       ├── api.ts                    # API request/response types
│       ├── fund.ts
│       ├── stock.ts
│       ├── portfolio.ts
│       ├── user.ts
│       └── charts.ts
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Mobile App (Flutter)

```
arthora_mobile/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── android/
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/
│   └── build.gradle
├── ios/
│   ├── Runner/
│   │   ├── AppDelegate.swift
│   │   └── Info.plist
│   └── Podfile
├── lib/
│   ├── main.dart
│   ├── app.dart                       # MaterialApp + router
│   ├── core/
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── colors.dart
│   │   │   └── typography.dart
│   │   ├── constants/
│   │   │   ├── api_constants.dart
│   │   │   ├── app_constants.dart
│   │   │   └── cache_config.dart
│   │   ├── network/
│   │   │   ├── api_client.dart        # Dio wrapper with interceptors
│   │   │   ├── auth_interceptor.dart
│   │   │   ├── cache_interceptor.dart
│   │   │   ├── logging_interceptor.dart
│   │   │   └── api_exceptions.dart
│   │   ├── storage/
│   │   │   ├── local_storage.dart     # SharedPreferences wrapper
│   │   │   └── database/
│   │   │       ├── app_database.dart  # SQLite via sqflite
│   │   │       ├── dao/
│   │   │       │   ├── fund_dao.dart
│   │   │       │   ├── stock_dao.dart
│   │   │       │   └── portfolio_dao.dart
│   │   │       └── tables.dart
│   │   ├── utils/
│   │   │   ├── formatters.dart
│   │   │   ├── date_utils.dart
│   │   │   ├── validators.dart
│   │   │   └── logger.dart
│   │   └── router/
│   │       └── app_router.dart        # GoRouter configuration
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── auth_repository.dart
│   │   │   │   └── auth_datasource.dart
│   │   │   ├── domain/
│   │   │   │   └── auth_model.dart
│   │   │   └── presentation/
│   │   │       ├── login_screen.dart
│   │   │       ├── register_screen.dart
│   │   │       └── auth_provider.dart
│   │   ├── ai_portfolio/
│   │   │   ├── data/
│   │   │   │   └── portfolio_repository.dart
│   │   │   ├── domain/
│   │   │   │   └── portfolio_model.dart
│   │   │   └── presentation/
│   │   │       ├── goal_input_screen.dart
│   │   │       ├── risk_selector.dart
│   │   │       ├── time_period_picker.dart
│   │   │       ├── portfolio_result_screen.dart
│   │   │       └── portfolio_provider.dart
│   │   ├── research/
│   │   │   ├── data/
│   │   │   │   └── search_repository.dart
│   │   │   └── presentation/
│   │   │       ├── search_screen.dart
│   │   │       └── search_provider.dart
│   │   ├── fund_detail/
│   │   │   ├── data/
│   │   │   │   └── fund_repository.dart
│   │   │   ├── domain/
│   │   │   │   └── fund_model.dart
│   │   │   └── presentation/
│   │   │       ├── fund_detail_screen.dart
│   │   │       ├── fund_metrics_section.dart
│   │   │       ├── fund_nav_chart.dart
│   │   │       ├── fund_holdings_section.dart
│   │   │       ├── fund_sector_pie.dart
│   │   │       └── fund_provider.dart
│   │   ├── stock_detail/
│   │   │   ├── data/
│   │   │   │   └── stock_repository.dart
│   │   │   ├── domain/
│   │   │   │   └── stock_model.dart
│   │   │   └── presentation/
│   │   │       ├── stock_detail_screen.dart
│   │   │       ├── stock_metrics_section.dart
│   │   │       ├── stock_price_chart.dart
│   │   │       ├── stock_technical_section.dart
│   │   │       └── stock_provider.dart
│   │   └── watchlist/
│   │       ├── data/
│   │       │   └── watchlist_repository.dart
│   │       └── presentation/
│   │           ├── watchlist_screen.dart
│   │           └── watchlist_provider.dart
│   ├── shared/
│   │   ├── widgets/
│   │   │   ├── loading_indicator.dart
│   │   │   ├── error_widget.dart
│   │   │   ├── metric_card.dart
│   │   │   ├── disclaimer_banner.dart
│   │   │   ├── time_range_selector.dart
│   │   │   └── empty_state.dart
│   │   └── models/
│   │       ├── api_response.dart
│   │       └── pagination.dart
│   └── l10n/                          # Future i18n
│       └── en.dart
├── test/
│   ├── unit/
│   │   ├── services/
│   │   └── calculations/
│   ├── widget/
│   │   ├── fund_detail_screen_test.dart
│   │   └── stock_detail_screen_test.dart
│   └── integration/
│       └── auth_flow_test.dart
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

## Shared Configuration

```
arthora-shared/                         # Shared between web and mobile (optional monorepo)
├── prompts/
│   ├── portfolio_suggestion.md
│   ├── fund_explanation.md
│   └── risk_profile.md
├── constants/
│   ├── fund_categories.json
│   ├── risk_profiles.json
│   └── goal_templates.json
└── schemas/
    ├── api_response.json
    └── fund_schema.json
```
