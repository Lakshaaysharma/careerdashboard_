"use client"

import { useEffect, useState } from 'react'
import { Button } from './button'
import { Loader2 } from 'lucide-react'
import { apiCall } from '@/lib/config'

declare global {
  interface Window {
    google: any
  }
}

interface GoogleAuthProps {
  role: string
  onSuccess: (data: any) => void
  onError: (error: string) => void
  isLoading?: boolean
  setIsLoading: (loading: boolean) => void
}

export function GoogleAuth({ role, onSuccess, onError, isLoading, setIsLoading }: GoogleAuthProps) {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [selectedRole, setSelectedRole] = useState(role)

  // Sync selectedRole with role prop changes
  useEffect(() => {
    setSelectedRole(role)
    console.log('GoogleAuth: Role prop changed to:', role)
  }, [role])

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsGoogleLoaded(true)
      initializeGoogleAuth()
    }
    document.head.appendChild(script)

    return () => {
      const existingScript = document.head.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const initializeGoogleAuth = () => {
    if (!window.google) return

    // Try to get from environment, fallback to hardcoded for testing
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '914803437431-u6gu32i0dmng6ap93gqoq5kvlaoevqco.apps.googleusercontent.com'
    console.log('Google Client ID:', clientId)
    
    if (!clientId || clientId === 'your-google-client-id-here') {
      console.error('Missing or invalid NEXT_PUBLIC_GOOGLE_CLIENT_ID:', clientId)
      onError('Google Sign-In not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and restart the app.')
      return
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    // Clear existing button and render new one
    const buttonContainer = document.getElementById('google-signin-button')
    if (buttonContainer) {
      buttonContainer.innerHTML = ''
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
        height: '48px',
      })
    }
  }

  const handleGoogleResponse = async (response: any) => {
    console.log('GoogleAuth: handleGoogleResponse called with role:', selectedRole)
    
    if (!selectedRole) {
      onError('Please select a role before continuing')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('GoogleAuth: Sending request with role:', selectedRole)
      const result = await apiCall('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          idToken: response.credential,
          role: selectedRole,
        }),
      })

      const data = await result.json()
      console.log('GoogleAuth: Backend response:', data)

      if (result.ok && data.success) {
        console.log('GoogleAuth: Success! User role from backend:', data.data.user.role)
        console.log('GoogleAuth: Redirect URL from backend:', data.data.redirectUrl)
        onSuccess(data.data)
      } else {
        onError(data.message || 'Google authentication failed')
      }
    } catch (error) {
      console.error('Google auth error:', error)
      onError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    if (!selectedRole) {
      onError('Please select your role from the form above before continuing with Google')
      return
    }
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '914803437431-u6gu32i0dmng6ap93gqoq5kvlaoevqco.apps.googleusercontent.com'
    if (!clientId || clientId === 'your-google-client-id-here') {
      onError('Google Sign-In not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and restart the app.')
      return
    }

    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt()
    }
  }

  return (
    <div className="space-y-4">
      {/* Google Sign-in Button */}
      <div id="google-signin-button" className="w-full"></div>
      
      {/* Fallback button if Google script doesn't load */}
      {!isGoogleLoaded && (
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>
        )}
    </div>
  )
} 