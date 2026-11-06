# Database Schema

## Database: MongoDB (document-based)

### Design Principles
- Financial data is inherently varied and non-normalized
- Lookups are frequent on specific fields
- Historical data grows unbounded
- Cached API responses stored alongside user-generated data

---

## Collection: `users`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Display name, max 100 chars |
| `email` | String | Unique, indexed (sparse) — can be null for Google-only |
| `firebaseUid` | String | Firebase Auth UID, unique index |
| `avatarUrl` | String | Google profile photo URL |
| `authProvider` | String | `"email"` or `"google"` |
| `emailVerified` | Boolean | Whether email is verified |
| `preferences` | Object | |
| `preferences.theme` | String | `"dark"` or `"light"` |
| `preferences.defaultTab` | String | `"ai"` or `"research"` |
| `preferences.currency` | String | `"INR"` (default) |
| `preferences.language` | String | `"en"` (default) |
| `preferences.exchange` | String | `"NSE"` for stocks (default NSE) |
| `fcmTokens` | Array of { token: String, platform: String, createdAt: Date } | FCM push notification tokens per device. See Mobile Auth Architecture. |
| `createdAt` | Date | |
| `updatedAt` | Date | |
| `lastLoginAt` | Date | |
| `isActive` | Boolean | Soft-delete flag |

**Indexes:** `{ firebaseUid: 1 }` (unique), `{ email: 1 }` (unique, sparse)

---

## Collection: `portfolios`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `userId` | ObjectId | Ref -> users |
| `name` | String | e.g., "Home Purchase Plan" |
| `goal` | String | Free-form goal text |
| `goalCategory` | String | Enum: retirement, education, home, wealth_building, tax_saving, emergency, vacation, other |
| `timePeriod` | Number | Years (1-30) |
| `riskLevel` | String | Enum: low, medium, high |
| `monthlyInvestment` | Number | Monthly SIP amount in INR |
| `lumpSum` | Number | Optional lump sum in INR |
| `currentAge` | Number | Optional user age |
| `riskDescription` | String | User's own description of volatility tolerance |
| `aiSuggestion` | Object | Latest AI suggestion |
| `aiSuggestion.model` | String | e.g., "3-fund portfolio" |
| `aiSuggestion.allocation` | Array | See sub-schema below |
| `aiSuggestion.projectedValue` | Number | Projected corpus at goal date |
| `aiSuggestion.rebalancing` | String | "yearly", "half-yearly" |
| `aiSuggestion.explanation` | String | Full AI explanation |
| `aiSuggestion.generatedAt` | Date | |
| `aiSuggestion.aiModel` | String | "gemini-1.5-flash" |
| `aiSuggestion.disclaimer` | String | "Not SEBI registered advice" |
| `history` | Array | Past AI suggestions |
| `isPinned` | Boolean | User pins this portfolio to dashboard. **Not** the same as favorites (which is for watchlisted external funds/stocks). |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### Allocation Sub-schema

| Field | Type | Description |
|-------|------|-------------|
| `assetType` | String | mutual_fund or stock |
| `name` | String | Fund scheme name or stock company name |
| `ticker` | String | NSE ticker (stocks) or null (MF) |
| `isin` | String | ISIN code for mutual funds |
| `schemeCode` | Number | AMFI scheme code (MFs) |
| `category` | String | e.g., "large cap", "small cap", "mid cap", "hybrid", "debt" |
| `allocationPercent` | Number | 0-100 |
| `reason` | String | One-liner: why this works for the user |
| `expectedReturn` | Number | Expected CAGR (projected) |

**Indexes:** `{ userId: 1 }`, `{ userId: 1, createdAt: -1 }`

---

## Collection: `funds_metadata`

Cached AMFI fund details. Updated daily.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `schemeCode` | Number | AMFI scheme code (unique, indexed) |
| `isin` | String | ISIN (unique, indexed) |
| `isinReinvest` | String | Reinvestment ISIN |
| `schemeName` | String | Full scheme name |
| `fundHouse` | String | e.g., "HDFC Mutual Fund" |
| `category` | String | e.g., "Equity: Large Cap" |
| `subCategory` | String | e.g., "Value Oriented" |
| `schemeType` | String | e.g., "Open Ended Schemes" |
| `navStartDate` | Date | NAV tracking start date |
| `navStartValue` | Number | Starting NAV value |
| `riskLevel` | String | AMFI risk level |
| `amfiCode` | Number | Also store for cross-ref |
| `isActive` | Boolean | Active scheme or merged/closed |
| `benchmark` | String | Benchmark index name |
| `lastUpdated` | Date | When metadata was last refreshed |

**Indexes:** `{ schemeCode: 1 }` (unique), `{ isin: 1 }` (unique), `{ fundHouse: 1 }`, `{ category: 1 }`, `{ schemeName: "text" }`

---

## Collection: `fund_nav_history`

Time-series NAV data. Extremely high volume.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `schemeCode` | Number | Ref -> funds_metadata.schemeCode |
| `date` | Date | NAV date (trading day) |
| `nav` | Number | NAV value |
| `source` | String | amfi or calculated |

**Indexes:** `{ schemeCode: 1, date: -1 }` (compound unique), `{ date: -1 }`
**Projected growth:** ~250K documents/year (500 schemes x 250 trading days)

---

## Collection: `fund_metrics`

Pre-computed metrics to avoid heavy aggregations on read.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `schemeCode` | Number | Unique reference |
| `expenseRatio` | Number | Latest expense ratio in % |
| `expenseRatioDate` | Date | Date of last reported ER |
| `cagr1Y` | Number | CAGR in % |
| `cagr3Y` | Number | CAGR in % |
| `cagr5Y` | Number | CAGR in % |
| `cagr10Y` | Number | CAGR in % or null |
| `xirr` | Number | XIRR in % (if available) |
| `sharpeRatio` | Number | |
| `sortinoRatio` | Number | |
| `alpha` | Number | |
| `beta` | Number | |
| `stdDev` | Number | Standard deviation |
| `maxDrawdown` | Number | Maximum drawdown in % |
| `aum` | Number | Total AUM in INR crores |
| `aumDate` | Date | |
| `fundManagerName` | String | Name(s) of fund manager(s) |
| `fundManagerTenure` | Number | Tenure in years |
| `rollingReturn1Y` | Array of {date, value} | Rolling 1-year returns history |
| `rollingReturn3Y` | Array of {date, value} |
| `turnoverRatio` | Number | Portfolio turnover ratio |
| `minSIP` | Number | Minimum SIP amount |
| `minLumpsum` | Number | Minimum lump sum investment |
| `exitLoad` | String | Exit load description |
| `ratings` | Object | e.g., {morningstar: 4, valueResearch: 3} |
| `calculatedAt` | Date | When metrics were last computed |

**Indexes:** `{ schemeCode: 1 }` (unique), `{ category: 1, cagr3Y: -1 }`, `{ expenseRatio: 1 }`

---

## Collection: `fund_holdings`

Portfolio holdings of each fund, as reported by AMFI monthly.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `schemeCode` | Number | |
| `reportDate` | Date | |Holding date |
| `holdings` | Array | Sub-schema below |
| `totalAUM` | Number | Total AUM at report date |
| `createdAt` | Date | |

### Holdings Sub-schema

| Field | Type | Description |
|-------|------|-------------|
| `symbol` | String | Stock symbol (e.g., "RELIANCE") |
| `name` | String | Company name |
| `sector` | String | e.g., "Banking", "IT", "Pharma" |
| `marketCapType` | String | large, mid, or small |
| `percentage` | Number | % of portfolio |
| `value` | Number | Absolute value in INR |
| `shares` | Number | Number of shares held |

**Indexes:** `{ schemeCode: 1, reportDate: -1 }`, `{ "holdings.sector": 1 }`

---

## Collection: `fund_sector_alloc`

Sector allocation breakdown.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `schemeCode` | Number | |
| `reportDate` | Date | |
| `sectors` | Array of { sectorName: String, percentage: Number } | |
| `marketCapAlloc` | Array of { capType: String, percentage: Number } | Large/Mid/Small split |

**Indexes:** `{ schemeCode: 1, reportDate: -1 }`

---

## Collection: `stocks_metadata`

Indian stock metadata from Yahoo Finance + manual enrichments.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `nseSymbol` | String | NSE ticker (e.g., "RELIANCE") |
| `bseSymbol` | String | BSE ticker (e.g., "500325") |
| `isin` | String | ISIN code |
| `companyName` | String | Full company name |
| `sector` | String | Industry sector |
| `industry` | String | Sub-industry |
| `exchange` | String | "NSE" or "BSE" |
| `yahooTicker` | String | e.g., "RELIANCE.NS" |
| `marketCap` | Number | In INR crores |
| `marketCapClass` | String | large, mid, or small |
| `faceValue` | Number | Face value per share |
| `listingDate` | Date | When it was listed |
| `isActive` | Boolean | Active or delisted |
| `lastUpdated` | Date | |

**Indexes:** `{ nseSymbol: 1 }` (unique), `{ isin: 1 }` (unique, sparse), `{ sector: 1 }`, `{ companyName: "text" }`, `{ nseSymbol: "text" }`

---

## Collection: `stock_metrics`

Pre-computed stock fundamental metrics.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `nseSymbol` | String | Ref -> stocks_metadata.nseSymbol |
| `peRatio` | Number | TTM P/E ratio |
| `forwardPe` | Number | Forward P/E |
| `pbRatio` | Number | Price-to-book |
| `dividendYield` | Number | In % |
| `marketCap` | Number | In INR crores |
| `enterpriseValue` | Number | |
| `revenueTTM` | Number | Revenue trailing 12 months (INR crores) |
| `revenueGrowth` | Number | YoY revenue growth % |
| `profitTTM` | Number | Net profit TTM (INR crores) |
| `profitGrowth` | Number | YoY profit growth % |
| `debtEquity` | Number | Debt-to-equity ratio |
| `roe` | Number | Return on equity % |
| `roce` | Number | Return on capital employed % |
| `eps` | Number | EPS TTM |
| `epsGrowth` | Number | YoY EPS growth % |
| `promoterHolding` | Number | % promoter holding |
| `promoterHoldingChange` | Number | Change in promoter holding % |
| `fiiHolding` | Number | % FII holding |
| `diiHolding` | Number | % DII holding |
| `sectorPe` | Number | Sector average P/E |
| `calculatedAt` | Date | |

**Indexes:** `{ nseSymbol: 1 }` (unique), `{ sector: 1, peRatio: 1 }`

---

## Collection: `stock_price_history`

Time-series of daily price data.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `nseSymbol` | String | |
| `date` | Date | Trading date |
| `open` | Number | |
| `high` | Number | |
| `low` | Number | |
| `close` | Number | |
| `volume` | Number | |
| `adjustedClose` | Number | For splits/dividends |
| `dividend` | Number | If any |

**Indexes:** `{ nseSymbol: 1, date: -1 }` (compound unique), `{ date: -1 }`
**Projected growth:** ~4M docs/year (1500 stocks x 250 trading days)

---

## Collection: `favorites`

**Purpose:** Watchlist for external fund/stock lookup. **Not** the same as `portfolios.isPinned` (which pins user-created portfolio plans to dashboard).

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `userId` | ObjectId | |
| `itemType` | String | "mutual_fund" or "stock" |
| `itemId` | String | schemeCode (MF) or nseSymbol (stock) |
| `itemName` | String | Denormalized for quick display |
| `addedAt` | Date | |
| `notes` | String | Optional user note |

**Indexes:** `{ userId: 1, itemType: 1, itemId: 1 }` (unique compound), `{ userId: 1 }`

---

## Collection: `search_history`

Tracks user search queries. **Mirrored by GET /search/history endpoint.**

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `userId` | ObjectId | |
| `query` | String | Raw search text |
| `resultType` | String | fund, stock, or both |
| `resultCount` | Number | Number of results returned |
| `searchedAt` | Date | |

**Indexes:** `{ userId: 1, searchedAt: -1 }`

**API:** `GET /search/history` returns paginated search history for authenticated user.

---

## Collection: `reports`

Stores generated reports (PDF/JSON) for download.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `reportId` | String | UUID v4 (unique, indexed) |
| `userId` | ObjectId | Ref -> users |
| `type` | String | "fund" or "stock" |
| `status` | String | generating, ready, or failed |
| `downloadUrl` | String | Pre-signed URL to storage (S3/R2 or Railway volume) |
| `expiresAt` | Date | TTL for the download URL |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:** `{ reportId: 1 }` (unique), `{ userId: 1 }`, `{ expiresAt: 1 }` (TTL index for auto-cleanup)

---

## Collection: `ai_suggestion_cache`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `inputHash` | String | MD5 hash of goal+risk+period+amount (unique) |
| `userInput` | Object | Original input params |
| `suggestion` | Object | Full suggestion |
| `hitCount` | Number | Reuse counter |
| `createdAt` | Date | |
| `expiresAt` | Date | TTL index (7 days) |

**Indexes:** `{ inputHash: 1 }` (unique), `{ expiresAt: 1 }` (TTL)

---

## Collection: `sessions`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `userId` | ObjectId | |
| `refreshToken` | String | Hashed refresh token |
| `deviceInfo` | Object | User agent, platform |
| `ipAddress` | String | |
| `lastActiveAt` | Date | |
| `expiresAt` | Date | TTL (30 days) |
| `createdAt` | Date | |

**Indexes:** `{ userId: 1 }`, `{ expiresAt: 1 }` (TTL)

---

## Entity Relationship Summary

```
users ──── has many ──── portfolios
users ──── has many ──── favorites
users ──── has many ──── search_history
users ──── has many ──── sessions (through auth)
users ──── has many ──── reports
         ┌────────────────┐
         │ funds_metadata  │── has many ── fund_nav_history
         │                 │── has 1 ───── fund_metrics
         │                 │── has many ── fund_holdings
         │                 │── has many ── fund_sector_alloc
         └────────────────┘
         ┌────────────────┐
         │ stocks_metadata │── has many ── stock_price_history
         │                 │── has 1 ───── stock_metrics
         └────────────────┘
favorites references either funds_metadata.schemeCode or stocks_metadata.nseSymbol
```

## Data Retention Policy

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| User accounts | Forever (until deleted) | User request |
| NAV/Price history | Forever | Financial analysis requires depth |
| AI suggestions | 7 days cache, forever in user portfolio | Personalized history |
| Search history | 90 days | Privacy + analytics |
| Sessions | 30 days or until logout | Security |
| Reports | 7 days (TTL on expiresAt) | Temporary storage, auto-cleanup |
| Rate limit counters | 1 hour (sliding window) | Transient |
