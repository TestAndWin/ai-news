# AI News Terminal

An intelligent news aggregation platform with a futuristic terminal interface that collects and curates AI and tech news from various sources.

## 🚀 Features

- **JWT Authentication**: Secure login system with automatic token refresh and httpOnly cookies
- **Route Protection**: Middleware-based authentication for both frontend and API routes
- **Multi-Source Aggregation**: Collects news from 40+ leading tech, research, and business sources
- **Smart Curation**: Intelligent algorithm for freshness score and source priority
- **Interactive News Cards**: Click tracking and rating system (Thumbs Up/Down)
- **Category Organization**: 
  - Tech & Product News
  - Research & Science
  - Business & Society
- **Futuristic UI**: Matrix-Rain effect with neon styling and cyberpunk aesthetics
- **Real-time Updates**: Authenticated refresh system
- **Filter Options**: Show/Hide read news and uninteresting articles

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes (Edge/Node)
- **Database**: SQLite (development) / PostgreSQL (production) via Prisma ORM
- **Authentication**: JWT tokens with httpOnly cookies + route protection middleware
- **News Fetching**: RSS Parser + Web Scraping (Puppeteer + Cheerio)
- **UI Components**: Radix UI + Lucide Icons
- **Styling**: Tailwind CSS with Custom Neon Effects

## 📁 Project Structure

```
ai-news/
├── config/
│   └── sources.yaml          # News Sources Configuration
├── prisma/
│   ├── schema.prisma         # Database Schema
│   └── dev.db               # SQLite Database
├── middleware.ts              # Route Protection Middleware
├── src/
│   ├── app/
│   │   ├── api/             # Next.js API Routes
│   │   │   ├── auth/        # Authentication Endpoints
│   │   │   ├── metadata/    # App Metadata
│   │   │   ├── news/        # News CRUD Operations
│   │   │   └── news-item/   # Individual News Item Actions
│   │   ├── login/           # Login Page
│   │   ├── layout.tsx
│   │   └── page.tsx         # Main UI
│   ├── components/
│   │   ├── Header.tsx       # App Header with Refresh & Logout
│   │   ├── MatrixRain.tsx   # Background Effect
│   │   ├── NewsCard.tsx     # Individual News Card
│   │   ├── NewsGrid.tsx     # Grid Layout for News
│   │   └── ui/              # shadcn/ui Components
│   └── lib/
│       ├── api-auth.ts      # JWT Authentication Wrapper
│       ├── api-client.ts    # Client-side API with Auto Auth
│       ├── jwt.ts           # JWT Utilities
│       ├── db.ts            # Prisma Client
│       ├── news-fetcher.ts  # News Aggregation Logic
│       ├── web-scraper.ts   # Web Scraping Engine
│       └── utils.ts         # Utility Functions
└── cache/
    └── scraper-cache.json   # Scraping Cache
```

## 🔧 Installation & Setup

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd ai-news
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Environment Variables**:
   ```bash
   # .env.local (Development)
   DATABASE_URL="file:./dev.db"
   AUTH_PASSWORD="your-secure-password"      # Default: "password"
   JWT_SECRET="your-jwt-secret-key"          # Required for JWT signing
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. **Login**: Navigate to [http://localhost:3000/login](http://localhost:3000/login) 
   - Default password: `password` (configurable via `AUTH_PASSWORD`)

7. **Access App**: [http://localhost:3000](http://localhost:3000) (requires authentication)

## 📡 News Sources

The app aggregates news from the following categories:

### Tech & Product News (15+ Sources)
- OpenAI Blog, Anthropic News, Google AI Blog
- GitHub Blog, NVIDIA Blog, Microsoft Research
- Hugging Face Blog, LangChain Blog
- Ars Technica AI, Wired AI, Import AI

### Research & Science (8+ Sources)
- MIT Technology Review AI, BAIR Blog (Berkeley)
- DeepMind Blog, Meta AI Blog
- Sebastian Raschka Blog, Chip Huyen Blog
- Simon Willison Blog

### Business & Society (12+ Sources)
- Ethan Mollick (One Useful Thing), VentureBeat AI
- The Verge AI, TechCrunch AI
- McKinsey Digital, Harvard Business Review AI
- Brookings AI, The New Stack

## 🤖 Smart Curation Algorithm

- **Freshness Score**: Prioritizes newer articles (24h = 1.0, 48h = 0.7, 1 week = 0.4)
- **Source Priority**: Based on order in sources.yaml
- **Diversity**: Max. 1-2 articles per source for better variety
- **Final Score**: (Freshness × 0.6) + (Source Priority × 0.4)

## 🎨 UI Features

- **Matrix Rain Background**: Animated code rain effect
- **Neon Effects**: Glow effects and cyberpunk styling
- **Responsive Design**: Optimized for desktop and mobile
- **Loading States**: Futuristic loading screen
- **Interactive Elements**: Hover effects and shimmer animations

## 📊 Database Schema

```sql
-- News Items
NewsItem {
  id: String (CUID)
  title: String
  summary: String
  url: String
  publishedAt: DateTime
  category: Enum (TECH_PRODUCT, RESEARCH_SCIENCE, BUSINESS_SOCIETY)
  source: String
  clicked: Boolean
  rating: Int? (1=thumbs down, 2=thumbs up)
}

-- App Metadata
AppMetadata {
  key: String
  value: String
  updatedAt: DateTime
}
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with password
- `POST /api/auth/logout` - Logout and clear tokens
- `POST /api/auth/refresh` - Refresh JWT tokens

### News (Protected)
- `GET /api/news` - All curated news (requires authentication)
- `GET /api/news/[category]` - News by category (requires authentication)
- `POST /api/news/fetch` - Manual news refresh (requires authentication)
- `PATCH /api/news-item/[id]/click` - Mark news as read (requires authentication)
- `PATCH /api/news-item/[id]/rate` - Rate news article (requires authentication)
- `GET /api/metadata/last-refresh` - Last refresh timestamp (requires authentication)

## 📝 Scripts

```bash
npm run dev        # Development Server
npm run build      # Production Build
npm run start      # Production Server
npm run lint       # ESLint Check
```

## 🔧 Configuration

News sources can be configured in `config/sources.yaml`:

```yaml
Tech & Product News:
  - name: "Source Name"
    url: "https://example.com"
    feed: "https://example.com/rss"  # Optional RSS Feed
    categoryFilter: "AI"             # Optional Category Filter
```

## 🚀 Deployment

### Production Environment Variables

For production deployment (Vercel, Railway, etc.), set these environment variables:

```bash
# Authentication (Required)
AUTH_PASSWORD="your-secure-production-password"
JWT_SECRET="your-long-secure-jwt-secret-key-minimum-32-chars"

# Database (Production - PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"
POSTGRES_URL="postgresql://user:password@host:port/database"
POSTGRES_PRISMA_URL="postgresql://user:password@host:port/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgresql://user:password@host:port/database"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host:port/database"
POSTGRES_USER="your-db-user"
POSTGRES_HOST="your-db-host"
POSTGRES_PASSWORD="your-db-password"
POSTGRES_DATABASE="your-db-name"

# Optional
NODE_ENV="production"
```

### Vercel Deployment

1. **Push to GitHub**: Commit your changes and push to GitHub
2. **Connect to Vercel**: Import your repository in Vercel dashboard
3. **Add PostgreSQL**: Add Vercel PostgreSQL storage to your project
4. **Set Environment Variables**: Add the required variables in Vercel dashboard
5. **Deploy**: Vercel will automatically build and deploy

### Manual Production Setup

1. **Install Dependencies**: `npm install`
2. **Set Environment Variables**: Configure production variables
3. **Generate Prisma Client**: `npm run prisma:generate:production`
4. **Deploy Database**: `npm run prisma:deploy:production`
5. **Build Application**: `npm run build`
6. **Start Production Server**: `npm run start`

The app supports both SQLite (development) and PostgreSQL (production) databases automatically based on the `DATABASE_URL` environment variable.

## 📄 License

This project is created for educational and demonstration purposes.
