"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { apiCall } from "@/lib/config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Users, Briefcase, GraduationCap } from "lucide-react"

export default function ApplicantsPage() {
  const [fitFilter, setFitFilter] = useState<'all' | 'fit' | 'unfit'>('all')
  const [jobApplicants, setJobApplicants] = useState<any[]>([])
  const [internshipApplicants, setInternshipApplicants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        
        // Fetch job applications
        const jobRes = await apiCall("/api/employers/applications", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const jobData = await jobRes.json()
        
        // Fetch internship applications
        const internshipRes = await apiCall("/api/employers/internship-applications", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const internshipData = await internshipRes.json()
        
        if (jobRes.ok && jobData.success) {
          setJobApplicants(jobData.data.applications || [])
        } else {
          console.error("Failed to fetch job applications:", jobData.message)
        }
        
        if (internshipRes.ok && internshipData.success) {
          setInternshipApplicants(internshipData.data.applications || [])
        } else {
          console.error("Failed to fetch internship applications:", internshipData.message)
        }
        
        if (!jobRes.ok && !internshipRes.ok) {
          setError("Failed to fetch applicants.")
        }
      } catch (err) {
        setError("Network error. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchApplicants()
  }, [])

  const filteredJobApplicants = fitFilter === 'all' ? jobApplicants : jobApplicants.filter(a => a.fitStatus === fitFilter)
  const filteredInternshipApplicants = fitFilter === 'all' ? internshipApplicants : internshipApplicants.filter(a => a.fitStatus === fitFilter)

  const ApplicantCard = ({ applicant, type }: { applicant: any, type: 'job' | 'internship' }) => (
    <div className="glass-card border border-blue-700/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-2xl hover:border-blue-400/60 transition-all duration-200 bg-gradient-to-br from-blue-900/30 via-black/60 to-purple-900/20">
      <div className="flex flex-col gap-1 min-w-[220px]">
        <span className="font-semibold text-white text-lg">{applicant.applicant?.name || applicant.applicantName || 'N/A'}</span>
        <span className="ml-0 text-gray-400 text-sm">{applicant.applicant?.email || applicant.applicantEmail || 'N/A'}</span>
        {applicant.applicantPhone && (
          <span className="ml-0 text-gray-400 text-xs">{applicant.applicantPhone}</span>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`px-2 py-1 rounded text-xs font-semibold border ${
          type === 'job' 
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        }`}>
          {type === 'job' ? (applicant.job?.title || 'Job') : (applicant.internship?.title || 'Internship')}
        </span>
        <span className="text-xs text-gray-400">{new Date(applicant.appliedAt).toLocaleDateString()}</span>
        <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs font-semibold border border-green-500/30">{(applicant.experience?.years || 0) + ((applicant.experience?.months || 0) / 12)} yrs</span>
        {Array.isArray(applicant.skills) && applicant.skills.map((skill: string) => (
          <span key={skill} className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 ml-1">{skill}</span>
        ))}
        {(applicant.expectedSalary?.amount || applicant.expectedStipend?.amount) && (
          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs font-semibold border border-yellow-500/30">
            ${(applicant.expectedSalary?.amount || applicant.expectedStipend?.amount).toLocaleString()}
          </span>
        )}
        {applicant.resume?.url && (
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'https://careerdashboard-vwue.onrender.com'}${applicant.resume.url}`} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 ml-1">Resume</a>
        )}
        <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ml-1 border shadow-sm ${applicant.fitStatus === 'fit' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
          {applicant.fitStatus === 'fit' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} 
          {applicant.fitStatus === 'fit' ? 'Fit' : 'Unfit'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Users className="w-7 h-7 text-blue-400" /> Applicants</h1>
      <Link href="/dashboard/employer" className="text-blue-400 hover:underline mb-4 inline-block">← Back to Dashboard</Link>
      <div className="mb-8">
        <div className="glass-card border border-blue-700/30 rounded-xl p-4 flex flex-wrap gap-4 items-center shadow-lg">
          <span className="font-semibold text-lg text-white mr-2">Filter by Fit Status:</span>
          <div className="flex rounded-lg bg-gray-800/60 border border-gray-700 overflow-hidden">
            <button
              onClick={() => setFitFilter('all')}
              aria-pressed={fitFilter === 'all'}
              className={`flex items-center gap-2 px-5 py-2 font-medium transition-all focus:outline-none ${
                fitFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-gray-300 hover:bg-blue-900/40'
              }`}
              title="Show all applicants"
            >
              <Users className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => setFitFilter('fit')}
              aria-pressed={fitFilter === 'fit'}
              className={`flex items-center gap-2 px-5 py-2 font-medium transition-all focus:outline-none ${
                fitFilter === 'fit'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-transparent text-gray-300 hover:bg-green-900/40'
              }`}
              title="Show only fit applicants"
            >
              <CheckCircle className="w-4 h-4" />
              Fit
            </button>
            <button
              onClick={() => setFitFilter('unfit')}
              aria-pressed={fitFilter === 'unfit'}
              className={`flex items-center gap-2 px-5 py-2 font-medium transition-all focus:outline-none ${
                fitFilter === 'unfit'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-transparent text-gray-300 hover:bg-red-900/40'
              }`}
              title="Show only unfit applicants"
            >
              <XCircle className="w-4 h-4" />
              Unfit
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-400 py-12 text-lg">Loading applicants...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-12 text-lg">{error}</div>
      ) : (
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 p-1 rounded-xl">
            <TabsTrigger value="jobs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg">
              <Briefcase className="w-4 h-4 mr-2" />
              Job Applicants ({filteredJobApplicants.length})
            </TabsTrigger>
            <TabsTrigger value="internships" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg">
              <GraduationCap className="w-4 h-4 mr-2" />
              Internship Applicants ({filteredInternshipApplicants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {filteredJobApplicants.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-lg">No job applicants found for this filter.</div>
            ) : (
              <div className="space-y-6">
                {filteredJobApplicants.map((applicant, idx) => (
                  <ApplicantCard key={idx} applicant={applicant} type="job" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            {filteredInternshipApplicants.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-lg">No internship applicants found for this filter.</div>
            ) : (
              <div className="space-y-6">
                {filteredInternshipApplicants.map((applicant, idx) => (
                  <ApplicantCard key={idx} applicant={applicant} type="internship" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 