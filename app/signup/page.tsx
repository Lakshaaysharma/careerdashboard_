"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleAuth } from "@/components/ui/google-auth"
import { StudentHierarchyForm } from "@/components/ui/student-hierarchy-form"
import { TeacherHierarchyForm } from "@/components/ui/teacher-hierarchy-form"
import { TrendingUp, AlertCircle } from "lucide-react"
import { apiCall } from "@/lib/config"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showHierarchyForm, setShowHierarchyForm] = useState(false)
  const [showTeacherSetupForm, setShowTeacherSetupForm] = useState(false)
  const [showMentorSetupForm, setShowMentorSetupForm] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.role) {
      newErrors.role = "Please select your role"
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log('Starting signup request...')
      const requestData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }
      console.log('Request data:', requestData)
      
      const response = await apiCall('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok && data.success) {
        console.log('Signup successful...')
        
        // Store token and user data
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        
        // If user is a student or teacher, show respective setup forms
        if (formData.role === 'student') {
          setUserData(data.data.user)
          setShowHierarchyForm(true)
        } else if (formData.role === 'teacher') {
          setUserData(data.data.user)
          setShowTeacherSetupForm(true)
        } else if (formData.role === 'mentor') {
          setUserData(data.data.user)
          setShowMentorSetupForm(true)
        } else {
          // For non-students, redirect to appropriate dashboard
          router.push(data.data.redirectUrl)
        }
      } else {
        console.log('Signup failed:', data.message)
        setGeneralError(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Signup error:', error)
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      })
      setGeneralError('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = (data: any) => {
    console.log('Signup: Google success data received:', data)
    console.log('Signup: User role from backend:', data.user.role)
    console.log('Signup: Redirect URL from backend:', data.redirectUrl)
    
    // Store token and user data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    // If user is a student or teacher, show setup forms
    if (data.user.role === 'student') {
      console.log('Signup: Showing student hierarchy form')
      setUserData(data.user)
      setShowHierarchyForm(true)
    } else if (data.user.role === 'teacher') {
      console.log('Signup: Showing teacher setup form')
      setUserData(data.user)
      setShowTeacherSetupForm(true)
    } else if (data.user.role === 'mentor') {
      console.log('Signup: Showing mentor setup form')
      setUserData(data.user)
      setShowMentorSetupForm(true)
    } else {
      // For non-students, redirect to appropriate dashboard
      console.log('Signup: Redirecting to:', data.redirectUrl)
      router.push(data.redirectUrl)
    }
  }

  const handleGoogleError = (error: string) => {
    setGeneralError(error)
  }

  const handleHierarchyComplete = async (hierarchyData: any) => {
    try {
      setIsLoading(true)
      
      // Send hierarchy data to backend to update student profile
      const response = await apiCall('/api/students/update-hierarchy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: userData._id,
          hierarchyData
        }),
      })

      if (response.ok) {
        console.log('Student hierarchy updated successfully')
        // Redirect to student dashboard
        router.push('/dashboard/student')
      } else {
        console.log('Failed to update student hierarchy')
        // Still redirect to dashboard even if hierarchy update fails
        router.push('/dashboard/student')
      }
    } catch (error) {
      console.error('Error updating student hierarchy:', error)
      // Redirect to dashboard even if there's an error
      router.push('/dashboard/student')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHierarchyBack = () => {
    setShowHierarchyForm(false)
    setUserData(null)
  }

  // Teacher setup handlers
  const handleTeacherSetupComplete = async (setupData: any) => {
    try {
      setIsLoading(true)
      
      // Transform the data to match backend expectations
      const transformedData = {
        instituteName: setupData.instituteName,
        className: setupData.className,
        section: setupData.section,
        batchYear: setupData.batchYear,
        subjects: setupData.subjects, // Now handling multiple subjects
        courses: setupData.courses
      }
      
      const response = await apiCall('/api/teachers/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transformedData)
      })
      
      if (response.ok) {
        console.log('Teacher setup completed successfully')
      } else {
        console.error('Teacher setup failed:', response.status)
      }
      
      // Redirect to teacher dashboard
      router.push('/dashboard/teacher')
    } catch (e) {
      console.error('Error in teacher setup:', e)
      router.push('/dashboard/teacher')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeacherSetupBack = () => {
    setShowTeacherSetupForm(false)
    setUserData(null)
  }

  // Mentor setup handlers
  const handleMentorSetupComplete = async (setupData: any) => {
    try {
      setIsLoading(true)
      const response = await apiCall('/api/mentors/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          company: setupData.company,
          experience: setupData.experience,
          bio: setupData.bio,
          skills: setupData.skills,
          hourlyRate: Number(setupData.hourlyRate),
          responseTime: setupData.responseTime,
          languages: setupData.languages,
          communicationMethods: setupData.communicationMethods,
          title: setupData.title || 'Mentor'
        })
      })

      if (!response.ok) {
        console.error('Failed to update mentor profile')
      }

      router.push('/dashboard/mentor')
    } catch (e) {
      console.error('Error in mentor setup:', e)
      router.push('/dashboard/mentor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMentorSetupBack = () => {
    setShowMentorSetupForm(false)
    setUserData(null)
  }

  // Show hierarchy form if user is a student and has completed initial signup
  if (showHierarchyForm) {
    return (
      <StudentHierarchyForm
        onComplete={handleHierarchyComplete}
        onBack={handleHierarchyBack}
        isLoading={isLoading}
      />
    )
  }

  // Show teacher setup form
  if (showTeacherSetupForm) {
    return (
      <TeacherHierarchyForm
        onComplete={handleTeacherSetupComplete}
        onBack={handleTeacherSetupBack}
        isLoading={isLoading}
      />
    )
  }

  if (showMentorSetupForm) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>
        <div className="w-full max-w-2xl relative z-10 glass-card p-6 sm:p-8 rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-4 sm:mb-6">Mentor Setup</h2>
          <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Tell us about your professional background.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const formData = new FormData(form)
              const toArray = (v: string) => v.split(',').map(s => s.trim()).filter(Boolean)
              handleMentorSetupComplete({
                title: formData.get('title') as string,
                company: formData.get('company') as string,
                experience: formData.get('experience') as string,
                bio: formData.get('bio') as string,
                skills: toArray(formData.get('skills') as string || ''),
                hourlyRate: formData.get('hourlyRate') as string,
                responseTime: formData.get('responseTime') as string,
                languages: toArray(formData.get('languages') as string || ''),
                communicationMethods: toArray(formData.get('communicationMethods') as string || ''),
              })
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm mb-2">Title</label>
              <input name="title" className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="e.g., Senior Software Engineer" />
            </div>
            <div>
              <label className="block text-sm mb-2">Company</label>
              <input name="company" className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="Your company" />
            </div>
            <div>
              <label className="block text-sm mb-2">Experience</label>
              <input name="experience" className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="e.g., 8 years" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Bio</label>
              <textarea name="bio" rows={4} className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="Short bio"></textarea>
            </div>
            <div>
              <label className="block text-sm mb-2">Skills (comma separated)</label>
              <input name="skills" className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="System Design, Algorithms" />
            </div>
            <div>
              <label className="block text-sm mb-2">Hourly Rate (USD)</label>
              <input name="hourlyRate" type="number" min="0" className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="150" />
            </div>
            <div>
              <label className="block text-sm mb-2">Response Time</label>
              <input name="responseTime" className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="< 2 hours" />
            </div>
            <div>
              <label className="block text-sm mb-2">Languages (comma separated)</label>
              <input name="languages" className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="English, Spanish" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Communication Methods (comma separated)</label>
              <input name="communicationMethods" className="w-full bg-white/10 border border-white/20 rounded-md p-3" placeholder="video, phone, chat" />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="button" onClick={handleMentorSetupBack} className="px-4 py-2 border border-white/20 rounded-md">Back</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md">
                {isLoading ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl sm:text-3xl gradient-text">Create Account</CardTitle>
            <CardDescription className="text-base sm:text-lg text-gray-300">Join thousands of users building their careers</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {generalError && (
                <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              {/* Google OAuth - Always visible */}
              {(() => {
                console.log('Signup: Rendering GoogleAuth with role:', formData.role || "student")
                return null
              })()}
              <GoogleAuth
                role={formData.role || "student"} // Use selected role from form, default to student
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
                  <span className="bg-black px-2 text-gray-400">Or sign up with email</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300 text-sm sm:text-base">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-11 sm:h-12 text-base ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300 text-sm sm:text-base">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-11 sm:h-12 text-base ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm sm:text-base">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-11 sm:h-12 text-base ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 text-sm sm:text-base">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a strong password" 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-11 sm:h-12 text-base ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 text-sm sm:text-base">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your password" 
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 h-11 sm:h-12 text-base ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300 text-sm sm:text-base">I am a</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className={`bg-gray-800/50 border-gray-600 text-white h-11 sm:h-12 ${errors.role ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="student" className="text-white hover:bg-gray-700 py-3">User</SelectItem>
                    <SelectItem value="teacher" className="text-white hover:bg-gray-700 py-3">Teacher</SelectItem>
                    <SelectItem value="employer" className="text-white hover:bg-gray-700 py-3">Employer</SelectItem>
                    <SelectItem value="mentor" className="text-white hover:bg-gray-700 py-3">Mentor</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-400 text-sm">{errors.role}</p>
                )}
              </div>


              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-red-400 text-sm">{errors.terms}</p>
              )}

              <div className="space-y-3">
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 neon-glow text-base sm:text-lg py-3 sm:py-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm sm:text-base text-gray-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign in
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
