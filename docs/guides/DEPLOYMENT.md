# Arthora Deployment & Infrastructure Architecture

## Architecture Overview

```mermaid
graph TD
    Client[Next.js 14 Static Web Client] -->|Vercel / Render Static| CDN[Global Edge CDN]
    CDN -->|API Requests| ExpressAPI[Arthora Express API on Render]
    ExpressAPI --> MongoDB[(MongoDB Atlas Cluster)]
    ExpressAPI --> Redis[(Upstash Redis Cache & BullMQ)]
    ExpressAPI --> Gemini[Google Gemini 1.5 Flash AI Engine]
    ExpressAPI --> AMFI[AMFI Mutual Fund NAV Scraper]
    ExpressAPI --> NSE[NSE/BSE Market Data Engine]
```

---

## 1. Vercel Frontend Deployment

### Monorepo Settings
When importing `syedzahidsaleem/arthora` into Vercel:

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Framework Preset** | `Other` (or auto-detected via root `vercel.json`) | Web uses Next.js static export (`output: 'export'`) |
| **Root Directory** | `.` (Repository root) | Ensures access to `pnpm-workspace.yaml` and `@arthora/shared` |
| **Build Command** | `pnpm --filter @arthora/shared build && pnpm --filter @arthora/web build` | Pre-compiles TypeScript shared types before Next.js export |
| **Output Directory** | `apps/web/out` | Contains pre-rendered static HTML, CSS, and JS bundles |
| **Install Command** | `pnpm install` | Installs root monorepo workspace dependencies |

### Environment Variables on Vercel
- `NEXT_PUBLIC_API_URL`: `https://arthora-api.onrender.com` (automatically falls back if omitted)
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase web API key
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: `arthora-659a8`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `arthora-659a8.firebaseapp.com`

---

## 2. Render Full-Stack Services (`render.yaml`)

The repository includes a Render Blueprint specification deploying both the Node.js backend and static frontend:

1. **`arthora-api` (Web Service)**:
   - **Environment**: Node.js
   - **Build Command**: `pnpm install && pnpm --filter @arthora/shared build && pnpm --filter @arthora/api build`
   - **Start Command**: `pnpm --filter @arthora/api start`
   - **Health Probe**: `/api/v1/health`

2. **`arthora-web` (Static Site)**:
   - **Environment**: Static
   - **Build Command**: `pnpm install && pnpm --filter @arthora/shared build && pnpm --filter @arthora/web build`
   - **Publish Directory**: `./apps/web/out`
   - **Routes**: SPA rewrite rule `/* -> /index.html`

---

## 3. Deployment Troubleshooting & Verification Guide

### Resolving Past Build Errors
The previous deployment failures on Render and Vercel (e.g., at commits `1f11ece` and `809a899`) were caused by an intermittent TypeScript compilation error in `AllocationCard.tsx`:
```text
Type error: Cannot find name 'isSaving'.
```
This has been **completely resolved**:
- `AllocationCard.tsx` now uses `useFavorites` hook (`isLoading`, `favorited`) without undefined variables.
- All unused imports (`useState`, `toast`, `api`, `API_ENDPOINTS`, `Filter`, `cn`) have been removed.
- `next lint` and `tsc --noEmit` pass with **zero warnings and zero errors**.
- Static export build generates **13 / 13 static pages** cleanly with exit code 0.

### Redeploying on Vercel & Render
Every push to `main` triggers automated CI/CD builds on both Vercel and Render.
If your project dashboard previously marked a build as failed and paused automatic triggers:
1. **On Render (`arthora-web` and `arthora-api`)**:
   - Navigate to your service dashboard on [dashboard.render.com](https://dashboard.render.com).
   - Click the **Manual Deploy** button in the upper right.
   - Select **Deploy latest commit** (or **Clear build cache & deploy**).
2. **On Vercel (`arthora`)**:
   - Navigate to [vercel.com/dashboard](https://vercel.com/dashboard).
   - Under Deployments, click on the three dots `...` next to the latest production deployment.
   - Select **Redeploy**.

---

## 4. Local Verification

To run and verify the entire stack locally:

```bash
# 1. Install all dependencies across workspace
pnpm install

# 2. Build shared contracts
pnpm --filter @arthora/shared build

# 3. Start API server (port 4000)
pnpm --filter @arthora/api dev

# 4. Start Next.js client (port 3000)
pnpm --filter @arthora/web dev
```
