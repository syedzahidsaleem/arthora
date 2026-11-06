# Contributing to Arthora

Thank you for your interest in contributing to Arthora! We welcome bug reports, feature suggestions, documentation enhancements, and pull requests.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful and constructive in all interactions.

---

## Development Workflow

### 1. Prerequisites
- **Node.js:** v20.x or higher
- **Package Manager:** `pnpm` v9.x or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker & Docker Compose:** For running local MongoDB and Redis instances (optional if using cloud databases)
- **Flutter SDK:** Flutter 3.29+ (for mobile app development)

### 2. Getting Started
1. **Fork and Clone:**
   ```bash
   git clone https://github.com/syedzahidsaleem/arthora.git
   cd arthora
   ```
2. **Install Monorepo Dependencies:**
   ```bash
   pnpm install
   ```
3. **Environment Configuration:**
   - Copy `apps/api/.env.example` to `apps/api/.env`
   - Copy `apps/web/.env.example` to `apps/web/.env.local`
4. **Compile Shared Types & Validators:**
   ```bash
   pnpm --filter @arthora/shared build
   ```

### 3. Verification Standards Before Submitting PRs
All pull requests must pass our automated quality gates:
```bash
# 1. Type verification across all packages
pnpm run type-check

# 2. Linting verification (0 errors, 0 warnings)
pnpm run lint

# 3. Unit & Integration test suite
pnpm run test

# 4. Production build check
pnpm run build
```

---

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) to maintain clean changelogs:

- `feat(...)`: A new user-facing feature or capability
- `fix(...)`: A bug fix or error correction
- `chore(...)`: Tooling, build pipeline, or dependency updates
- `docs(...)`: Documentation additions or refinements
- `test(...)`: Adding or updating test cases
- `refactor(...)`: Code adjustments without behavioral changes

---

## Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with concise messages following the conventional format.
3. Push to your fork and submit a PR to the `main` branch.
4. Fill out the PR template completely with screenshots (for UI changes) or test logs.
