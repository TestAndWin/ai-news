# Repository Guidelines

## Project Structure & Module Organization
The App Router lives in `src/app`; API endpoints sit in `src/app/api`, while `layout.tsx` and `page.tsx` compose the terminal interface. Shared UI and shadcn components live in `src/components`, and authentication, fetching, and Prisma helpers are in `src/lib`. Database schemas are kept in `prisma/`, source configuration in `config/sources.yaml`, and scraper artifacts in `cache/` (safe to regenerate when experimenting with crawlers).

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Launch Next.js with Turbopack on `http://localhost:3000`.
- `npm run build`: Prepare the production bundle, running Prisma deploy and generate against PostgreSQL.
- `npm run build:dev`: Build using the SQLite schema for local checks.
- `npm run lint`: Run ESLint with the Next.js TypeScript preset.
- `npm run prisma:generate:dev`: Refresh the Prisma client after schema edits.

## Coding Style & Naming Conventions
Use TypeScript with 2-space indentation and single quotes, mirroring existing files. Components, hooks, and context objects are PascalCase; utility modules stay camelCase. Keep request logic inside `src/lib` and expose named exports. Tailwind is the primary styling tool—compose classes in JSX and extend shared variants with `class-variance-authority` when needed. Run `npm run lint` before pushing to catch accessibility and performance regressions enforced by `next/core-web-vitals`.

## Testing Guidelines
No automated suite ships yet, so pair every change with manual smoke tests in `npm run dev` plus linting. When introducing tests, co-locate `*.test.ts(x)` alongside the component or in `src/__tests__`, and prefer React Testing Library with Vitest for UI logic or Playwright for flows. Document manual steps or recordings in the PR, especially when touching authentication or scraping.

## Commit & Pull Request Guidelines
Commit messages follow an imperative, one-line format (`Remove unused dependencies`). Keep diffs focused and mention schema or config updates in-body when relevant. PRs should outline the problem, the solution, any Prisma or sources.yaml considerations, and verification steps. Attach screenshots or terminal captures for UI and CLI changes, and link issues or TODO items when closing them.

## Configuration & Security Notes
Never commit secrets. Load credentials through `.env.local` (`DATABASE_URL`, `AUTH_PASSWORD`, `JWT_SECRET`) and document new variables in the PR body. After altering `prisma/schema.prisma` or `prisma/schema.postgresql.prisma`, rerun the matching `prisma:generate` script so teammates can regenerate clients quickly.
