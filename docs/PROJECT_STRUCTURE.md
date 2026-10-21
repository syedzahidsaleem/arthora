# Arthora Monorepo Architecture & Directory Guide

This document provides a comprehensive map of the **Arthora** monorepo structure, detailing package responsibilities, directory organization, and where specific capabilities reside.

---

## High-Level Monorepo Layout

```text
arthora/
├── apps/
│   ├── web/                   # Next.js 14 App Router Web Client (Static HTML Export)
│   └── api/                   # Express.js REST API Gateway & BullMQ Workers
├── packages/
│   ├── shared/                # Universal TypeScript types, Zod contracts, and Indian formatters
│   └── sdk/                   # Isomorphic TypeScript Client SDK
├── arthora_mobile/            # Cross-Platform Flutter 3.29+ Mobile Client (iOS & Android)
├── docs/                      # Architectural, compliance, deployment, and PRD specifications
├── scripts/                   # Automated pre-commit quality gate runners
├── .github/                   # Workflows, issue templates, and visual assets
├── vercel.json                # Vercel Monorepo deployment specification
├── render.yaml                # Render Infrastructure-as-Code Blueprint
├── pnpm-workspace.yaml        # PNPM workspace definition
└── tsconfig.base.json         # Base TypeScript compiler configuration
```

---

## 1. Web Application (`apps/web`)

A high-performance Next.js 14 client built with the App Router, Tailwind CSS, and Neo-Brutalist design tokens. Pre-rendered to pure static assets (`apps/web/out`) for global CDN deployment on Vercel.

```text
apps/web/
├── public/                    # Static public assets, favicon, manifest, and icons
├── src/
│   ├── app/                   # Next.js App Router route hierarchy
│   │   ├── layout.tsx         # Root layout (fonts, providers, offline banner, skip-link)
│   │   ├── page.tsx           # Neo-Brutalist landing page with fluid particle background
│   │   ├── globals.css        # Global CSS variables, high-contrast borders, font utilities
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── login/         # Investor login page & modal
│   │   │   └── register/      # Registration with email autocompletion chips
│   │   └── (dashboard)/       # Authenticated dashboard views
│   │       ├── layout.tsx     # Dashboard frame, sidebar, header, dynamic SEO tags
│   │       ├── ai/            # AI Portfolio Architect form & results
│   │       ├── research/      # Mutual fund & stock search and screener
│   │       ├── watchlist/     # Real-time monitored tickers and pinned funds
│   │       └── settings/      # User risk preferences and profile settings
│   │
│   ├── components/            # Reusable UI component library
│   │   ├── ui/                # Base primitives (button, badge, dialog, input, card, slider)
│   │   │   └── fluid-particles-background.tsx  # HTML5 Canvas fluid particle engine
│   │   ├── auth/              # Auth dialogs, login forms, password strength meter
│   │   ├── ai/                # Portfolio allocation charts, Monte Carlo projections
│   │   ├── fund/              # Mutual fund metrics grid, NAV chart, rolling returns
│   │   ├── stock/             # Stock candlesticks, technical charts, financials
│   │   ├── dashboard/         # Dashboard summary cards, quick action tiles
│   │   └── common/            # Header, sidebar, footer, offline banner, error boundary
│   │
│   ├── lib/                   # Client-side utility functions and API connectors
│   │   ├── api/               # Typed HTTP client (`client.ts`) with cold-start retry
│   │   └── utils.ts           # Class merge helper (`cn`) and formatting utilities
│   │
│   ├── store/                 # Persistent Zustand global state stores
│   │   ├── authStore.ts       # Authentication state, JWT tokens, user profile
│   │   ├── portfolioStore.ts  # Cached AI portfolio allocations and target goals
│   │   └── watchlistStore.ts  # Starred securities and persistent tickers
│   │
│   └── __tests__/             # Unit tests for API config resolution and utilities
│
├── tailwind.config.ts         # Neo-Brutalism theme tokens, colors, and shadows
├── next.config.mjs            # Static export (`output: 'export'`) build settings
└── vercel.json                # Web-specific deployment fallback
```

---

## 2. API Gateway & Workers (`apps/api`)

A scalable Express.js backend engineered with security middleware, external scrapers, MongoDB time-series models, and BullMQ background job queues.

```text
apps/api/
├── src/
│   ├── main.ts                # Primary HTTP server entry point (port 4000)
│   ├── worker.ts              # BullMQ background job worker entry point
│   │
│   ├── routes/                # Express route controllers
│   │   ├── auth.ts            # Registration, login, Google OAuth, token refresh
│   │   ├── funds.ts           # AMFI mutual fund search, metrics, and details
│   │   ├── stocks.ts          # NSE/BSE stock quotes, history, and technicals
│   │   ├── portfolios.ts      # Portfolio generation, pinning, and retrieval
│   │   ├── ai.ts              # Gemini 1.5 Flash portfolio suggestions & explanations
│   │   ├── charts.ts          # Historical NAV and stock price time-series series
│   │   ├── reports.ts         # PDF generation job dispatch and retrieval
│   │   ├── favorites.ts       # User pinned favorites and watchlist persistence
│   │   ├── search.ts          # Search history tracking and auto-complete
│   │   └── health.ts          # Uptime, memory usage, node version, and DB status probe
│   │
│   ├── lib/                   # Internal core libraries and business logic
│   │   ├── calculations/      # Sharpe, Sortino, Alpha, Beta, CAGR, Max Drawdown
│   │   ├── constants/         # App constants, category benchmarks, queue names
│   │   ├── db/                # MongoDB Mongoose connection and Upstash Redis TLS client
│   │   ├── errors/            # AppError classes and global error handler
│   │   ├── external/          # AMFI scraper, mfapi.in adapter, Yahoo Finance, Gemini AI
│   │   ├── middleware/        # Rate limiting, auth JWT verification, CORS, audit logging
│   │   ├── models/            # Mongoose schemas (Fund, Stock, Portfolio, User, NAV)
│   │   ├── prompts/           # Guardrailed Gemini generative prompt templates
│   │   ├── services/          # Portfolio, fund, stock, and fallback rule engines
│   │   └── validators/        # Zod request payload schemas
│   │
│   ├── workers/               # Background task processors
│   │   ├── dataSyncWorker.ts  # Daily AMFI NAV and stock price synchronization
│   │   ├── metricCalcWorker.ts# Rolling returns and risk ratio calculation queue
│   │   └── pdfWorker.ts       # Headless Chromium PDF report generator
│   │
│   └── __tests__/             # 92 Vitest integration, unit, and performance tests
│
├── Dockerfile                 # Multi-stage production container image
└── vitest.config.ts           # Vitest configuration for API test suite
```

---

## 3. Shared Workspace Packages (`packages/`)

Packages consumed across multiple projects in the monorepo to ensure zero drift between frontend and backend contracts.

### `@arthora/shared` (`packages/shared`)
Pure TypeScript library with zero Node-specific runtime dependencies:
- **`types/`**: Common API response wrappers (`ApiResponse<T>`), User, Portfolio, Fund, and Stock models.
- **`schemas/`**: Shared Zod validation schemas for payload validation on both client and server.
- **`formatters/`**: Indian numbering notation formatters (`formatLakhsCrores`, `formatINR`, `formatPercent`).

### `@arthora/sdk` (`packages/sdk`)
Isomorphic TypeScript client library allowing third-party developers, test suites, or other microservices to consume the Arthora API with full type inference and automated authentication.

---

## 4. Mobile Application (`arthora_mobile`)

Cross-platform mobile application written in Flutter 3.29+:
- **`lib/core/`**: Dio network interceptors, Riverpod providers, theme definitions, local secure storage.
- **`lib/features/`**: Feature-first module structure covering Authentication, AI Goal Builder, Fund Research, Stock Charts, and Watchlist.

---

## 5. Scripts & Automation (`scripts/`)

- **`verify-all.ps1`**: Cross-platform PowerShell automated pre-commit quality gate (type-checks, lints, runs all 106 tests, and tests the Next.js static production build).
- **`verify-all.sh`**: Bash equivalent for Linux and macOS environments.
