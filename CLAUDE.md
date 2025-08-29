# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

* Frontend: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
* Backend: Next.js API Routes (Edge/Node)
* Database: SQLite (local) via Prisma ORM
* News Fetching: RSS Parser + Web Scraping (Puppeteer + Cheerio)

Use context7.com MCP to find the latest documentation for these technologies.

## Development Commands

```bash
# Development
npm run dev            # Start development server with Turbopack
npm run build          # Generate Prisma client and create production build
npm run start          # Start production server
npm run lint           # Run ESLint

# Database
npm run prisma:generate:dev        # Generate Prisma client for development (SQLite)
npm run prisma:generate:production  # Generate Prisma client for production (PostgreSQL)
npx prisma db push     # Push schema changes to database
npx prisma studio      # Open database GUI

# News Fetching (via API during development)
curl -X POST "http://localhost:3000/api/news/fetch?api_key=dev-api-key-change-in-production"
curl -X POST "http://localhost:3000/api/news/fetch?source=SOURCE_NAME&api_key=dev-api-key-change-in-production"
```

## Architecture Overview

This is an AI news aggregation platform with intelligent curation. The architecture follows Next.js App Router patterns:

### News Fetching System
- **Dual Strategy**: Sources can use RSS feeds (`feed: string`) or web scraping (`feed: null`)
- **Configuration**: News sources managed in `config/sources.yaml` with 40+ sources across 3 categories
- **Smart Curation**: Algorithm combines freshness score (60%) + source priority (40%) with diversity limiting (max 1-2 articles per source)
- **Caching**: Web scraper uses JSON cache in `cache/scraper-cache.json`

### Database Design
- **Multi-Database Setup**: SQLite for development, PostgreSQL for production (Vercel)
- **Dual Schemas**: `schema.prisma` (SQLite) and `schema.postgresql.prisma` (PostgreSQL)
- **Models**: NewsItem and AppMetadata with consistent schema across databases
- **Categories**: TECH_PRODUCT, RESEARCH_SCIENCE, BUSINESS_SOCIETY
- **User Interactions**: Click tracking (`clicked: Boolean`) and rating system (`rating: 1|2|null`)

### API Architecture
- `fetchAllNews()` vs `fetchSingleSource(sourceName)` in `src/lib/news-fetcher.ts`
- Authentication via `x-api-key` header or `api_key` query param
- Rate limiting applied to fetch endpoints
- CRUD operations for news items and metadata

### Frontend Structure
- **Main UI**: Single page with Matrix rain background effect
- **Component Hierarchy**: Header → NewsGrid → NewsCard components
- **State Management**: Server components with API calls, no complex client state
- **Styling**: Tailwind with custom neon/cyberpunk effects

### Key Files for Development
- `src/lib/news-fetcher.ts` - Core news aggregation logic and curation algorithm
- `src/lib/web-scraper.ts` - Puppeteer-based scraping engine with site-specific selectors
- `src/lib/api-auth.ts` - API authentication wrapper
- `src/lib/db.ts` - Database configuration with environment detection
- `config/sources.yaml` - News sources configuration (edit here to add sources)
- `prisma/schema.prisma` - SQLite database schema (development)
- `prisma/schema.postgresql.prisma` - PostgreSQL database schema (production)

### Testing News Sources
When adding new sources to `config/sources.yaml`:
1. Start dev server: `npm run dev`
2. Test single source: `curl -X POST "http://localhost:3000/api/news/fetch?source=SOURCE_NAME&api_key=dev-api-key-change-in-production"`
3. Check server logs for scraping success/errors
4. Sources without RSS feeds will automatically use web scraping

### Web Scraping Notes
- Uses Puppeteer with Chromium for dynamic content
- Site-specific selectors in `src/lib/web-scraper.ts`
- Graceful fallback to generic selectors when specific ones fail
- Cache prevents re-scraping same content within time windows

### Vercel Deployment Notes
- PostgreSQL database is auto-configured via Vercel Storage
- Build automatically uses PostgreSQL schema in production
- Environment variables (DATABASE_URL, POSTGRES_*) are set by Vercel
- Local development continues to use SQLite for simplicity