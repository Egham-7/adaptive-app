# Agent Guidelines for adaptive-app

## Commands

- **Dev**: `pnpm dev` (generates Prisma client + starts Next.js with Turbo)
- **Build**: `pnpm run build` (generates Prisma client + builds)
- **Typecheck**: `pnpm run typecheck` (run before committing)
- **Lint/Format**: `pnpm run check` (Biome linter), `pnpm run check:write` (auto-fix)
- **DB**: `pnpm run db:generate` (migrate), `pnpm run db:push` (push schema), `pnpm run db:studio` (GUI)
- **Tests**: No test framework configured. Check README for testing approach before implementing tests.

## Code Style

- **Package Manager**: Use `pnpm` only, never `npm` or `yarn`
- **Imports**: Use `@/` for absolute imports (e.g., `@/lib/shared/utils`), organize with Biome's auto-import sorting
- **TypeScript**: Strict mode enabled, always use explicit types, leverage `type` over `interface`, use `noUncheckedIndexedAccess`
- **Formatting**: Biome handles formatting. Use `cn()` from `@/lib/shared/utils` for className merging
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for files
- **Error Handling**: Use `TRPCError` for API routes with proper error codes, wrap DB operations in try-catch
- **Components**: Server Components by default (no "use client" unless needed), use Radix UI primitives
- **Database**: Use Prisma ORM exclusively, never raw SQL. Generate types: `import type { Prisma } from "prisma/generated"`
- **Comments**: NEVER add comments unless explicitly requested (per CLAUDE.md)
- **API**: Use tRPC for type-safe APIs, validate inputs with Zod schemas
- **Async/Await**: Always use async/await, never raw Promises or callbacks
