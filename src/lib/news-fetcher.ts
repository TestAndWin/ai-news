import RSSParser from 'rss-parser'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { Category } from '@prisma/client'
import { db } from './db'
import { scrapeWebsite, loadCache, saveCache, cleanupScraper } from './web-scraper'

interface Source {
  name: string
  url: string
  feed: string | null
  categoryFilter?: string
}

interface SourceConfig {
  'Tech & Product News': Source[]
  'Research & Science': Source[]
  'Business & Society': Source[]
}

const parser = new RSSParser({
  customFields: {
    item: [
      ['category', 'categories', {keepArray: true}]
    ]
  }
})

export async function loadSources(): Promise<SourceConfig> {
  const sourcesPath = path.join(process.cwd(), 'config', 'sources.yaml')
  const sourcesFile = fs.readFileSync(sourcesPath, 'utf8')
  return yaml.load(sourcesFile) as SourceConfig
}

function mapCategoryToEnum(category: string): Category {
  switch (category) {
    case 'Tech & Product News':
      return Category.TECH_PRODUCT
    case 'Research & Science':
      return Category.RESEARCH_SCIENCE
    case 'Business & Society':
      return Category.BUSINESS_SOCIETY
    default:
      return Category.TECH_PRODUCT
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export async function fetchNewsFromRSS(feed: string, source: string, category: Category, categoryFilter?: string) {
  try {
    const feedData = await parser.parseURL(feed)
    const items = feedData.items.slice(0, 15) // More items for better selection

    for (const item of items) {
      if (!item.title || !item.link || !item.pubDate) continue

      // Apply category filter if defined
      if (categoryFilter && item.categories) {
        console.log(`Checking categories for "${item.title}":`, item.categories)
        const hasRequiredCategory = item.categories.some((cat: string | { _?: string; term?: string; $?: { term?: string; scheme?: string }; [key: string]: unknown }) => {
          // Check both the term and the string content of the category
          if (typeof cat === 'string') {
            console.log(`  - String category: "${cat}"`)
            return cat.toLowerCase() === categoryFilter.toLowerCase()
          }
          // RSS Parser can return categories as objects with _ property
          if (typeof cat === 'object' && cat && cat._) {
            console.log(`  - Object category with _: "${cat._}"`)
            return cat._.toLowerCase() === categoryFilter.toLowerCase()
          }
          // Check "term" property for RSS categories
          if (typeof cat === 'object' && cat && cat.term) {
            console.log(`  - Object category with term: "${cat.term}"`)
            return cat.term.toLowerCase() === categoryFilter.toLowerCase()
          }
          // Check The Verge specific format: cat.$.term
          if (typeof cat === 'object' && cat && cat.$ && cat.$.term) {
            console.log(`  - Object category with $.term: "${cat.$.term}"`)
            return cat.$.term.toLowerCase() === categoryFilter.toLowerCase()
          }
          console.log(`  - Unknown category format:`, cat)
          return false
        })
        if (!hasRequiredCategory) {
          console.log(`❌ Skipping article "${item.title}" - no matching category filter "${categoryFilter}"`)
          continue
        } else {
          console.log(`✅ Including article "${item.title}" - matches category filter "${categoryFilter}"`)
        }
      }

      const publishedAt = new Date(item.pubDate)
      const summary = truncateText(
        item.contentSnippet || item.content || item.title,
        100
      )

      // Check if news item already exists
      const existing = await db.newsItem.findFirst({
        where: {
          url: item.link,
        },
      })

      if (!existing) {
        await db.newsItem.create({
          data: {
            title: item.title,
            summary,
            url: item.link,
            publishedAt: publishedAt instanceof Date ? publishedAt.toISOString() : publishedAt,
            category,
            source,
          },
        })
      }
    }
  } catch (error) {
    console.error(`Error fetching RSS for ${source}:`, error)
  }
}

async function fetchNewsFromWebScraping(url: string, source: string, category: Category) {
  try {
    const articles = await scrapeWebsite(url, source)
    
    for (const article of articles) {
      if (!article.title || !article.url) continue

      // Check if news item already exists
      const existing = await db.newsItem.findFirst({
        where: {
          url: article.url,
        },
      })

      if (!existing) {
        await db.newsItem.create({
          data: {
            title: article.title,
            summary: article.summary,
            url: article.url,
            publishedAt: article.publishedAt instanceof Date ? article.publishedAt.toISOString() : article.publishedAt,
            category,
            source: article.source,
          },
        })
        console.log(`✅ Added scraped article: ${article.title.substring(0, 60)}...`)
      }
    }
  } catch (error) {
    console.error(`Error scraping ${source}:`, error)
  }
}

export async function fetchSingleSource(sourceName: string) {
  try {
    // Load cache
    await loadCache()
    
    const sources = await loadSources()
    let sourceFound = false

    for (const [categoryName, categorySourcesArray] of Object.entries(sources)) {
      const category = mapCategoryToEnum(categoryName)

      for (const source of categorySourcesArray) {
        if (source.name === sourceName) {
          sourceFound = true
          if (source.feed) {
            console.log(`📡 Fetching RSS news from ${source.name}...`)
            await fetchNewsFromRSS(source.feed, source.name, category, source.categoryFilter)
          } else {
            console.log(`🔍 Scraping web content from ${source.name}...`)
            await fetchNewsFromWebScraping(source.url, source.name, category)
          }
          break
        }
      }
      if (sourceFound) break
    }

    if (!sourceFound) {
      throw new Error(`Source "${sourceName}" not found`)
    }

    // Save cache
    await saveCache()
    
    // Cleanup
    await cleanupScraper()

    console.log(`News fetching completed for ${sourceName}`)
  } catch (error) {
    console.error(`Error fetching news for ${sourceName}:`, error)
    // Cleanup also on errors
    await cleanupScraper()
    throw error
  }
}

export async function fetchAllNews() {
  try {
    // Load cache
    await loadCache()
    
    const sources = await loadSources()

    for (const [categoryName, categorySourcesArray] of Object.entries(sources)) {
      const category = mapCategoryToEnum(categoryName)

      for (const source of categorySourcesArray) {
        if (source.feed) {
          console.log(`📡 Fetching RSS news from ${source.name}...`)
          await fetchNewsFromRSS(source.feed, source.name, category, source.categoryFilter)
        } else {
          console.log(`🔍 Scraping web content from ${source.name}...`)
          await fetchNewsFromWebScraping(source.url, source.name, category)
        }
      }
    }

    // Save cache
    await saveCache()
    
    // Cleanup
    await cleanupScraper()

    console.log('News fetching completed')
  } catch (error) {
    console.error('Error fetching news:', error)
    // Cleanup also on errors
    await cleanupScraper()
  }
}

// Smart Curation Algorithm
function calculateFreshnessScore(publishedAt: Date): number {
  const now = new Date()
  const ageInHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)
  
  if (ageInHours <= 24) return 1.0      // Today
  if (ageInHours <= 48) return 0.7      // Yesterday  
  if (ageInHours <= 168) return 0.4     // This week (7 days)
  return 0.1                             // Older
}

async function getSourcePriority(sourceName: string, category: Category): Promise<number> {
  try {
    const sources = await loadSources()
    let sourceList: Source[] = []
    
    if (category === Category.TECH_PRODUCT) {
      sourceList = sources['Tech & Product News']
    } else if (category === Category.RESEARCH_SCIENCE) {
      sourceList = sources['Research & Science'] || []
    } else if (category === Category.BUSINESS_SOCIETY) {
      sourceList = sources['Business & Society']
    }
    
    const index = sourceList.findIndex(source => source.name === sourceName)
    return index >= 0 ? 1 / (index + 1) : 0.1  // Higher priority = lower index
  } catch {
    return 0.1
  }
}


async function curateArticles(articles: Array<{
  id: string
  title: string
  summary: string
  url: string
  publishedAt: Date
  category: Category
  source: string
  clicked: boolean
  createdAt: Date
  updatedAt: Date
}>, category: Category, maxCount: number) {
  // Calculate scores for all articles
  const scoredArticles = await Promise.all(
    articles.map(async (article) => {
      const freshnessScore = calculateFreshnessScore(article.publishedAt)
      const sourcePriority = await getSourcePriority(article.source, category)
      const finalScore = (freshnessScore * 0.6) + (sourcePriority * 0.4)
      
      return {
        ...article,
        _score: finalScore,
        _freshness: freshnessScore,
        _priority: sourcePriority
      }
    })
  )
  
  // Sort by score
  scoredArticles.sort((a, b) => b._score - a._score)
  
  // Smart source limiting: max 1 article per source if we have too many
  const sourceArticleCount = new Map<string, number>()
  const curatedArticles = []
  
  // First pass: Take top article from each source
  for (const article of scoredArticles) {
    if (curatedArticles.length >= maxCount) break
    
    const currentCount = sourceArticleCount.get(article.source) || 0
    
    // Allow up to 1 article per source, or 2 for very high-priority sources (top 5)
    const maxPerSource = article._priority > 0.2 ? 2 : 1
    
    if (currentCount < maxPerSource || curatedArticles.length < Math.floor(maxCount * 0.8)) {
      curatedArticles.push(article)
      sourceArticleCount.set(article.source, currentCount + 1)
    }
  }
  
  // Remove scoring metadata
  return curatedArticles.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _score, _freshness, _priority, ...article } = item
    return article
  })
}

export async function getNewsByCategory(category: Category, limit: number = 10) {
  // Get more articles than needed for curation
  const allArticles = await db.newsItem.findMany({
    where: { category },
    orderBy: { publishedAt: 'desc' },
    take: limit * 3, // Get 3x more for better curation options
  })
  
  // Apply smart curation
  return await curateArticles(allArticles, category, limit)
}

export async function getAllNews() {
  const techNews = await getNewsByCategory(Category.TECH_PRODUCT, 15)    // Increased from 10 to 15
  const researchNews = await getNewsByCategory(Category.RESEARCH_SCIENCE, 12) // Increased from 10 to 12
  const businessNews = await getNewsByCategory(Category.BUSINESS_SOCIETY, 12) // Increased from 10 to 12

  return {
    techNews,
    researchNews,
    businessNews,
  }
}