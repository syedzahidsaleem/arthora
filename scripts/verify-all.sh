#!/usr/bin/env bash
# ==============================================================================
# Arthora Monorepo Quality & Production Build Verification Script
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "  [1/4] Building Shared Workspace Contracts"
echo "=========================================================="
pnpm --filter @arthora/shared build

echo "=========================================================="
echo "  [2/4] Running Monorepo Lint & Type Checks"
echo "=========================================================="
pnpm -r run lint
pnpm -r run type-check

echo "=========================================================="
echo "  [3/4] Running Full Vitest Test Suite"
echo "=========================================================="
pnpm -r run test

echo "=========================================================="
echo "  [4/4] Verifying Next.js Production Static Export"
echo "=========================================================="
pnpm --filter @arthora/web build

echo ""
echo ">>> [SUCCESS] All Arthora monorepo quality gates passed cleanly! <<<"
