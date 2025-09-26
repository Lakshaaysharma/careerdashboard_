"use client";

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, DollarSign, Building, Search, TrendingUp } from "lucide-react"
import { apiCall } from "@/lib/config"

interface Internship {
  _id: string;
  title: string;
  company: string;
  location: string;
  stipend?: { min?: number; max?: number; currency?: string };
  duration?: string;
  type?: string;
  skills?: string[];
  description?: string;
  createdAt?: string;
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyInternship, setApplyInternship] = useState<Internship | null>(null);
  const [viewInternship, setViewInternship] = useState<Internship | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      const response = await apiCall("/api/internships");
      const data = await response.json();
      if (data.success && data.data) {
        setInternships(data.data);
      }
      setLoading(false);
    };
    fetchInternships();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/jobs">
                <Button variant="ghost">Jobs</Button>
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

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Responsive Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Internship Opportunities</h1>
          <p className="text-base sm:text-lg text-gray-600">Discover amazing internship opportunities to kickstart your career</p>
        </div>

        {/* Responsive Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search internships..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="ca">California</SelectItem>
                <SelectItem value="wa">Washington</SelectItem>
                <SelectItem value="ny">New York</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="8-12">8-12 weeks</SelectItem>
                <SelectItem value="12-16">12-16 weeks</SelectItem>
                <SelectItem value="16+">16+ weeks</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="data">Data Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Responsive Internships Grid */}
        <div className="grid gap-4 sm:gap-6">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading internships...</div>
          ) : internships.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No internships found.</div>
          ) : (
            internships.map((internship, index) => (
              <Card
                key={internship._id || index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setViewInternship(internship)}
              >
                <CardHeader className="px-3 sm:px-4 py-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base sm:text-lg leading-tight">{internship.title}</CardTitle>
                    <Badge variant="secondary" className="h-6 px-2 text-xs">{internship.type || 'Full-time'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center"><Building className="w-4 h-4 mr-1.5" />{internship.company}</div>
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" />{internship.location}</div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button className="h-8 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={(e) => { e.stopPropagation(); setApplyInternship(internship) }}>Apply</Button>
                    <Button variant="outline" className="h-8 px-3" onClick={(e) => e.stopPropagation()}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Internships
          </Button>
        </div>
      </div>

      {/* Responsive Apply Modal */}
      <Dialog open={!!applyInternship} onOpenChange={(open) => !open && setApplyInternship(null)}>
        <DialogContent className="max-w-xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle className="text-lg sm:text-xl">Apply for {applyInternship?.title}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!applyInternship) return
              const form = e.currentTarget as HTMLFormElement
              const fd = new FormData(form)
              fd.append('internshipId', applyInternship._id)
              try {
                setIsSubmitting(true)
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                const res = await apiCall('/api/internship-applications?name=' + encodeURIComponent((fd.get('name') as string) || '') + '&email=' + encodeURIComponent((fd.get('email') as string) || '') + '&phone=' + encodeURIComponent((fd.get('phone') as string) || ''), {
                  method: 'POST',
                  headers: token ? { 'Authorization': `Bearer ${token}` } as any : undefined,
                  body: fd
                })
                const json = await res.json()
                if (!res.ok || json.success === false) throw new Error(json.message || 'Failed to submit application')
                setApplyInternship(null)
                alert('Application submitted successfully')
              } catch (err:any) {
                alert(err.message || 'Failed to submit application')
              } finally {
                setIsSubmitting(false)
              }
            }}
            className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6"
          >
            <div>
              <Label className="text-sm">Full Name</Label>
              <Input name="name" placeholder="Your name" required className="h-10 sm:h-12" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Email</Label>
                <Input name="email" type="email" placeholder="you@email.com" required className="h-10 sm:h-12" />
              </div>
              <div>
                <Label className="text-sm">Phone</Label>
                <Input name="phone" placeholder="+1 555 123 4567" required className="h-10 sm:h-12" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Cover Letter</Label>
              <Input name="coverLetter" placeholder="Brief summary" className="h-10 sm:h-12" />
            </div>
            <div>
              <Label className="text-sm">Resume (PDF)</Label>
              <Input name="resume" type="file" accept="application/pdf" required className="h-10 sm:h-12" />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button type="button" variant="outline" onClick={() => setApplyInternship(null)} className="w-full sm:w-auto py-3">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 py-3">{isSubmitting ? 'Submitting...' : 'Submit Application'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Internship Details Modal */}
      <Dialog open={!!viewInternship} onOpenChange={(open) => !open && setViewInternship(null)}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle className="text-xl sm:text-2xl">{viewInternship?.title}</DialogTitle>
          </DialogHeader>
          {viewInternship && (
            <div className="space-y-4 px-4 sm:px-6 pb-6 text-gray-700">
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center"><Building className="w-4 h-4 mr-2" />{viewInternship.company}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{viewInternship.location}</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-2" />{viewInternship.duration || '—'}</span>
                <span className="flex items-center"><DollarSign className="w-4 h-4 mr-2" />{viewInternship.stipend?.min ? `$${viewInternship.stipend.min}` : '—'}{viewInternship.stipend?.max ? ` - $${viewInternship.stipend.max}` : ''}</span>
                <Badge variant="secondary">{viewInternship.type || 'Full-time'}</Badge>
              </div>
              {viewInternship.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="whitespace-pre-wrap text-gray-800">{viewInternship.description}</p>
                </div>
              )}
              {viewInternship.skills && viewInternship.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewInternship.skills.map((s, i) => (
                      <Badge key={i} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setViewInternship(null)}>Close</Button>
                <Button onClick={() => { setApplyInternship(viewInternship); setViewInternship(null); }} className="bg-gradient-to-r from-blue-600 to-indigo-600">Apply Now</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
