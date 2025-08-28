# AI News Terminal

An intelligent news aggregation platform with a futuristic terminal interface that collects and curates AI and tech news from various sources.

## 🚀 Features

- **Multi-Source Aggregation**: Collects news from 40+ leading tech, research, and business sources
- **Smart Curation**: Intelligent algorithm for freshness score and source priority
- **Interactive News Cards**: Click tracking and rating system (Thumbs Up/Down)
- **Category Organization**: 
  - Tech & Product News
  - Research & Science
  - Business & Society
- **Futuristic UI**: Matrix-Rain effect with neon styling and cyberpunk aesthetics
- **Real-time Updates**: Refresh button for manual updates
- **Filter Options**: Show/Hide read news and uninteresting articles

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes (Edge/Node)
- **Database**: SQLite via Prisma ORM
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
├── src/
│   ├── app/
│   │   ├── api/             # Next.js API Routes
│   │   │   ├── metadata/    # App Metadata
│   │   │   ├── news/        # News CRUD Operations
│   │   │   └── news-item/   # Individual News Item Actions
│   │   ├── layout.tsx
│   │   └── page.tsx         # Main UI
│   ├── components/
│   │   ├── Header.tsx       # App Header with Refresh
│   │   ├── MatrixRain.tsx   # Background Effect
│   │   ├── NewsCard.tsx     # Individual News Card
│   │   ├── NewsGrid.tsx     # Grid Layout for News
│   │   └── ui/              # shadcn/ui Components
│   └── lib/
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

4. **Environment Variables** (optional):
   ```bash
   # .env.local
   DATABASE_URL="file:./dev.db"
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. **Open App**: [http://localhost:3000](http://localhost:3000)

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

- `GET /api/news` - All curated news
- `GET /api/news/[category]` - News by category
- `POST /api/news/fetch` - Manual news refresh
- `PATCH /api/news-item/[id]/click` - Mark news as read
- `PATCH /api/news-item/[id]/rate` - Rate news article
- `GET /api/metadata/last-refresh` - Last refresh timestamp

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

The app can be deployed on Vercel, Railway, or other Next.js-compatible platforms. SQLite database is included.

## 📄 License

This project is created for educational and demonstration purposes.
