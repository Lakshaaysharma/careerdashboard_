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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CareerLaunch</h1>
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
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Internship Opportunities</h1>
          <p className="text-lg text-gray-600">Discover amazing internship opportunities to kickstart your career</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
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

        {/* Internships Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div>Loading internships...</div>
          ) : internships.length === 0 ? (
            <div>No internships found.</div>
          ) : (
            internships.map((internship, index) => (
              <Card key={internship._id || index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{internship.title}</CardTitle>
                      <CardDescription className="flex items-center text-lg">
                        <Building className="w-4 h-4 mr-2" />
                        {internship.company}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{internship.type || 'Full-time'}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {internship.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      {/* Duration is not always available, so fallback to N/A */}
                      <Clock className="w-4 h-4 mr-2" />
                      {internship.duration || 'N/A'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {internship.stipend && internship.stipend.min ? `$${internship.stipend.min}` : 'N/A'}
                    </div>
                    <div className="text-gray-500 text-sm col-span-2">Posted {internship.createdAt ? new Date(internship.createdAt).toLocaleDateString() : ''}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {internship.skills && internship.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => setApplyInternship(internship)}
                    >
                      Apply Now
                    </Button>
                    <Button variant="outline">Save</Button>
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

      {/* Apply Modal */}
      <Dialog open={!!applyInternship} onOpenChange={(open) => !open && setApplyInternship(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Apply for {applyInternship?.title}</DialogTitle>
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
            className="space-y-4"
          >
            <div>
              <Label className="text-sm">Full Name</Label>
              <Input name="name" placeholder="Your name" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Email</Label>
                <Input name="email" type="email" placeholder="you@email.com" required />
              </div>
              <div>
                <Label className="text-sm">Phone</Label>
                <Input name="phone" placeholder="+1 555 123 4567" required />
              </div>
            </div>
            <div>
              <Label className="text-sm">Cover Letter</Label>
              <Input name="coverLetter" placeholder="Brief summary" />
            </div>
            <div>
              <Label className="text-sm">Resume (PDF)</Label>
              <Input name="resume" type="file" accept="application/pdf" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setApplyInternship(null)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-indigo-600">{isSubmitting ? 'Submitting...' : 'Submit Application'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
