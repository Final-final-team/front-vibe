# WHY 0010: Env Hardening And Explicit Mock Mode

Date: 2026-03-09

## Context
- Frontend runtime API selection was split between:
  - hardcoded Vite proxy values in `vite.config.ts`
  - implicit runtime fallback in `src/features/review/api.ts`
- This made it too easy to ship the wrong runtime mode by accident, especially while switching between mock data, local backend, and Vercel deployments.

## Decision
- Public runtime API base uses `VITE_PUBLIC_API_BASE_URL`.
- Local Vite proxy target uses `DEV_PROXY_TARGET`.
- Mock mode is explicit with `VITE_USE_MOCK=true|false`.
- Runtime code reads env through a single config module in `src/shared/config/app-config.ts`.

## Why
- The API target visible in browser code must be treated as public configuration, not hidden infrastructure.
- Explicit mock mode is safer than inferring from a missing env because deployment mistakes become obvious.
- Local proxy target and public runtime API base have different responsibilities and should not share one variable.

## Consequences
- Vercel must define `VITE_USE_MOCK` and, when live mode is used, `VITE_PUBLIC_API_BASE_URL`.
- Local development should define `DEV_PROXY_TARGET` in `.env.local` when backend proxying is needed.
- Hardcoded machine-specific addresses are removed from committed runtime code.
