# ADR 0001: Monorepo Tooling

## Status
Accepted

## Context
We need to manage multiple applications (backend, mobile) and shared code in a single repository while maintaining clear boundaries and efficient builds.

## Decision
Use pnpm workspaces + Turborepo for monorepo management.

## Rationale
- **pnpm**: Efficient disk usage, fast installs, native workspace support
- **Turborepo**: Intelligent caching, parallel task execution, clear task dependencies

## Consequences
- Single source of truth for dependencies
- Efficient builds with caching
- Clear workspace boundaries
- Easier code sharing via packages/
