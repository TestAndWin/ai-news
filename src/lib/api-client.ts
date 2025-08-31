// Client-side API utility for JWT authenticated requests

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

class ApiClient {
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  private async refreshTokens(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })
      
      return response.ok
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.refreshTokens()
    
    try {
      const success = await this.refreshPromise
      return success
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  async apiRequest(url: string, options: RequestOptions = {}): Promise<Response> {
    const { skipAuth = false, headers = {}, ...otherOptions } = options
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers as Record<string, string>
    }
    
    // Make initial request with cookies (JWT tokens will be sent automatically)
    let response = await fetch(url, {
      ...otherOptions,
      headers: requestHeaders,
      credentials: 'include' // Important: sends httpOnly cookies
    })
    
    // If unauthorized and not skipping auth, try token refresh
    if (response.status === 401 && !skipAuth) {
      const refreshSuccess = await this.handleTokenRefresh()
      
      if (refreshSuccess) {
        // Retry original request with refreshed token
        response = await fetch(url, {
          ...otherOptions,
          headers: requestHeaders,
          credentials: 'include'
        })
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    
    return response
  }

  // Convenience methods that return parsed JSON
  async get(url: string, options: RequestOptions = {}) {
    const response = await this.apiRequest(url, { ...options, method: 'GET' })
    if (!response.ok) {
      // Authentication failures are handled by apiRequest, so we shouldn't reach here for 401s
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }
    
  async post(url: string, data?: unknown, options: RequestOptions = {}) {
    const response = await this.apiRequest(url, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }
    
  async patch(url: string, data?: unknown, options: RequestOptions = {}) {
    const response = await this.apiRequest(url, { 
      ...options, 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }
    
  async delete(url: string, options: RequestOptions = {}) {
    const response = await this.apiRequest(url, { ...options, method: 'DELETE' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }

  // Authentication methods
  async login(password: string): Promise<boolean> {
    try {
      const response = await this.apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
        skipAuth: true
      })
      
      return response.ok
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async logout(): Promise<boolean> {
    try {
      const response = await this.apiRequest('/api/auth/logout', {
        method: 'POST'
      })
      
      if (response.ok && typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      
      return response.ok
    } catch (error) {
      console.error('Logout failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const api = new ApiClient()

// Export for backward compatibility
export const apiRequest = api.apiRequest.bind(api)