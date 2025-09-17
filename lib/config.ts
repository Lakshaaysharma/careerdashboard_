// Environment configuration for API endpoints
export const config = {
  // API Base URL - automatically detects environment
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 
          (typeof window !== 'undefined' && window.location.origin.includes('localhost') 
            ? 'http://localhost:5000' 
            : 'https://careerdashboard-vwue.onrender.com'),), // Replace with your actual backend URL
  
  // Socket.IO URL
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 
             (typeof window !== 'undefined' && window.location.origin.includes('localhost') 
               ? 'http://localhost:5000' 
               : 'https://careerdashboard-vwue.onrender.com'), // Replace with your actual backend URL), // Replace with your actual backend URL
  
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
