# ==============================================================================
# Arthora Monorepo Quality & Production Build Verification Script (PowerShell)
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  [1/4] Building Shared Workspace Contracts" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
pnpm --filter @arthora/shared build

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  [2/4] Running Monorepo Lint & Type Checks" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
pnpm -r run lint
pnpm -r run type-check

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  [3/4] Running Full Vitest Test Suite" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
pnpm -r run test

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  [4/4] Verifying Next.js Production Static Export" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
pnpm --filter @arthora/web build

Write-Host "`n>>> [SUCCESS] All Arthora monorepo quality gates passed cleanly! <<<" -ForegroundColor Green
