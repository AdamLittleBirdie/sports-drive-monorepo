# Architecture

## Overview

Sports Drive is built as a monorepo with clear separation of concerns:

- **Backend**: Fastify API server handling business logic
- **Mobile**: Flutter app for iOS/Android
- **Shared**: TypeScript types for type safety across services

## Technology Stack

### Backend
- **Runtime**: Node.js 22
- **Framework**: Fastify
- **Language**: TypeScript
- **Testing**: Vitest
- **Databases**: MongoDB (data), Redis (cache)

### Mobile
- **Framework**: Flutter
- **Language**: Dart
- **State Management**: Provider

### Shared
- **Language**: TypeScript
- **Purpose**: Shared type definitions

## Build & Deployment

- **Build Tool**: Turborepo
- **Package Manager**: pnpm
- **Cloud**: AWS
- **CI/CD**: GitHub Actions (recommended)

## Directory Structure

```
sports-drive/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── env.ts
│   │   │   └── index.test.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/
│       ├── lib/
│       │   ├── main.dart
│       │   ├── config/
│       │   └── screens/
│       ├── pubspec.yaml
│       └── .env.example
├── packages/
│   └── shared-types/
│       ├── src/
│       │   └── index.ts
│       ├── dist/
│       ├── package.json
│       └── tsconfig.json
├── docs/
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Data Flow

1. **Mobile App** → HTTP requests to Backend API
2. **Backend** → Validates requests, queries MongoDB, caches in Redis
3. **Shared Types** → Ensures type safety across mobile and backend

## Environment Configuration

Each service has its own `.env.example` file. Copy to `.env.local` for local development.
