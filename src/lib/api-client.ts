// Client-side API utility for authenticated requests
// Note: API key is embedded at build time from server environment

const API_KEY = process.env.NODE_ENV === 'production' 
  ? '__PRODUCTION_API_KEY__' // Will be replaced at build time
  : 'dev-api-key-change-in-production'

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiRequest(url: string, options: RequestOptions = {}): Promise<Response> {
  const { skipAuth = false, headers = {}, ...otherOptions } = options
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers as Record<string, string>
  }
  
  // Add API key for authenticated requests
  if (!skipAuth) {
    requestHeaders['X-API-Key'] = API_KEY
  }
  
  return fetch(url, {
    ...otherOptions,
    headers: requestHeaders
  })
}

// Convenience methods
export const api = {
  get: (url: string, options: RequestOptions = {}) => 
    apiRequest(url, { ...options, method: 'GET' }),
    
  post: (url: string, data?: unknown, options: RequestOptions = {}) => 
    apiRequest(url, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
    
  patch: (url: string, data?: unknown, options: RequestOptions = {}) => 
    apiRequest(url, { 
      ...options, 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }),
    
  delete: (url: string, options: RequestOptions = {}) => 
    apiRequest(url, { ...options, method: 'DELETE' })
}