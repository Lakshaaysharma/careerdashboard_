"use client"

import { useState, useEffect } from "react"
import { FloatingParticles } from "@/components/ui/floating-particles"
import { apiCall } from "@/lib/config"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  Settings,
  Star,
  DollarSign,
  Clock,
  Globe,
  Languages,
  Briefcase,
  MapPin
} from "lucide-react"

export default function MentorDashboard() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mentor, setMentor] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await apiCall('/api/mentors/me', {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load mentor profile')
        setMentor(json.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load mentor profile')
      } finally {
        setLoading(false)
      }
    }
    fetchMentor()
  }, [])

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

      {/* Header */}
      <header className={`relative z-50 glass-card border-b border-white/10 transition-all duration-1000 ${isVisible ? "slide-up-animation" : "opacity-0"}`}>
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center neon-glow">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">Mentor Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  {loading ? 'Loading profile...' : error ? error : `Welcome back, ${mentor?.name || 'Mentor'}`}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-end">
              <button 
                onClick={() => setIsEditOpen(true)} 
                className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded-lg transition-colors w-full sm:w-auto"
              >
                Edit Profile
              </button>
            {mentor?.name && (
              <div className="ml-3">
                <a
                  href={`/startup-ideas?name=${encodeURIComponent(mentor.name || '')}&email=${encodeURIComponent(mentor.email || '')}&role=mentor`}
                  className="inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                >
                  Submit Startup Idea
                </a>
              </div>
            )}
            </div>
          </div>

          {/* Details removed from header; summary is shown below */}
        </div>
      </header>

      {/* Profile Summary */}
      {!loading && !error && mentor && (
        <section className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="container mx-auto">
            <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                {/* Left: Identity */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold">
                    {(mentor.name || 'M').slice(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-white truncate">{mentor.name}</div>
                    <div className="text-gray-300 flex items-center gap-2 text-sm sm:text-base">
                      <Briefcase className="w-4 h-4 text-blue-300 flex-shrink-0" />
                      <span className="truncate">{mentor.title || 'Mentor'} • <span className="text-blue-300">{mentor.company || '—'}</span></span>
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm mt-1">{mentor.experience || '—'} experience</div>
                  </div>
                </div>

                {/* Right: Quick stats (responsive grid) */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 w-full lg:w-1/2">
                  <div className="glass-card rounded-xl p-3 sm:p-4 group flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" /> 
                      <span className="hidden sm:inline">Rate</span>
                    </div>
                    <div className="text-white text-sm sm:text-base lg:text-lg font-semibold group-hover:scale-105 transition">
                      {typeof mentor.hourlyRate === 'number' ? `$${mentor.hourlyRate}/hr` : '—'}
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-3 sm:p-4 group flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" /> 
                      <span className="hidden sm:inline">Sessions</span>
                    </div>
                    <div className="text-white text-sm sm:text-base lg:text-lg font-semibold group-hover:scale-105 transition">
                      {mentor.stats?.totalSessions ?? 0}
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-3 sm:p-4 group flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> 
                      <span className="hidden sm:inline">Rating</span>
                    </div>
                    <div className="text-white text-sm sm:text-base lg:text-lg font-semibold group-hover:scale-105 transition">
                      {mentor.stats?.averageRating ?? '—'}
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-3 sm:p-4 group flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> 
                      <span className="hidden sm:inline">Response</span>
                    </div>
                    <div className="text-white text-sm sm:text-base lg:text-lg font-semibold group-hover:scale-105 transition">
                      {mentor.responseTime || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {mentor.bio && (
                <p className="text-gray-300 mt-4 sm:mt-6 leading-relaxed text-sm sm:text-base">{mentor.bio}</p>
              )}

              {/* Meta rows */}
              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div className="glass-card rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                  <Clock className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-400 mb-1 text-xs sm:text-sm">Availability</div>
                    <div className="text-white text-sm sm:text-base truncate">{mentor.availability || '—'}</div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                  <Globe className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-400 mb-1 text-xs sm:text-sm">Timezone</div>
                    <div className="text-white text-sm sm:text-base flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{mentor.timezone || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 sm:col-span-2 lg:col-span-1">
                  <Languages className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-400 mb-1 text-xs sm:text-sm">Languages</div>
                    <div className="text-white text-sm sm:text-base">
                      {Array.isArray(mentor.languages) ? mentor.languages.join(', ') : (mentor.languages || '—')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expertise / Skills chips */}
              {(mentor.expertise?.length || mentor.skills?.length) && (
                <div className="mt-4 sm:mt-6">
                  <div className="text-gray-400 text-xs sm:text-sm mb-2">Expertise</div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {(mentor.expertise || mentor.skills || []).map((tag: string, i: number) => (
                      <span 
                        key={i} 
                        className="px-2 sm:px-3 py-1 rounded-full text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10 hover:from-blue-500/30 hover:to-purple-500/30 transition"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Edit Mentor Details Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass-card border-white/20 text-white w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl gradient-text">Edit Mentor Details</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!mentor) return
              const form = e.currentTarget as HTMLFormElement
              const fd = new FormData(form)
              const toArray = (v: any) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean)
              const payload: any = {
                title: fd.get('title') as string,
                company: fd.get('company') as string,
                experience: fd.get('experience') as string,
                bio: fd.get('bio') as string,
                skills: toArray(fd.get('skills')),
                expertise: toArray(fd.get('expertise')),
                hourlyRate: Number(fd.get('hourlyRate') as string),
                responseTime: fd.get('responseTime') as string,
                languages: toArray(fd.get('languages')),
                availability: fd.get('availability') as string,
                timezone: fd.get('timezone') as string,
                communicationMethods: toArray(fd.get('communicationMethods')),
              }

              try {
                setIsSaving(true)
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                const res = await apiCall('/api/mentors/me', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                  },
                  body: JSON.stringify(payload)
                })
                const json = await res.json()
                if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update mentor profile')
                setMentor(json.data)
                setIsEditOpen(false)
              } catch (e) {
                console.error(e)
              } finally {
                setIsSaving(false)
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          >
            <div className="sm:col-span-2">
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Title</label>
              <input name="title" defaultValue={mentor?.title || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Company</label>
              <input name="company" defaultValue={mentor?.company || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Experience</label>
              <input name="experience" defaultValue={mentor?.experience || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Bio</label>
              <textarea name="bio" rows={3} defaultValue={mentor?.bio || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base resize-none" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Expertise (comma separated)</label>
              <input name="expertise" defaultValue={(mentor?.expertise || []).join(', ')} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Skills (comma separated)</label>
              <input name="skills" defaultValue={(mentor?.skills || []).join(', ')} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Hourly Rate (USD)</label>
              <input name="hourlyRate" type="number" min="0" defaultValue={mentor?.hourlyRate ?? ''} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Response Time</label>
              <input name="responseTime" defaultValue={mentor?.responseTime || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Languages (comma separated)</label>
              <input name="languages" defaultValue={Array.isArray(mentor?.languages) ? mentor.languages.join(', ') : (mentor?.languages || '')} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Timezone</label>
              <input name="timezone" defaultValue={mentor?.timezone || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Availability</label>
              <input name="availability" defaultValue={mentor?.availability || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs sm:text-sm text-gray-300 block mb-1">Communication Methods (comma separated)</label>
              <input name="communicationMethods" defaultValue={(mentor?.communicationMethods || []).join(', ')} className="w-full bg-white/10 border border-white/20 rounded-md p-2 sm:p-3 text-sm sm:text-base" />
            </div>
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setIsEditOpen(false)} 
                className="px-4 py-2 border border-white/20 rounded-md text-sm sm:text-base w-full sm:w-auto"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md text-sm sm:text-base w-full sm:w-auto"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}