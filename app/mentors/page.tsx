"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingParticles } from "@/components/ui/floating-particles"
import { apiCall } from "@/lib/config"
import {
  Users,
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Languages,
  Calendar,
  CheckCircle,
  CreditCard,
  Loader2,
} from "lucide-react"

export default function MentorsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mentors, setMentors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    timezone: 'UTC',
    communicationMethod: 'video'
  })
  
  const loadMentors = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await apiCall('/api/mentors?page=1&limit=1000')
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load mentors')
      const list = Array.isArray(json?.data?.mentors) ? json.data.mentors : []
      setMentors(list)
    } catch (e:any) {
      // Keep a concise UI message; log full error to console
      console.error('Mentor load error:', e)
      setError('Unable to load mentors right now.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Load mentors from backend on mount
  useEffect(() => { loadMentors() }, [])

  const handleBookSession = (mentor: any) => {
    setSelectedMentor(mentor)
    setBookingForm({
      title: `Session with ${mentor.name}`,
      description: '',
      scheduledDate: '',
      duration: 60,
      timezone: 'UTC',
      communicationMethod: 'video'
    })
    setShowBookingDialog(true)
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMentor) return

    setIsBooking(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please log in to book a session')
        return
      }

      const response = await apiCall('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          ...bookingForm
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.data.payment.url
      } else {
        alert(data.message || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  const handleFormChange = (field: string, value: any) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <FloatingParticles />

      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="aurora-bg"></div>
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            top: "20%",
            left: "10%",
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        ></div>
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            bottom: "20%",
            right: "10%",
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
          }}
        ></div>
      </div>

      {/* Responsive Header */}
      <header className={`relative z-50 glass-card border-b border-white/10 transition-all duration-1000 ${isVisible ? "slide-up-animation" : "opacity-0"}`}>
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden">
            <Link href="/">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group p-2">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center neon-glow">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold gradient-text">Expert Mentors</h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Connect with industry professionals</p>
              </div>
            </div>
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group">
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center neon-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text">Expert Mentors</h1>
                  <p className="text-sm text-gray-400">Connect with industry professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Mentors Grid */}
      <section className="relative z-10 py-8 sm:py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Mentors</h2>
            {isLoading ? (
              <p className="text-gray-400 text-sm sm:text-base">Loading mentors...</p>
            ) : error ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-red-400 text-sm sm:text-base">{error}</p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={loadMentors}>Retry</Button>
              </div>
            ) : (
              <p className="text-base sm:text-lg text-gray-300">{Array.isArray(mentors) ? mentors.length : 0} mentors available</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {Array.isArray(mentors) && mentors.length > 0 ? mentors.map((mentor: any) => (
              <Card key={mentor._id || mentor.id} className="glass-card-hover group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <CardHeader className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="relative mx-auto sm:mx-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold text-white neon-glow">
                        {(mentor.name || 'M').slice(0,2).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-xl sm:text-2xl font-bold text-white mb-1">{mentor.name}</h4>
                      <p className="text-base sm:text-lg text-gray-300">{mentor.title}</p>
                      <p className="text-base sm:text-lg text-blue-400 font-semibold">{mentor.company}</p>
                      <p className="text-sm text-gray-400 mt-1">{mentor.experience}</p>
                      <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-300">{mentor.stats?.averageRating ?? '-'}</span>
                        </div>
                        <span className="text-sm text-gray-400">{mentor.stats?.totalSessions ?? 0} sessions</span>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-white">${mentor.hourlyRate}</div>
                      <div className="text-sm text-gray-400">per hour</div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 leading-relaxed text-sm sm:text-base">{mentor.bio}</p>

                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-xs sm:text-sm text-gray-300">Available: {mentor.availability}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs sm:text-sm text-gray-300">Response time: {mentor.responseTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Languages className="w-4 h-4 text-purple-400" />
                      <span className="text-xs sm:text-sm text-gray-300">{Array.isArray(mentor.languages) ? mentor.languages.join(", ") : mentor.languages}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      <span className="text-xs sm:text-sm text-gray-300">{mentor.timezone}</span>
                    </div>
                    {mentor.communicationMethods && mentor.communicationMethods.length > 0 && (
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                        <span>Communication: {mentor.communicationMethods.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <h5 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3">EXPERTISE</h5>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {(mentor.expertise || mentor.skills || []).map((skill: string, i: number) => (
                        <Badge key={i} className="bg-white/10 text-white border-0 text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
                  <Button
                    onClick={() => handleBookSession(mentor)}
                    className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform duration-300 text-base sm:text-lg py-3 sm:py-4`}
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center text-gray-400">No mentors found.</div>
            )}
          </div>
        </div>
      </section>

      {/* Responsive Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle className="text-xl sm:text-2xl gradient-text">Book a Session</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Book a session with {selectedMentor?.name} - ${selectedMentor?.hourlyRate}/hour
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Session Title *</Label>
                <Input
                  id="title"
                  value={bookingForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="e.g., Career Guidance Session"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-300">Duration (minutes) *</Label>
                <Select
                  value={bookingForm.duration.toString()}
                  onValueChange={(value) => handleFormChange('duration', parseInt(value))}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduledDate" className="text-gray-300">Date & Time *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={bookingForm.scheduledDate}
                  onChange={(e) => handleFormChange('scheduledDate', e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-gray-300">Timezone *</Label>
                <Select
                  value={bookingForm.timezone}
                  onValueChange={(value) => handleFormChange('timezone', value)}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">EST (New York)</SelectItem>
                    <SelectItem value="America/Los_Angeles">PST (Los Angeles)</SelectItem>
                    <SelectItem value="Europe/London">GMT (London)</SelectItem>
                    <SelectItem value="Asia/Kolkata">IST (India)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="communicationMethod" className="text-gray-300">Communication Method *</Label>
                <Select
                  value={bookingForm.communicationMethod}
                  onValueChange={(value) => handleFormChange('communicationMethod', value)}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Session Description</Label>
              <Textarea
                id="description"
                value={bookingForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[100px]"
                placeholder="Describe what you'd like to discuss or learn in this session..."
              />
            </div>
            
            {/* Pricing Summary */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-2">Pricing Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Duration:</span>
                  <span className="text-white">{bookingForm.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Hourly Rate:</span>
                  <span className="text-white">${selectedMentor?.hourlyRate}</span>
                </div>
                <div className="flex justify-between border-t border-gray-600 pt-2">
                  <span className="text-gray-300 font-semibold">Total Amount:</span>
                  <span className="text-white font-bold">
                    ${((bookingForm.duration / 60) * (selectedMentor?.hourlyRate || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBookingDialog(false)}
                className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 py-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isBooking}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}