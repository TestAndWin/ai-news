# Security Implementation

## API Authentication

All API endpoints now require authentication via API key.

### How to Use

**Option 1: Header Authentication (Recommended)**
```bash
curl -X POST "http://localhost:3000/api/news/fetch" \
  -H "X-API-Key: your-api-key-here"
```

**Option 2: Query Parameter**
```bash
curl -X POST "http://localhost:3000/api/news/fetch?api_key=your-api-key-here"
```

### Protected Endpoints

- `POST /api/news/fetch` - Fetch news from sources
- `PATCH /api/news-item/[id]/click` - Mark news as clicked
- `PATCH /api/news-item/[id]/rate` - Rate news items

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Set a secure API key in production:
```bash
API_KEY="your-secure-random-key-here"
```

## Rate Limiting

- **Limit**: 10 requests per minute per IP address
- **Headers**: Rate limit status included in response headers
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in window
  - `X-RateLimit-Reset`: Time when limit resets (timestamp)

## Input Validation

- **News IDs**: Validated against cuid format (`^[a-z0-9]{25}$`)
- **Source Parameters**: Restricted to alphanumeric and safe characters
- **Rating Values**: Only accepts `1`, `2`, or `null`

## Puppeteer Security

- Removed `--disable-web-security` flag
- `--no-sandbox` only enabled in production environments
- Proper container security recommended for production

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
API_KEY="secure-random-key-min-32-chars"
DATABASE_URL="your-production-db-url"
```

### Security Headers (Recommended)
Add these to your reverse proxy/CDN:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### Container Security
If deploying with Docker, ensure proper security context:
```dockerfile
# Run as non-root user
USER node
# Enable security profiles
--security-opt seccomp=default
```