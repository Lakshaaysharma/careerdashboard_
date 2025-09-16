"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Lightbulb, DollarSign, Users, Rocket, Search, Filter, Heart, MessageCircle, Eye } from "lucide-react"

export default function StartupIdeasGalleryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [startupIdeas, setStartupIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalIdeas: 0, fundedIdeas: 0, totalFunding: 0, totalTeamMembers: 0 })

  const filteredIdeas = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase()
    return startupIdeas.filter((idea: any) => {
      const title = (idea?.title || '').toLowerCase()
      const description = (idea?.description || '').toLowerCase()
      const founder = (idea?.founder || '').toLowerCase()
      const matchesSearch = term === '' || title.includes(term) || description.includes(term) || founder.includes(term)
      const matchesIndustry = !selectedIndustry || selectedIndustry === 'all' || (idea?.industry === selectedIndustry)
      return matchesSearch && matchesIndustry
    })
  }, [startupIdeas, searchTerm, selectedIndustry])

  const getStatusColor = (status: string) => status === 'funded' ? 'bg-green-100 text-green-800' : status === 'in-development' ? 'bg-blue-100 text-blue-800' : status === 'seeking-funding' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
  const getStatusText = (status: string) => status === 'funded' ? 'Funded' : status === 'in-development' ? 'In Development' : status === 'seeking-funding' ? 'Seeking Funding' : 'Unknown'

  const clearFilters = () => { setSearchTerm(""); setSelectedIndustry("all") }

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'
    const fetchIdeas = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/startup-ideas`)
        if (res.ok) {
          const data = await res.json()
          setStartupIdeas(data.ideas || [])
        }
      } finally { setLoading(false) }
    }
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/startup-ideas/stats/overview`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {}
    }
    fetchIdeas(); fetchStats();
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CareerLaunch</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/startup-ideas"><Button variant="outline">Submit Idea</Button></Link>
            <Link href="/login"><Button variant="outline">Login</Button></Link>
            <Link href="/signup"><Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Sign Up</Button></Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Startup Ideas Gallery</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Discover innovative startup ideas from entrepreneurs around the world.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center"><CardContent className="pt-6"><Lightbulb className="w-8 h-8 text-orange-600 mx-auto mb-2" /><div className="text-2xl font-bold">{loading ? '...' : stats.totalIdeas}</div><p className="text-sm text-gray-600">Total Ideas</p></CardContent></Card>
          <Card className="text-center"><CardContent className="pt-6"><DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" /><div className="text-2xl font-bold">{loading ? '...' : `$${stats.totalFunding}K+`}</div><p className="text-sm text-gray-600">Total Funding</p></CardContent></Card>
          <Card className="text-center"><CardContent className="pt-6"><Users className="w-8 h-8 text-blue-600 mx-auto mb-2" /><div className="text-2xl font-bold">{loading ? '...' : stats.totalTeamMembers}</div><p className="text-sm text-gray-600">Team Members</p></CardContent></Card>
          <Card className="text-center"><CardContent className="pt-6"><Rocket className="w-8 h-8 text-purple-600 mx-auto mb-2" /><div className="text-2xl font-bold">{loading ? '...' : stats.fundedIdeas}</div><p className="text-sm text-gray-600">Funded Ideas</p></CardContent></Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center"><Search className="w-5 h-5 mr-2" />Search & Filter Ideas</CardTitle>
              <Button variant="outline" onClick={clearFilters} size="sm">Clear Filters</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2"><Input placeholder="Search ideas, founders, or descriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" /></div>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="sustainability">Sustainability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-6"><p className="text-gray-600">Showing {filteredIdeas.length} of {startupIdeas.length} ideas</p><div className="flex items-center space-x-2"><Filter className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-500">Filtered Results</span></div></div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div><p className="text-gray-600">Loading startup ideas...</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea: any) => (
              <Card key={idea._id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getStatusColor(idea.status)}>{getStatusText(idea.status)}</Badge>
                    {idea.prototype && (<Badge className="bg-blue-100 text-blue-800">Prototype</Badge>)}
                  </div>
                  <CardTitle className="text-lg text-white line-clamp-2">{idea.title}</CardTitle>
                  <CardDescription className="text-sm text-white line-clamp-3">{idea.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-500">Industry</p><p className="font-medium capitalize">{idea.industry}</p></div>
                    <div><p className="text-gray-500">Founder</p><p className="font-medium">{idea.founder}</p></div>
                  </div>
                  {idea.location && idea.location !== 'Not specified' && (<div className="text-sm text-gray-500">{idea.location}</div>)}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1"><Heart className="w-4 h-4" /><span>{idea.likes}</span></div>
                      <div className="flex items-center space-x-1"><Eye className="w-4 h-4" /><span>{idea.views}</span></div>
                      <div className="flex items-center space-x-1"><MessageCircle className="w-4 h-4" /><span>{idea.comments}</span></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1" variant="outline" size="sm" onClick={() => {
                      if (idea.contactEmail) {
                        window.location.href = `mailto:${idea.contactEmail}?subject=Regarding your startup idea: ${encodeURIComponent(idea.title)}`
                      } else { alert('No contact email provided') }
                    }}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredIdeas.length === 0 && (<Card className="text-center py-12"><CardContent><Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-600 mb-2">No ideas found</h3><p className="text-gray-500 mb-4">Try adjusting your search terms or filters.</p><Button onClick={clearFilters} variant="outline">Clear All Filters</Button></CardContent></Card>)}

        <div className="text-center mt-12"><Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white"><CardContent className="py-8"><h3 className="text-2xl font-bold mb-4">Have a Great Startup Idea?</h3><p className="text-orange-100 mb-6">Share your innovative idea with our network of investors.</p><Link href="/startup-ideas"><Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100"><Rocket className="w-5 h-5 mr-2" /> Submit Your Idea</Button></Link></CardContent></Card></div>
      </div>
    </div>
  )
}


