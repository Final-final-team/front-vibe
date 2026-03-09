# Frontend ADRs

This folder is the frontend architecture decision record store for this workspace.

## Purpose
- Capture meaningful frontend technical decisions in a durable format.
- Preserve the context and tradeoffs behind each choice.
- Make later refactors easier by showing what was chosen, why, and what assumptions were active at the time.

## ADR Format
Each ADR should use this structure when possible:

```md
# ADR-XXXX: Short Title

- Status: accepted | superseded | deprecated | proposed
- Date: YYYY-MM-DD

## Context

## Options Considered

## Decision

## Consequences
```

Optional sections are allowed when useful:
- `Recommendation`
- `Open Questions`
- `References`
- `Supersedes`
- `Superseded by`

## Writing Rules
- One ADR per meaningful decision.
- Keep titles short and concrete.
- Record the user-approved choice, not just the recommendation.
- Prefer file and code references when the decision was grounded in the current repository state.
- If a decision changes later, create a new ADR and link the old one instead of silently rewriting history.

## Current Scope
These ADRs cover frontend architecture, rendering model, routing, state/data strategy, environment/config strategy, and interaction patterns for `front-vibe`.
