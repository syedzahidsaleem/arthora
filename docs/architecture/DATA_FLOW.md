# Data Flow: mfapi.in, Yahoo Finance, and Gemini AI

## Overview

All external data follows a **Read-Through Cache** pattern with **Background Sync** jobs. No user request ever hits an external API directly in the critical path — all reads come from Redis or MongoDB first.

---

## 1. Mutual Fund Data Flow (mfapi.in)

### Source: mfapi.in
- **Base URL:** `https://api.mfapi.in/mf`
- **Auth:** None (free, no API key)
- **Rate Limit:** Undocumented, but observed ~100 req/min before throttling
- **Data:** AMFI-sourced, updated daily after 11:30 PM IST

### API Endpoints Used

| mfapi.in Endpoint | Purpose | Call Frequency |
|---|---|---|
| `GET /mf` | List all scheme codes + names | Daily (midnight sync) |
| `GET /mf/{schemeCode}` | Scheme details + latest NAV | On demand (cached) |
| `GET /mf/{schemeCode}/nav` | Full NAV history (all dates) | Weekly bulk + daily incremental |

### Flow Diagram

```
                        ┌─────────────────────────────────┐
                        │     DAILY SYNC (6 PM IST)       │
                        │     BullMQ Cron Job              │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  Fetch GET /mf (all schemes)     │
                        │  ~40,000 scheme codes             │
                        │  Response: [{schemeCode, name}]  │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  Upsert into funds_metadata     │
                        │  (MongoDB)                       │
                        │  - New schemes: INSERT           │
                        │  - Existing: UPDATE if changed   │
                        │  - Mark inactive if missing      │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  For POPULAR schemes only        │
                        │  (~500: Nifty50 index funds,     │
                        │   top AUM, user favorites)       │
                        │                                  │
                        │  Fetch GET /mf/{code}/nav        │
                        │  Parse NAV array                 │
                        │  Upsert fund_nav_history          │
                        │  (only new dates, not full list) │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  Trigger metrics recalculation   │
                        │  for updated schemes             │
                        │  (CAGR, Sharpe, etc.)           │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  Update Redis cache              │
                        │  - fund:{schemeCode}:detail      │
                        │  - fund:{schemeCode}:metrics     │
                        │  - fund:search:* (invalidate)    │
                        └─────────────────────────────────┘
```

### On-Demand Fetch (User Searches a Fund)

```
User searches "HDFC Top 100"
       │
       ▼
GET /funds/search?q=HDFC+Top+100
       │
       ▼
Check Redis: fund:search:hdfc+top+100
       │
       ├── HIT → Return cached results (TTL: 1h)
       │
       └── MISS → Query MongoDB text index on funds_metadata
                   │
                   ├── RESULTS FOUND → Return + cache in Redis (TTL: 1h)
                   │
                   └── NO RESULTS → Fetch mfapi.in GET /mf?q=...
                                     │
                                     └── Parse + store + return + cache
```

### On-Demand Fetch (User Views Fund Detail)

```
User clicks fund detail page
       │
       ▼
GET /funds/120523
       │
       ▼
Check Redis: fund:120523:detail (TTL: 24h for metadata)
       │
       ├── HIT → Return
       │
       └── MISS → Check MongoDB funds_metadata
                   │
                   ├── FOUND → Return + cache in Redis
                   │
                   └── NOT FOUND → Fetch mfapi.in GET /mf/120523
                                   │
                                   ├── Success → Store in MongoDB + Redis + Return
                                   │
                                   └── 404 → Return 404 to client


GET /funds/120523/metrics
       │
       ▼
Check Redis: fund:120523:metrics (TTL: 24h)
       │
       ├── HIT → Return
       │
       └── MISS → Check MongoDB fund_metrics
                   │
                   ├── FOUND → Return + cache in Redis
                   │
                   └── NOT FOUND → Trigger sync worker
                                   │
                                   └── Worker calculates from NAV history
                                      (CAGR, Sharpe, Alpha, Beta, etc.)
                                      Store in fund_metrics + Redis


GET /funds/120523/nav-history?from=2024-01-01&to=2025-06-12
       │
       ▼
Check Redis: fund:120523:nav:2024-01-01:2025-06-12 (TTL: 1h)
       │
       ├── HIT → Return
       │
       └── MISS → Check MongoDB fund_nav_history
                   │
                   ├── FOUND (sufficient data) → Return + cache
                   │
                   └── INSUFFICIENT DATA → Fetch from mfapi.in
                       GET /mf/120523/nav
                       │
                       └── Store all new NAVs in fund_nav_history
                          Return requested range + cache in Redis
```

### Caching Strategy (Funds)

| Data Type | Redis Key Pattern | TTL | MongoDB Source |
|-----------|-------------------|-----|----------------|
| Search results | `fund:search:{query_hash}` | 1 hour | funds_metadata (text index) |
| Fund detail | `fund:{code}:detail` | 24 hours | funds_metadata |
| Fund metrics | `fund:{code}:metrics` | 24 hours | fund_metrics |
| NAV history (short) | `fund:{code}:nav:{from}:{to}` | 1 hour | fund_nav_history |
| Holdings | `fund:{code}:holdings` | 7 days | fund_holdings |
| Sector allocation | `fund:{code}:sector` | 7 days | fund_sector_alloc |
| Peer comparison | `fund:{code}:peers` | 24 hours | fund_metrics (aggregation) |
| Top funds per category | `fund:category:{cat}:top` | 24 hours | fund_category_top (materialized aggregation) |

---

## 2. Stock Data Flow (Yahoo Finance)

### Source: yahoo-finance2 (npm package)
- **Package:** `yahoo-finance2` (server-side Node.js only)
- **Auth:** None (scrapes Yahoo Finance, no API key)
- **Rate Limit:** ~2000 req/hour from same IP (undocumented)
- **Data:** NSE (`.NS` suffix) and BSE (`.BO` suffix) stocks

### API Methods Used

| yahoo-finance2 Method | Purpose | Call Frequency |
|---|---|---|
| `quote(symbol)` | Current price, change, 52w high/low | Every 15 min during market hours |
| `quoteSummary(symbol, modules)` | P/E, P/B, market cap, revenue, profit, holdings | Daily (post-market) |
| `historical(symbol, options)` | OHLCV price history | On demand / weekly bulk |
| `recommendationsBySymbol(symbol)` | Similar stocks | On demand (cached) |

### Flow Diagram

```
                        ┌─────────────────────────────────┐
                        │   MARKET HOURS SYNC (9:15-15:30)│
                        │   Every 15 minutes                │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  Fetch Nifty 50 + Nifty Next 50  │
                        │  + user favorites (AppBundle100 )│
                        │  ~150 popular stocks              │
                        │                                  │
                        │  For each ticker (RELIANCE.NS):  │
                        │    yahoo-finance2.quote()         │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  Upsert into stock_price_history │
                        │  (MongoDB) — only if date is new │
                        │  Update Redis: stock:{sym}:price │
                        │  (TTL: 15 min during hours)      │
                        └─────────────────────────────────┘


                        ┌─────────────────────────────────┐
                        │   POST-MARKET SYNC (4 PM IST)    │
                        │   BullMQ Cron Job                │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  For each popular stock:         │
                        │  yahoo-finance2.quoteSummary()   │
                        │  Fetch: P/E, P/B, marketCap,     │
                        │  revenue, profit, debt/equity    │
                        │  holdings pattern, etc.           │
                        └──────────────┬──────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │  Upsert into stock_metrics       │
                        │  (MongoDB)                        │
                        │  Update Redis: stock:{sym}:metrics│
                        │  (TTL: 24h)                       │
                        └─────────────────────────────────┘
```

### On-Demand Fetch (User Searches a Stock)

```
User searches "Reliance"
       │
       ▼
GET /stocks/search?q=Reliance
       │
       ▼
Check Redis: stock:search:reliance (TTL: 1h)
       │
       ├── HIT → Return
       │
       └── MISS → Query MongoDB stocks_metadata
                   (text index on companyName + nseSymbol)
                   │
                   ├── RESULTS → Return + cache
                   │
                   └── NO RESULTS → Fetch yahoo-finance2.search()
                                     │
                                     └── Parse + store + return + cache
```

### Caching Strategy (Stocks)

| Data Type | Redis Key Pattern | TTL | During Market Hours |
|-----------|-------------------|-----|---------------------|
| Search results | `stock:search:{query_hash}` | 1h | 15 min |
| Stock detail | `stock:{sym}:detail` | 24h | 5 min |
| Stock metrics | `stock:{sym}:metrics` | 24h | 1h |
| Stock price (current) | `stock:{sym}:price` | 1h | 15 min |
| Price history | `stock:{sym}:history:{from}:{to}` | 1h | 15 min |
| Technical indicators | `stock:{sym}:technical:{period}` | 1h | 30 min |

---

## 3. AI Data Flow (Google Gemini)

### Source: Google Gemini 1.5 Flash API
- **SDK:** `@google/generative-ai` npm package
- **Auth:** Gemini API Key (free tier)
- **Rate Limit:** 15 RPM, 1M tokens/min, 1500 RPD
- **Model:** `gemini-1.5-flash`

### Flow Diagram

```
User creates portfolio
       │
       ▼
POST /portfolios (or POST /ai/suggest)
       │
       ▼
┌─────────────────────────────────────────┐
│ 1. Validate input (Zod)                │
│ 2. Check AI cache: MongoDB              │
│    ai_suggestion_cache                  │
│    inputHash = MD5(goal+risk+period+amt)│
│                                         │
│    ├── CACHE HIT → Return cached result │
│    │   (increment hitCount)             │
│    │                                    │
│    └── CACHE MISS → Continue to API     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Build Gemini prompt with:            │
│    - User goal text                     │
│    - Risk level + description           │
│    - Time period                        │
│    - Monthly investment amount          │
│    - Current age                        │
│    - INDIAN MUTUAL FUND CONTEXT:        │
│      * Top funds per category (from DB) │
│      * Their CAGR, ER, AUM (from DB)   │
│      * Indian market benchmarks         │
│                                         │
│    Prompt outputs: JSON with            │
│    - portfolio model name               │
│    - fund/stock allocation array         │
│    - each with reason, expected return  │
│    - projected value                    │
│    - rebalancing frequency              │
│    - disclaimer                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Call Gemini 1.5 Flash API            │
│    - Temperature: 0.3 (low, consistent) │
│    - Max tokens: 4096                   │
│    - Response format: JSON              │
│                                         │
│    ├── SUCCESS → Parse JSON response    │
│    │   Validate against Zod schema      │
│    │   Verify fund ISINs exist in DB    │
│    │   Store in ai_suggestion_cache     │
│    │   Return to user                   │
│    │                                    │
│    ├── RATE LIMITED → Queue for retry   │
│    │   Return status: "generating"      │
│    │   Retry in 10s, max 3 attempts     │
│    │                                    │
│    └── FAILURE → Fallback to            │
│        rules-based engine               │
│        (pre-built templates)            │
└─────────────────────────────────────────┘
```

---

## 4. AI Fund Query: "Top Funds Per Category" (Blocker #6 Resolution)

### How the AI engine queries "top funds per category"

The AI service needs to know which real Indian funds to suggest. It queries a **pre-computed materialized aggregation** stored in the `fund_category_top` cache collection, NOT a live aggregation pipeline.

### Implementation

**Collection: `fund_category_top`** (materialized view, not in main schema — lightweight cache)

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | |
| `category` | String | e.g., "Equity: Large Cap" |
| `asOfDate` | Date | When this snapshot was computed |
| `funds` | Array | Top 5 funds, sorted by composite score |
| `funds[].schemeCode` | Number | |
| `funds[].schemeName` | String | |
| `funds[].isin` | String | |
| `funds[].cagr3Y` | Number | 3Y CAGR % |
| `funds[].cagr5Y` | Number | 5Y CAGR % |
| `funds[].expenseRatio` | Number | % |
| `funds[].aum` | Number | INR crores |
| `funds[].sharpeRatio` | Number | |
| `funds[].compositeScore` | Number | Weighted = 0.3*sharpeRatio + 0.2*(1/expenseRatio) + 0.2*cagr5Y + 0.15*aum_normalized + 0.15*maxDrawdown_inverse |

**Indexes:** `{ category: 1 }` (unique)

### Aggregation Query (used to populate `fund_category_top`)

```javascript
db.fund_metrics.aggregate([
  {
    $match: {
      "cagr3Y": { $exists: true, $ne: null },
      "sharpeRatio": { $exists: true, $ne: null },
      "aum": { $gt: 100 }
    }
  },
  {
    $lookup: {
      from: "funds_metadata",
      localField: "schemeCode",
      foreignField: "schemeCode",
      as: "metadata"
    }
  },
  { $unwind: "$metadata" },
  {
    $match: {
      "metadata.isActive": true,
      "metadata.category": { $exists: true, $ne: null }
    }
  },
  {
    $addFields: {
      compositeScore: {
        $add: [
          { $multiply: ["$sharpeRatio", 0.3] },
          { $multiply: [{ $divide: [1, "$expenseRatio"] }, 0.2] },
          { $multiply: ["$cagr5Y", 0.2] },
          { $multiply: [{ $divide: ["$aum", 50000] }, 0.15] },
          { $multiply: [{ $divide: [1, "$maxDrawdown"] }, 0.15] }
        ]
      }
    }
  },
  {
    $sort: { "metadata.category": 1, compositeScore: -1 }
  },
  {
    $group: {
      _id: "$metadata.category",
      funds: { $push: "$$ROOT" }
    }
  },
  {
    $project: {
      _id: 0,
      category: "$_id",
      funds: {
        $slice: ["$funds", 5]
      }
    }
  }
])
```

### Refresh Schedule

| Schedule | What happens |
|----------|-------------|
| **Daily at 6:30 PM IST** (after NAV sync completes) | Worker runs the aggregation pipeline. Upserts results into `fund_category_top`. Updates Redis key `fund:category:{cat}:top` (TTL: 24h). |
| **On-demand (cache miss)** | If Redis key `fund:category:{cat}:top` is missing AND `fund_category_top` has no data for that category, the AI service triggers a one-off aggregation run (blocks for ~2s). Caches result for 24h. |

### How AI service consumes this data

```
AI Service (Building Gemini Prompt)
       │
       ▼
┌──────────────────────────────────────────────────┐
│ 1. Determine relevant categories based on       │
│    user risk level:                               │
│    - Low risk: ["Debt: Gilt", "Debt: Short",     │
│                  "Hybrid: Conservative"]          │
│    - Medium risk: ["Equity: Large Cap",          │
│                     "Hybrid: Aggressive",         │
│                     "Debt: Short"]                │
│    - High risk: ["Equity: Mid Cap",              │
│                   "Equity: Small Cap",            │
│                   "Equity: Flexi Cap"]            │
│                                                    │
│ 2. For each relevant category:                   │
│    Check Redis: fund:category:{cat}:top           │
│       │                                            │
│       ├── HIT → Use cached top 5 funds            │
│       │                                            │
│       └── MISS → Check MongoDB fund_category_top  │
│                   │                                │
│                   ├── FOUND → Return + cache Redis │
│                   │                                │
│                   └── NOT FOUND → Run aggregation  │
│                       pipeline on-demand           │
│                       (blocks ~2s, then caches)    │
│                                                    │
│ 3. Inject top 5 funds per category into prompt    │
│    Ex: "CATEGORY: Equity: Large Cap               │
│         1. HDFC Top 100 (INF109K01Z77)             │
│            CAGR 5Y: 12.8%, ER: 1.15%, AUM: 25K Cr │
│         2. ICICI Bluechip (INF109K01Z85)           │
│            ..."                                    │
│                                                    │
│ 4. AI is instructed to ONLY suggest funds from    │
│    this list (grounded in real data, no hallucinations) │
└──────────────────────────────────────────────────┘
```

### Why materialized aggregation, not live query or materialized view?

1. **DO NOT use live aggregation pipeline on every AI request:** The `fund_metrics` collection has 40K+ documents. The pipeline with `$lookup` + `$sort` + `$group` takes ~2-5 seconds. Running this on every AI request would add unacceptable latency and burn compute.

2. **DO NOT use MongoDB materialized views:** Atlas M0 (free tier) does not support `$onCreate` materialized views (requires Atlas Triggers or Atlas App Services, which add complexity).

3. **USE pre-computed cache collection (`fund_category_top`):** Simple, fast reads (<10ms). Updated daily by background worker. Zero dependency on MongoDB features not available in free tier.

4. **Redis caching on top:** Even the cache collection read is avoided if Redis has it. Two-tier cache: Redis (hot, 24h TTL) -> MongoDB `fund_category_top` (warm, daily refresh) -> Aggregation (cold, on-demand).

---

## 5. Mobile Auth Data Flow (Blocker #7 Resolution)

### Token Lifecycle on Mobile

```
[App Launch]
    │
    ├─→ Check `shared_preferences` for saved accessToken
    │     │
    │     ├── EXISTS + NOT EXPIRED → Use it for all API calls
    │     │
    │     ├── EXISTS + EXPIRED → Attempt token refresh
    │     │     │
    │     │     ├─→ POST /auth/refresh { refreshToken }
    │     │     │    ├── 200 → Store new tokens, continue
    │     │     │    └── 401 → Clear all tokens, redirect to login
    │     │     │
    │     │     └── If refreshToken also expired or invalid:
    │     │          └─→ Clear all tokens, redirect to login
    │     │
    │     └── NOT EXISTS → Show login screen
    │
[Login Screen]
    │
    ├─→ Google OAuth: Firebase Auth SDK → idToken
    │     └─→ POST /auth/google { idToken }
    │         └─→ 200 → Store accessToken + refreshToken
    │
    └─→ Email/Password: Firebase Auth SDK → idToken
          └─→ POST /auth/login { email, password }
              └─→ 200 → Store accessToken + refreshToken
```

### Dio Interceptor Configuration

```dart
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final accessToken = await _secureStorage.getAccessToken();
    if (accessToken != null) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }
    options.headers['X-Platform'] = Platform.isIOS ? 'ios' : 'android';
    options.headers['X-Client-Version'] = '1.0.0';
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expired — attempt refresh
      final newToken = await _refreshToken();
      if (newToken != null) {
        // Retry the original request with new token
        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final response = await _dio.fetch(err.requestOptions);
        handler.resolve(response);
      } else {
        // Refresh failed — redirect to login
        _authService.logout();
        handler.reject(err);
      }
    } else {
      handler.next(err);
    }
  }

  Future<String?> _refreshToken() async {
    final refreshToken = await _secureStorage.getRefreshToken();
    if (refreshToken == null) return null;
    
    try {
      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });
      final newAccessToken = response.data['data']['token'];
      final newRefreshToken = response.data['data']['refreshToken'];
      await _secureStorage.setAccessToken(newAccessToken);
      await _secureStorage.setRefreshToken(newRefreshToken);
      return newAccessToken;
    } catch (e) {
      await _secureStorage.clearAll();
      return null;
    }
  }
}
```

### FCM Token Flow

```
[App Start / After Login]
    │
    ├─→ Request notification permission (iOS: UNUserNotificationCenter, Android: automatic)
    │
    ├─→ FirebaseMessaging.instance.getToken()
    │     └─→ Returns FCM device token (unique per install)
    │
    ├─→ POST /auth/fcm-token { fcmToken, platform: "ios"/"android", action: "register" }
    │     └─→ Server stores in users.fcmTokens[] array
    │         (upsert: if token exists, update createdAt; if new, push to array)
    │
    └─→ On token refresh (Firebase auto-refreshes):
          └─→ FirebaseMessaging.instance.onTokenRefresh.listen((token) {
                POST /auth/fcm-token { fcmToken: token, platform, action: "register" }
              })
```

### FCM Token Storage in MongoDB

```javascript
// users.fcmTokens example
{
  "_id": ObjectId("..."),
  "fcmTokens": [
    { "token": "dA1B2c3D4e5F6...", "platform": "ios", "createdAt": ISODate("2025-06-01T00:00:00Z") },
    { "token": "xY9z8W7v6U5t4...", "platform": "android", "createdAt": ISODate("2025-06-05T00:00:00Z") }
  ]
}
```

**Cleanup rule:** If a user has >5 FCM tokens (from multiple reinstalls), delete the oldest ones. This prevents unlimited array growth.

---

## 6. Data Freshness Summary

| Data Type | Freshness | Source | Cache TTL | Background Sync |
|-----------|-----------|--------|-----------|-----------------|
| Fund NAV | T+1 day | mfapi.in | 1h (Redis), 24h (metadata) | Daily 6 PM IST |
| Fund details | Weekly | mfapi.in | 24h | Weekly bulk sync |
| Fund metrics | Daily | Calculated from NAV | 24h | Daily after NAV sync |
| Top funds per category | Daily | Aggregation pipeline | 24h (Redis + MongoDB) | Daily 6:30 PM IST (after NAV sync) |
| Stock price | 15 min (live) | yahoo-finance2 | 15min during market, 1h after | Every 15 min during hours |
| Stock fundamentals | Daily | yahoo-finance2 | 24h | Daily 4 PM IST |
| Technical indicators | 30 min | Calculated from price | 30min during market, 1h after | On demand |
| AI suggestions | On demand | Gemini API | 7 days (cache) | Async via BullMQ |

---

## 7. Failure Handling

| Scenario | Handling |
|----------|----------|
| mfapi.in is down | Serve stale data from MongoDB + Redis. Show "Data as of [date]" banner. Retry sync in 1h. |
| Yahoo Finance is down | Same as mfapi.in. Fallback to last known price. Show stale indicator. |
| Yahoo Finance changes API | Detect via HTTP 404/410. Alert. Implement fallback to NSE India website scraping. |
| Gemini API rate limited | Queue request in BullMQ. Retry 3x with exponential backoff (10s, 30s, 90s). If all fail, use rules-based template engine. |
| Gemini returns invalid JSON | Parse error → retry with stricter prompt once → if still fails, use template. |
| MongoDB is down | Redis cache still serves hot data. API returns cached responses. Mark as degraded. Alert. |
| Redis is down | Bypass cache, query MongoDB directly. Higher latency but functional. Alert. |
| AI top-funds cache stale | Serve stale `fund_category_top` data (still better than nothing). Re-compute next sync cycle. |
