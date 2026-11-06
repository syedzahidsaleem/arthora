# Architecture Decision Records (ADR)

## ADR-001: Express.js over Next.js API Routes for Backend

**Date:** 2025-06-13
**Status:** Accepted
**Decision:** Use Express.js on Railway as the sole backend. Next.js on Vercel serves only static/client-side code (no API routes).

### Context
The original architecture proposed Next.js API routes on Vercel as the backend. The coordinator identified a contradiction: the docs referenced both "Next.js API routes on Vercel" and "Node.js/Express on Railway" without clearly choosing one.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **A: Next.js API Routes (Vercel)** | Single repo, single deploy, SSR + API together | 10s timeout on Hobby tier, no persistent processes, WebSocket not supported, serverless cold starts, CPU limits |
| **B: Express.js (Railway)** | No timeouts, persistent workers, WebSocket ready, full CPU, separate deploy cycles | Two services to manage, CORS configuration needed, separate repo or monorepo |
| **C: Both (hybrid)** | Light APIs on Vercel, heavy on Railway | Complex, confusing, deployment parity issues |

### Decision
Option B: Express.js on Railway.

### Consequences
- **Positive:** AI calls (Gemini, up to 30s) never timeout. BullMQ worker runs alongside Express in the same process. PDF generation (puppeteer) has CPU headroom. WebSocket support for future real-time price updates.
- **Negative:** Two deployment targets (Vercel + Railway). CORS must be configured. Web frontend must know the backend URL via `NEXT_PUBLIC_API_URL` env var.
- **Updated docs:** ARCHITECTURE.md, TECH_STACK.md

---

## ADR-002: Reports Collection with Puppeteer-Core

**Date:** 2025-06-13
**Status:** Accepted
**Decision:** Add a `reports` collection to MongoDB and use puppeteer-core + @sparticuz/chromium for PDF generation.

### Context
The coordinator identified a missing `reports` collection with fields: reportId, userId, type, status, downloadUrl, expiresAt, createdAt. The original tech stack also lacked a PDF generation solution that works in Railway's container environment.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **A: puppeteer + full Chromium** | Works locally, easy setup | 100MB+ Docker image, Chromium binary may not work in Railway containers |
| **B: puppeteer-core + @sparticuz/chromium** | Minimal image, Chromium optimized for serverless/containers, ~40MB | Slightly more setup, @sparticuz/chromium may lag behind Chrome releases |
| **C: pdfkit (pure Node.js)** | No browser dependency, tiny | Low fidelity for complex financial reports, no CSS support, manual layout |
| **D: html-pdf** | Simple API | Abandoned package, security vulnerabilities |

### Decision
Option B: puppeteer-core + @sparticuz/chromium.

### Consequences
- **Positive:** Generates pixel-perfect PDF reports from HTML templates (leveraging existing Tailwind CSS). Works in Railway Docker containers. @sparticuz/chromium is specifically built for AWS Lambda / container environments.
- **Negative:** Chromium layer adds ~40MB to Docker image. First PDF generation is slow (~5s cold start for Chromium). Must manage `reports` collection cleanup (TTL index on `expiresAt`).
- **Updated docs:** DATABASE_SCHEMA.md, TECH_STACK.md, TASK_LIST.md, API_CONTRACT.md

---

## ADR-003: GET /search/history Endpoint

**Date:** 2025-06-13
**Status:** Accepted
**Decision:** Add `GET /search/history` endpoint. Keep the `search_history` collection.

### Context
The coordinator identified that `search_history` collection existed in DATABASE_SCHEMA.md but had no corresponding API endpoint. Two options: add the endpoint or remove the collection.

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **A: Add endpoint** | Users can revisit past searches, useful for returning investors, enables "recently viewed" UX | More surface area, privacy considerations (must support deletion) |
| **B: Remove collection** | Simpler, less code, less privacy risk | Loses useful feature, harder to add back later |

### Decision
Option A: Add `GET /search/history` endpoint with paginated results and `DELETE /search/history` to clear history. The search_history collection remains.

### Consequences
- **Positive:** Users can revisit past research. Powers "recently searched" suggestions. 90-day auto-deletion handles privacy.
- **Negative:** Additional endpoints to maintain. Must handle pagination and deletion in both web and mobile clients.
- **Updated docs:** API_CONTRACT.md, DATABASE_SCHEMA.md (confirmed collection stays), TASK_LIST.md (Tasks 80-81)

---

## ADR-004: `portfolios.isPinned` vs `favorites` Collection Distinction

**Date:** 2025-06-13
**Status:** Accepted
**Decision:** Rename `portfolios.isFavorite` to `portfolios.isPinned`. Clarify that the `favorites` collection is exclusively for watchlisted external mutual funds and stocks (not portfolios).

### Context
The coordinator identified semantic confusion: `isFavorite` on portfolios could be confused with the `favorites` collection, which serves a different purpose.

### Definitions

| Concept | Where | Purpose |
|---------|-------|---------|
| **isPinned** | `portfolios.isPinned` (Boolean) | User pins their own AI-generated portfolio plan to the dashboard for quick access. |
| **favorites** | `favorites` collection | User adds external mutual funds and stocks to their personal watchlist for tracking (NAV, price, alerts). |

### Consequences
- **Positive:** Clear semantic separation. No confusion between "my portfolio plan" and "funds I'm watching." API contract is unambiguous.
- **Negative:** Requires updating all references in docs, code, and UI components. Frontend must implement two distinct features: pin portfolio (isPinned toggle) vs add to watchlist (favorites CRUD).
- **Updated docs:** DATABASE_SCHEMA.md, API_CONTRACT.md (endpoint 26b for pin toggle), TASK_LIST.md (Task 74)

---

## ADR-005: Auth Middleware Before Auth Endpoints

**Date:** 2025-06-13
**Status:** Accepted
**Decision:** Auth middleware (JWT validation, rate limiting, CORS) must be implemented and tested before any auth endpoints are built. All unit tests are co-located with their feature tasks, not deferred to a separate "testing phase."

### Context
The original TASK_LIST.md placed auth middleware at Task 20 (after auth endpoints at Tasks 15-19). This creates a dependency inversion: auth endpoints need middleware to function correctly but middleware was built after them.

### Changes to Task Order
- **Before:** Tasks 15-19 (auth endpoints) → Task 20 (auth middleware)
- **After:** Tasks 16-22 (auth middleware first) → Tasks 23-29 (auth endpoints after)

### Test Distribution Change
- **Before:** All unit tests in "Phase 7: Integration Testing & Polish (Weeks 8-9)"
- **After:** Every task includes its own unit test. Phase 7 retains only cross-cutting integration/E2E tests.

### Consequences
- **Positive:** Auth endpoints are built on top of working middleware. No "build first, secure later" anti-pattern. Tests catch bugs immediately during development, not weeks later.
- **Negative:** Slightly slower initial development velocity (tests take extra time). More discipline required to write tests alongside features.
- **Updated docs:** TASK_LIST.md (all phases)

---

## ADR-006: Pre-Computed Materialized Aggregation for "Top Funds Per Category"

**Date:** 2025-06-13
**Status:** Accepted
**Decision:** The AI service queries "top funds per category" from a pre-computed `fund_category_top` MongoDB collection, NOT from a live aggregation pipeline and NOT from a MongoDB materialized view.

### Context
The original DATA_FLOW.md stated that the AI prompt includes "top funds per category" from the database but did not specify how this query works — is it live, materialized, or cached?

### Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **A: Live aggregation pipeline** | Always fresh data | 2-5s query time, increased MongoDB load, unacceptable latency for AI prompt building |
| **B: MongoDB materialized view** | Always fresh, native feature | Atlas M0 free tier doesn't support `$onCreate` materialized views, requires Atlas Triggers (extra complexity) |
| **C: Pre-computed cache collection (`fund_category_top`)** | <10ms reads, simple implementation, works on free tier, no special MongoDB features needed | Data is up to 24h stale, requires daily refresh worker, additional collection to manage |

### Decision
Option C: Pre-computed `fund_category_top` collection with daily refresh at 6:30 PM IST (after NAV sync).

### Aggregation Logic
Composite score formula:
```
compositeScore = 0.3 * sharpeRatio 
               + 0.2 * (1 / expenseRatio) 
               + 0.2 * cagr5Y 
               + 0.15 * (aum / 50000) 
               + 0.15 * (1 / maxDrawdown)
```

Top 5 funds per category are stored in `fund_category_top` collection.

### Caching Tier
```
Read: Redis `fund:category:{cat}:top` (TTL: 24h)
      └── Miss: MongoDB `fund_category_top` (daily refresh)
            └── Miss: Run aggregation pipeline on-demand (blocks ~2s, then caches)
```

### Consequences
- **Positive:** AI prompts build in <100ms (all data from Redis/MongoDB cache). No dependence on MongoDB features unavailable in M0 free tier. Simple to debug and inspect (just query the collection).
- **Negative:** Top funds data is up to 24h stale (acceptable for AI suggestions — fund rankings don't change daily). One extra collection + worker to maintain. Composite score weights are subjective and may need tuning.
- **Updated docs:** DATA_FLOW.md (Section 4: detailed specification)

---

## ADR-007: Mobile Auth Architecture with FCM Token Storage

**Date:** 2025-06-13
**Status:** Accepted
**Decision:** Full mobile auth architecture specified: Dio interceptors for auto-refresh, FCM token storage in `users.fcmTokens[]` array, POST `/auth/fcm-token` endpoint for register/unregister.

### Context
The coordinator identified that ARCHITECTURE.md, TASK_LIST.md, and DATABASE_SCHEMA.md lacked mobile-specific auth details: how tokens flow, how they're stored securely, and how FCM tokens are managed.

### Key Design Decisions

1. **Token storage on mobile:**
   - `accessToken` → `shared_preferences` (unencrypted, short-lived 1h)
   - `refreshToken` → `flutter_secure_storage` (encrypted, long-lived 30d)
   - Future: move accessToken to secure storage too

2. **Dio interceptor pattern:**
   - Every request: inject `Authorization: Bearer <accessToken>`
   - On 401: automatically call `/auth/refresh`, retry original request with new token
   - If refresh fails: clear all tokens, redirect to login

3. **FCM token lifecycle:**
   - On app start: `FirebaseMessaging.instance.getToken()` → POST `/auth/fcm-token`
   - On token refresh: `onTokenRefresh.listen()` → POST `/auth/fcm-token`
   - Stored in `users.fcmTokens[]` array (max 5 tokens per user, oldest pruned)
   - On logout: POST `/auth/fcm-token { action: "unregister" }` → remove from array

4. **Multi-device sessions:**
   - User can be logged in on web + iOS + Android simultaneously
   - Each device has its own session (Redis) and FCM token
   - Users can view and revoke sessions in settings

### Consequences
- **Positive:** Seamless token management (users never see "session expired" unless refresh token itself expires). Push notifications work across all devices. Clean session management.
- **Negative:** `users.fcmTokens[]` can grow if not pruned (mitigated: max 5 per user). `flutter_secure_storage` is an additional dependency. Secure storage is slower than shared_preferences.
- **Updated docs:** ARCHITECTURE.md (Mobile Auth Architecture section), DATABASE_SCHEMA.md (users.fcmTokens field), TASK_LIST.md (Tasks 32-34, 29, 156-157), API_CONTRACT.md (endpoint 7b)

---

## ADR-008: MongoDB as Sole Database (No PostgreSQL)

**Date:** 2025-06-13
**Status:** Accepted
**Decision:** MongoDB is the only database. All PostgreSQL references are removed from the architecture.

### Context
The original ARCHITECTURE.md contained a reference to "PostgreSQL (if needed, but MongoDB preferred for documents)" in the Railway deployment section. The coordinator flagged this as contradictory.

### Rationale
- Document model fits variable fund/stock schemas naturally
- M0 free tier (512MB) is sufficient for MVP
- No SQL joins needed in current feature set
- All financial data is naturally document-shaped (nested holdings, variable metrics per category)
- Adding PostgreSQL would increase operational complexity with no clear benefit

### Consequences
- **Positive:** Single database to manage, monitor, and pay for. Mongoose schemas provide type safety. Horizontal scaling via sharding if needed post-MVP.
- **Negative:** 512MB limit on free tier (mitigated by data pruning per RISKS.md). No ACID transactions across collections (acceptable — our operations are single-document).
- **Updated docs:** ARCHITECTURE.md (PostgreSQL reference removed from Railway services section)

---

## Summary of ADR Impact

| ADR | Documents Updated | New Collections | New Endpoints |
|-----|-------------------|-----------------|---------------|
| ADR-001 | ARCHITECTURE.md, TECH_STACK.md | 0 | 0 |
| ADR-002 | DATABASE_SCHEMA.md, TECH_STACK.md, TASK_LIST.md, API_CONTRACT.md | 1 (`reports`) | 2 (POST/GET reports) |
| ADR-003 | API_CONTRACT.md, TASK_LIST.md | 0 | 2 (GET/DELETE search/history) |
| ADR-004 | DATABASE_SCHEMA.md, API_CONTRACT.md, TASK_LIST.md | 0 | 1 (PATCH portfolios/{id}/pin) |
| ADR-005 | TASK_LIST.md | 0 | 0 |
| ADR-006 | DATA_FLOW.md | 1 (`fund_category_top`) | 0 |
| ADR-007 | ARCHITECTURE.md, DATABASE_SCHEMA.md, TASK_LIST.md, API_CONTRACT.md | 0 | 1 (POST auth/fcm-token) |
| ADR-008 | ARCHITECTURE.md | 0 | 0 |
