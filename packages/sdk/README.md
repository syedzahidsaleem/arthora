# @arthora/sdk

Official TypeScript & JavaScript client SDK for **Arthora** — the institutional-grade financial analytics and AI portfolio builder for Indian markets.

## Installation

```bash
pnpm add @arthora/sdk
# or
npm install @arthora/sdk
# or
yarn add @arthora/sdk
```

## Quick Start

```typescript
import { createArthoraClient } from '@arthora/sdk';

const client = createArthoraClient({
  apiUrl: 'https://arthora-api.onrender.com', // Optional: defaults to production Render API
});

// 1. Search 40,000+ AMFI Mutual Funds
const funds = await client.funds.search({
  query: 'HDFC',
  category: 'Equity Scheme - Large Cap Fund',
  limit: 10,
});
console.log(funds.items);

// 2. Query NSE Stock Technicals & RSI
const technicals = await client.stocks.getTechnicals('TCS');
console.log(technicals);

// 3. Generate AI Portfolio Allocation
const suggestion = await client.portfolios.suggest({
  goal: 'Retirement Corpus',
  horizonYears: 15,
  riskTolerance: 'aggressive',
  monthlyInvestment: 25000,
});
console.log(suggestion);
```

## Supported Environments
- Node.js 18+ / 20+
- Modern Web Browsers (Chrome, Firefox, Safari, Edge)
- Bun & Deno
- React Native / Expo
- Cloudflare Workers / Vercel Edge Runtime

## License
MIT © 2026 Syed Zahid Saleem
