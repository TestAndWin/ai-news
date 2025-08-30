const fs = require('fs')
const path = require('path')

// Inject API key into client code at build time
function injectApiKey() {
  const apiKey = process.env.API_KEY
  if (!apiKey) {
    console.warn('⚠️ API_KEY not found in environment')
    return
  }

  const clientPath = path.join(__dirname, '../src/lib/api-client.ts')
  let content = fs.readFileSync(clientPath, 'utf8')
  
  // Replace placeholder with actual API key
  content = content.replace('__PRODUCTION_API_KEY__', apiKey)
  
  fs.writeFileSync(clientPath, content)
  console.log('✅ API key injected into client code')
}

if (process.env.NODE_ENV === 'production') {
  injectApiKey()
}