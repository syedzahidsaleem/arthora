# Potential Risks and Mitigation Strategies

## 1. Free API Rate Limits

### Risk: mfapi.in Rate Limiting or Downtime
- **Probability:** Medium (no SLA, free service)
- **Impact:** High (core data source for mutual funds)
- **Symptoms:** HTTP 429, 503, or timeout
- **Mitigation:**
  1. **Aggressive caching:** Redis TTL 1h for NAV, 24h for metadata. MongoDB stores everything permanently.
  2. **Background sync:** Fetch data in bulk during off-peak hours (6 PM IST daily). User requests always hit cache first.
  3. **Request deduplication:** If 100 users request the same fund simultaneously, only 1 API call is made. Others wait for cache.
  4. **Stale-while-revalidate:** Serve stale cache immediately, refresh in background.
  5. **Rate limit on our side:** Limit mfapi.in calls to 50/min max (well under their limit).
  6. **Fallback data source:** AMFI direct website (https://www.amfiindia.com/spages/NAVAll.txt) — bulk NAV text file updated daily. Parse and store. This is the primary backup if mfapi.in goes down permanently.

### Risk: Yahoo Finance Scraping Instability
- **Probability:** High (Yahoo frequently changes their API)
- **Impact:** High (core data source for stocks)
- **Symptoms:** `yahoo-finance2` npm package returns errors, 404s, or malformed data
- **Mitigation:**
  1. **Pin `yahoo-finance2` version:** Lock to a known-working version. Test upgrades carefully.
  2. **Abstraction layer:** `lib/external/yfinance.ts` wraps all Yahoo calls. If Yahoo breaks, only this file needs changes.
  3. **Graceful degradation:** If Yahoo fails, show last cached price with "as of [date]" disclaimer.
  4. **Alternative NSE data source:** NSE India website (https://www.nseindia.com/) can be scraped for prices. Build a fallback scraper with rate limiting (NSE blocks IPs aggressively — use session cookies + delays).
  5. **Alternative BSE data source:** BSE India API (https://api.bseindia.com/) for stock data.
  6. **Community monitoring:** Watch `yahoo-finance2` GitHub issues for reports of Yahoo API changes.
  7. **Health check endpoint:** Monitor Yahoo API availability every 5 minutes. Alert on degradation.

### Risk: Gemini API Free Tier Limits
- **Probability:** Medium (15 RPM, 1500 RPD is generous but can be hit)
- **Impact:** Medium (AI suggestions are core feature but not blocking)
- **Symptoms:** HTTP 429 from Gemini API
- **Mitigation:**
  1. **Application-level rate limit:** 10 AI requests/hour per user. Redis sliding window counter.
  2. **Cache identical queries:** MD5 hash of (goal + risk + period + amount). Reuse cached suggestions for 7 days.
  3. **BullMQ queue:** Process AI requests sequentially with 4-second gaps (15/min max). Queue excess requests.
  4. **Rules-based fallback engine:** Pre-built allocation templates by risk level:
     - Low risk: 80% debt + 20% large cap
     - Medium risk: 50% large cap + 30% hybrid + 20% debt
     - High risk: 60% mid/small cap + 25% large cap + 15% international
  5. **Model switching:** If Gemini is down, try Gemini 1.5 Pro (different quota). Or switch to OpenAI (paid, as last resort).
  6. **Prompt optimization:** Minimize token usage (concise prompt, JSON output mode) to stay under limits.

---

## 2. Data Quality Risks

### Risk: Stale or Incorrect Fund Data
- **Probability:** Medium (AMFI data sometimes has lag or corrections)
- **Impact:** Medium (wrong metrics displayed to users)
- **Mitigation:**
  1. **Data validation:** Cross-check NAV against previous day. Flag if change > 10% (likely error).
  2. **Source attribution:** Always show "Data as of [date]" and "Source: AMFI via mfapi.in".
  3. **Manual override:** Admin tool to correct/update specific fund data.
  4. **Multiple source comparison:** For popular funds, cross-reference with MoneyControl or ValueResearch (scraped/semi-automated).

### Risk: Incorrect Financial Calculations
- **Probability:** Low (well-documented formulas)
- **Impact:** Very High (wrong returns = wrong investment decisions = legal risk)
- **Mitigation:**
  1. **Unit tests with known values:** Test CAGR, XIRR, Sharpe against published values from AMFI/Morningstar.
  2. **Cross-verification:** For top 50 funds, compare our calculated CAGR against published CAGR on AMFI/mfapi.in.
  3. **Disclaimer on every calculation:** "Calculated internally. Verify with fund house."
  4. **Peer review:** Financial formulas reviewed by someone with CFA/base knowledge.
  5. **Monitoring:** Alert if calculated values deviate > 5% from published values.

---

## 3. Regulatory & Legal Risks

### Risk: SEBI Regulations on Investment Advice
- **Probability:** Low (for educational app, but regulatory landscape changing)
- **Impact:** Very High (could require SEBI registration or face legal action)
- **Mitigation:**
  1. **Prominent disclaimers:** "Not SEBI registered investment advisor. This is educational guidance, not investment advice." On every AI suggestion, every page.
  2. **No transaction execution:** App never executes trades. Only shows information.
  3. **No personalized guarantee:** AI suggestions say "consider these funds" not "invest in these funds".
  4. **Terms of service:** Clear ToS stating educational nature. User must acknowledge before first AI suggestion.
  5. **Legal review:** Have a lawyer review disclaimers before launch.
  6. **Future compliance:** Budget for SEBI RIA registration if app grows (cost: ~₹50K + exam).

### Risk: Personal Data Protection (India DPDP Act 2023)
- **Probability:** Medium (new law, enforcement starting)
- **Impact:** Medium (fines up to ₹250 Cr for data breaches)
- **Mitigation:**
  1. **Minimal data collection:** Only email, name. No Aadhaar, PAN, bank details.
  2. **Data deletion:** User can request full account + data deletion via settings.
  3. **Encryption:** All PII encrypted at rest (MongoDB Atlas encryption). TLS in transit.
  4. **Data retention limits:** Search history auto-deleted after 90 days. Sessions after 30 days.
  5. **Privacy policy:** Clear policy on what data is collected and how it's used.

---

## 4. Infrastructure & Scaling Risks

### Risk: MongoDB Atlas M0 Free Tier Limit (512MB)
- **Probability:** High (NAV history grows ~250K docs/year, price history ~4M/year)
- **Impact:** High (database full = app stops working)
- **Mitigation:**
  1. **Document compression:** MongoDB WiredTiger compresses by default (~60% savings).
  2. **Data pruning:** Archive NAV history older than 10 years to S3/R2. Only keep recent in MongoDB.
  3. **Selective storage:** Only store NAV history for popular funds (top 500). For obscure funds, fetch on demand from mfapi.in.
  4. **Price history sampling:** Store daily OHLCV only for Nifty 200 stocks. For smaller stocks, store weekly snapshots.
  5. **Monitor usage:** Alert at 70% of 512MB.
  6. **Upgrade path:** Atlas M2 ($0.25/GB/day ≈ $9/month) when needed.

### Risk: Railway Free Tier ($5/month credit)
- **Probability:** High (backend + Redis + workers easily exceed $5/month)
- **Impact:** Medium (app goes offline when credit runs out)
- **Mitigation:**
  1. **Efficient Docker image:** Multi-stage build, minimal dependencies. Smaller container = less compute.
  2. **Separate deployments:** Web on Vercel (free), only workers on Railway.
  3. **Alternative:** Render free tier (750 hrs/month) or Fly.io free allowance.
  4. **Optimize workers:** Only run sync during market hours. Scale to zero outside hours.
  5. **Budget:** Top up Railway to $10/month if needed (still very cheap).

### Risk: Vercel Serverless Function Timeout (10s on Hobby)
- **Probability:** Medium (AI calls can take >10s)
- **Impact:** Medium (portfolio creation fails)
- **Mitigation:**
  1. **Async pattern:** Return `{ status: "generating" }` immediately. Client polls `/portfolios/{id}/status`.
  2. **Move AI processing to Railway worker:** Vercel function just queues the job. Worker processes it.
  3. **Upgrade Vercel:** Pro tier ($20/month) gives 60s timeout if needed post-MVP.

---

## 5. Security Risks

### Risk: API Abuse / Scraping
- **Probability:** Medium (financial data APIs are targets for scrapers)
- **Impact:** High (burns through free tier limits, affects real users)
- **Mitigation:**
  1. **Rate limiting:** Redis sliding window. Per-IP and per-user limits.
  2. **Authentication required:** All data endpoints require JWT (except search which is limited).
  3. **Captcha on registration:** Prevent bot account creation.
  4. **Request signing:** HMAC signature on sensitive endpoints (prevent tampering).
  5. **IP whitelisting:** For admin endpoints.

### Risk: XSS or Injection via User Goal Text
- **Probability:** Low (React prevents most XSS, MongoDB is NoSQL-injection resistant with Mongoose)
- **Impact:** High (if successful)
- **Mitigation:**
  1. **Input validation:** Zod schemas on every endpoint. Strip HTML tags from goal text.
  2. **Content Security Policy:** Strict CSP headers on Vercel.
  3. **Mongoose schemas:** Type enforcement prevents NoSQL injection.
  4. **Sanitize AI output:** Validate Gemini JSON response before storing/rendering.

---

## 6. User Experience Risks

### Risk: Slow Chart Rendering on Mobile
- **Probability:** Medium (600 data points for 3-year NAV chart)
- **Impact:** Medium (bad UX on low-end devices)
- **Mitigation:**
  1. **Data downsampling:** For charts > 500 points, send weekly averages instead of daily (reduces 750 points to ~156).
  2. **Lazy loading:** Charts load after above-fold content renders.
  3. **FL_chart optimization:** Use `swapAnimation` duration 0 for large datasets. Disable tooltips on very dense charts.
  4. **Mobile data saver:** Option to load simplified charts (fewer points).

### Risk: User Confusion About AI Suggestions
- **Probability:** Medium (users may treat AI output as guaranteed advice)
- **Impact:** High (misplaced trust = negative reviews, potential complaints)
- **Mitigation:**
  1. **Disclaimer banners:** Before, during, and after AI suggestions.
  2. **Educational content:** "How to use AI suggestions" guide. "What is CAGR?" tooltips.
  3. **No guaranteed returns:** Always show "Expected returns are not guaranteed. Past performance does not guarantee future results."
  4. **Multiple suggestions:** Show 2-3 alternative portfolios (conservative, moderate, aggressive) rather than one "answer".

---

## 7. Dependency Risks

### Risk: Single Maintainer npm Packages
- **Probability:** Medium (yahoo-finance2 is community-maintained)
- **Impact:** High (app breaks if package abandoned)
- **Mitigation:**
  1. **Vendor copy:** Copy critical package code into `lib/external/vendor/` if package goes unmaintained.
  2. **Alternative packages:** Identify alternatives (e.g., `stock-api`, `nse-india`).
  3. **Direct API integration:** If npm package breaks, implement direct HTTP calls to Yahoo Finance API.
  4. **Health monitoring:** Automated daily test that Yahoo API integration returns valid data.

### Risk: mfapi.in Shut Down
- **Probability:** Low-Medium (hobby project by a single developer)
- **Impact:** Very High (no alternative free MF API)
- **Mitigation:**
  1. **AMFI direct fallback:** Parse AMFI's daily NAV file (https://www.amfiindia.com/spages/NAVAll.txt). It's a pipe-delimited text file with all scheme NAVs. Not as clean as mfapi.in but functional.
  2. **MFAPI self-host:** mfapi.in is open source (GitHub). Fork and self-host on Railway if it goes down.
  3. **Build our own AMFI parser:** Direct AMFI data pipeline as backup. More work but fully controlled.
  4. **Pre-position:** Implement AMFI direct parser NOW as a backup route, not waiting for mfapi.in to fail.

---

## 8. Risk Priority Matrix

| Risk | Probability | Impact | Priority | Mitigation Status |
|------|------------|--------|----------|-------------------|
| Yahoo Finance API change | High | High | **P0** | Abstract + fallback + monitor |
| mfapi.in downtime | Medium | High | **P0** | Cache + AMFI direct fallback |
| MongoDB 512MB limit | High | High | **P1** | Pruning + selective storage + monitoring |
| Incorrect financial calculations | Low | Very High | **P1** | Unit tests + cross-verification + disclaimers |
| SEBI regulatory action | Low | Very High | **P1** | Disclaimers + legal review + no transactions |
| Gemini rate limiting | Medium | Medium | **P2** | Queue + cache + rules fallback |
| Railway credit exhaustion | High | Medium | **P2** | Optimize + alternative hosting |
| API abuse/scraping | Medium | High | **P2** | Rate limiting + auth + captcha |
| Slow mobile charts | Medium | Medium | **P3** | Downsampling + lazy loading |
| mfapi.in permanent shutdown | Low | Very High | **P3** | AMFI direct parser as backup |
| User trust in AI | Medium | High | **P3** | Disclaimers + education + multiple options |
