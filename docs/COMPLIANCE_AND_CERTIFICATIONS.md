# Regulatory Compliance, Legal Disclaimers & Certifications

**Platform:** Arthora  
**Entity:** Independent Investment Research & Financial Analytics Technology Platform  
**Target Market:** Republic of India  
**Jurisdiction:** Indian Financial Regulations (SEBI, RBI, AMFI, MeitY)

---

## 1. SEBI Regulatory Status & Non-Advisory Declaration

### 1.1 Statutory Notice
> [!IMPORTANT]
> **Arthora is NOT a SEBI-registered Investment Adviser (RIA) or Research Analyst (RA)** as defined under the Securities and Exchange Board of India (Investment Advisers) Regulations, 2013 or SEBI (Research Analysts) Regulations, 2014.
>
> All analytics, statistical calculations, AI-generated allocation suggestions, risk score computations, and financial charts provided across Arthora's web application, mobile application, and programmatic APIs are **strictly for educational, informational, and research purposes only**.

### 1.2 No Investment Advice or Solicitation
- Nothing contained on the platform constitutes an offer, solicitation, recommendation, or endorsement to buy, sell, or hold any security, mutual fund unit, equity share, commodity, derivative, or financial product.
- **Risk Profiling & Algorithmic Allocation:** The AI Portfolio Builder uses deterministic financial algorithms and generative models to illustrate theoretical asset allocations based on user inputs. Users must evaluate their personal financial situation, risk tolerance, and tax implications, and consult an independent SEBI-registered financial adviser before executing any investment transactions.
- **Mutual Fund Investments are subject to market risks.** Please read all scheme-related documents (SID, SAI, KIM) carefully before investing. Past performance is not indicative of future returns.

---

## 2. Market Data Attribution & Licensing

### 2.1 Mutual Fund Data
- **Source:** Association of Mutual Funds in India (AMFI) and [mfapi.in](https://mfapi.in) open API.
- **NAV Data:** Historical and daily Net Asset Values (NAV) are sourced via public endpoints provided by AMFI/mfapi.in and are subject to daily settlement timings (typically 9:00 PM to 11:00 PM IST on business days).
- **Attribution:** All scheme names, AMCs, NAV figures, and portfolio holdings belong to their respective Asset Management Companies (AMCs).

### 2.2 Equity & Exchange Market Data
- **Source:** Yahoo Finance & NSE public market quotes.
- **Delay Notice:** Equity market quotes and candlestick metrics may be delayed by up to 15 minutes during live trading hours as per exchange market data distribution policies.
- **Exchange Disclaimer:** Neither Arthora nor its data providers warrant the timeliness, sequence, accuracy, or completeness of market data, and shall not be liable for any trading losses incurred as a result of data delays.

---

## 3. Data Protection & Privacy Compliance (DPDP Act 2023)

Arthora adheres to the principles of the **Digital Personal Data Protection Act, 2023 (DPDP Act)** enacted by the Parliament of India:

1. **Lawful Basis & Purpose Limitation:** User data (email addresses, hashed passwords, risk profiles, search history, saved portfolios) is collected solely for platform authentication, personalization, and requested financial computations.
2. **Data Minimization:** No Aadhaar numbers, PAN numbers, bank account numbers, UPI IDs, or demat account credentials are required or stored on Arthora servers.
3. **Cryptographic Storage:**
   - Passwords hashed using **Argon2id** (memory-hard, resistant to GPU/ASIC attacks).
   - Session JWTs generated with high-entropy 256-bit cryptographically secure keys.
   - All network traffic forced over **TLS 1.3 / HTTPS** with HTTP Strict Transport Security (HSTS) preloading.
4. **Right to Erasure & Portability:** Users can delete their accounts, portfolios, and favorites at any time via Account Settings or by API endpoint (`DELETE /api/v1/auth/me`).

---

## 4. Artificial Intelligence & Algorithmic Governance

### 4.1 Model Architecture & Transparency
- Arthora integrates Google DeepMind's Gemini large language models via the official Google AI SDK alongside a deterministic rule-based allocation fallback engine.
- **Hallucination Prevention:** Generative models are constrained by strict JSON schema validation (Zod schemas). If a model output fails structural, risk bounds, or asset percentage constraints (e.g. allocations must sum to exactly 100%), the deterministic mathematical fallback engine automatically takes over.
- **Auditability:** All prompt inputs and generated allocation payloads are cached in Redis and MongoDB with deterministic SHA-256 hashes for transparency and idempotency.

---

## 5. Security Certifications & Technical Standards

| Standard / Control | Implementation Mechanism | Status |
|---|---|---|
| **Data in Transit** | TLS 1.3 / HTTPS enforced with HSTS (`max-age=31536000`) | Enforced |
| **Data at Rest** | MongoDB Atlas AES-256 cluster encryption & Upstash TLS | Enforced |
| **Authentication** | Firebase Admin SDK + Dual JWT (Access 15m / Refresh 7d) | Enforced |
| **Password Hashing** | Argon2id (RFC 9106 compliant) | Enforced |
| **Injection Defense** | Zod input schema validation + `sanitize-html` XSS filter | Enforced |
| **DDoS & Scraping** | Redis sliding-window distributed rate limiters | Enforced |
| **Content Security** | Helmet.js CSP, `frameguard: { action: 'deny' }`, `noSniff: true` | Enforced |
| **Monitoring** | Sentry real-time exception tracking and error alerting | Active |

---

## 6. Contact for Compliance & Legal Inquiries

For legal notices, data privacy requests, or regulatory inquiries:
- **Compliance Lead:** Syed Zahid Saleem
- **Email:** `syedzahidsaleem2@gmail.com`
- **Repository:** [https://github.com/syedzahidsaleem/arthora](https://github.com/syedzahidsaleem/arthora)
