"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleAuth } from "@/components/ui/google-auth"
import { TrendingUp, Mail, Lock, User, AlertCircle } from "lucide-react"
import { apiCall } from "@/lib/config"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log('Login attempt with:', { email, role })

    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok && data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        
        console.log('Login successful, redirecting to:', data.data.redirectUrl)
        // Redirect based on role
        router.push(data.data.redirectUrl)
      } else {
        console.log('Login failed:', data.message)
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = (data: any) => {
    // Store token in localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    // Redirect based on role
    router.push(data.redirectUrl)
  }

  const handleGoogleError = (error: string) => {
    setError(error)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        {/* Responsive Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">Shaping Career</h1>
          </Link>
        </div>

        <Card className="glass-card shadow-2xl border border-white/10">
          <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6 pt-6 sm:pt-8">
            <CardTitle className="text-2xl sm:text-3xl gradient-text">Welcome Back</CardTitle>
            <CardDescription className="text-base sm:text-lg text-gray-300">Sign in to continue your career journey</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Google OAuth */}
              <GoogleAuth
                role={role || "student"} // Use selected role from form
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-gray-400">Or sign in with email</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 flex items-center text-sm sm:text-base">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-11 sm:h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 flex items-center text-sm sm:text-base">
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-11 sm:h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300 flex items-center text-sm sm:text-base">
                  <User className="w-4 h-4 mr-2" />
                  Login as
                </Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-11 sm:h-12">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="student" className="text-white hover:bg-gray-700 py-3">
                      User
                    </SelectItem>
                    <SelectItem value="teacher" className="text-white hover:bg-gray-700 py-3">
                      Teacher
                    </SelectItem>
                    <SelectItem value="employer" className="text-white hover:bg-gray-700 py-3">
                      Employer
                    </SelectItem>
                    <SelectItem value="mentor" className="text-white hover:bg-gray-700 py-3">
                      Mentor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 neon-glow text-base sm:text-lg py-3 sm:py-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>

                <div className="text-center text-sm sm:text-base text-gray-400">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
