// Environment configuration for API endpoints
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_API_URL || 'https://careerdashboard-vwue.onrender.com'
  }
  // Client-side: check if we're on localhost
  if (window.location.origin.includes('localhost')) {
    return 'http://localhost:5000'
  }
  return 'https://careerdashboard-vwue.onrender.com'
}

const getSocketUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_SOCKET_URL || 'https://careerdashboard-vwue.onrender.com'
  }
  // Client-side: check if we're on localhost
  if (window.location.origin.includes('localhost')) {
    return 'http://localhost:5000'
  }
  return 'https://careerdashboard-vwue.onrender.com'
}

export const config = {
  // API Base URL - automatically detects environment
  apiUrl: getApiUrl(),
  
  // Socket.IO URL
  socketUrl: getSocketUrl(),
  
  // Frontend URL
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 
               (typeof window !== 'undefined' 
                 ? window.location.origin 
                 : 'http://localhost:3000'),
  
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// API helper function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${config.apiUrl}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  
  try {
    const response = await fetch(url, defaultOptions)
    return response
  } catch (error) {
    console.error(`API call failed for ${url}:`, error)
    throw error
  }
}
