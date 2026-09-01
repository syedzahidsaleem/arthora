# Arthora

AI-powered investment research platform for Indian retail investors.

## Features
- **AI Portfolio Builder**: Tailored multi-asset portfolio recommendations powered by Google Gemini 1.5 Flash
- **40,000+ Mutual Fund Research**: Comprehensive AMFI scheme directory, NAV history, and quantitative metrics (CAGR, Sharpe, Sortino, Max Drawdown)
- **Indian Stock Analytics**: Real-time NSE/BSE stock quotes, 14 fundamental ratios, technical momentum indicators (RSI, MACD, SMAs), and shareholding breakdown
- **Historical Visualizations & SIP Calculators**: Dynamic charts, real-time compound projections, and sector allocation graphs
- **Institutional PDF Reports**: High-resolution downloadable mutual fund research briefs powered by Puppeteer & Chromium
- **Cross-Platform Mobile Apps**: Native iOS and Android apps built with Flutter, Riverpod, and GoRouter

## Tech Stack

| Layer | Technology |
|---|---|
| **Web Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS 3, shadcn/ui, Recharts |
| **Mobile App** | Flutter 3.16+, Riverpod, GoRouter, fl_chart |
| **Backend API & Workers** | Node.js 20, Express.js 4, TypeScript, BullMQ |
| **Databases & Cache** | MongoDB Atlas (Mongoose 8), Redis (ioredis / Upstash) |
| **Authentication** | Firebase Admin/Client SDK (Email/Password + Google OAuth) & Argon2id JWT |
| **Artificial Intelligence** | Google Gemini 1.5 Flash via `@google/generative-ai` |
| **Error Monitoring** | Sentry (`@sentry/node` & `@sentry/nextjs`) |
| **Deployment** | Vercel (Web static export), Railway (API & Worker Docker containers) |

## Monorepo Architecture

```text
arthora/
├── apps/
│   ├── api/             # Express.js REST API & BullMQ workers
│   │   ├── src/main.ts    # API Server entry point
│   │   └── src/worker.ts  # BullMQ background worker entry point
│   └── web/             # Next.js 14 App Router web client
├── arthora_mobile/      # Standalone Flutter iOS & Android application
├── packages/
│   └── shared/          # Shared Zod schemas, TypeScript types, and formatters
├── docs/                # Architecture guides, API specs, and smoke test checklists
└── .github/workflows/   # Automated CI/CD pipelines
```

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker Desktop
- Flutter 3.16+ (for mobile development)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/arthora.git
   cd arthora
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```
4. Start Redis and MongoDB via Docker:
   ```bash
   docker-compose up -d
   ```
5. Run development servers:
   ```bash
   pnpm dev
   ```
   - Web App: [http://localhost:3000](http://localhost:3000)
   - API Server: [http://localhost:4000](http://localhost:4000)
   - API Health Check: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

### Mobile App (Flutter)
1. Navigate to the mobile directory:
   ```bash
   cd arthora_mobile
   ```
2. Fetch Flutter packages:
   ```bash
   flutter pub get
   ```
3. Run on connected device or simulator:
   ```bash
   flutter run
   ```

## Environment Variables

### Backend (`apps/api/.env`)
| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `REDIS_URL` | Upstash Redis connection string (`rediss://`) | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account client email | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | Yes |
| `JWT_SECRET` | 256-bit random hex string (`openssl rand -hex 32`) | Yes |
| `JWT_REFRESH_SECRET` | 256-bit random hex string for refresh tokens | Yes |
| `GEMINI_API_KEY` | Google AI Studio API key | Yes |
| `PORT` | API server listen port (default: 4000) | No |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | Yes |
| `SENTRY_DSN` | Sentry DSN for backend error tracking | No |

### Frontend (`apps/web/.env.local`)
| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web client API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app ID | Yes |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for client error tracking | No |

## Deployment

### Railway (Backend API & Worker)
1. Install Railway CLI: `npm install -g @railway/cli`
2. Link project: `railway link`
3. Configure environment variables in Railway dashboard
4. Deploy API and Worker services defined in `railway.toml`

### Vercel (Web Frontend)
1. Install Vercel CLI: `npm install -g vercel`
2. Run build and deployment from workspace:
   ```bash
   vercel --prod
   ```

## SEBI Compliance Disclaimer
Arthora is not a SEBI registered investment advisor or research analyst. All portfolio recommendations, mutual fund analyses, stock metrics, and risk projections are generated algorithmically for informational and educational purposes only. Investing in financial securities involves risk of loss. Past performance does not guarantee future returns.
