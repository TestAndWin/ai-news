import puppeteer, { Browser } from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

// Types
interface ScrapedArticle {
  title: string
  summary: string
  url: string
  publishedAt: Date
  source: string
}

interface ArticleData {
  title: string
  url: string
  dateStr: string
  summary: string
}

interface SiteConfig {
  selectors: {
    container: string[]
    title: string[]
    link: string[]
    date: string[]
    summary: string[]
  }
  urlTransform?: (url: string) => string
  maxArticles?: number
}

// Constants
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour
const IPHONE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'

// Global state
let browser: Browser | null = null
let cache: Record<string, { articles: ScrapedArticle[]; timestamp: number }> = {}
const requestQueue: Array<() => void> = []
let processing = false

// Site-specific configurations
const SITE_CONFIGS: Record<string, SiteConfig> = {
  'openai.com': {
    selectors: {
      container: ['.post-preview', 'article', '.blog-post'],
      title: ['h2', 'h3', '.title'],
      link: ['a'],
      date: ['time', '.date', '.published'],
      summary: ['p', '.excerpt']
    },
    urlTransform: (url) => url.startsWith('http') ? url : `https://openai.com${url}`,
    maxArticles: 10
  },
  'anthropic.com': {
    selectors: {
      container: ['[data-testid="news-card"]', '.news-item', 'article', '.card', '[class*="news"]', '[class*="post"]'],
      title: ['h2', 'h3', 'h4', '.title', '.headline', '[class*="title"]'],
      link: ['a'],
      date: ['time', '.date', '.published', '[datetime]'],
      summary: ['p', '.excerpt', '.description', '.summary']
    },
    urlTransform: (url) => url.startsWith('http') ? url : `https://www.anthropic.com${url}`,
    maxArticles: 10
  },
  'deepmind': {
    selectors: {
      container: ['article', '.blog-card', '.post'],
      title: ['h2', 'h3', 'h1'],
      link: ['a'],
      date: ['time', '.date'],
      summary: ['p', '.excerpt']
    },
    urlTransform: (url) => url.startsWith('http') ? url : `https://deepmind.google${url}`,
    maxArticles: 10
  },
  'hbr.org': {
    selectors: {
      container: ['.stream-item', '.stream-article', '.article-item'],
      title: ['h2', 'h3', '.title'],
      link: ['a'],
      date: ['.date-published', 'time'],
      summary: ['p', '.excerpt']
    },
    maxArticles: 10
  },
  'mckinsey.com': {
    selectors: {
      container: ['.insights-card', '.insight-card', '.content-card'],
      title: ['h2', 'h3', '.title'],
      link: ['a'],
      date: ['.date', 'time'],
      summary: ['p', '.excerpt']
    },
    maxArticles: 10
  }
}

// Utility functions
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/[\r\n\t]/g, ' ').trim()
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  
  const cleanDateStr = dateStr.replace(/^(Posted|Published|Updated)\s+/i, '').trim()
  const patterns = [
    /\d{4}-\d{2}-\d{2}/,
    /\w+\s+\d{1,2},?\s+\d{4}/,
    /\d{1,2}\s+\w+\s+\d{4}/,
    /\d{1,2}\/\d{1,2}\/\d{4}/
  ]
  
  for (const pattern of patterns) {
    const match = cleanDateStr.match(pattern)
    if (match) {
      const parsed = new Date(match[0])
      if (!isNaN(parsed.getTime())) return parsed
    }
  }
  
  const fallbackDate = new Date(cleanDateStr)
  return isNaN(fallbackDate.getTime()) ? new Date() : fallbackDate
}

// Browser management
async function processQueue() {
  if (processing || requestQueue.length === 0) return
  processing = true
  
  while (requestQueue.length > 0) {
    const request = requestQueue.shift()!
    await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limiting
    request()
  }
  
  processing = false
}

function queueRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
    processQueue()
  })
}

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    // Optimized configuration for Ubuntu server deployment
    const isProduction = process.env.NODE_ENV === 'production'
    
    browser = await puppeteer.launch({
      headless: true, // Use headless mode
      args: [
        // Security-safe flags only
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-features=TranslateUI',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-background-timer-throttling',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--no-first-run',
        '--no-default-browser-check',
        // Conditional flags for production only
        ...(isProduction ? [
          '--no-sandbox', // Only in production with proper container setup
          '--disable-setuid-sandbox',
          '--single-process',
          '--disable-logging'
        ] : [])
      ],
      // Set timeout for server environments  
      timeout: 30000,
      // Use system Chrome in production if available
      ...(isProduction && { executablePath: '/usr/bin/google-chrome-stable' })
    })
  }
  return browser
}

async function closeBrowser() {
  if (browser) {
    await browser.close()
    browser = null
  }
}

// Dedicated Anthropic scraper
async function scrapeAnthropic(url: string, sourceName: string): Promise<ScrapedArticle[]> {
  return queueRequest(async () => {
    const browser = await getBrowser()
    const page = await browser.newPage()
    
    try {
      await page.setUserAgent(IPHONE_USER_AGENT)
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      
      // Wait for content to load (React app)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const articles = await page.evaluate(() => {
        const results: ArticleData[] = []
        
        // Multiple strategies for Anthropic news page
        const strategies = [
          // Strategy 1: Look for news link cards (based on the structure I saw)
          () => {
            const newsLinks = document.querySelectorAll('a[href*="/news/"]')
            newsLinks.forEach((link, index) => {
              if (index >= 15 || results.length >= 10) return
              
              const linkEl = link as HTMLAnchorElement
              
              // Look for h3 headlines within the link
              const h3El = linkEl.querySelector('h3')
              if (h3El && h3El.textContent?.trim()) {
                const title = h3El.textContent.trim()
                
                // Look for date within the same link
                const dateText = Array.from(linkEl.querySelectorAll('*'))
                  .map(el => el.textContent?.trim())
                  .find(text => text && (/\w+ \d{1,2}, \d{4}/.test(text) || /\d{4}-\d{2}-\d{2}/.test(text)))
                
                // Skip generic titles and ensure it's a real article
                if (title !== 'News' && title !== 'Newsroom' && title.length > 5 && linkEl.href) {
                  if (!results.find(r => r.url === linkEl.href)) {
                    results.push({
                      title: title,
                      url: linkEl.href,
                      dateStr: dateText || '',
                      summary: ''
                    })
                  }
                }
              }
            })
          },
          
          // Strategy 2: Look for structured news cards
          () => {
            if (results.length === 0) {
              const cardSelectors = [
                '[data-testid*="news"]',
                '[data-testid*="card"]', 
                '.news-card',
                'article',
                '.card',
                '[class*="news"]'
              ]
              
              for (const selector of cardSelectors) {
                const elements = document.querySelectorAll(selector)
                elements.forEach((element, index) => {
                  if (index >= 15 || results.length >= 10) return
                  
                  // Prioritize h3 tags for titles
                  const titleEl = element.querySelector('h3') || 
                                element.querySelector('h2') ||
                                element.querySelector('h4') ||
                                element.querySelector('.title')
                  
                  const linkEl = element.querySelector('a') || element.closest('a')
                  const dateEl = element.querySelector('time, .date, .published, [datetime]')
                  const summaryEl = element.querySelector('p, .excerpt, .description, .summary')
                  
                  if (titleEl && linkEl && titleEl.textContent?.trim()) {
                    const title = titleEl.textContent.trim()
                    const articleUrl = (linkEl as HTMLAnchorElement).href
                    
                    if (title !== 'Newsroom' && title !== 'No results found.' && title.length > 5 && articleUrl) {
                      if (!results.find(r => r.url === articleUrl || r.title === title)) {
                        results.push({
                          title: title,
                          url: articleUrl,
                          dateStr: dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || '',
                          summary: summaryEl?.textContent?.trim() || ''
                        })
                      }
                    }
                  }
                })
                
                if (results.length > 0) break
              }
            }
          }
        ]
        
        // Execute strategies
        strategies.forEach(strategy => strategy())
        
        return results
      })
      
      // Post-process: If title is generic, try to get real title from article page
      const processedArticles = await Promise.all(
        articles.map(async (article) => {
          let title = cleanText(article.title)
          let summary = truncateText(cleanText(article.summary), 100)
          
          // If we got a generic title, try to fetch the real title from the article page
          if (title === 'Newsroom' || title === 'No results found.' || title.length < 5) {
            try {
              const articlePage = await browser.newPage()
              await articlePage.setUserAgent(IPHONE_USER_AGENT)
              await articlePage.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 15000 })
              
              const pageContent = await articlePage.evaluate(() => {
                // Try various selectors for the actual article title
                const titleSelectors = [
                  'h1',
                  '.article-title', 
                  '[class*="title"]',
                  '[data-testid*="title"]'
                ]
                
                // First try direct text content
                for (const selector of titleSelectors) {
                  const element = document.querySelector(selector)
                  if (element) {
                    const titleText = element.textContent?.trim() || ''
                    if (titleText && titleText.length > 5 && titleText !== 'Newsroom' && !titleText.includes('Skip to')) {
                      return {
                        title: titleText,
                        description: (document.querySelector('meta[property="og:description"]') as HTMLMetaElement)?.content || ''
                      }
                    }
                  }
                }
                
                // Then try meta tags
                const metaTitleEl = document.querySelector('meta[property="og:title"]') as HTMLMetaElement
                if (metaTitleEl && metaTitleEl.content) {
                  let titleText = metaTitleEl.content.trim()
                  // Remove "| Anthropic" suffix if present
                  titleText = titleText.replace(/\s*\|\s*Anthropic\s*$/, '').trim()
                  if (titleText && titleText.length > 5) {
                    return {
                      title: titleText,
                      description: (document.querySelector('meta[property="og:description"]') as HTMLMetaElement)?.content || ''
                    }
                  }
                }
                
                // Fallback to page title
                const titleEl = document.querySelector('title')
                if (titleEl && titleEl.textContent) {
                  let titleText = titleEl.textContent.trim()
                  // Remove "| Anthropic" suffix if present
                  titleText = titleText.replace(/\s*\\\s*Anthropic\s*$/, '').replace(/\s*\|\s*Anthropic\s*$/, '').trim()
                  if (titleText && titleText.length > 5) {
                    return {
                      title: titleText,
                      description: (document.querySelector('meta[property="og:description"]') as HTMLMetaElement)?.content || ''
                    }
                  }
                }
                
                return { title: '', description: '' }
              })
              
              if (pageContent.title) {
                title = cleanText(pageContent.title)
              }
              if (pageContent.description && !summary) {
                summary = truncateText(cleanText(pageContent.description), 100)
              }
              
              await articlePage.close()
            } catch (error) {
              // Fallback to original title if page fetch fails
              console.log(`Failed to fetch title for ${article.url}:`, error)
            }
          }
          
          return {
            title,
            url: article.url.startsWith('http') ? article.url : `https://www.anthropic.com${article.url}`,
            publishedAt: parseDate(article.dateStr),
            summary,
            source: sourceName
          }
        })
      )
      
      return processedArticles
    } finally {
      await page.close()
    }
  })
}

// Core scraping functions
async function scrapeWithConfig(url: string, sourceName: string, config: SiteConfig): Promise<ScrapedArticle[]> {
  return queueRequest(async () => {
    const browser = await getBrowser()
    const page = await browser.newPage()
    
    try {
      await page.setUserAgent(IPHONE_USER_AGENT)
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      
      const articles = await page.evaluate((siteConfig) => {
        const results: ArticleData[] = []
        const maxArticles = siteConfig.maxArticles || 10
        
        // Try each container selector
        for (const containerSelector of siteConfig.selectors.container) {
          const containers = document.querySelectorAll(containerSelector)
          
          containers.forEach((container, index) => {
            if (index >= maxArticles || results.length >= maxArticles) return
            
            // Find elements within this container
            const titleEl = siteConfig.selectors.title
              .map(sel => container.querySelector(sel))
              .find(el => el?.textContent?.trim())
            
            const linkEl = siteConfig.selectors.link
              .map(sel => container.querySelector(sel) || titleEl?.closest('a'))
              .find(el => el?.getAttribute('href'))
            
            const dateEl = siteConfig.selectors.date
              .map(sel => container.querySelector(sel))
              .find(el => el?.textContent?.trim() || el?.getAttribute('datetime'))
            
            const summaryEl = siteConfig.selectors.summary
              .map(sel => container.querySelector(sel))
              .find(el => el?.textContent?.trim())
            
            if (titleEl && linkEl && titleEl.textContent?.trim()) {
              const articleUrl = (linkEl as HTMLAnchorElement).href
              if (articleUrl && !results.find(r => r.url === articleUrl)) {
                results.push({
                  title: titleEl.textContent.trim(),
                  url: articleUrl,
                  dateStr: dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || '',
                  summary: summaryEl?.textContent?.trim() || ''
                })
              }
            }
          })
          
          if (results.length > 0) break // Stop if we found articles with this selector
        }
        
        return results
      }, config)
      
      return articles.map(article => ({
        title: cleanText(article.title),
        url: config.urlTransform ? config.urlTransform(article.url) : article.url,
        publishedAt: parseDate(article.dateStr),
        summary: truncateText(cleanText(article.summary), 100),
        source: sourceName
      }))
    } finally {
      await page.close()
    }
  })
}

async function scrapeGeneric(url: string, sourceName: string): Promise<ScrapedArticle[]> {
  return queueRequest(async () => {
    const browser = await getBrowser()
    const page = await browser.newPage()
    
    try {
      await page.setUserAgent(IPHONE_USER_AGENT)
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      
      const articles = await page.evaluate(() => {
        const results: ArticleData[] = []
        
        // Generic selectors for common blog/news structures
        const containerSelectors = [
          'article', '.post', '.blog-post', '.news-item', '.entry',
          '.card', '.item', '[class*="article"]', '[class*="post"]'
        ]
        
        for (const selector of containerSelectors) {
          const containers = document.querySelectorAll(selector)
          
          containers.forEach((container, index) => {
            if (index >= 15 || results.length >= 10) return
            
            const titleEl = container.querySelector('h1, h2, h3, h4, .title, [class*="title"]')
            const linkEl = container.querySelector('a') || titleEl?.closest('a')
            const dateEl = container.querySelector('time, .date, .published, [datetime]')
            const summaryEl = container.querySelector('p, .excerpt, .summary, .description')
            
            if (titleEl && linkEl && titleEl.textContent?.trim()) {
              const articleUrl = (linkEl as HTMLAnchorElement).href
              if (articleUrl && !results.find(r => r.url === articleUrl)) {
                results.push({
                  title: titleEl.textContent.trim(),
                  url: articleUrl,
                  dateStr: dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || '',
                  summary: summaryEl?.textContent?.trim() || ''
                })
              }
            }
          })
          
          if (results.length > 0) break
        }
        
        return results
      })
      
      return articles.map(article => ({
        title: cleanText(article.title),
        url: article.url.startsWith('http') ? article.url : new URL(article.url, url).href,
        publishedAt: parseDate(article.dateStr),
        summary: truncateText(cleanText(article.summary), 100),
        source: sourceName
      }))
    } finally {
      await page.close()
    }
  })
}

// Main export function
export async function scrapeWebsite(url: string, sourceName: string): Promise<ScrapedArticle[]> {
  // Check cache first
  const cached = cache[url]
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`✅ Using cached data for ${sourceName}`)
    return cached.articles
  }
  
  console.log(`🔍 Scraping ${sourceName} from ${url}...`)
  
  try {
    let articles: ScrapedArticle[] = []
    
    // Site-specific scrapers
    if (url.includes('anthropic.com')) {
      articles = await scrapeAnthropic(url, sourceName)
    } else {
      // Find matching site config
      const siteKey = Object.keys(SITE_CONFIGS).find(key => url.includes(key))
      
      if (siteKey) {
        articles = await scrapeWithConfig(url, sourceName, SITE_CONFIGS[siteKey])
      } else {
        articles = await scrapeGeneric(url, sourceName)
      }
    }
    
    // Cache results
    cache[url] = {
      articles,
      timestamp: Date.now()
    }
    
    console.log(`✅ Scraped ${articles.length} articles from ${sourceName}`)
    return articles
  } catch (error) {
    console.error(`❌ Error scraping ${sourceName}:`, error)
    return []
  }
}

// Cache management
const cacheFilePath = path.join(process.cwd(), 'cache', 'scraper-cache.json')

export async function loadCache() {
  try {
    const cacheData = await fs.readFile(cacheFilePath, 'utf8')
    cache = JSON.parse(cacheData)
  } catch {
    cache = {}
  }
}

export async function saveCache() {
  try {
    const cacheDir = path.dirname(cacheFilePath)
    await fs.mkdir(cacheDir, { recursive: true })
    await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2))
  } catch (error) {
    console.error('Error saving cache:', error)
  }
}

export async function cleanupScraper() {
  await closeBrowser()
  cache = {}
}