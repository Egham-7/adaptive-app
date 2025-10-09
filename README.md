# Adaptive App

Next.js web application with AI chat interface and API management platform.

## Quick Start

```bash
pnpm install
cp .env.example .env  # Configure database, auth, and API URLs
pnpm run db:generate
pnpm run dev
```

## Features

- **Chat Platform** - Real-time streaming chat with conversation management
- **API Management** - Organization, project, and API key management
- **Analytics** - Usage tracking and cost insights dashboard
- **Authentication** - Clerk-based user authentication
- **Payments** - Stripe subscription integration

## Tech Stack

- **Next.js 15** with App Router and React 19
- **TypeScript** with strict type checking
- **Prisma** ORM with PostgreSQL
- **tRPC** for type-safe APIs
- **Clerk** for authentication
- **Tailwind CSS** for styling
- **pnpm** as package manager

## Commands

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm check            # Lint and format (Biome)
pnpm typecheck        # TypeScript checking
pnpm db:studio        # Database GUI
pnpm db:generate      # Run migrations
```