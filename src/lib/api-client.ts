// Client-side API utility for authenticated requests
// Note: In a real production app, you'd want to handle API keys more securely
// This is a simplified implementation for development

const API_KEY = 'dev-api-key-change-in-production' // This should match your .env API_KEY

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