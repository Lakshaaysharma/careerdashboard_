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
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Opportunities</h1>
          <p className="text-lg text-gray-600">Find your perfect entry-level position and start your career journey</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid md:grid-cols-4 gap-4">
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

        {/* Jobs Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div>Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div>No jobs found.</div>
          ) : (
            jobs.map((job, index) => (
              <Card key={job._id || index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="flex items-center text-lg">
                        <Building className="w-4 h-4 mr-2" />
                        {job.company}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{job.type || 'Full-time'}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
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
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => setApplyJob(job)}>
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
            Load More Jobs
          </Button>
        </div>
      </div>
      {/* Apply Modal */}
      <Dialog open={!!applyJob} onOpenChange={(open) => !open && setApplyJob(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Apply for {applyJob?.title}</DialogTitle>
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
                <Input name="phone" placeholder="+1 555 123 4567" />
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
              <Button type="button" variant="outline" onClick={() => setApplyJob(null)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-indigo-600">{isSubmitting ? 'Submitting...' : 'Submit Application'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
