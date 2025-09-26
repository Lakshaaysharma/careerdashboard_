"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Briefcase, 
  GraduationCap, 
  Plus, 
  MapPin, 
  DollarSign, 
  Users,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  CheckCircle,
  Building2,
  Target,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Send,
  FileText,
  Award,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiCall } from "@/lib/config"

export default function EmployerDashboard() {
  // All hooks at the top
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [jobs, setJobs] = useState<any[]>([])
  const [internships, setInternships] = useState<any[]>([])
  const [employerData, setEmployerData] = useState<any>(null)
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    experience: "",
    currentSalary: "",
    skills: "",
    qualification: "",
    phone: "",
    email: ""
  })
  const [internshipForm, setInternshipForm] = useState({
    title: "",
    description: "",
    location: "",
    stipend: "",
    experience: "",
    currentSalary: "",
    skills: "",
    qualification: "",
    phone: "",
    email: ""
  })
  // Add state for profile dialog
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  // Add state for applications dialog
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false)
  // Add state for job form dialog
  const [showJobForm, setShowJobForm] = useState(false)
  // Add state for applicant filter
  const [applicantFilter, setApplicantFilter] = useState("")
  const [expFilter, setExpFilter] = useState("")
  const [skillsFilter, setSkillsFilter] = useState<string[]>([])
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const allSkills = ["React", "Node.js", "Python", "SQL", "UI/UX", "Java", "AWS"]
  const mockApplicants = [
    { name: 'Amit Sharma', email: 'amit@example.com', job: 'Software Engineer', date: '2024-07-10', experience: '2-4', skills: ['React', 'Node.js'], salary: 70000 },
    { name: 'Priya Verma', email: 'priya@example.com', job: 'Frontend Developer', date: '2024-07-12', experience: '0-2', skills: ['React', 'UI/UX'], salary: 60000 },
    { name: 'Rahul Singh', email: 'rahul@example.com', job: 'Backend Developer', date: '2024-07-13', experience: '4+', skills: ['Node.js', 'Python', 'AWS'], salary: 90000 },
  ]
  // Add state for internship form dialog
  const [showInternshipForm, setShowInternshipForm] = useState(false);

  useEffect(() => {
    const fetchUserAndEmployerData = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Not authenticated. Please log in.")
          setLoading(false)
          return
        }
        
        // Fetch user data
        const userResponse = await apiCall("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const userData = await userResponse.json()
        
        if (userResponse.ok && userData.success) {
          setUser(userData.data)
          
          // Fetch employer dashboard data
          const employerResponse = await apiCall("/api/employers/dashboard", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const employerData = await employerResponse.json()
          
          if (employerResponse.ok && employerData.success) {
            setEmployerData(employerData.data)
            setJobs(employerData.data.recentJobs || [])
            setInternships(employerData.data.recentInternships || [])
          } else {
            console.error("Failed to fetch employer data:", employerData.message)
          }
        } else {
          setError(userData.message || "Failed to fetch user data.")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchUserAndEmployerData()
  }, [])

  const handleJobChange = (e: any) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value })
  }
  const handleInternshipChange = (e: any) => {
    setInternshipForm({ ...internshipForm, [e.target.name]: e.target.value })
  }
  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      const response = await apiCall("/api/employers/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: jobForm.title,
          location: jobForm.location,
          description: jobForm.description,
          salary: jobForm.salary,
          experience: jobForm.experience,
          skills: jobForm.skills,
          qualification: jobForm.qualification,
          email: jobForm.email
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Add the new job to the list
        setJobs([data.data.job, ...jobs])
        setJobForm({ title: "", description: "", location: "", salary: "", experience: "", currentSalary: "", skills: "", qualification: "", phone: "", email: "" })
        setShowJobForm(false)
        
        // Refresh employer data
        const employerResponse = await apiCall("/api/employers/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const employerData = await employerResponse.json()
        
        if (employerResponse.ok && employerData.success) {
          setEmployerData(employerData.data)
        }
      } else {
        setError(data.message || "Failed to create job posting.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  // Update handleInternshipSubmit to POST to backend
  const handleInternshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        return;
      }
      const response = await apiCall("/api/employers/internships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: internshipForm.title,
          location: internshipForm.location,
          description: internshipForm.description,
          stipend: internshipForm.stipend,
          experience: internshipForm.experience,
          skills: internshipForm.skills,
          qualification: internshipForm.qualification,
          email: internshipForm.email
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setInternships([data.data.internship, ...internships]);
        setInternshipForm({ title: "", description: "", location: "", stipend: "", experience: "", currentSalary: "", skills: "", qualification: "", phone: "", email: "" });
        setShowInternshipForm(false);
        
        // Refresh employer data
        const employerResponse = await apiCall("/api/employers/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const employerData = await employerResponse.json()
        
        if (employerResponse.ok && employerData.success) {
          setEmployerData(employerData.data)
          setInternships(employerData.data.recentInternships || [])
        }
      } else {
        setError(data.message || "Failed to create internship posting.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    setLoading(true)
    setError("")
    
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      const response = await apiCall(`/api/employers/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setJobs(jobs.filter(job => job.id !== id))
        
        // Refresh employer data
        const employerResponse = await apiCall("/api/employers/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const employerData = await employerResponse.json()
        
        if (employerResponse.ok && employerData.success) {
          setEmployerData(employerData.data)
        }
      } else {
        setError(data.message || "Failed to delete job.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const deleteInternship = (id: number) => {
    setInternships(internships.filter(internship => internship.id !== id))
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>
  }
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">No user data found.</div>
  }

  // Use real employer data or fallback to calculated values
  const dashboardData = employerData ? {
    name: user.name,
    totalJobs: employerData.statistics?.totalJobs || jobs.length,
    totalInternships: employerData.statistics?.totalInternships || internships.length,
    totalApplications: employerData.statistics?.totalApplications || jobs.reduce((sum, job) => sum + job.applications, 0) + 
                      internships.reduce((sum, internship) => sum + internship.applications, 0),
    totalViews: employerData.statistics?.totalViews || jobs.reduce((sum, job) => sum + job.views, 0) + 
               internships.reduce((sum, internship) => sum + internship.views, 0),
  } : {
    name: user.name,
    totalJobs: jobs.length,
    totalInternships: internships.length,
    totalApplications: jobs.reduce((sum, job) => sum + job.applications, 0) + 
                      internships.reduce((sum, internship) => sum + internship.applications, 0),
    totalViews: jobs.reduce((sum, job) => sum + job.views, 0) + 
               internships.reduce((sum, internship) => sum + internship.views, 0),
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 justify-center sm:justify-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">Shaping Career</h1>
          </Link>
          <div className="flex items-center justify-center sm:justify-end space-x-3 sm:space-x-4">
            {/* Profile Dialog Trigger */}
            <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
              <DialogTrigger asChild>
                <div className="cursor-pointer" onClick={() => setShowProfileDialog(true)}>
                  <Avatar className="w-12 h-12 border-2 border-blue-500/30">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {dashboardData.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'EM'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 w-[95vw] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl gradient-text">Profile Details</DialogTitle>
                  <DialogDescription className="text-gray-300">Your account information</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <Avatar className="w-20 h-20 border-2 border-blue-500/30">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-3xl">
                      {dashboardData.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'EM'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center w-full">
                    <p className="text-xl font-bold text-white mb-2">{user.name}</p>
                    <div className="flex flex-col items-start gap-2 mx-auto w-fit text-left">
                      {user.email && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="none"/><path d="M22 6l-10 7L2 6" /></svg>
                          <span><span className="font-semibold">Email ID:</span> {user.email}</span>
                        </div>
                      )}
                      {user.profile?.location && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                          <span>{user.profile.location}</span>
                        </div>
                      )}
                      {user.profile?.phone && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 21 16.91z"/></svg>
                          <span>{user.profile.phone}</span>
                        </div>
                      )}
                      {user.role && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21h13a2 2 0 0 0 2-2v-2a7 7 0 0 0-14 0v2a2 2 0 0 0 2 2z"/></svg>
                          <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                        </div>
                      )}
                      {user.profile?.bio && (
                        <div className="flex items-start gap-2 text-gray-400 mt-2">
                          <svg className="w-4 h-4 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/></svg>
                          <span>{user.profile.bio}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <p className="font-medium text-white">{dashboardData.name}</p>
              <p className="text-sm text-gray-400">Employer Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2">Welcome back, {dashboardData.name?.split(' ')[0]}!</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300">Manage your job postings and find the perfect candidates</p>
          </div>
          {/* Quick action: submit startup idea */}
          {user?.email && (
            <div className="mt-4">
              <Link href={`/startup-ideas?name=${encodeURIComponent(user.name || '')}&email=${encodeURIComponent(user.email || '')}&role=employer`}>
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  Submit Startup Idea
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Jobs</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData.totalJobs}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl">
                  <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Internships</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData.totalInternships}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl">
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/dashboard/employer/applicants" className="block sm:col-span-2 lg:col-span-1">
            <Card className="glass-card cursor-pointer hover:bg-white/5 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Applications</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData.totalApplications}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-500/20 rounded-xl">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 p-1 rounded-xl h-auto">
            <TabsTrigger value="jobs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg flex-col sm:flex-row p-2 sm:p-3">
              <Briefcase className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="internships" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg flex-col sm:flex-row p-2 sm:p-3">
              <GraduationCap className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm">Internships</span>
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4 sm:space-y-6">
            {/* Post Job Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white text-center sm:text-left">Your Job Postings</h3>
              <Button 
                onClick={() => setShowJobForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Post New Job</span>
                <span className="sm:hidden">Post Job</span>
              </Button>
            </div>



            {/* Posted Jobs */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  Posted Jobs ({jobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No jobs posted yet</p>
                    <p className="text-gray-500">Create your first job posting to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <Card key={job.id} className="bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-colors">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-white truncate">{job.title}</h3>
                                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 self-start">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              </div>
                              <p className="text-gray-300 mb-3 line-clamp-2 text-sm sm:text-base">{job.description}</p>
                              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">{job.salary}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span>{job.applications} apps</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span>{job.views} views</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => deleteJob(job.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Internships Tab */}
          <TabsContent value="internships" className="space-y-4 sm:space-y-6">
            {/* Post Internship Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white text-center sm:text-left">Your Internship Postings</h3>
              <Button 
                onClick={() => setShowInternshipForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Post New Internship</span>
                <span className="sm:hidden">Post Internship</span>
              </Button>
            </div>

            {/* Internship Posting Dialog */}
            <Dialog open={showInternshipForm} onOpenChange={setShowInternshipForm}>
              <DialogContent className="bg-gray-900 border-gray-700 w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl lg:text-2xl gradient-text">Post a New Internship</DialogTitle>
                  <DialogDescription className="text-gray-300 text-sm sm:text-base">Fill in the details to create a new internship posting</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInternshipSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="internship-title" className="text-gray-300">Internship Title *</Label>
                      <Input 
                        id="internship-title" 
                        name="title" 
                        value={internshipForm.title} 
                        onChange={handleInternshipChange} 
                        required 
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        placeholder="e.g., Software Development Intern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internship-location" className="text-gray-300">Location *</Label>
                      <Input 
                        id="internship-location" 
                        name="location" 
                        value={internshipForm.location} 
                        onChange={handleInternshipChange} 
                        required 
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        placeholder="e.g., Remote or San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internship-experience" className="text-gray-300">Experience Required (months)</Label>
                      <Input 
                        id="internship-experience" 
                        name="experience" 
                        value={internshipForm.experience} 
                        onChange={handleInternshipChange} 
                        type="number"
                        min="0"
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        placeholder="e.g., 0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internship-skills" className="text-gray-300">Skills</Label>
                      <Input 
                        id="internship-skills" 
                        name="skills" 
                        value={internshipForm.skills} 
                        onChange={handleInternshipChange} 
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        placeholder="e.g., Python, Data Analysis, Communication"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internship-qualification" className="text-gray-300">Academic Qualification</Label>
                      <Input 
                        id="internship-qualification" 
                        name="qualification" 
                        value={internshipForm.qualification} 
                        onChange={handleInternshipChange} 
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        placeholder="e.g., B.Sc, BBA, Diploma"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internship-email" className="text-gray-300">Email ID</Label>
                      <Input 
                        id="internship-email" 
                        name="email" 
                        value={internshipForm.email} 
                        onChange={handleInternshipChange} 
                        type="email"
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        placeholder="e.g., hr@company.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="internship-description" className="text-gray-300">Internship Description *</Label>
                    <Textarea 
                      id="internship-description" 
                      name="description" 
                      value={internshipForm.description} 
                      onChange={handleInternshipChange} 
                      required 
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 min-h-[120px]"
                      placeholder="Describe the internship program, learning opportunities, and requirements..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="internship-stipend" className="text-gray-300">Stipend</Label>
                    <Input 
                      id="internship-stipend" 
                      name="stipend" 
                      value={internshipForm.stipend} 
                      onChange={handleInternshipChange} 
                      required 
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      placeholder="e.g., $3,000/month or Unpaid with benefits"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowInternshipForm(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full sm:w-auto"
                      disabled={loading}
                    >
                      {loading ? "Posting..." : "Post Internship"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Posted Internships */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  Posted Internships ({internships.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {internships.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No internships posted yet</p>
                    <p className="text-gray-500">Create your first internship posting to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {internships.map((internship) => (
                      <Card key={internship.id} className="bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 transition-colors">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-white truncate">{internship.title}</h3>
                                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 self-start">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              </div>
                              <p className="text-gray-300 mb-3 line-clamp-2 text-sm sm:text-base">{internship.description}</p>
                              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">{internship.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">{internship.stipend && (internship.stipend.min ? `$${internship.stipend.min}` : '')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span>{internship.applications} apps</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span>{internship.views} views</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => deleteInternship(internship.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Posting Dialog */}
      <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
        <DialogContent className="bg-gray-900 border-gray-700 w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl gradient-text">Post a New Job</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">Fill in the details to create a new job posting</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJobSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-title" className="text-gray-300">Job Title *</Label>
                <Input 
                  id="job-title" 
                  name="title" 
                  value={jobForm.title} 
                  onChange={handleJobChange} 
                  required 
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-location" className="text-gray-300">Location *</Label>
                <Input 
                  id="job-location" 
                  name="location" 
                  value={jobForm.location} 
                  onChange={handleJobChange} 
                  required 
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="e.g., New York, NY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-experience" className="text-gray-300">Experience Required (years)</Label>
                <Input 
                  id="job-experience" 
                  name="experience" 
                  value={jobForm.experience} 
                  onChange={handleJobChange} 
                  type="number"
                  min="0"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="e.g., 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-salary" className="text-gray-300">Salary Range</Label>
                <Input 
                  id="job-salary" 
                  name="salary" 
                  value={jobForm.salary} 
                  onChange={handleJobChange} 
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-skills" className="text-gray-300">Skills</Label>
                <Input 
                  id="job-skills" 
                  name="skills" 
                  value={jobForm.skills} 
                  onChange={handleJobChange} 
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="e.g., React, Node.js, SQL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-qualification" className="text-gray-300">Academic Qualification</Label>
                <Input 
                  id="job-qualification" 
                  name="qualification" 
                  value={jobForm.qualification} 
                  onChange={handleJobChange} 
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="e.g., B.Tech, M.Sc, MBA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-email" className="text-gray-300">Contact Email</Label>
                <Input 
                  id="job-email" 
                  name="email" 
                  value={jobForm.email} 
                  onChange={handleJobChange} 
                  type="email"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  placeholder="e.g., jobs@company.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-description" className="text-gray-300">Job Description *</Label>
              <Textarea 
                id="job-description" 
                name="description" 
                value={jobForm.description} 
                onChange={handleJobChange} 
                required 
                rows={6}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                placeholder="Describe the role, responsibilities, requirements, and what makes this position exciting..."
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowJobForm(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 