<div align="center">

# Arthora (अर्थोरा)

### *Intelligent Investment Research & Portfolio Architecture for Indian Retail Investors*

[![CI Pipeline](https://github.com/syedzahidsaleem/arthora/actions/workflows/ci.yml/badge.svg)](https://github.com/syedzahidsaleem/arthora/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7_Strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![Flutter](https://img.shields.io/badge/Flutter-3.29_Cross--Platform-02569B?logo=flutter)](https://flutter.dev)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Cluster_Active-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-TLS_Serverless-00E599?logo=redis)](https://upstash.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285F4?logo=google)](https://aistudio.google.com)
[![Render Backend](https://img.shields.io/badge/Render-API_Active-46E3B7?logo=render)](https://arthora-api.onrender.com/api/v1/health)
[![Vercel Production](https://img.shields.io/badge/Vercel-Web_Active-000000?logo=vercel)](https://out-sand-phi-45.vercel.app)

<br/>

[**Explore Live Web App**](https://out-sand-phi-45.vercel.app) • [**API Health Status**](https://arthora-api.onrender.com/api/v1/health) • [**Compliance & Legal**](docs/COMPLIANCE_AND_CERTIFICATIONS.md) • [**Security Policy**](SECURITY.md)

</div>

---

## 🌟 Overview

**Arthora** is an institutional-grade investment research platform designed specifically for the 14+ crore retail investors across India. By fusing real-time market data across 40,000+ mutual fund schemes and NSE/BSE listed equities with Google Gemini generative models and deterministic financial calculation engines, Arthora delivers tailored asset allocations, deep quantitative risk metrics, and instant research reports.

### Key Capabilities

- 🤖 **AI Portfolio Builder:** Generates goal-oriented asset allocation strategies across Large Cap, Mid Cap, Small Cap, Hybrid, and Debt with Monte Carlo probability projections.
- 📊 **40,000+ Mutual Fund Analytics:** Comprehensive AMFI directory parsing with 14 trailing ratios (CAGR, Sharpe, Sortino, Alpha, Beta, Max Drawdown, Rolling Returns).
- 📈 **Indian Equity Technicals & Fundamentals:** Real-time quotes, candlestick history, moving averages (SMA 20/50/200), RSI, MACD, PE, PB, and shareholding patterns.
- 🛡️ **Institutional Risk Governance:** Deterministic rule-based fallback engine protects against LLM hallucinations, ensuring allocations always sum to 100% within valid asset class boundaries.
- 📑 **Institutional PDF Reports:** Headless Chromium/Puppeteer generation engine for high-resolution downloadable mutual fund research briefs.
- 📱 **Cross-Platform Mobile Application:** Native iOS and Android application built with Flutter 3, Riverpod `StateNotifier`, and GoRouter.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────────────────────────────────────┐
                                  │                       Client Surfaces                       │
                                  │  ┌─────────────────────────┐   ┌──────────────────────────┐ │
                                  │  │   Next.js 14 Web App    │   │      Flutter Mobile      │ │
                                  │  │  https://out-sand-phi...│   │   (iOS / Android / Web)  │ │
                                  │  └────────────┬────────────┘   └────────────┬─────────────┘ │
                                  └───────────────┼─────────────────────────────┼───────────────┘
                                                  │ HTTPS / TLS 1.3             │
                                                  ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                 Arthora API Gateway                                                     │
│                                           https://arthora-api.onrender.com                                              │
│                                                                                                                         │
│  ┌───────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐   ┌─────────────────────────────┐  │
│  │   Helmet.js Security  │   │  XSS Sanitizer & 1MB   │   │  Redis Sliding-Window  │   │     Firebase Admin SDK      │  │
│  │   HSTS / CSP Preload  │──▶│     Body Guard         │──▶│     Rate Limiters      │──▶│  Dual JWT Rotation (Argon2) │  │
│  └───────────────────────┘   └────────────────────────┘   └────────────────────────┘   └─────────────────────────────┘  │
│                                                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ REST Routing & Services: /funds, /stocks, /portfolios, /ai, /charts, /reports, /favorites, /search, /health       │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────┬───────────────────────────────────────┬─────────────────────────────────┘
                                                │                                       │
                                                ▼                                       ▼
                     ┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
                     │         MongoDB Atlas Cluster       │         │          Upstash Redis (TLS)        │
                     │       arthora.2be4m1j.mongodb       │         │      refined-collie-149010.upstash  │
                     │  • Metadata & 15 Schemas            │         │  • Sliding-Window Rate Limit Keys   │
                     │  • Portfolios & Users               │         │  • Distributed Session Cache        │
                     │  • Indexed NAV & Price History      │         │  • BullMQ Task Queues               │
                     └─────────────────────────────────────┘         └──────────────────┬──────────────────┘
                                                                                        │
                                                                                        ▼
                                                                     ┌─────────────────────────────────────┐
                                                                     │     BullMQ Background Workers       │
                                                                     │  • NAV & Stock Price Sync Workers   │
                                                                     │  • Rolling Returns & Sharpe Calc    │
                                                                     │  • Headless Chromium PDF Generator  │
                                                                     └─────────────────────────────────────┘
```

---

## 🛡️ Security, Governance & Safety

Arthora is engineered with defense-in-depth security:

- **Distributed Rate Limiting:**
  - `General API Limiter:` 100 requests / minute per client
  - `Auth Limiter:` 10 requests / minute per IP to prevent credential stuffing
  - `AI Portfolio Limiter:` 10 requests / hour per user to protect LLM compute quotas
  - `Report Limiter:` 5 PDF generations / hour per user
- **Proxy & IP Integrity:** Configured with `app.set('trust proxy', 1)` to evaluate client IPs accurately behind reverse proxies (Render, Cloudflare, Vercel).
- **Cryptographic Foundations:**
  - Password hashing via memory-hard **Argon2id** (RFC 9106)
  - 256-bit cryptographically secure JWT secrets with Redis blacklisting on token revocation
- **XSS & Injection Protection:** Recursive input sanitization via `sanitize-html` and strict runtime schema enforcement with Zod.
- **Monitoring & Auditing:** Real-time error capturing via Sentry (`@sentry/node` and `@sentry/nextjs`).

For vulnerability reporting, review our [Security Policy](SECURITY.md).

---

## ⚖️ Regulatory Compliance & Certifications

> [!NOTE]
> **Arthora is NOT a SEBI-registered Investment Adviser (RIA) or Research Analyst (RA).**  
> All calculations, projections, and suggested allocations are provided strictly for educational and analytical purposes.

- **AMFI Open Data:** Mutual fund data is sourced via Association of Mutual Funds in India (AMFI) and mfapi.in public endpoints.
- **Market Data Notice:** Equity market quotes and candlestick series may be delayed up to 15 minutes in compliance with exchange policies.
- **DPDP Act 2023:** Full adherence to India's Digital Personal Data Protection Act 2023 with data minimization and right-to-erasure guarantees.

Read the complete [Regulatory Compliance & Certifications Document](docs/COMPLIANCE_AND_CERTIFICATIONS.md).

---

## 📦 Monorepo Structure

```text
arthora/
├── apps/
│   ├── api/                   # Express.js REST API & BullMQ workers
│   │   ├── src/main.ts        # Primary API server entry point
│   │   ├── src/worker.ts      # BullMQ background worker entry point
│   │   ├── src/lib/           # Calculations, external adapters, Mongoose models, middleware
│   │   └── src/__tests__/     # 91 unit, integration, and performance tests
│   └── web/                   # Next.js 14 App Router client (Static Export)
│       ├── src/app/           # Auth, Dashboard, AI Builder, Research, Watchlist, Settings
│       ├── src/components/    # shadcn/ui components, charts, and interactive calculators
│       └── src/store/         # Zustand global state stores with persistence
├── arthora_mobile/            # Cross-platform Flutter 3.29+ iOS/Android application
│   ├── lib/core/              # Network interceptors, theme tokens, storage adapters
│   └── lib/features/          # Auth, AI Portfolio, Research, Fund/Stock detail, Watchlist
├── packages/
│   └── shared/                # Pure TypeScript types, Zod schemas, INR formatters
├── docs/                      # PRD, Architecture, API Contract, Smoke Tests, Compliance
├── render.yaml                # Infrastructure-as-Code blueprint for Render deployment
└── .github/                   # CI/CD workflow, Dependabot, Issue & PR templates
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 20+ & pnpm 9+
- Flutter 3.29+ (for mobile development)
- Docker Desktop (optional, cloud databases already supported)

### 1. Clone & Install
```bash
git clone https://github.com/syedzahidsaleem/arthora.git
cd arthora
pnpm install
```

### 2. Environment Setup
```bash
# Backend environment variables
cp apps/api/.env.example apps/api/.env

# Frontend environment variables
cp apps/web/.env.example apps/web/.env.local
```

### 3. Build & Run
```bash
# Build shared library
pnpm --filter @arthora/shared build

# Start Backend API (runs on http://localhost:4000)
pnpm --filter @arthora/api dev

# Start Background Worker (separate terminal)
pnpm --filter @arthora/api dev:worker

# Start Web Client (runs on http://localhost:3000)
pnpm --filter @arthora/web dev

# Start Mobile App (separate terminal)
cd arthora_mobile
flutter run
```

---

## 🧪 Verification & Quality Standards

```bash
# Run strict TypeScript type checks across all packages
pnpm run type-check

# Run ESLint validation (0 errors, 0 warnings)
pnpm run lint

# Run all 91 unit, integration, and performance tests
pnpm run test

# Run full production build (API + Next.js static export)
pnpm run build
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for Indian Retail Investors • Maintained by <a href="https://github.com/syedzahidsaleem">Syed Zahid Saleem</a></sub>
</div>
