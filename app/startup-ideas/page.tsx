"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Lightbulb, Rocket, CheckCircle } from "lucide-react"

export default function StartupIdeasPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ideaTitle: '',
    category: '',
    description: '',
    targetMarket: '',
    // fundingNeeded removed
    // timeline removed
    experience: '',
    additionalInfo: ''
  })

  // Prefill from dashboard deep-link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const name = params.get('name') || ''
      const email = params.get('email') || ''
      if (name || email) {
        const [firstName, ...rest] = name.split(' ')
        const lastName = rest.join(' ')
        setFormData(prev => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
          email: email || prev.email,
        }))
      }
    } catch {}
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://careerdashboard-vwue.onrender.com'
      // Prepare data for backend
      const startupIdeaData = {
        title: formData.ideaTitle,
        description: formData.description,
        industry: formData.category,
        founder: `${formData.firstName} ${formData.lastName}`,
        // omit location if not captured; backend will allow undefined
        teamSize: '1', // Default to 1 for now
        prototype: formData.additionalInfo.toLowerCase().includes('prototype'),
        marketSize: formData.targetMarket.includes('$') ? formData.targetMarket : '$10M+', // Extract or default
        contactEmail: formData.email,
        contactPhone: formData.phone,
        website: '',
        tags: []
      }

      const response = await fetch(`${API_BASE}/api/startup-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(startupIdeaData),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message || 'Failed to submit idea'}`)
      }
    } catch (error) {
      console.error('Error submitting idea:', error)
      alert('Failed to submit idea. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="px-4 sm:px-6 pt-6 sm:pt-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Idea Submitted!</CardTitle>
            <CardDescription className="text-sm sm:text-base">Your startup idea has been sent to our investor network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
            <p className="text-gray-600 text-sm sm:text-base">
              We'll review your submission and connect you with relevant investors within 5-7 business days.
            </p>
            <div className="space-y-3">
              <Link href="/startup-ideas/gallery">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3">
                  View Your Idea in Gallery
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent py-3">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Responsive Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shaping Career</h1>
            </Link>
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-sm px-3 py-2">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-sm px-3 py-2">Sign Up</Button>
              </Link>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Shaping Career</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/startup-ideas/gallery">
                <Button variant="outline">Browse Ideas</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Sign Up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Responsive Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Submit Your Startup Idea</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Have a brilliant startup idea? Share it with our network of investors and mentors who are looking for the
            next big thing.
          </p>
        </div>


        {/* Responsive Submission Form */}
        <Card className="shadow-lg">
          <CardHeader className="px-4 sm:px-6 pt-6 sm:pt-8">
            <CardTitle className="text-xl sm:text-2xl">Tell Us About Your Idea</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Fill out the form below to submit your startup idea to our investor network
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Your first name" 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Your last name" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="(555) 123-4567" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ideaTitle">Startup Idea Title</Label>
                <Input 
                  id="ideaTitle" 
                  placeholder="Give your idea a catchy name" 
                  value={formData.ideaTitle}
                  onChange={(e) => handleInputChange('ideaTitle', e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Industry Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="sustainability">Sustainability</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Idea Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your startup idea in detail. What problem does it solve? How does it work? What makes it unique?"
                  className="min-h-32"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetMarket">Target Market</Label>
                <Textarea
                  id="targetMarket"
                  placeholder="Who are your target customers? What's the market size? How will you reach them?"
                  className="min-h-24"
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                  required
                />
              </div>

              {/* Funding Needed and Development Timeline removed as requested */}

              <div className="space-y-2">
                <Label htmlFor="experience">Your Background & Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Tell us about your relevant experience, skills, and what qualifies you to execute this idea"
                  className="min-h-24"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Any additional information you'd like to share? Prototypes, market research, team members, etc."
                  className="min-h-24"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-3 sm:py-4"
                >
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Idea'}
                </Button>
                <Link href="/" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto py-3 sm:py-4">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
