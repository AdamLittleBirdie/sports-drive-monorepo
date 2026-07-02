# Sports Drive

A modern sports platform built with a monorepo architecture.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: Node.js 22, TypeScript, Fastify
- **Mobile**: Flutter
- **Shared**: TypeScript types package
- **Testing**: Vitest (backend), Flutter test (mobile)
- **Cloud**: AWS

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm 9.15.4+
- Flutter (for mobile development)

### Installation

```bash
pnpm install
```

### Development

Start all services in parallel:
```bash
pnpm dev
```

Or run individual services:
```bash
# Backend
cd apps/backend && pnpm dev

# Mobile
cd apps/mobile && flutter run
```

### Build

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Type Checking

```bash
pnpm typecheck
```

## Project Structure

```
sports-drive/
├── apps/
│   ├── backend/          # Fastify API server
│   └── mobile/           # Flutter mobile app
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── docs/                 # Documentation
├── turbo.json            # Turborepo config
├── pnpm-workspace.yaml   # pnpm workspace config
└── tsconfig.base.json    # Base TypeScript config
```

## Documentation

- [Architecture](./docs/architecture.md)
- [Development Guide](./docs/development.md)
- [API Reference](./docs/api.md)
- [Architecture Decisions](./docs/decisions/)

## License

MIT
