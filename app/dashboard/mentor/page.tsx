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
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center neon-glow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Mentor Dashboard</h1>
                <p className="text-sm text-gray-400">{loading ? 'Loading profile...' : error ? error : `Welcome back, ${mentor?.name || 'Mentor'}`}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsEditOpen(true)} className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded-lg transition-colors">Edit</button>
            </div>
          </div>

          {/* Details removed from header; summary is shown below */}
        </div>
      </header>

      {/* Profile Summary */}
      {!loading && !error && mentor && (
        <section className="relative z-10 px-6 pt-6">
          <div className="container mx-auto">
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left: Identity */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                    {(mentor.name || 'M').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-semibold text-white">{mentor.name}</div>
                    <div className="text-gray-300 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-300" />
                      <span>{mentor.title || 'Mentor'} • <span className="text-blue-300">{mentor.company || '—'}</span></span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">{mentor.experience || '—'} experience</div>
                  </div>
                </div>

                {/* Right: Quick stats (vertical) */}
                <div className="grid grid-cols-1 gap-3 w-full md:w-1/2">
                  <div className="glass-card rounded-xl p-4 group flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <DollarSign className="w-4 h-4" /> Rate
                    </div>
                    <div className="text-white text-lg font-semibold group-hover:scale-105 transition">{typeof mentor.hourlyRate === 'number' ? `$${mentor.hourlyRate}/hr` : '—'}</div>
                  </div>
                  <div className="glass-card rounded-xl p-4 group flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Users className="w-4 h-4" /> Sessions
                    </div>
                    <div className="text-white text-lg font-semibold group-hover:scale-105 transition">{mentor.stats?.totalSessions ?? 0}</div>
                  </div>
                  <div className="glass-card rounded-xl p-4 group flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Star className="w-4 h-4 text-yellow-400" /> Rating
                    </div>
                    <div className="text-white text-lg font-semibold group-hover:scale-105 transition">{mentor.stats?.averageRating ?? '—'}</div>
                  </div>
                  <div className="glass-card rounded-xl p-4 group flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" /> Response
                    </div>
                    <div className="text-white text-lg font-semibold group-hover:scale-105 transition">{mentor.responseTime || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {mentor.bio && (
                <p className="text-gray-300 mt-6 leading-relaxed">{mentor.bio}</p>
              )}

              {/* Meta rows */}
              <div className="mt-6 grid grid-cols-1 gap-4 text-sm">
                <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-400 mt-1" />
                  <div>
                    <div className="text-gray-400 mb-1">Availability</div>
                    <div className="text-white">{mentor.availability || '—'}</div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                  <Globe className="w-4 h-4 text-purple-400 mt-1" />
                  <div>
                    <div className="text-gray-400 mb-1">Timezone</div>
                    <div className="text-white flex items-center gap-2"><MapPin className="w-4 h-4" />{mentor.timezone || '—'}</div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                  <Languages className="w-4 h-4 text-green-400 mt-1" />
                  <div>
                    <div className="text-gray-400 mb-1">Languages</div>
                    <div className="text-white">{Array.isArray(mentor.languages) ? mentor.languages.join(', ') : (mentor.languages || '—')}</div>
                  </div>
                </div>
              </div>

              {/* Expertise / Skills chips */}
              {(mentor.expertise?.length || mentor.skills?.length) && (
                <div className="mt-6">
                  <div className="text-gray-400 text-sm mb-2">Expertise</div>
                  <div className="flex flex-wrap gap-2">
                    {(mentor.expertise || mentor.skills || []).map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10 hover:from-blue-500/30 hover:to-purple-500/30 transition">{tag}</span>
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
        <DialogContent className="glass-card border-white/20 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Edit Mentor Details</DialogTitle>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Title</label>
              <input name="title" defaultValue={mentor?.title || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Company</label>
              <input name="company" defaultValue={mentor?.company || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Experience</label>
              <input name="experience" defaultValue={mentor?.experience || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Bio</label>
              <textarea name="bio" rows={3} defaultValue={mentor?.bio || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Expertise (comma separated)</label>
              <input name="expertise" defaultValue={(mentor?.expertise || []).join(', ')} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Skills (comma separated)</label>
              <input name="skills" defaultValue={(mentor?.skills || []).join(', ')} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Hourly Rate (USD)</label>
              <input name="hourlyRate" type="number" min="0" defaultValue={mentor?.hourlyRate ?? ''} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Response Time</label>
              <input name="responseTime" defaultValue={mentor?.responseTime || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Languages (comma separated)</label>
              <input name="languages" defaultValue={Array.isArray(mentor?.languages) ? mentor.languages.join(', ') : (mentor?.languages || '')} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Timezone</label>
              <input name="timezone" defaultValue={mentor?.timezone || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Availability</label>
              <input name="availability" defaultValue={mentor?.availability || ''} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Communication Methods (comma separated)</label>
              <input name="communicationMethods" defaultValue={(mentor?.communicationMethods || []).join(', ')} className="w-full bg-white/10 border border-white/20 rounded-md p-3" />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-white/20 rounded-md">Cancel</button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md">{isSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}