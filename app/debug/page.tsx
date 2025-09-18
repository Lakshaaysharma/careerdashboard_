"use client"

import { useState, useEffect } from "react"
import { config, apiCall } from "@/lib/config"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Gather debug information
    const info = {
      windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
      configApiUrl: config.apiUrl,
      configSocketUrl: config.socketUrl,
      configFrontendUrl: config.frontendUrl,
      isDevelopment: config.isDevelopment,
      isProduction: config.isProduction,
      nodeEnv: process.env.NODE_ENV,
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
      nextPublicSocketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
      nextPublicFrontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL,
    }
    setDebugInfo(info)
  }, [])

  const testEndpoints = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test health endpoint
      console.log('Testing health endpoint...')
      const healthRes = await apiCall('/health')
      results.health = {
        status: healthRes.status,
        ok: healthRes.ok,
        data: healthRes.ok ? await healthRes.json() : await healthRes.text()
      }
    } catch (error: any) {
      results.health = { error: error.message }
    }

    try {
      // Test mentors endpoint
      console.log('Testing mentors endpoint...')
      const mentorsRes = await apiCall('/api/mentors?page=1&limit=5')
      results.mentors = {
        status: mentorsRes.status,
        ok: mentorsRes.ok,
        data: mentorsRes.ok ? await mentorsRes.json() : await mentorsRes.text()
      }
    } catch (error: any) {
      results.mentors = { error: error.message }
    }

    try {
      // Test with token if available
      const token = localStorage.getItem('token')
      if (token) {
        console.log('Testing auth endpoint...')
        const authRes = await apiCall('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        results.auth = {
          status: authRes.status,
          ok: authRes.ok,
          data: authRes.ok ? await authRes.json() : await authRes.text()
        }
      } else {
        results.auth = { message: 'No token found' }
      }
    } catch (error: any) {
      results.auth = { error: error.message }
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Information</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Info */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">⚙️ Configuration</h2>
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400">{key}:</span>
                  <span className="text-green-400 font-mono text-xs break-all max-w-xs">
                    {String(value) || 'undefined'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* API Tests */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🧪 API Tests</h2>
              <button
                onClick={testEndpoints}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Run Tests'}
              </button>
            </div>
            
            {Object.keys(testResults).length > 0 && (
              <div className="space-y-4">
                {Object.entries(testResults).map(([endpoint, result]: [string, any]) => (
                  <div key={endpoint} className="border border-gray-700 p-3 rounded">
                    <h3 className="font-semibold text-yellow-400 mb-2">{endpoint}</h3>
                    <div className="text-xs">
                      {result.error ? (
                        <div className="text-red-400">❌ Error: {result.error}</div>
                      ) : (
                        <div>
                          <div className={result.ok ? 'text-green-400' : 'text-red-400'}>
                            Status: {result.status} {result.ok ? '✅' : '❌'}
                          </div>
                          <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📋 Instructions</h2>
          <ol className="space-y-2 text-sm">
            <li>1. Check the Configuration section to verify environment variables are set correctly</li>
            <li>2. Click "Run Tests" to test API connectivity</li>
            <li>3. Share the results to help debug the network error issue</li>
            <li>4. Pay attention to the API URL being used vs what's expected</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
