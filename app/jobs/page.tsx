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
import { MapPin, DollarSign, Building, Search, TrendingUp } from "lucide-react"
import { apiCall } from "@/lib/config"

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: { min?: number; max?: number; currency?: string };
  type?: string;
  skills?: string[];
  description?: string;
  createdAt?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyJob, setApplyJob] = useState<Job | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const response = await apiCall("/api/jobs");
      const data = await response.json();
      if (data.success) {
        setJobs(data.data);
      }
      setLoading(false);
    };
    fetchJobs();
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
              <Link href="/internships">
                <Button variant="ghost">Internships</Button>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Job Opportunities</h1>
          <p className="text-base sm:text-lg text-gray-600">Find your perfect entry-level position and start your career journey</p>
        </div>

        {/* Responsive Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search jobs..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="ca">California</SelectItem>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="tx">Texas</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
                <SelectItem value="junior">Junior (1-3 years)</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fulltime">Full-time</SelectItem>
                <SelectItem value="parttime">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Responsive Jobs Grid */}
        <div className="grid gap-4 sm:gap-6">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No jobs found.</div>
          ) : (
            jobs.map((job, index) => (
              <Card key={job._id || index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="flex items-center text-base sm:text-lg">
                        <Building className="w-4 h-4 mr-2" />
                        {job.company}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-auto">{job.type || 'Full-time'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {job.salary && job.salary.min ? `$${job.salary.min}` : 'N/A'}
                    </div>
                    <div className="text-gray-500 text-sm col-span-2">Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ''}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills && job.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => setApplyJob(job)}>
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto">Save</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Jobs
          </Button>
        </div>
      </div>
      {/* Responsive Apply Modal */}
      <Dialog open={!!applyJob} onOpenChange={(open) => !open && setApplyJob(null)}>
        <DialogContent className="max-w-xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle className="text-lg sm:text-xl">Apply for {applyJob?.title}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!applyJob) return
              const form = e.currentTarget as HTMLFormElement
              const fd = new FormData(form)
              fd.append('jobId', applyJob._id)
              try {
                setIsSubmitting(true)
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                const res = await apiCall('/api/applications?name=' + encodeURIComponent((fd.get('name') as string) || '') + '&email=' + encodeURIComponent((fd.get('email') as string) || '') + '&phone=' + encodeURIComponent((fd.get('phone') as string) || ''), {
                  method: 'POST',
                  headers: token ? { 'Authorization': `Bearer ${token}` } as any : undefined,
                  body: fd
                })
                const json = await res.json()
                if (!res.ok || json.success === false) throw new Error(json.message || 'Failed to submit application')
                setApplyJob(null)
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
                <Input name="phone" placeholder="+1 555 123 4567" className="h-10 sm:h-12" />
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
              <Button type="button" variant="outline" onClick={() => setApplyJob(null)} className="w-full sm:w-auto py-3">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 py-3">{isSubmitting ? 'Submitting...' : 'Submit Application'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
