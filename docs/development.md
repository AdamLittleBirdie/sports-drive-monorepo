# Development Guide

## Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy environment files:
   ```bash
   cp .env.example .env.local
   cp apps/backend/.env.example apps/backend/.env.local
   cp apps/mobile/.env.example apps/mobile/.env.local
   ```

## Running Services

### Backend
```bash
cd apps/backend
pnpm dev
```

Server runs on http://localhost:3000

### Mobile
```bash
cd apps/mobile
flutter run
```

### All Services (Parallel)
```bash
pnpm dev
```

## Testing

### Backend Tests
```bash
cd apps/backend
pnpm test
pnpm test:ui  # Interactive UI
```

### Type Checking
```bash
pnpm typecheck
```

## Building

```bash
pnpm build
```

Outputs:
- Backend: `apps/backend/dist/`
- Mobile: `apps/mobile/build/`

## Code Style

Format code:
```bash
pnpm format
```

Check formatting:
```bash
pnpm format:check
```
