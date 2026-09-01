# System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├──────────────────────────┬──────────────────────────────────┤
│   Web App (Next.js)      │   Mobile App (Flutter)           │
│   - App Router           │   - Single codebase iOS/Android  │
│   - Server Components      │   - Dio HTTP client              │
│   - Client Components      │   - Riverpod state management    │
│   - Vercel deployment      │   - Firebase Mobile SDK          │
├──────────────────────────┼──────────────────────────────────┤
│   Vercel (Static + Edge) │   Compile to native iOS/Android  │
└──────────┬───────────────┴──────────────┬───────────────────┘
           │                              │
           │ HTTPS/JSON                   │ HTTPS/JSON
           │                              │
           ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Express Server)              │
│                 Railway App Deployment (Node.js)             │
│       ┌─────────────────────────────────────────────────┐   │
│       │ Rate Limiting | CORS | Auth JWT | Request Logging│   │
│       └─────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Auth Service │ │ Fund Service │ │ Stock Service        │ │
│  │ - JWT/OAuth  │ │ - mfapi.in   │ │ - yahoo-finance2    │ │
│  │ - Firebase   │ │ - AMFI data  │ │ - NSE/BSE data       │ │
│  │ -argon2      │ │              │ │                      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│          │         │                      │                   │
│          │         ▼                      ▼                   │
│          │  ┌──────────────────┐  ┌──────────────────┐      │
│          │  │ Portfolio Service│  │ AI Service       │      │
│          │  │ - Goal engine    │  │ - Gemini/OpenAI  │      │
│          │  │ - Allocation     │  │ - Prompt eng     │      │
│          │  │ - Projections    │  │ - Fund matching  │      │
│          │  └──────────────────┘  └──────────────────┘      │
│          │                                                  │
│  ┌───────┴──────────────────────────────────────────────┐   │
│  │                 Reporting & Analytics Service        │   │
│  │  - PDF generation (puppeteer)                        │   │
│  │  - Scheduled jobs, audit logs                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
├────────────────────┬────────────────────┬─────────────────────┤
│  MongoDB Atlas     │  Redis (Upstash)   │  Local Storage      │
│  (M0 Free Cluster) │  (In-memory cache) │  (client-side)      │
│                    │                    │                     │
│  - Users           │  - API responses   │  - Auth tokens      │
│  - Portfolios      │  - Session data    │  - Watchlists       │
│  - Fund metadata   │  - Rate limit      │  - Theme preference │
│  - Stock metadata  │    counters        │                     │
│  - AI suggestions  │  - Job queues      │                     │
│  - Fund NAV data   │                    │                     │
│  - Stock prices    │                    │                     │
│  - Reports         │                    │                     │
└────────────────────┴────────────────────┴─────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL DATA SOURCES                    │
├────────────────────┬────────────────────┬─────────────────────┤
│    mfapi.in        │   Yahoo Finance    │   Google Gemini     │
│    (AMFI Data)     │   (yfinance)       │   1.5 Flash API     │
│                    │                    │                     │
│  - NAV history     │  - Stock prices    │  - AI portfolio     │
│  - Fund details    │  - Stock metrics   │    suggestions      │
│  - Scheme codes    │  - Technical data  │  - Goal analysis    │
│  - Fund lists      │  - Company info    │  - Explanations     │
└────────────────────┴────────────────────┴─────────────────────┘
```

## Framework Choice: Express/Node.js on Railway

**Decision: Express.js on Railway, NOT Next.js API routes on Vercel.**

**Rationale:**
1. **No serverless function timeouts** — ExpressGames API routes for long-running AI calls (>10s) timing out is a deal-breaker.
2. **Long-lived processes** — Background worker (BullMQ) needs a persistent process, not a serverless function.
3. **Socket support** — Future real-time features need WebSocket connections.
4. **CPU-intensive ops** — PDF generation (puppeteer) and financial calculations consume CPU.
5. **Separation of concerns** — Frontend and backend deploy independently. Frontend changes don't redeploy backend.
6. **Cost** — Railway is still free-tier friendly ($5 credit), and we avoid Vercel's $20/month Pro tier for >10s execution.

## Service Separation Boundaries

### Auth Service (`/auth`)
- Firebase Auth integration (Google OAuth, Email/Password)
- JWT token minting and validation
- Session management via Redis
- Rate limiting: 10 requests/minute per IP
- **No Business logic beyond authentication.**

### Fund Service (`/funds/*`)
- Reads: Cached fund data (Redis → MongoDB → mfapi.in)
- Writes: None (data is read-only from AMFI)
- Background jobs: Daily NAV sync at 6 PM IST
- Rate limiting: 60/minute per user
- **No AI or portfolio logic.**

### Stock Service (`/stocks/*`)
- Reads: Cached stock data (Redis → MongoDB → Yahoo Finance)
- Writes: None (data is read-only from Yahoo)
- Background jobs: Every 15 minutes during market hours (9:15-15:30 IST)
- Rate limiting: 60/minute per user
- **No AI or portfolio logic.**

### Portfolio Service (`/portfolios/*`)
- CRUD operations on user portfolios
- Triggers AI suggestion generation asynchronously
- Stores AI response in MongoDB
- Returns cached AI response if available
- Rate limiting: 10 requests/minute per user

### AI Service (`/ai/*`)
- Provides structured AI suggestions (prompt → Gemini → parse → validate)
- Rate limiting: 10 requests/hour per user
- Fallback: Rules-based engine for rate limit exceeded or API failure
- **No database access beyond ai_suggestion_cache.**

### Reporting Service (`/reports/*`)
- Generates PDF reports for fund analysis
- Uses puppeteer-core with @sparticuz/chromium
- Stores generated reports in S3/R2 (future) or temporary Railway volume
- Returns download URL with expiration

## Data Flow Patterns

### Pattern 1: Read-Through Cache (All fund/stock data reads)

```
Client request → Redis (check TTL) → Cache Hit → Return
                     |
                     └── Cache Miss → MongoDB (find) → Return + Cache in Redis
                             |
                             └── Data Missing → Fetch from External API (mfapi.in or Yahoo)
                                    → Store in MongoDB → Cache in Redis → Return
```

**Guarantee:** Every read checks Redis first. If data is stale or missing after MongoDB, a background refresh is triggered, but the stale data is still returned immediately.

### Pattern 2: Write-Behind / Async Processing (AI suggestions)

```
Client POST /portfolios (goal, risk, time, amount)
    |
    └─→ API Gateway → Business Logic validates input
    |
    └─→ Store portfolio in MongoDB (status: "generating")
    |
    └─→ Push job to BullMQ (priority: high)
    |
    └─→ Return 202 Accepted to client
    |
    └─→ Worker dequeues job → Calls Gemini API
    |
    └─→ Parse and validate response (Zod schema)
    |
    └─→ Store AI suggestion in portfolio document (status: "completed")
    |
    └─→ (Client polls /portfolios/{id} OR receives WebSocket/SSE update)
```

**Guarantee:** AI suggestion is generated asynchronously. Client never blocks on Gemini API call. Max wait: 15 seconds (if Gemini is fast) or fallback to rules engine after 3 retries.

### Pattern 3: Batch Background Sync (Daily data refresh)

```
Scheduled job (6 PM IST daily)
    |
    └─→ Fetch MF scheme list from AMFI (via mfapi.in)
    |
    └─→ For each new scheme: Insert into funds_metadata
        For each existing scheme: Update if changed
        Mark missing schemes as "inactive"
    |
    └─→ For popular schemes (top 500 AUM): Fetch full NAV history
        Upsert only new dates into fund_nav_history
    |
    └─→ Recalculate metrics for funds with updated NAVs (CAGR, Sharpe, etc.)
      → Upsert into fund_metrics
    |
    └─→ Update Redis cache for popular funds (invalidate old data)
    |
    └─→ Log completion and errors (Sentry + file log)
```

**Guarantee:** Daily sync is idempotent. Re-running it twice won't create duplicates. NAV data is aggregated (not overwritten) so historical data is never lost.

## API Gateway / Load Balancer

Since Railway handles TLS termination and load balancing out of the box, we implement a thin API gateway using Express.js middleware at the application level:

- **Rate limiting:** Per-endpoint sliding window (Redis)
- **CORS:** Configured for `arthora.in` and `localhost:3000`
- **Authentication:** JWT validation via Firebase Admin SDK
- **Request logging:** Morgan middleware for access logs
- **Error handling:** Global error handler (500 → 500, 404 → 404, custom app errors)
- **Security headers:** Helmet.js for HSTS, CSP, X-Frame-Options, etc.
- **Compression:** gzip/deflate (native Node.js zlib or compression middleware)

```
Express App Structure

main.ts
├── Global Middleware (CORS, Helmet, Compression, Request ID, Logging)
├── API Gateway Middleware (Rate Limiting, Auth JWT, Error Handler)
├── Router Mounting
│   ├── /auth        → Auth Service routes
│   ├── /funds       → Fund Service routes
│   ├── /stocks      → Stock Service routes
│   ├── /portfolios  → Portfolio Service routes
│   ├── /ai          → AI Service routes
│   ├── /favorites   → Favorites routes
│   ├── /charts      → Charts routes
│   ├── /onboard     → Onboarding routes
│   └── /reports     → Reporting routes
└── 404 Handler → Serve SPA or return JSON
```

## Deployed Services Architecture

**Railway (Backend + Worker):**
- **Service 1 — API Server:** Node.js/Express server (`main.ts`)
- **Service 2 — Worker Process:** BullMQ processor (`worker.ts`)
- **Service 3 — Redis:** In-memory cache (Railway add-on or separate service)

**Vercel (Frontend Web):**
- **Project:** `arthora-web`
- **Build:** Next.js static export (`output: 'export'`)
- **Environment:** Connect to Railway API via `env.NEXT_PUBLIC_API_URL`
- **CDN:** Vercel Edge Network (automatic)

**MongoDB Atlas (Database):**
- **Cluster:** M0 Free Tier (512MB), region: `ap-south-1` (Mumbai)
- **Connection:** From Railway via whitelist (Railway IPs are dynamic; use IP whitelist `0.0.0.0/0` for free tier, upgrade to VPC later)
- **Monitoring:** MongoDB Atlas UI for slow queries

**External Services:**
- **Firebase Auth:** `arthora-12345.firebaseapp.com`
- **mfapi.in:** Direct HTTPS calls (no auth)
- **Yahoo Finance:** Via `yahoo-finance2` npm package (scrapes Yahoo Finance)
- **Google Gemini:** Via `@google/generative-ai` SDK
- **Vercel Analytics:** Web vitals tracking

## Mobile Auth Architecture (Flutter)

**Token Flow:**
```
Flutter App
    │
    ├─→ Firebase Auth SDK (via `firebase_auth` package)
    │     └─→ Google OAuth / Email + Password
    │         (Credentials verified by Firebase servers)
    │
    ├─→ Firebase returns `idToken` (JWT, valid 1 hour)
    │
    ├─→ Flutter App sends `idToken` to Express API
    │     Header: `Authorization: Bearer <idToken>`
    │
    ├─→ Express API validates `idToken` via Firebase Admin SDK
    │     └─→ If valid: extracts `uid`, `email`, `name`
    │         └─→ Issues custom JWT (24h expiry)
    │             └─→ `accessToken` + `refreshToken` (stored in Redis session)
    │
    ├─→ Flutter App stores tokens securely:
    │     - `accessToken` → `shared_preferences` (or secure storage plugin)
    │     - `refreshToken` → `secure_storage` Flutter package
    │
    ├─→ Dio interceptors inject `accessToken` into every API request
    │     Header: `Authorization: Bearer <accessToken>`
    │
    └─→ On 401 (expired token):
          ├─→ Dio interceptor refreshes token automatically:
          │    └─→ POST /auth/refresh with `refreshToken`
          │         └─→ Express API validates `refreshToken` (checks Redis)
          │              └─→ Returns new `accessToken` + `refreshToken`
          │
          └─→ If refresh fails (e.g., token revoked):
               └─→ Redirect to Login screen
```

**Firebase Cloud Messaging (FCM) Integration:**

```
Flutter App (via `firebase_messaging` package)
    │
    ├─→ On app start, request FCM token
    │     └─→ `FirebaseMessaging.instance.getToken()`
    │         └─→ Returns device FCM token (string, unique per device)
    │
    ├─→ Send FCM token to Express API
    │     └─→ POST /users/me/fcm-tokens
    │         Body: `{ "fcmToken": "<token>" }`
    │         └─→ Express API stores in `users.fcmTokens[]` array
    │
    └─→ On app foreground: messages handled via `onMessage` stream
        On app background: messages handled via background isolate
```

**Session Management (Redis):**

```
Express API
    │
    ├─→ On login (Google/Email):
    │     └─→ Generates `sessionId` (UUID v4)
    │         └─→ Stores in Redis: `session:<sessionId>` with userId, expiresIn
    │
    └─→ On every authenticated request:
          ├─→ Decode `accessToken` (JWT, verify signature + expiry)
          │   └─→ If expired: return 401
          │       └─→ Client uses `refreshToken` to get new `accessToken`
          │
          └─→ Rate limit check: Redis `rate_limit:<userId>:<endpoint>:<window>`
              └─→ If limit exceeded: return 429 (Retry-After header)
```

**Device Sync across Sessions:**
```
User logs in on Web → sessionId_1 (Redis TTL: 30 days)
User logs in on iOS → sessionId_2 (Redis TTL: 30 days)
User logs in on Android → sessionId_3 (Redis TTL: 30 days)

All 3 sessions are active simultaneously (no "logout from all devices" by default).
User can view active sessions in settings and revoke individual ones.
Revocation: Delete `sessionId` from Redis → Flushes on next request validation.
```

**Token Storage on Mobile (Security):**

| Token | Storage | Reason |
|-------|---------|--------|
| `accessToken` | `shared_preferences` (unencrypted) | Short-lived (1 hour), acceptable for convenience. In production, use `secure_storage` or Keychain (iOS) / Keystore (Android). |
| `refreshToken` | `secure_storage` (encrypted) | Long-lived (30 days). Must be encrypted. |
| `fcmToken` | `shared_preferences` (unencrypted) | Identifiable but not secret. Sent in request body, not headers. |

**Future consideration:** Use `flutter_secure_storage` package for all tokens to receive hardware encryption.

## Scaling Considerations (Post-MVP)

- **Redis persistence:** Upstash paid tier or Redis Cloud for persistent Redis.
- **MongoDB M2/M5 paid cluster** if we outgrow M0 ( Analytics aggregation pipelines (reporting) will benefit from paid tier.
- **CDN:** Vercel Edge Network is sufficient for static assets. No additional CDN needed.
- **Image storage:** For user avatars or charts, use Cloudflare R2 or AWS S3 (both have cheap storage). Currently not in MVP.
- **Worker scaling:** Separate BullMQ worker on Railway Pro tier for dedicated CPU. Currently bundled with API server process.
