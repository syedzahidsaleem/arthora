# Security Policy & Responsible Disclosure

Arthora takes the security and integrity of financial technology infrastructure seriously. This document outlines our security governance, supported releases, and responsible disclosure procedures.

---

## 1. Supported Versions

Security updates and critical vulnerability patches are applied to the following active branches:

| Version / Branch | Supported | Release Channel |
|---|---|---|
| `main` (1.0.x) | :white_check_mark: | Production |
| Development branches | :x: | Experimental |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability, flaw, or potential exploit in Arthora (including the API server, worker processes, web client, or mobile application), **please do not disclose it publicly or file a public GitHub issue**.

### Reporting Process:
1. Send an email to **`syedzahidsaleem2@gmail.com`** with the subject line:  
   `[SECURITY VULNERABILITY] - Arthora Platform - <Short Summary>`
2. Include in your report:
   - Type of issue (e.g., Auth bypass, SQL/NoSQL injection, SSRF, XSS, rate-limit evasion, sensitive data exposure).
   - Location of the vulnerability (URL, endpoint, source file, or parameter).
   - Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
   - Impact assessment and recommendations for mitigation.
3. We will acknowledge receipt of your report within **48 hours** and provide periodic updates as we triage and resolve the issue.

---

## 3. Security Architecture & Protective Controls

Arthora implements defense-in-depth across every architectural layer:

- **Strict Input Validation:** All API inputs are parsed and validated through Zod schemas before reaching business logic controllers.
- **XSS & Script Stripping:** HTML tags, scripts, and potentially malicious payloads are recursively sanitized via `sanitize-html`.
- **Payload Size Constraints:** HTTP body sizes are strictly limited to `1MB` to prevent denial-of-service and buffer exhaustion.
- **Distributed Rate Limiting:** Redis-backed sliding window rate limiters protect authentication, AI generation, and general endpoints against brute-force and DDoS attacks.
- **Modern Cryptography:** Passwords are protected using Argon2id with high memory cost parameters. Tokens use cryptographically secure 256-bit keys rotated via refresh token blacklisting.
- **Security Headers:** Enforced via Helmet with strict Content Security Policy (CSP), HSTS preloading, Clickjacking defense (`X-Frame-Options: DENY`), and MIME-type sniffing suppression.
- **Zero Secret Commits:** Git repositories are strictly guarded via `.gitignore` and automated secret scanning to prevent API keys and private keys from entering version control.
