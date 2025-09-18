"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Users,
  BookOpen,
  BarChart3,
  Plus,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Send,
  FileText,
  Award,
  Target,
  Building2,
  GraduationCap,
  Clock,
  UserCheck,
  UserX,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Home,
} from "lucide-react"
import { apiCall, config } from "@/lib/config"

export default function TeacherDashboard() {
  // All hooks at the top!
  const [user, setUser] = useState<any>(null)
  const [teacherData, setTeacherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    points: "",
    type: "homework",
    timeLimit: "30", // Default 30 minutes for quizzes
    assignToAll: true,
    selectedStudents: [] as string[],
    questions: [] as any[]
  })
  // Add state for profile dialog
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  // Add state for assignments
  const [assignments, setAssignments] = useState<any[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  // Add state for available students
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  
  // Add state for viewing submissions
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  
  // Add state for student assignments
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null)
  const [studentAssignments, setStudentAssignments] = useState<any>({
    completedAssignments: [],
    uncompletedAssignments: [],
    summary: {}
  })
  const [loadingStudentAssignments, setLoadingStudentAssignments] = useState(false)
  // Add state for enrolled students in selected subject
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
  const [loadingEnrolledStudents, setLoadingEnrolledStudents] = useState(false)
  // Add state for student profile dialog
  const [showStudentProfileDialog, setShowStudentProfileDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  // Add state for subject selection modal
  const [showSubjectSelectionModal, setShowSubjectSelectionModal] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [customSubject, setCustomSubject] = useState("")
  const [availableSubjects] = useState([
    { id: 'web-development', name: 'Web Development', category: 'Programming' },
    { id: 'data-science', name: 'Data Science', category: 'Analytics' },
    { id: 'machine-learning', name: 'Machine Learning', category: 'AI' },
    { id: 'ui-ux-design', name: 'UI/UX Design', category: 'Design' },
    { id: 'mobile-development', name: 'Mobile Development', category: 'Programming' },
    { id: 'cybersecurity', name: 'Cybersecurity', category: 'Security' },
    { id: 'cloud-computing', name: 'Cloud Computing', category: 'Infrastructure' },
    { id: 'database-management', name: 'Database Management', category: 'Data' },
    { id: 'software-testing', name: 'Software Testing', category: 'Quality Assurance' },
    { id: 'devops', name: 'DevOps', category: 'Operations' },
    { id: 'blockchain', name: 'Blockchain', category: 'Emerging Tech' },
    { id: 'artificial-intelligence', name: 'Artificial Intelligence', category: 'AI' }
  ])
  // Add state for selected subject
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  // Add state for subject details modal
  const [showSubjectDetailsModal, setShowSubjectDetailsModal] = useState(false)
  const [selectedSubjectForDetails, setSelectedSubjectForDetails] = useState<any>(null)
  // Add state for pricing modal
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedSubjectForPricing, setSelectedSubjectForPricing] = useState<any>(null)
  const [pricingData, setPricingData] = useState({
    price: 0,
    currency: 'USD',
    isFree: true,
    description: ''
  })
  
  // Add state for chat functionality
  const [showChatDialog, setShowChatDialog] = useState(false)
  const [chatUsers, setChatUsers] = useState<{
    students: Array<{ _id: string; name: string; email: string; avatar: string; role: string }>;
    teachers: Array<{ _id: string; name: string; email: string; avatar: string; role: string }>;
    all: Array<{ _id: string; name: string; email: string; avatar: string; role: string }>;
  }>({ students: [], teachers: [], all: [] })
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [chats, setChats] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // Add state for filtering and search
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  // Add state for assignment filtering and search
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState("")
  const [assignmentFilterSubject, setAssignmentFilterSubject] = useState<string>("all")
  const [showAssignmentFilterDropdown, setShowAssignmentFilterDropdown] = useState(false)
  
  // Add state for course management
  const [newCourse, setNewCourse] = useState<{ name: string; description?: string; level?: string }>({ 
    name: "", 
    description: "", 
    level: "" 
  })
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null)
  // Add state for quiz questions
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    type: "multiple-choice",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ],
    correctAnswer: "",
    points: 1,
    explanation: ""
  })
  const [showQuizBuilder, setShowQuizBuilder] = useState(false)
  // Add state for AI quiz generation
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [aiGenerationData, setAiGenerationData] = useState({
    subject: "",
    topic: "",
    difficulty: "intermediate",
    questionCount: 5,
    generationType: "subject" // "subject" or "topic"
  })
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Add state for attendance functionality
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState<any>(null)
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    status: 'present',
    sessionTitle: '',
    sessionDescription: '',
    teacherNotes: '',
    scheduledDate: new Date().toISOString().slice(0, 16) // Auto-select today's date and time
  })
  const [attendanceStats, setAttendanceStats] = useState<any>(null)
  const [attendanceFilter, setAttendanceFilter] = useState({
    courseId: '',
    startDate: '',
    endDate: '',
    status: 'all'
  })
  const [bulkAttendanceData, setBulkAttendanceData] = useState<any[]>([])
  const [isSavingAttendance, setIsSavingAttendance] = useState(false)
  const [bulkAttendanceDate, setBulkAttendanceDate] = useState(new Date().toISOString().slice(0, 16))
  const [attendanceJustSaved, setAttendanceJustSaved] = useState(false)
  const [attendanceMarkedForDate, setAttendanceMarkedForDate] = useState<string | null>(null)
  
  // Function to reset assignment form
  const resetAssignmentForm = () => {
    console.log('🔄 Resetting assignment form...')
    setNewAssignment({
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      points: "",
      type: "homework",
      timeLimit: "30",
      assignToAll: true,
      selectedStudents: [],
      questions: []
    })
    
    // Reset current question
    setCurrentQuestion({
      question: "",
      type: "multiple-choice",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ],
      correctAnswer: "",
      points: 1,
      explanation: ""
    })
    
    // Clear any errors
    setError("")
    console.log('✅ Assignment form reset complete')
  }

  // Function to handle opening create assignment dialog
  const openCreateAssignment = () => {
    resetAssignmentForm()
    setShowCreateAssignment(true)
  }

  // Function to handle closing create assignment dialog
  const closeCreateAssignment = () => {
    setShowCreateAssignment(false)
    resetAssignmentForm()
  }

  // Function to reset AI Generator form
  const resetAIGenerator = () => {
    console.log('🔄 Resetting AI Generator form...')
    setAiGenerationData({
      subject: "",
      topic: "",
      difficulty: "intermediate",
      questionCount: 5,
      generationType: "subject"
    })
    setGeneratedQuestions([])
    setError("")
    console.log('✅ AI Generator form reset complete')
  }

  // Function to handle opening AI Generator dialog
  const openAIGenerator = () => {
    resetAIGenerator()
    setShowAIGenerator(true)
  }

  // Function to handle closing AI Generator dialog
  const closeAIGenerator = () => {
    setShowAIGenerator(false)
    resetAIGenerator()
  }

  const fetchAssignmentData = async (token: string) => {
    setLoadingAssignments(true)
    try {
      console.log('Fetching assignments...')
      const response = await apiCall("/api/teachers/assignments/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log('Assignments API response:', data)

      if (response.ok && data.success) {
        console.log('Setting assignments:', data.data.assignments)
        setAssignments(data.data.assignments)
      } else {
        console.error("Failed to fetch assignments:", data.message)
        // Don't set error here, just log it
      }
    } catch (error) {
      console.error("Failed to fetch assignment data:", error)
      // Don't set error here, just log it
    } finally {
      setLoadingAssignments(false)
    }
  }

  const fetchAvailableStudents = async (token: string) => {
    setLoadingStudents(true)
    try {
      console.log('Fetching students with token:', !!token)
      const response = await apiCall("/api/teachers/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log('Students API response:', data)

      if (response.ok && data.success && data.data) {
        console.log('Setting available students:', data.data.students)
        setAvailableStudents(data.data.students || [])
      } else {
        console.error("Failed to fetch students:", data?.message || 'No data returned')
        setAvailableStudents([]) // Set empty array as fallback
      }
    } catch (error) {
      console.error("Failed to fetch students data:", error)
      setAvailableStudents([]) // Set empty array as fallback
    } finally {
      setLoadingStudents(false)
    }
  }

  // Function to fetch assignment submissions
  const fetchSubmissions = async (assignmentId: string) => {
    setLoadingSubmissions(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      const response = await apiCall(`/api/teachers/assignments/${assignmentId}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setSubmissions(data.data.submissions)
      } else {
        console.error("Failed to fetch submissions:", data.message)
        setError("Failed to fetch submissions")
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
      setError("Failed to fetch submissions")
    } finally {
      setLoadingSubmissions(false)
    }
  }

  // Function to view assignment submissions
  const viewSubmissions = (assignment: any) => {
    setSelectedAssignment(assignment)
    setShowSubmissionsModal(true)
    fetchSubmissions(assignment._id)
  }

  // Function to fetch student assignments
  const fetchStudentAssignments = async (studentId: string) => {
    setLoadingStudentAssignments(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      const response = await apiCall(`/api/teachers/students/${studentId}/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setStudentAssignments({
          completedAssignments: data.data.completedAssignments,
          uncompletedAssignments: data.data.uncompletedAssignments,
          summary: data.data.summary
        })
      } else {
        console.error("Failed to fetch student assignments:", data.message)
        setError("Failed to fetch student assignments")
      }
    } catch (error) {
      console.error("Failed to fetch student assignments:", error)
      setError("Failed to fetch student assignments")
    } finally {
      setLoadingStudentAssignments(false)
    }
  }

  // Function to handle viewing student profile with assignments
  const handleViewStudentProfile = (student: any) => {
    setSelectedStudentProfile(student)
    setShowStudentProfileDialog(true)
    fetchStudentAssignments(student._id)
  }

  const fetchEnrolledStudents = async (token: string, subjectName: string) => {
    setLoadingEnrolledStudents(true)
    try {
      console.log('Fetching enrolled students for subject:', subjectName)
      const response = await apiCall(`/api/teachers/subjects/${encodeURIComponent(subjectName)}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log('Enrolled students API response:', data)

      if (response.ok && data.success) {
        console.log('Setting enrolled students:', data.data.students)
        console.log('First student data structure:', data.data.students[0])
        setEnrolledStudents(data.data.students || [])
      } else {
        console.error("Failed to fetch enrolled students:", data.message)
        setEnrolledStudents([])
      }
    } catch (error) {
      console.error("Failed to fetch enrolled students data:", error)
      setEnrolledStudents([])
    } finally {
      setLoadingEnrolledStudents(false)
    }
  }

  // Chat functions
  const fetchChatUsers = async () => {
    setLoadingUsers(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await apiCall('/api/teacher-chats/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Chat users response:', data)
        setChatUsers(data.data)
      } else {
        console.error('Failed to fetch chat users:', response.status)
      }
    } catch (error) {
      console.error('Error fetching chat users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

         const fetchChats = async () => {
         setLoadingChats(true)
         try {
           const token = localStorage.getItem('token')
           if (!token) return
       
           const response = await apiCall('/api/teacher-chats', {
        headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
             }
      })
       
           if (response.ok) {
      const data = await response.json()
             console.log('Chats response:', data)
             
             // Deduplicate chats by ID
             const uniqueChats = (data.data || []).filter((chat: any, index: number, self: any[]) => 
               index === self.findIndex((c: any) => c.id === chat.id)
             )
             
             console.log('Original chats count:', (data.data || []).length)
             console.log('Unique chats count:', uniqueChats.length)
             
             // Log all chat IDs to debug duplicates
             console.log('All chat IDs:', (data.data || []).map((chat: any) => chat.id))
             console.log('Unique chat IDs:', uniqueChats.map((chat: any) => chat.id))
             
             setChats(uniqueChats)
      } else {
             console.error('Failed to fetch chats:', response.status)
      }
    } catch (error) {
           console.error('Error fetching chats:', error)
    } finally {
           setLoadingChats(false)
         }
       }

  const createChat = async (participantId: string, chatType: 'teacher-student' | 'teacher-teacher' = 'teacher-student') => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await apiCall('/api/teacher-chats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participantId, chatType })
      })

                 if (response.ok) {
      const data = await response.json()
             console.log('Chat created:', data)
             
             // Add new chat to list (avoid duplicates)
             setChats(prev => {
               const existingChat = prev.find(chat => chat.id === data.data.id)
               if (existingChat) {
                 return prev // Don't add if already exists
               }
               return [data.data, ...prev]
             })
             
             // Select the new chat
             setSelectedChat(data.data)
             
             // Fetch messages for the new chat
             fetchMessages(data.data.id)
      } else {
        console.error('Failed to create chat:', response.status)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await apiCall(`/api/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Messages response:', data)
        setMessages(data.data || [])
      } else {
        console.error('Failed to fetch messages:', response.status)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await apiCall('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: selectedChat.id,
          text: message.trim()
      })
      })

      if (response.ok) {
      const data = await response.json()
        console.log('Message sent:', data)
        
        // Add message to local state
        setMessages(prev => [...prev, data.data])
        setMessage("")
        
        // Refresh messages
        fetchMessages(selectedChat.id)
      } else {
        console.error('Failed to send message:', response.status)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Effect to fetch chat data when dialog opens
  useEffect(() => {
    if (showChatDialog) {
      fetchChatUsers()
      fetchChats()
    }
  }, [showChatDialog])

  useEffect(() => {
    const fetchUserAndTeacherData = async () => {
      console.log("Starting teacher dashboard data fetch...")
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        console.log("Token available:", !!token)
        if (!token) {
          setError("Not authenticated. Please log in.")
          setLoading(false)
          return
        }
        
        // First, try to get user data from localStorage if available
        const storedUser = localStorage.getItem("user")
        console.log("Stored user data:", storedUser ? "available" : "not available")
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            setUser(userData)
            console.log("Set user from localStorage:", userData)
          } catch (e) {
            console.error("Error parsing stored user data:", e)
          }
        }
        
        // Fetch user data from API
        console.log("Fetching user data from API...")
        try {
          const userResponse = await apiCall("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const userData = await userResponse.json()
          console.log("User API response:", userData)
          
          if (userResponse.ok && userData.success) {
            setUser(userData.data)
            // Update stored user data
            localStorage.setItem("user", JSON.stringify(userData.data))
            console.log("Updated user data from API")
          } else {
            console.error("Failed to fetch user data:", userData.message)
            // Don't set error here, continue with stored user data if available
          }
        } catch (err) {
          console.error("Error fetching user data:", err)
          // Don't set error here, continue with stored user data if available
        }
        
        // Fetch teacher dashboard data
        console.log("Fetching teacher dashboard data...")
        try {
          const teacherResponse = await apiCall("/api/teachers/dashboard", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const teacherData = await teacherResponse.json()
          console.log("Teacher API response:", teacherData)
          
          if (teacherResponse.ok && teacherData.success && teacherData.data) {
            setTeacherData(teacherData.data.teacher)
            console.log("Set teacher data successfully")
          } else {
            console.error("Failed to fetch teacher data:", teacherData?.message || 'No data returned')
            // Set default teacher data to prevent crashes
            setTeacherData({
              name: user?.name || 'Teacher',
              subjects: [],
              statistics: {
                totalStudents: 0,
                activeAssignments: 0,
                completedAssignments: 0,
                averageScore: 0
              },
              subjectStats: {},
              recentAssignments: []
            })
          }
        } catch (err) {
          console.error("Error fetching teacher data:", err)
          setError("Network error. Please try again.")
        }

        // Fetch teacher profile data (institute, class, section, batch year, courses)
        console.log("Fetching teacher profile data...")
        try {
          const profileResponse = await apiCall("/api/teacher-profiles/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const profileData = await profileResponse.json()
          console.log("Profile API response:", profileData)
          
          if (profileResponse.ok && profileData.success) {
            // Merge profile data with existing teacher data
            setTeacherData((prev: any) => prev ? {
              ...prev,
              instituteName: profileData.data.profile.instituteName || prev.instituteName,
              className: profileData.data.profile.className || prev.className,
              section: profileData.data.profile.section || prev.section,
              batchYear: profileData.data.profile.batchYear || prev.batchYear,
              courses: profileData.data.profile.courses || prev.courses
            } : profileData.data.profile)
            console.log("Set teacher profile data successfully")
          } else {
            console.error("Failed to fetch profile data:", profileData.message)
            // Don't set error here, continue with existing teacher data
          }
        } catch (err) {
          console.error("Error fetching profile data:", err)
          // Don't set error here, continue with existing teacher data
        }

        // Fetch assignment data (don't fail if this errors)
        console.log("Fetching assignment data...")
        try {
          await fetchAssignmentData(token)
          console.log("Assignment data fetched successfully")
        } catch (error) {
          console.error("Error fetching assignment data:", error)
          setAssignments([]) // Ensure we have an empty array
        }

        // Fetch available students (don't fail if this errors)
        console.log("Fetching available students...")
        try {
          await fetchAvailableStudents(token)
          console.log("Available students fetched successfully")
        } catch (error) {
          console.error("Error fetching available students:", error)
          setAvailableStudents([]) // Ensure we have an empty array
        }
      } catch (err) {
        console.error("General error in fetchUserAndTeacherData:", err)
        setError("Network error. Please try again.")
      } finally {
        console.log("Finished loading teacher dashboard")
        setLoading(false)
      }
    }
    fetchUserAndTeacherData()
  }, [])

  // Show subject selection modal if teacher has no subjects
  useEffect(() => {
    if (teacherData && (!teacherData.subjects || teacherData.subjects.length === 0)) {
      setShowSubjectSelectionModal(true)
    }
  }, [teacherData])

  // Initialize selected subjects with existing teacher subjects
  useEffect(() => {
    if (teacherData?.subjects) {
      const existingSubjectIds = teacherData.subjects.map((subject: any) => {
        // Find if it matches a predefined subject
        const predefinedSubject = availableSubjects.find(s => s.name === subject.name)
        return predefinedSubject ? predefinedSubject.id : subject.name
      })
      setSelectedSubjects(existingSubjectIds)
    }
  }, [teacherData, availableSubjects])

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false)
      }
    }

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])

  // Close assignment filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.assignment-filter-dropdown')) {
        setShowAssignmentFilterDropdown(false)
      }
    }

    if (showAssignmentFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAssignmentFilterDropdown])

  // Effect to update bulk attendance data when enrolled students change
  useEffect(() => {
    if (selectedCourseForAttendance && !attendanceJustSaved) {
      const studentsToShow = (enrolledStudents && enrolledStudents.length > 0) ? enrolledStudents : availableStudents
      const today = new Date().toDateString()
      
      // Check if attendance was already marked for today
      const shouldResetStatus = attendanceMarkedForDate !== today
      
      const bulkData = studentsToShow.map((student: any) => ({
        ...student,
        attendanceStatus: shouldResetStatus ? null : student.attendanceStatus, // Keep status if marked today
        sessionTitle: `Session - ${new Date().toLocaleDateString()}`,
        sessionDescription: '',
        teacherNotes: ''
      }))
      setBulkAttendanceData(bulkData)
    }
  }, [enrolledStudents, availableStudents, selectedCourseForAttendance, attendanceJustSaved, attendanceMarkedForDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading teacher dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-300 mb-4">No user data found.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Use real assignments from teacher data or empty array
  const recentAssignments = teacherData?.recentAssignments?.map((assignment: any, index: any) => ({
    id: assignment._id || index,
    title: assignment.title,
    course: assignment.subject,
    dueDate: new Date(assignment.dueDate).toLocaleDateString(),
    submitted: assignment.submittedCount || 0,
    total: assignment.totalStudents || 0,
    averageScore: assignment.averageScore || 0,
    status: assignment.status,
  })) || []

  // Use real student performance data or empty array
  const studentPerformance = teacherData?.studentPerformance || []
  
  // Ensure assignments is always an array
  const safeAssignments = assignments || []
  const safeAvailableStudents = availableStudents || []


  const handleCreateAssignment = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      // Validation
      if (!newAssignment.assignToAll && newAssignment.selectedStudents.length === 0) {
        setError("Please select at least one student or assign to all students.")
        return
      }

      const response = await apiCall("/api/teachers/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newAssignment.title,
          description: newAssignment.description,
          subject: newAssignment.subject,
          dueDate: newAssignment.dueDate,
          points: newAssignment.points,
          type: newAssignment.type,
          timeLimit: newAssignment.type === 'quiz' ? parseInt(newAssignment.timeLimit) * 60 : undefined, // Convert minutes to seconds for quizzes
          questions: newAssignment.type === 'quiz' ? newAssignment.questions : undefined,
          assignToAll: newAssignment.assignToAll,
          selectedStudents: newAssignment.selectedStudents,
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log("Assignment created successfully:", data.data.assignment)
        console.log("Current assignments state before refresh:", assignments)
        setShowCreateAssignment(false)
        // Reset the form after successful creation
        resetAssignmentForm()
        // Refresh teacher data to get updated hierarchy information
        await refreshTeacherData()
        // Refresh assignments list to show the newly created assignment
        const token = localStorage.getItem("token")
        if (token) {
          console.log("Refreshing assignments after creation...")
          await fetchAssignmentData(token)
          console.log("Assignments refreshed, new state:", assignments)
        }
      } else {
        setError(data.message || "Failed to create assignment.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }


  // Subject selection functions
  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects(prev => [...prev, customSubject.trim()])
      setCustomSubject("")
    }
  }

  const handleRemoveSubject = (subjectIdOrName: string) => {
    // Remove from selectedSubjects array
    setSelectedSubjects(prev => prev.filter(id => id !== subjectIdOrName))
    
    // Also remove from teacherData subjects if it's a current subject
    if (teacherData?.subjects) {
      const updatedSubjects = teacherData.subjects.filter((subject: any) => subject.name !== subjectIdOrName)
      // Update the teacherData state to reflect the removal
      setTeacherData((prev: any) => prev ? {
        ...prev,
        subjects: updatedSubjects
      } : null)
    }
  }

  const handleRemoveCurrentSubject = async (subjectName: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      // Remove from selectedSubjects array
      setSelectedSubjects(prev => prev.filter(id => id !== subjectName))
      
      // Update teacherData immediately for UI feedback
      if (teacherData?.subjects) {
        const updatedSubjects = teacherData.subjects.filter((subject: any) => subject.name !== subjectName)
        setTeacherData((prev: any) => prev ? {
          ...prev,
          subjects: updatedSubjects
        } : null)
      }

      // Send update to backend
      const response = await apiCall("/api/teachers/subjects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjects: teacherData?.subjects?.filter((subject: any) => subject.name !== subjectName).map((subject: any) => ({
            name: subject.name,
            isActive: subject.isActive
          })) || []
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log("Subject removed successfully:", subjectName)
      } else {
        setError(data.message || "Failed to remove subject.")
        // Revert the UI change if backend update failed
        if (teacherData?.subjects) {
          setTeacherData((prev: any) => prev ? {
            ...prev,
            subjects: teacherData.subjects
          } : prev)
        }
      }
    } catch (err) {
      setError("Network error. Please try again.")
      // Revert the UI change if network error
      if (teacherData?.subjects) {
        setTeacherData((prev: any) => prev ? {
          ...prev,
          subjects: teacherData.subjects
        } : prev)
      }
    }
  }

  const handleSaveSubjects = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      // Validate required fields
      if (!teacherData?.instituteName || !teacherData?.className || !teacherData?.section || !teacherData?.batchYear) {
        setError("Please fill in all required fields: Institute, Class, Section, and Batch Year")
        return
      }

      if (selectedSubjects.length === 0) {
        setError("Please select at least one subject")
        return
      }

      // Prepare the complete profile data
      const profileData = {
        instituteName: teacherData.instituteName,
        className: teacherData.className,
        section: teacherData.section,
        batchYear: teacherData.batchYear,
        subjects: selectedSubjects.map(subjectId => {
          const predefinedSubject = availableSubjects.find(s => s.id === subjectId)
          return {
            name: predefinedSubject ? predefinedSubject.name : subjectId,
            isActive: true
          }
        }),
        courses: teacherData?.courses || []
      }

      // First, update the teacher profile with complete information
      const profileResponse = await apiCall("/api/teacher-profiles/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      console.log("Profile response status:", profileResponse.status)
      console.log("Profile response headers:", Object.fromEntries(profileResponse.headers.entries()))

      if (!profileResponse.ok) {
        let profileError
        try {
          profileError = await profileResponse.json()
          console.error("Failed to update profile:", profileError)
        } catch (parseError) {
          console.error("Failed to parse profile error response:", parseError)
          profileError = { message: "Invalid response from server" }
        }
        
        // Show more specific error message
        if (profileError.message) {
          setError(`Profile update failed: ${profileError.message}`)
        } else {
          setError("Failed to update profile information. Please check all required fields.")
        }
        return
      }

      // Then, update the subjects (keeping the existing logic for backward compatibility)
          const subjectsResponse = await apiCall("/api/teachers/subjects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjects: profileData.subjects
        }),
      })

      const subjectsData = await subjectsResponse.json()
      
      if (subjectsResponse.ok && subjectsData.success) {
        console.log("Profile and subjects updated successfully")
        setShowSubjectSelectionModal(false)
        
        // Update local state with new profile data
        setTeacherData((prev: any) => prev ? {
          ...prev,
          ...profileData
        } : profileData)
        
        // Show success message instead of reloading
        // window.location.reload() // Commented out to avoid page reload
      } else {
        setError(subjectsData.message || "Failed to update subjects.")
      }
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Network error. Please try again.")
    }
  }

  const checkIfTeacherNeedsSubjectSetup = () => {
    return teacherData && (!teacherData.subjects || teacherData.subjects.length === 0)
  }

  // Handle subject selection
  const handleSubjectClick = async (subjectName: string) => {
    const newSelectedSubject = selectedSubject === subjectName ? null : subjectName
    setSelectedSubject(newSelectedSubject)
    
    // Fetch enrolled students for the selected subject
    if (newSelectedSubject) {
      const token = localStorage.getItem('token')
      if (token) {
        await fetchEnrolledStudents(token, newSelectedSubject)
      }
    } else {
      setEnrolledStudents([])
    }
  }

  // Get assignments for selected subject
  const getSubjectAssignments = () => {
    if (!selectedSubject) return []
    return assignments.filter((assignment: any) => assignment.subject === selectedSubject)
  }

  // Get students for selected subject (students who have assignments in this subject)
  const getSubjectStudents = () => {
    if (!selectedSubject) return availableStudents
    
    // Return the actual enrolled students for the selected subject
    return enrolledStudents
  }

  // Get unique students count for stats
  const getUniqueStudentsCount = (students: any[]) => {
    return new Set(students.map(student => student._id)).size
  }

  // Filter students based on search term and subject filter
  const getFilteredStudents = (students: any[]) => {
    let filtered = students

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by subject
    if (filterSubject !== "all") {
      filtered = filtered.filter(student => 
        student.enrolledSubject === filterSubject
      )
    }

    return filtered
  }

  // Get available subjects for filter dropdown
  const getAvailableSubjectsForFilter = () => {
    const subjects = new Set(availableStudents.map(student => student.enrolledSubject))
    return Array.from(subjects).sort()
  }

  // Filter assignments based on search term and subject filter
  const getFilteredAssignments = (assignments: any[]) => {
    let filtered = assignments

    // Filter by search term
    if (assignmentSearchTerm.trim()) {
      filtered = filtered.filter(assignment => 
        assignment.title?.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
        assignment.subject?.toLowerCase().includes(assignmentSearchTerm.toLowerCase())
      )
    }

    // Filter by subject
    if (assignmentFilterSubject !== "all") {
      filtered = filtered.filter(assignment => 
        assignment.subject === assignmentFilterSubject
      )
    }

    return filtered
  }

  // Get available subjects for assignment filter dropdown
  const getAvailableSubjectsForAssignmentFilter = () => {
    const subjects = new Set(safeAssignments.map(assignment => assignment.subject))
    return Array.from(subjects).sort()
  }

  // Get stats from real teacher data or use defaults
  const stats = {
    totalStudents: getUniqueStudentsCount(availableStudents), // Count unique students
    activeAssignments: teacherData?.statistics?.activeAssignments || 0,
  }


  // Pricing management functions
  const handleOpenPricingModal = (subject: any) => {
    setSelectedSubjectForPricing(subject)
    setPricingData({
      price: subject.pricing?.price || 0,
      currency: subject.pricing?.currency || 'USD',
      isFree: subject.pricing?.isFree !== false,
      description: subject.pricing?.description || ''
    })
    setShowPricingModal(true)
  }

  const handleUpdatePricing = async () => {
    if (!selectedSubjectForPricing) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await apiCall('/api/teachers/subjects/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectName: selectedSubjectForPricing.name,
          pricing: {
            price: pricingData.price,
            currency: pricingData.currency,
            description: pricingData.description
          }
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Update the teacher data with new pricing
        setTeacherData((prev: any) => ({
          ...prev,
          subjects: prev.subjects.map((subject: any) => 
            subject.name === selectedSubjectForPricing.name 
              ? { ...subject, pricing: data.data.subject.pricing }
              : subject
          )
        }))
        setShowPricingModal(false)
        setSelectedSubjectForPricing(null)
      } else {
        setError(data.message || 'Failed to update pricing')
      }
    } catch (error) {
      console.error('Error updating pricing:', error)
      setError('Failed to update pricing')
    }
  }

  // Course management functions
  const addCourse = () => {
    if (newCourse.name.trim()) {
      if (editingCourseIndex !== null) {
        // Edit existing course
        setTeacherData((prev: any) => prev ? {
          ...prev,
          courses: prev.courses.map((course: any, index: number) => 
            index === editingCourseIndex ? newCourse : course
          )
        } : prev)
        setEditingCourseIndex(null)
      } else {
        // Add new course
        setTeacherData((prev: any) => prev ? {
          ...prev,
          courses: [...(prev.courses || []), newCourse]
        } : prev)
      }
      setNewCourse({ name: "", description: "", level: "" })
    }
  }

  const editCourse = (index: number) => {
    if (teacherData?.courses) {
      setNewCourse(teacherData.courses[index])
      setEditingCourseIndex(index)
    }
  }

  const removeCourse = (index: number) => {
    setTeacherData((prev: any) => prev ? {
      ...prev,
      courses: prev.courses.filter((_: any, i: number) => i !== index)
    } : prev)
  }

  // Function to handle viewing subject details
  const handleViewSubjectDetails = (subject: any) => {
    // Debug: Log the teacher data to see what's available
    console.log("Teacher data when viewing subject details:", teacherData)
    console.log("Institute Name:", teacherData?.instituteName)
    console.log("Class Name:", teacherData?.className)
    console.log("Section:", teacherData?.section)
    console.log("Batch Year:", teacherData?.batchYear)
    
    // Merge subject data with teacher profile data to include hierarchy information
    const subjectWithHierarchy = {
      ...subject,
      hierarchy: {
        instituteName: teacherData?.instituteName || "Not specified",
        className: teacherData?.className || "Not specified",
        section: teacherData?.section || "Not specified",
        batchYear: teacherData?.batchYear || "Not specified"
      }
    }
    console.log("Subject with hierarchy:", subjectWithHierarchy)
    setSelectedSubjectForDetails(subjectWithHierarchy)
    setShowSubjectDetailsModal(true)
  }

  // Quiz question management functions
  const addQuestion = () => {
    if (currentQuestion.question.trim() === '') {
      setError("Question text cannot be empty")
      return
    }

    if (currentQuestion.type === 'multiple-choice') {
      const validOptions = currentQuestion.options.filter(opt => opt.text.trim() !== '')
      if (validOptions.length < 2) {
        setError("Multiple choice questions must have at least 2 options")
        return
      }
      if (!validOptions.some(opt => opt.isCorrect)) {
        setError("Multiple choice questions must have at least one correct option")
        return
      }
    } else if (currentQuestion.type === 'true-false') {
      if (!currentQuestion.correctAnswer || !['true', 'false'].includes(currentQuestion.correctAnswer.toLowerCase())) {
        setError("True/False questions must have a correct answer of 'true' or 'false'")
        return
      }
    }

    setNewAssignment(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }))

    // Reset current question
    setCurrentQuestion({
      question: "",
      type: "multiple-choice",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ],
      correctAnswer: "",
      points: 1,
      explanation: ""
    })
  }

  const removeQuestion = (index: number) => {
    setNewAssignment(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const updateQuestionOption = (optionIndex: number, field: string, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === optionIndex ? { ...opt, [field]: value } : opt
      )
    }))
  }

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }]
    }))
  }

  const removeOption = (optionIndex: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== optionIndex)
    }))
  }

  // AI Quiz Generation Functions
  const generateQuizWithAI = async () => {
    try {
      setIsGenerating(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      if (!aiGenerationData.subject) {
        setError("Please select a subject for quiz generation")
        return
      }

      if (aiGenerationData.generationType === 'topic' && !aiGenerationData.topic.trim()) {
        setError("Please enter a topic for quiz generation")
        return
      }

      const response = await apiCall("/api/teachers/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(aiGenerationData)
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log("AI generated quiz questions:", data.data.questions)
        setGeneratedQuestions(data.data.questions)
        setError("")
      } else {
        setError(data.message || "Failed to generate quiz questions.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const useGeneratedQuestions = () => {
    if (generatedQuestions.length === 0) {
      setError("No generated questions to use")
      return
    }

    // Add generated questions to the current assignment
    setNewAssignment(prev => ({
      ...prev,
      questions: [...prev.questions, ...generatedQuestions]
    }))

    // Close AI generator and show success message
    closeAIGenerator()
    
    // Show success message
    alert(`Successfully added ${generatedQuestions.length} AI-generated questions to your quiz!`)
  }

  const clearGeneratedQuestions = () => {
    setGeneratedQuestions([])
    setError("")
  }

  // Function to handle viewing course details with hierarchy
  const handleViewCourseDetails = (course: any) => {
    setSelectedSubjectForDetails(course)
    setShowSubjectDetailsModal(true)
  }

  // Function to refresh teacher data
  const refreshTeacherData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token available for refresh")
        return
      }

      // Fetch teacher profile data to get updated hierarchy information
      const profileResponse = await apiCall("/api/teacher-profiles/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.success) {
          // Update teacher data with fresh profile information
          setTeacherData((prev: any) => prev ? {
            ...prev,
            instituteName: profileData.data.profile.instituteName || prev.instituteName,
            className: profileData.data.profile.className || prev.className,
            section: profileData.data.profile.section || prev.section,
            batchYear: profileData.data.profile.batchYear || prev.batchYear,
            courses: profileData.data.profile.courses || prev.courses
          } : profileData.data.profile)
          console.log("Teacher data refreshed successfully")
        }
      }
    } catch (error) {
      console.error("Error refreshing teacher data:", error)
    }
  }

  // Attendance functions

  const fetchAttendanceStats = async (courseId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await apiCall(`/api/attendance/stats/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAttendanceStats(data.data)
        }
      }
    } catch (error) {
      console.error("Error fetching attendance stats:", error)
    }
  }

  const markAttendance = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await apiCall("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: `course_${selectedCourseForAttendance?.name?.replace(/\s+/g, '_').toLowerCase()}`,
          ...attendanceForm
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh attendance stats
          if (selectedCourseForAttendance) {
            const courseId = `course_${selectedCourseForAttendance.name.replace(/\s+/g, '_').toLowerCase()}`
            await fetchAttendanceStats(courseId)
          }
          setShowAttendanceDialog(false)
          setAttendanceForm({
            studentId: '',
            status: 'present',
            sessionTitle: '',
            sessionDescription: '',
            teacherNotes: '',
            scheduledDate: new Date().toISOString().slice(0, 16)
          })
        }
      }
    } catch (error) {
      console.error("Error marking attendance:", error)
    }
  }

  // Bulk attendance functions
  const updateBulkAttendance = (index: number, status: string) => {
    setBulkAttendanceData(prev => prev.map((student, i) => 
      i === index ? { ...student, attendanceStatus: status } : student
    ))
  }

  const markBulkAttendance = async () => {
    if (!selectedCourseForAttendance || bulkAttendanceData.length === 0) return

    setIsSavingAttendance(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const courseId = `course_${selectedCourseForAttendance.name.replace(/\s+/g, '_').toLowerCase()}`

      // Mark attendance for all students with selected status
      const attendancePromises = bulkAttendanceData
        .filter(student => student.attendanceStatus)
        .map(student => 
          apiCall("/api/attendance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              courseId,
              studentId: student._id || student.id,
              status: student.attendanceStatus,
              sessionTitle: `Session - ${new Date(bulkAttendanceDate).toLocaleDateString()}`,
              sessionDescription: `Bulk attendance for ${selectedCourseForAttendance.name}`,
              teacherNotes: '',
              scheduledDate: bulkAttendanceDate
            })
          })
        )

      const responses = await Promise.all(attendancePromises)
      const results = await Promise.all(responses.map(r => r.json()))

      // Check if all requests were successful
      const allSuccessful = results.every(result => result.success)
      
      if (allSuccessful) {
        // Refresh attendance stats
        await fetchAttendanceStats(courseId)
        
        // Mark attendance as saved for today's date
        const today = new Date().toDateString()
        setAttendanceMarkedForDate(today)
        setAttendanceJustSaved(true)
        
        alert('Attendance marked successfully for all students!')
        
        // Keep the attendance marked for the entire day
        // No auto-reset timer
      } else {
        alert('Some attendance records failed to save. Please try again.')
      }
    } catch (error) {
      console.error("Error marking bulk attendance:", error)
      alert('Failed to save attendance. Please try again.')
    } finally {
      setIsSavingAttendance(false)
    }
  }


  const handleAttendanceCourseSelect = async (subject: any) => {
    setSelectedCourseForAttendance(subject)
    setAttendanceJustSaved(false) // Reset the saved flag when changing subjects
    // Don't reset attendanceMarkedForDate - let it persist across course changes for the same day
    
    // For now, we'll create a mock course ID based on the subject name
    // In a real implementation, you'd need to find the actual course ID
    const mockCourseId = `course_${subject.name.replace(/\s+/g, '_').toLowerCase()}`
    
    // Fetch enrolled students for this subject
    const token = localStorage.getItem('token')
    if (token) {
      await fetchEnrolledStudents(token, subject.name)
    }
    
    await fetchAttendanceStats(mockCourseId)
  }

  // Function to reset attendance for a new day
  const resetAttendanceForNewDay = () => {
    setAttendanceMarkedForDate(null)
    setAttendanceJustSaved(false)
    setBulkAttendanceData(prev => prev.map(student => ({
      ...student,
      attendanceStatus: null
    })))
  }


  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">Shaping Career</h1>
          </Link>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {/* Go to Dashboard Button */}
            <Link href="/" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Go to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
            </Link>
            
            {/* Chat Dialog Trigger */}
            <div className="cursor-pointer" onClick={() => setShowChatDialog(true)}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-green-500/30 hover:border-green-400/50 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            
            {/* Profile Dialog Trigger */}
            <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
              <DialogTrigger asChild>
                <div className="cursor-pointer" onClick={() => setShowProfileDialog(true)}>
                  <Avatar className="w-12 h-12 border-2 border-blue-500/30">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl gradient-text">Profile Details</DialogTitle>
                  <DialogDescription className="text-gray-300">Your account information</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <Avatar className="w-20 h-20 border-2 border-blue-500/30">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-3xl">
                      {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{user.name}</p>
                    {user.email && <p className="text-gray-400">{user.email}</p>}
                    {/* Add more user fields as needed */}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <p className="font-medium text-white">{user.name}</p>
              <p className="text-sm text-gray-400">Teacher Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 text-center sm:text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2">Welcome back, {user.name?.split(' ')[0]}!</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300">Manage your courses and empower the next generation</p>
          </div>
        </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        <Card className="glass-card hover:bg-white/5 transition-all duration-300">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
                <p className="text-sm text-gray-400">Total Students</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover:bg-white/5 transition-all duration-300">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{stats.activeAssignments}</p>
                <p className="text-sm text-gray-400">Active Assignments</p>
              </div>
              <BookOpen className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Courses Section */}
      <Card className="glass-card mb-12">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl gradient-text flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Your Teaching Subjects
            </CardTitle>
            <Button 
              onClick={() => setShowSubjectSelectionModal(true)}
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Manage Subjects
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teacherData?.subjects && teacherData.subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {teacherData.subjects.map((subject: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-4 sm:p-6 glass-card rounded-lg border transition-all duration-300 cursor-pointer ${
                    selectedSubject === subject.name
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                      : 'border-blue-500/20 hover:bg-white/5 hover:border-blue-400'
                  }`}
                  onClick={() => handleSubjectClick(subject.name)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        selectedSubject === subject.name
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}>
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-white text-sm sm:text-base truncate">{subject.name}</h4>
                        {selectedSubject === subject.name && (
                          <p className="text-xs sm:text-sm text-blue-400">Selected</p>
                        )}
                      </div>
                    </div>
                    {selectedSubject === subject.name && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Pricing Information */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Enrollment Price:</span>
                      <span className={`font-semibold ${
                        subject.pricing?.isFree ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {subject.pricing?.isFree ? 'Free' : `${subject.pricing?.currency || 'USD'} ${subject.pricing?.price || 0}`}
                      </span>
                    </div>
                    {subject.pricing?.description && (
                      <p className="text-xs text-gray-500 mt-1">{subject.pricing.description}</p>
                    )}
                  </div>
                  
                  {/* Student Count */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Enrolled Students:</span>
                      <span className="font-semibold text-blue-400">
                        {subject.studentCount || 0} students
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (selectedSubject === subject.name) {
                          handleSubjectClick(subject.name)
                        } else {
                          // Find the course for this subject to get hierarchy information
                          const courseForSubject = teacherData?.courses?.find((c: any) => c.subject === subject.name)
                          if (courseForSubject) {
                            handleViewCourseDetails(courseForSubject)
                          } else {
                            handleViewSubjectDetails(subject)
                          }
                        }
                      }}
                      className={`flex-1 ${
                        selectedSubject === subject.name
                          ? 'bg-gradient-to-r from-green-600 to-blue-600'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {selectedSubject === subject.name ? 'Selected' : 'View Details'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenPricingModal(subject)
                      }}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Set Price
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No subjects selected yet</p>
              <p className="text-gray-500 text-sm mt-2">Set up your teaching subjects to start creating assignments</p>
              <Button 
                onClick={() => setShowSubjectSelectionModal(true)}
                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Subject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>



      <Tabs defaultValue="assignments" className="space-y-6 sm:space-y-10">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1 sm:p-2 h-auto">
          <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-600 flex-col sm:flex-row p-2 sm:p-3">
            <BookOpen className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="text-xs sm:text-sm">Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-purple-600 flex-col sm:flex-row p-2 sm:p-3">
            <Users className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="text-xs sm:text-sm">Students</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-orange-600 flex-col sm:flex-row p-2 sm:p-3">
            <Clock className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="text-xs sm:text-sm">Attendance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl gradient-text flex items-center">
                  <BookOpen className="w-6 h-6 mr-2" />
                  {selectedSubject ? `${selectedSubject} Assignments` : 'Assignment Management'}
                </CardTitle>
                <div className="flex items-center gap-3">
                  {selectedSubject && (
                    <Button 
                      onClick={() => setSelectedSubject(null)}
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-white/10"
                    >
                      Show All
                    </Button>
                  )}
                  <Button 
                    onClick={openCreateAssignment}
                    size="sm" 
                    className="bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Assignment
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assignments..."
                    value={assignmentSearchTerm}
                    onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div className="relative assignment-filter-dropdown">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 bg-transparent"
                    onClick={() => setShowAssignmentFilterDropdown(!showAssignmentFilterDropdown)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {assignmentFilterSubject === "all" ? "All Subjects" : assignmentFilterSubject}
                  </Button>
                  {showAssignmentFilterDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-lg border border-gray-600 z-50">
                      <div className="p-2">
                        <div className="text-xs text-gray-400 mb-2 px-2">Filter by Subject</div>
                        <button
                          onClick={() => {
                            setAssignmentFilterSubject("all")
                            setShowAssignmentFilterDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors ${
                            assignmentFilterSubject === "all" ? "bg-blue-500/20 text-blue-300" : "text-gray-300"
                          }`}
                        >
                          All Subjects
                        </button>
                        {getAvailableSubjectsForAssignmentFilter().map((subject) => (
                          <button
                            key={subject}
                            onClick={() => {
                              setAssignmentFilterSubject(subject)
                              setShowAssignmentFilterDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors ${
                              assignmentFilterSubject === subject ? "bg-blue-500/20 text-blue-300" : "text-gray-300"
                            }`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAssignments ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading assignments...</p>
                </div>
              ) : (() => {
                console.log('Current assignments state:', assignments)
                console.log('Selected subject:', selectedSubject)
                const displayAssignments = selectedSubject ? getSubjectAssignments() : safeAssignments
                console.log('Display assignments:', displayAssignments)
                const filteredAssignments = getFilteredAssignments(displayAssignments)
                console.log('Filtered assignments:', filteredAssignments)
                return filteredAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAssignments.map((assignment: any, index: any) => (
                      <div key={index} className="p-4 glass-card rounded-lg hover:bg-white/5 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-base sm:text-lg">{assignment.title}</h4>
                            <p className="text-sm text-gray-400">{assignment.subject}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 w-full sm:w-auto"
                              onClick={() => viewSubmissions(assignment)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">View Submissions</span>
                              <span className="sm:hidden">View</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      {assignmentSearchTerm || assignmentFilterSubject !== "all" 
                        ? `No assignments found matching your filters` 
                        : selectedSubject 
                          ? `No assignments for ${selectedSubject} yet` 
                          : 'No assignments yet'
                      }
                    </p>
                    <p className="text-gray-500">
                      {assignmentSearchTerm || assignmentFilterSubject !== "all"
                        ? 'Try adjusting your search or filter criteria'
                        : selectedSubject 
                          ? 'Create assignments for this subject to get started' 
                          : 'Create your first assignment to get started'
                      }
                    </p>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl gradient-text flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  {selectedSubject ? `${selectedSubject} Students` : 'Student Performance Tracking'}
                </CardTitle>
                <div className="flex items-center gap-3">
                  {selectedSubject && (
                    <Button 
                      onClick={() => setSelectedSubject(null)}
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-white/10"
                    >
                      Show All
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div className="relative filter-dropdown">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-600 text-gray-300 bg-transparent"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {filterSubject === "all" ? "All Subjects" : filterSubject}
                </Button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-lg border border-gray-600 z-50">
                      <div className="p-2">
                        <div className="text-xs text-gray-400 mb-2 px-2">Filter by Subject</div>
                        <button
                          onClick={() => {
                            setFilterSubject("all")
                            setShowFilterDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors ${
                            filterSubject === "all" ? "bg-blue-500/20 text-blue-300" : "text-gray-300"
                          }`}
                        >
                          All Subjects
                        </button>
                        {getAvailableSubjectsForFilter().map((subject) => (
                          <button
                            key={subject}
                            onClick={() => {
                              setFilterSubject(subject)
                              setShowFilterDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-white/10 transition-colors ${
                              filterSubject === subject ? "bg-blue-500/20 text-blue-300" : "text-gray-300"
                            }`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingStudents || loadingEnrolledStudents ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading students...</p>
                  </div>
                ) : (() => {
                  const displayStudents = getSubjectStudents()
                  const filteredStudents = getFilteredStudents(displayStudents)
                  console.log('Display students:', displayStudents)
                  console.log('Filtered students:', filteredStudents)
                  return filteredStudents.length > 0 ? (
                    filteredStudents
                      .filter((student: any) => student && (student.name || student.email)) // Filter out invalid students
                      .map((student: any, index: any) => (
                      <div key={index} className="p-4 glass-card rounded-lg hover:bg-white/5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12 border-2 border-blue-500/30">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {student.name
                                  ? student.name.split(" ").map((n: any) => n[0]).join("")
                                  : student.email ? student.email.charAt(0).toUpperCase() : "S"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-white text-lg">{student.name || 'Unknown Student'}</p>
                              <p className="text-sm text-gray-400">{student.email || 'No email'}</p>
                                <div className="space-y-1">
                                <p className="text-xs text-blue-400">
                                  Enrolled in: {student.enrolledSubject}
                                </p>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500">Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}</p>
                                  <p className="text-xs text-purple-400">Status: {student.status}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">
                              Student ID: {student.id}
                            </p>
                            {selectedSubject && (
                              <div className="space-y-1">
                                <Badge className={`text-xs ${
                                  student.status === 'enrolled' ? 'bg-blue-500/20 text-blue-300' :
                                  student.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                  'bg-gray-500/20 text-gray-300'
                                }`}>
                                  {student.status}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                            onClick={() => handleViewStudentProfile(student)}
                          >
                            <Target className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">
                        {searchTerm || filterSubject !== "all" 
                          ? `No students found matching your filters` 
                          : selectedSubject 
                            ? `No students enrolled in ${selectedSubject}` 
                            : 'No enrolled students'
                        }
                      </p>
                      <p className="text-gray-500">
                        {searchTerm || filterSubject !== "all"
                          ? 'Try adjusting your search or filter criteria'
                          : selectedSubject 
                            ? 'Students will appear here when they enroll in this subject' 
                            : 'Students will appear here when they enroll in your courses'
                        }
                      </p>
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl gradient-text flex items-center">
                  <Clock className="w-6 h-6 mr-2" />
                  Attendance Management
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedCourseForAttendance?.name || ''}
                    onValueChange={(subjectName) => {
                      const subject = teacherData?.subjects?.find((s: any) => s.name === subjectName)
                      if (subject) handleAttendanceCourseSelect(subject)
                    }}
                  >
                    <SelectTrigger className="w-64 bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherData?.subjects?.map((subject: any) => (
                        <SelectItem key={subject.name} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAttendanceDialog(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={!selectedCourseForAttendance}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Mark Single
                    </Button>
                    <Button
                      onClick={markBulkAttendance}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      disabled={!selectedCourseForAttendance || bulkAttendanceData.length === 0 || isSavingAttendance}
                    >
                      {isSavingAttendance ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save All
                        </>
                      )}
                    </Button>
                    {attendanceMarkedForDate && (
                      <Button
                        onClick={resetAttendanceForNewDay}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        variant="outline"
                      >
                        <Timer className="w-4 h-4 mr-2" />
                        Reset for New Day
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedCourseForAttendance ? (
                <div className="space-y-6">
                  {/* Attendance Status Indicator */}
                  {attendanceMarkedForDate && (
                    <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-400">Attendance Status</p>
                          <p className="text-lg font-bold text-white">
                            ✅ Marked for {new Date(attendanceMarkedForDate).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                  )}

                  {/* Attendance Stats */}
                  {attendanceStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-400">Present</p>
                            <p className="text-2xl font-bold text-white">
                              {attendanceStats.find((stat: any) => stat._id === 'present')?.count || 0}
                            </p>
                          </div>
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                      </div>
                      <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-400">Absent</p>
                            <p className="text-2xl font-bold text-white">
                              {attendanceStats.find((stat: any) => stat._id === 'absent')?.count || 0}
                            </p>
                          </div>
                          <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Bulk Attendance Marking */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-white">Mark Attendance for All Students</h3>
                        <Badge className="bg-blue-900/50 text-blue-400 border-blue-500/30">
                          {bulkAttendanceData.filter(s => s.attendanceStatus).length} of {bulkAttendanceData.length} marked
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="datetime-local"
                          value={bulkAttendanceDate}
                          onChange={(e) => setBulkAttendanceDate(e.target.value)}
                          className="bg-gray-800/50 border-gray-600 text-white w-48"
                        />
                      </div>
                    </div>
                    
                    {bulkAttendanceData.length > 0 ? (
                      <div className="space-y-3">
                        {bulkAttendanceData.map((student: any, index: number) => (
                          <div key={student._id || student.id || index} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {(student.name || student.studentName || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{student.name || student.studentName}</p>
                                  <p className="text-sm text-gray-400">{student.email || student.studentEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => updateBulkAttendance(index, 'present')}
                                  className={`w-12 h-12 rounded-full ${
                                    student.attendanceStatus === 'present' 
                                      ? 'bg-green-500 hover:bg-green-600' 
                                      : 'bg-gray-700 hover:bg-gray-600'
                                  }`}
                                  title="Mark Present"
                                >
                                  <CheckCircle className="w-6 h-6 text-white" />
                                </Button>
                                <Button
                                  onClick={() => updateBulkAttendance(index, 'absent')}
                                  className={`w-12 h-12 rounded-full ${
                                    student.attendanceStatus === 'absent' 
                                      ? 'bg-red-500 hover:bg-red-600' 
                                      : 'bg-gray-700 hover:bg-gray-600'
                                  }`}
                                  title="Mark Absent"
                                >
                                  <XCircle className="w-6 h-6 text-white" />
                                </Button>
                              </div>
                            </div>
                            {student.attendanceStatus && (
                              <div className="mt-3 p-2 bg-gray-700/30 rounded text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-300">Status:</span>
                                  <Badge className={`${
                                    student.attendanceStatus === 'present' ? 'bg-green-900/50 text-green-400 border-green-500/30' :
                                    'bg-red-900/50 text-red-400 border-red-500/30'
                                  }`}>
                                    {student.attendanceStatus.charAt(0).toUpperCase() + student.attendanceStatus.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No students enrolled in this subject.</p>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a course to manage attendance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>



      </Tabs>
    </div>

    {/* Student Profile Dialog */}
    <Dialog open={showStudentProfileDialog} onOpenChange={setShowStudentProfileDialog}>
      <DialogContent className="bg-gray-900 border-gray-700 w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Student Profile & Assignment Status
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Detailed information about the student and their assignment progress
          </DialogDescription>
        </DialogHeader>
        
        {selectedStudentProfile && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="flex items-center space-x-4 p-4 glass-card rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {selectedStudentProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{selectedStudentProfile.name}</h3>
                <p className="text-gray-400">{selectedStudentProfile.email}</p>
                <p className="text-sm text-gray-500">ID: {selectedStudentProfile._id}</p>
              </div>
              
              {/* Assignment Summary Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {studentAssignments.summary.completedCount || 0}
                  </p>
                  <p className="text-gray-400 text-sm">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {studentAssignments.summary.uncompletedCount || 0}
                  </p>
                  <p className="text-gray-400 text-sm">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {studentAssignments.summary.completionRate || 0}%
                  </p>
                  <p className="text-gray-400 text-sm">Completion Rate</p>
                </div>
              </div>
            </div>

            {/* Assignment Status Tabs */}
            <Tabs defaultValue="completed" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass-card">
                <TabsTrigger value="completed" className="data-[state=active]:bg-green-600">
                  Completed ({studentAssignments.summary.completedCount || 0})
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                  Pending ({studentAssignments.summary.uncompletedCount || 0})
                </TabsTrigger>
              </TabsList>

              {/* Completed Assignments */}
              <TabsContent value="completed" className="space-y-4">
                {loadingStudentAssignments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading assignments...</p>
                  </div>
                ) : studentAssignments.completedAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {studentAssignments.completedAssignments.map((assignment: any, index: number) => (
                      <div key={index} className="p-4 glass-card rounded-lg border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{assignment.title}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-400">{assignment.subject}</span>
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 capitalize">
                                {assignment.type}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-gray-400 text-sm">Score</p>
                              <p className={`font-bold text-lg ${
                                assignment.score >= 90 ? 'text-green-400' :
                                assignment.score >= 80 ? 'text-blue-400' :
                                assignment.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {assignment.score}%
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-gray-400 text-sm">Points</p>
                              <p className="font-bold text-lg text-purple-400">
                                {assignment.pointsEarned}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-gray-400 text-sm">Completed</p>
                              <p className="text-white text-sm">
                                {new Date(assignment.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No completed assignments</p>
                    <p className="text-gray-500 text-sm mt-2">Student hasn't completed any assignments yet.</p>
                  </div>
                )}
              </TabsContent>

              {/* Pending Assignments */}
              <TabsContent value="pending" className="space-y-4">
                {loadingStudentAssignments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading assignments...</p>
                  </div>
                ) : studentAssignments.uncompletedAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {studentAssignments.uncompletedAssignments.map((assignment: any, index: number) => (
                      <div key={index} className="p-4 glass-card rounded-lg border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{assignment.title}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-400">{assignment.subject}</span>
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 capitalize">
                                {assignment.type}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-gray-400 text-sm">Points Available</p>
                              <p className="font-bold text-lg text-yellow-400">
                                {assignment.points}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-gray-400 text-sm">Due Date</p>
                              <p className="text-white text-sm">
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                Pending
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">All assignments completed!</p>
                    <p className="text-gray-500 text-sm mt-2">Student has completed all available assignments.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Subject Selection Modal */}
    <Dialog open={showSubjectSelectionModal} onOpenChange={setShowSubjectSelectionModal}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl gradient-text flex items-center">
            <BookOpen className="w-8 h-8 mr-3" />
            Manage Your Teaching Subjects
          </DialogTitle>

        </DialogHeader>
        
        <div className="space-y-8">
          {/* Institute Name */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-blue-400" />
              Institute Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Institute Name</Label>
                <Select value={teacherData?.instituteName || ""} onValueChange={(v) => setTeacherData((prev: any) => prev ? { ...prev, instituteName: v } : prev)}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select your institute or university" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                    {[
                      "IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
                      "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT Indore", "IIT Jodhpur",
                      "IIT Patna", "IIT Ropar", "IIT Bhubaneswar", "IIT Gandhinagar", "IIT Mandi",
                      "IIT Varanasi", "IIT Dhanbad", "IIT Bhilai", "IIT Goa", "IIT Jammu",
                      "Delhi University", "Mumbai University", "Pune University", "Calcutta University",
                      "Madras University", "Bangalore University", "Hyderabad University", "Punjab University",
                      "BITS Pilani", "Manipal University", "Amity University", "SRM University",
                      "VIT University", "Thapar University", "DTU Delhi", "NSIT Delhi",
                      "Other"
                    ].map((option) => (
                      <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Class Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-green-400" />
              Class Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Class</Label>
                <Select value={teacherData?.className || ""} onValueChange={(v) => setTeacherData((prev: any) => prev ? { ...prev, className: v } : prev)}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                    {[
                      "Class X", "Class XI", "Class XII",
                      "B.Tech 1st Year", "B.Tech 2nd Year", "B.Tech 3rd Year", "B.Tech 4th Year",
                      "B.Sc 1st Year", "B.Sc 2nd Year", "B.Sc 3rd Year",
                      "BBA 1st Year", "BBA 2nd Year", "BBA 3rd Year",
                      "MBA 1st Year", "MBA 2nd Year",
                      "M.Tech 1st Year", "M.Tech 2nd Year",
                      "PhD", "Post Doc"
                    ].map((option) => (
                      <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-purple-400" />
              Section Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Section</Label>
                <Select value={teacherData?.section || ""} onValueChange={(v) => setTeacherData((prev: any) => prev ? { ...prev, section: v } : prev)}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((option) => (
                      <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Batch Year Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-orange-400" />
              Batch Year Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Batch Year</Label>
                <Select value={teacherData?.batchYear || ""} onValueChange={(v) => setTeacherData((prev: any) => prev ? { ...prev, batchYear: v } : prev)}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select batch year" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {[
                      "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", 
                      "2025-26", "2026-27", "2027-28", "2028-29", "2029-30"
                    ].map((option) => (
                      <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-green-400" />
              Subject Selection
            </h3>
            
            {/* Current Subjects (if any) */}
            {teacherData?.subjects && teacherData.subjects.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Current Teaching Subjects</h4>
                <div className="space-y-3">
                  {teacherData.subjects.map((subject: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 glass-card rounded-lg border border-blue-500/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">{subject.name}</h5>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveCurrentSubject(subject.name)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Subjects */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Available Subjects</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedSubjects.includes(subject.id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                    onClick={() => handleSubjectToggle(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-white">{subject.name}</h5>
                        <p className="text-sm text-gray-400">{subject.category}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedSubjects.includes(subject.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {selectedSubjects.includes(subject.id) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Subject Addition */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Add Custom Subject</h4>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter custom subject name..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="flex-1 bg-gray-800/50 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSubject()}
                />
                <Button
                  onClick={handleAddCustomSubject}
                  disabled={!customSubject.trim()}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Subjects */}
            {selectedSubjects.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Selected Subjects ({selectedSubjects.length})</h4>
                <div className="space-y-2">
                  {selectedSubjects.map((subjectId) => {
                    const predefinedSubject = availableSubjects.find(s => s.id === subjectId)
                    const subjectName = predefinedSubject ? predefinedSubject.name : subjectId
                    return (
                      <div key={subjectId} className="flex items-center justify-between p-3 glass-card rounded-lg">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-medium">{subjectName}</span>
                          {!predefinedSubject && (
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveSubject(subjectId)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          Remove
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Course Management */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-indigo-400" />
              Course Management
            </h3>
            <div className="space-y-4">
              {/* Add New Course */}
              <div className="p-4 glass-card rounded-lg border border-gray-600">
                <h4 className="text-lg font-medium text-white mb-3">Add New Course</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Course name"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newCourse.description || ""}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Select value={newCourse.level || ""} onValueChange={(v) => setNewCourse(prev => ({ ...prev, level: v }))}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {["Beginner", "Intermediate", "Advanced", "Expert"].map((level) => (
                        <SelectItem key={level} value={level} className="text-white hover:bg-gray-700">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={addCourse}
                    disabled={!newCourse.name.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Course
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNewCourse({ name: "", description: "", level: "" })}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Course List */}
              {teacherData?.courses && teacherData.courses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-white">Your Courses ({teacherData.courses.length})</h4>
                  {teacherData.courses.map((course: any, index: number) => (
                    <div key={index} className="bg-gray-800/30 border border-gray-600 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-white">{course.name}</h5>
                          {course.description && (
                            <p className="text-gray-400 text-sm mt-1">{course.description}</p>
                          )}
                          {course.level && (
                            <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded mt-2">
                              {course.level}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editCourse(index)}
                            className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeCourse(index)}
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
                          <Button
                onClick={handleSaveSubjects}
                disabled={
                  selectedSubjects.length === 0 || 
                  !teacherData?.instituteName || 
                  !teacherData?.className || 
                  !teacherData?.section || 
                  !teacherData?.batchYear
                }
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Complete Profile ({selectedSubjects.length} subjects)
              </Button>
            <Button
              variant="outline"
              onClick={() => setShowSubjectSelectionModal(false)}
              className="border-gray-600 text-gray-300 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>

          {/* Help Text */}
          <div className="p-4 glass-card rounded-lg border border-blue-500/20">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Complete Profile Setup</h4>
                <p className="text-sm text-gray-300">
                  Set up your complete teaching profile including institute, class, section, batch year, courses, and subjects. 
                  This information will help students find and enroll in your courses more effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Assignment Creation Modal */}
    <Dialog open={showCreateAssignment} onOpenChange={(open) => {
      if (!open) closeCreateAssignment()
    }}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl dialog-content">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">Create New Assignment</DialogTitle>
          <DialogDescription className="text-gray-300">
            Design a new assignment for your students
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 dialog-body custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Assignment Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., React Hooks Project"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-gray-300">
                Subject
              </Label>
              <Select
                value={newAssignment.subject}
                onValueChange={(value) => setNewAssignment({ ...newAssignment, subject: value })}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {teacherData?.subjects && teacherData.subjects.length > 0 ? (
                    teacherData.subjects.map((subject: any) => (
                      <SelectItem key={subject.name} value={subject.name} className="text-white">
                        {subject.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled className="text-gray-500">
                      No subjects available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the assignment objectives and requirements..."
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              className="bg-gray-800/50 border-gray-600 text-white min-h-24"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-300">
                Type
              </Label>
              <Select
                value={newAssignment.type}
                onValueChange={(value) => setNewAssignment({ ...newAssignment, type: value })}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Assignment type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="quiz" className="text-white">
                    Quiz
                  </SelectItem>
                  <SelectItem value="homework" className="text-white">
                    Homework
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-gray-300">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points" className="text-gray-300">
                Points
              </Label>
              <Input
                id="points"
                type="number"
                placeholder="100"
                value={newAssignment.points}
                onChange={(e) => setNewAssignment({ ...newAssignment, points: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            {/* Time Limit for Quizzes */}
            {newAssignment.type === 'quiz' && (
              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="text-gray-300">
                  Time Limit (minutes)
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  placeholder="30"
                  min="1"
                  max="180"
                  value={newAssignment.timeLimit}
                  onChange={(e) => setNewAssignment({ ...newAssignment, timeLimit: e.target.value })}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400">
                  Set how long students have to complete this quiz (1-180 minutes)
                </p>
              </div>
            )}
          </div>
          
          {/* Student Assignment Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="assignToAll"
                checked={newAssignment.assignToAll}
                onChange={(e) => setNewAssignment({ 
                  ...newAssignment, 
                  assignToAll: e.target.checked,
                  selectedStudents: e.target.checked ? [] : newAssignment.selectedStudents
                })}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              />
              <Label htmlFor="assignToAll" className="text-gray-300 cursor-pointer">
                Assign to all students
              </Label>
            </div>
            
            {!newAssignment.assignToAll && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Select specific students:</Label>
                  {newAssignment.selectedStudents.length > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {newAssignment.selectedStudents.length} student{newAssignment.selectedStudents.length !== 1 ? 's' : ''} selected
                    </Badge>
                  )}
                </div>
                {loadingStudents ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Loading enrolled students...</p>
                  </div>
                ) : availableStudents.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-2 p-3 glass-card rounded-lg border border-gray-600">
                    {availableStudents.map((student: any) => (
                      <div key={student._id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`student-${student._id}`}
                          checked={newAssignment.selectedStudents.includes(student._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAssignment({
                                ...newAssignment,
                                selectedStudents: [...newAssignment.selectedStudents, student._id]
                              })
                            } else {
                              setNewAssignment({
                                ...newAssignment,
                                selectedStudents: newAssignment.selectedStudents.filter(id => id !== student._id)
                              })
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor={`student-${student._id}`} className="text-gray-300 cursor-pointer flex-1">
                          <div>
                            <div>{student.name} ({student.email})</div>
                            <div className="text-xs text-gray-400">
                              Enrolled in: {student.enrolledSubject}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No enrolled students available</p>
                    <p className="text-xs text-gray-500 mt-1">Students will appear here once they enroll in your courses</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Quiz Questions Section - Only show for quiz type */}
          {newAssignment.type === 'quiz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 text-lg font-semibold">Quiz Questions</Label>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {newAssignment.questions.length} question{newAssignment.questions.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAIGenerator}
                    className="border-purple-600 text-purple-300 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    AI Generator
                  </Button>
                </div>
              </div>
              
              {/* Question Builder */}
              <div className="glass-card p-4 border border-gray-600 rounded-lg">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Question Text</Label>
                    <Textarea
                      placeholder="Enter your question here..."
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className="bg-gray-800/50 border-gray-600 text-white min-h-20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Question Type</Label>
                      <Select
                        value={currentQuestion.type}
                        onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, type: value })}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder="Question Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300">Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                        className="bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Multiple Choice Options */}
                  {currentQuestion.type === 'multiple-choice' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {currentQuestion.options.map((option: any, optIndex: number) => (
                          <div key={optIndex} className="flex items-center space-x-3 p-2 bg-gray-800/30 rounded-lg border border-gray-600">
                            <input
                              type="radio"
                              name={`correct-${optIndex}`}
                              checked={option.isCorrect}
                              onChange={() => updateQuestionOption(optIndex, 'isCorrect', true)}
                              className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600"
                            />
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={option.text}
                              onChange={(e) => updateQuestionOption(optIndex, 'text', e.target.value)}
                              className="bg-gray-800/50 border-gray-600 text-white flex-1"
                            />
                            {currentQuestion.options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(optIndex)}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700 px-2"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* True/False Answer */}
                  {currentQuestion.type === 'true-false' && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Correct Answer</Label>
                      <Select
                        value={currentQuestion.correctAnswer}
                        onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: value })}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="true" className="text-white">True</SelectItem>
                          <SelectItem value="false" className="text-white">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  

                  
                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Explanation (Optional)</Label>
                    <Textarea
                      placeholder="Explain why this answer is correct..."
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                      className="bg-gray-800/50 border-gray-600 text-white min-h-16"
                    />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>
              
              {/* Questions List */}
              {newAssignment.questions.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-300 font-semibold">Added Questions:</Label>
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {newAssignment.questions.map((question, index) => (
                      <div key={index} className="glass-card p-3 border border-gray-600 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-white mb-2">
                              Q{index + 1}: {question.question}
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>Type: {question.type}</div>
                              <div>Points: {question.points}</div>
                              {question.type === 'multiple-choice' && (
                                <div>Options: {question.options.filter((opt: any) => opt.text.trim() !== '').length}</div>
                              )}
                              {question.explanation && (
                                <div>Explanation: {question.explanation}</div>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 ml-3"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={handleCreateAssignment}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
            <Button
              variant="outline"
              onClick={closeCreateAssignment}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Pricing Modal */}
    <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">Set Course Pricing</DialogTitle>
          <DialogDescription className="text-gray-300">
            Configure enrollment pricing for {selectedSubjectForPricing?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Free/Paid Toggle */}
          <div className="space-y-2">
            <Label className="text-gray-300">Course Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={pricingData.isFree ? "default" : "outline"}
                onClick={() => setPricingData({ ...pricingData, isFree: true, price: 0 })}
                className={pricingData.isFree ? "bg-green-600 hover:bg-green-700" : "border-gray-600 text-gray-300"}
              >
                Free Course
              </Button>
              <Button
                type="button"
                variant={!pricingData.isFree ? "default" : "outline"}
                onClick={() => setPricingData({ ...pricingData, isFree: false })}
                className={!pricingData.isFree ? "bg-yellow-600 hover:bg-yellow-700" : "border-gray-600 text-gray-300"}
              >
                Paid Course
              </Button>
            </div>
          </div>

          {/* Price Input */}
          {!pricingData.isFree && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-300">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricingData.price}
                  onChange={(e) => setPricingData({ ...pricingData, price: parseFloat(e.target.value) || 0 })}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                <Select
                  value={pricingData.currency}
                  onValueChange={(value) => setPricingData({ ...pricingData, currency: value })}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="USD" className="text-white">USD ($)</SelectItem>
                    <SelectItem value="EUR" className="text-white">EUR (€)</SelectItem>
                    <SelectItem value="GBP" className="text-white">GBP (£)</SelectItem>
                    <SelectItem value="INR" className="text-white">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what students will learn..."
              value={pricingData.description}
              onChange={(e) => setPricingData({ ...pricingData, description: e.target.value })}
              className="bg-gray-800/50 border-gray-600 text-white min-h-20"
            />
          </div>

          {/* Preview */}
          <div className="p-4 glass-card rounded-lg border border-blue-500/20">
            <h4 className="font-semibold text-white mb-2">Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Course:</span>
                <span className="text-white">{selectedSubjectForPricing?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className={pricingData.isFree ? "text-green-400 font-semibold" : "text-yellow-400 font-semibold"}>
                  {pricingData.isFree ? 'Free' : `${pricingData.currency} ${pricingData.price}`}
                </span>
              </div>
              {pricingData.description && (
                <div className="text-gray-300 text-xs mt-2">
                  {pricingData.description}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpdatePricing}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Update Pricing
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPricingModal(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Teacher Chat Full Screen */}
    {showChatDialog && (
      <div className="fixed inset-0 z-50 bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
            </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Teacher Chat</h3>
                  <p className="text-sm text-gray-400">Communicate with your students</p>
            </div>
          </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChatDialog(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            </div>

          {/* Chat Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Chat List */}
            <div className="w-80 border-r border-gray-700 bg-gray-800 flex flex-col h-full">
              {/* Search */}
              <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                    placeholder="Search chats..."
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {/* Chat List */}
                <div>
                  {loadingChats ? (
                    <div className="p-4 text-center text-gray-400">
                      <p>Loading chats...</p>
                </div>
                  ) : chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
              </div>
                      <p className="text-lg font-medium text-gray-300 mb-2">No chats yet</p>
                      <p className="text-sm text-gray-500">Start conversations with your students</p>
                          </div>
                  ) : (
                                      chats.map((chat, index) => (
                    <div
                      key={chat.id || `chat-${index}-${Date.now()}`}
                            onClick={() => {
                        setSelectedChat(chat)
                        fetchMessages(chat.id)
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-gray-700' : ''
                      }`}
                    >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={chat.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                              {chat.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate">{chat.name}</h3>
                            <p className="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
                        </div>
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              {chat.unreadCount}
                            </Badge>
                          )}
                      </div>
                              </div>
                    ))
                  )}
                        </div>

                {/* Users List for New Chats */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="px-4 pb-2">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Start New Chat</h4>
                        </div>
                  
                  {/* All Available Users */}
                  <div className="px-4 pb-2">
                    <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Available Users ({(() => {
                        const availableStudents = chatUsers.students.filter(student => 
                          !chats.some(chat => 
                            chat.participants.some((p: any) => p._id === student._id)
                          )
                        );
                        const availableTeachers = chatUsers.teachers.filter(teacher => 
                          !chats.some(chat => 
                            chat.participants.some((p: any) => p._id === teacher._id)
                          )
                        );
                        return availableStudents.length + availableTeachers.length;
                      })()})
                    </h5>
                        </div>
                  
                  {loadingUsers ? (
                    <div className="p-4 text-center text-gray-400">
                      <p className="text-sm">Loading users...</p>
          </div>
                  ) : (() => {
                    // Filter out users who already have chats
                    const availableStudents = chatUsers.students.filter(student => 
                      !chats.some(chat => 
                        chat.participants.some((p: any) => p._id === student._id)
                      )
                    );
                    const availableTeachers = chatUsers.teachers.filter(teacher => 
                      !chats.some(chat => 
                        chat.participants.some((p: any) => p._id === teacher._id)
                      )
                    );
                    
                    const allAvailableUsers = [...availableStudents, ...availableTeachers];
                    
                    if (allAvailableUsers.length === 0) {
                      return (
                        <div className="p-4 text-center text-gray-400">
                          <p className="text-sm text-gray-500">All users already have chats</p>
              </div>
                      );
                    }
                    
                    return allAvailableUsers.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => createChat(user._id, user.role === 'student' ? 'teacher-student' : 'teacher-teacher')}
                        className="p-4 cursor-pointer hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className={`${
                              user.role === 'student' 
                                ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}>
                              {user.name?.split(' ').map((n: string) => n[0]).join('') || (user.role === 'student' ? 'S' : 'T')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-white font-medium truncate">{user.name}</h3>
                              <Badge className={`text-xs ${
                                user.role === 'student' 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-purple-600 text-white'
                              }`}>
                                {user.role === 'student' ? 'Student' : 'Teacher'}
                </Badge>
              </div>
                            <p className="text-gray-400 text-sm truncate">{user.email}</p>
              </div>
                          <Plus className="w-5 h-5 text-gray-400" />
              </div>
            </div>
                    ));
                  })()}
              </div>
            </div>
          </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-700 bg-gray-800">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedChat.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                          {selectedChat.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                        <h3 className="text-white font-medium">{selectedChat.name}</h3>
                        <p className="text-sm text-gray-400">Active now</p>
                        </div>
                      </div>
                    </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                      messages.map((msg, index) => (
                        <div
                          key={msg.id || index}
                          className={`flex ${msg.sender === user?._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === user?._id
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-700 text-white'
                          }`}>
                            <p>{msg.text}</p>
                            <p className={`text-xs mt-1 ${
                              msg.sender === user?._id ? 'text-blue-200' : 'text-gray-400'
                            }`}>
                              {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          </div>
                      ))
                        )}
                      </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-700 bg-gray-800">
                    <div className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                              <Button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                              </Button>
                            </div>
                        </div>
                </>
              ) : (
                /* Chat Placeholder */
                <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                          </div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Select a chat to start messaging</h3>
                  <p className="text-sm text-gray-500">Choose a student or teacher from the list to begin a conversation</p>
                      </div>
                      </div>
                    )}
                  </div>
            </div>
        </div>
            </div>
          )}

    {/* Subject Details Modal */}
    <Dialog open={showSubjectDetailsModal} onOpenChange={setShowSubjectDetailsModal}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl gradient-text flex items-center">
            <BookOpen className="w-8 h-8 mr-3" />
            Course Details: {selectedSubjectForDetails?.title || selectedSubjectForDetails?.name}
          </DialogTitle>
        </DialogHeader>
        
        {selectedSubjectForDetails && (
          <div className="space-y-6">
            {/* Institute Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Building2 className="w-6 h-6 mr-2 text-blue-400" />
                Institute Information
              </h3>
              <div className="p-4 glass-card rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Institute Name:</span>
                  <span className="text-white font-semibold">
                    {selectedSubjectForDetails?.hierarchy?.instituteName || teacherData?.instituteName || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Class Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <GraduationCap className="w-6 h-6 mr-2 text-green-400" />
                Class Information
              </h3>
              <div className="p-4 glass-card rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Class:</span>
                  <span className="text-white font-semibold">
                    {selectedSubjectForDetails?.hierarchy?.className || teacherData?.className || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-purple-400" />
                Section Information
              </h3>
              <div className="p-4 glass-card rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Section:</span>
                  <span className="text-white font-semibold">
                    {selectedSubjectForDetails?.hierarchy?.section || teacherData?.section || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Batch Year Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-orange-400" />
                Batch Year Information
              </h3>
              <div className="p-4 glass-card rounded-lg border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Batch Year:</span>
                  <span className="text-white font-semibold">
                    {selectedSubjectForDetails?.hierarchy?.batchYear || teacherData?.batchYear || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-green-400" />
                Subject Details
              </h3>
              <div className="p-4 glass-card rounded-lg border border-green-500/20">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Course Title:</span>
                    <span className="text-white font-semibold">{selectedSubjectForDetails.title || selectedSubjectForDetails.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Subject:</span>
                    <span className="text-white font-semibold">{selectedSubjectForDetails.subject || selectedSubjectForDetails.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white font-semibold">
                      {availableSubjects.find(s => s.name === selectedSubjectForDetails.name)?.category || "Custom Subject"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Management */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-indigo-400" />
                Course Management
              </h3>
              <div className="space-y-4">
                {teacherData?.courses && teacherData.courses.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-white">Related Courses ({teacherData.courses.length})</h4>
                    {teacherData.courses.map((course: any, index: number) => (
                      <div key={index} className="bg-gray-800/30 border border-gray-600 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-white">{course.name}</h5>
                            {course.description && (
                              <p className="text-gray-400 text-sm mt-1">{course.description}</p>
                            )}
                            {course.level && (
                              <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded mt-2">
                                {course.level}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 glass-card rounded-lg border border-gray-600 text-center">
                    <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No courses created yet</p>
                    <p className="text-sm text-gray-500 mt-1">Create courses to organize your teaching content</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowSubjectDetailsModal(false)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubjectDetailsModal(false)
                  setShowSubjectSelectionModal(true)
                }}
                className="border-gray-600 text-gray-300 hover:bg-white/10"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* AI Quiz Generator Modal */}
    <Dialog open={showAIGenerator} onOpenChange={(open) => {
      if (!open) closeAIGenerator()
    }}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl dialog-content">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              🤖
            </div>
            AI Quiz Generator
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Generate quiz questions automatically using Gemini AI
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 dialog-body custom-scrollbar">
          {/* Generation Type Selection */}
          <div className="space-y-3">
            <Label className="text-gray-300 font-semibold">Generation Type</Label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="generationType"
                  value="subject"
                  checked={aiGenerationData.generationType === 'subject'}
                  onChange={(e) => setAiGenerationData({ ...aiGenerationData, generationType: e.target.value })}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600"
                />
                <span className="text-gray-300">By Subject</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="generationType"
                  value="topic"
                  checked={aiGenerationData.generationType === 'topic'}
                  onChange={(e) => setAiGenerationData({ ...aiGenerationData, generationType: e.target.value })}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600"
                />
                <span className="text-gray-300">By Specific Topic</span>
              </label>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Subject *</Label>
            <Select
              value={aiGenerationData.subject}
              onValueChange={(value) => setAiGenerationData({ ...aiGenerationData, subject: value })}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {teacherData?.subjects && teacherData.subjects.length > 0 ? (
                  teacherData.subjects.map((subject: any) => (
                    <SelectItem key={subject.name} value={subject.name} className="text-white">
                      {subject.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled className="text-gray-500">
                    No subjects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Topic Input (only for topic-based generation) */}
          {aiGenerationData.generationType === 'topic' && (
            <div className="space-y-2">
              <Label className="text-gray-300">Specific Topic *</Label>
              <Input
                placeholder="e.g., React Hooks, JavaScript Promises, CSS Grid..."
                value={aiGenerationData.topic}
                onChange={(e) => setAiGenerationData({ ...aiGenerationData, topic: e.target.value })}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
          )}

          {/* Difficulty and Question Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Difficulty</Label>
              <Select
                value={aiGenerationData.difficulty}
                onValueChange={(value) => setAiGenerationData({ ...aiGenerationData, difficulty: value })}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Number of Questions</Label>
              <Select
                value={aiGenerationData.questionCount.toString()}
                onValueChange={(value) => setAiGenerationData({ ...aiGenerationData, questionCount: parseInt(value) })}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="3" className="text-white">3 Questions</SelectItem>
                  <SelectItem value="5" className="text-white">5 Questions</SelectItem>
                  <SelectItem value="8" className="text-white">8 Questions</SelectItem>
                  <SelectItem value="10" className="text-white">10 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateQuizWithAI}
            disabled={isGenerating || !aiGenerationData.subject || (aiGenerationData.generationType === 'topic' && !aiGenerationData.topic.trim())}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Questions...
              </>
            ) : (
              <>
                🤖 Generate Quiz Questions
              </>
            )}
          </Button>

          {/* Generated Questions Display */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 font-semibold">Generated Questions:</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearGeneratedQuestions}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={useGeneratedQuestions}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Use Questions
                  </Button>
                </div>
              </div>
              
              {/* Questions Summary */}
              <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-3">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-white">{generatedQuestions.length}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-400">
                      {generatedQuestions.filter(q => q.type === 'multiple-choice').length}
                    </div>
                    <div className="text-xs text-gray-400">MCQ</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-400">
                      {generatedQuestions.filter(q => q.type === 'true-false').length}
                    </div>
                    <div className="text-xs text-gray-400">T/F</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-400">
                      {generatedQuestions.reduce((sum, q) => sum + q.points, 0)}
                    </div>
                    <div className="text-xs text-gray-400">Points</div>
                  </div>
                </div>
              </div>
              
              {/* Visual Separator */}
              <div className="border-t border-gray-600 pt-4">
                <div className="text-sm text-gray-400 font-medium mb-3">Question Details:</div>
              </div>
              
              <div className="max-h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {generatedQuestions.map((question, index) => (
                  <div key={index} className="glass-card p-4 border border-gray-600 rounded-lg">
                    <div className="space-y-3">
                      {/* Question Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-white text-lg mb-2">
                            Q{index + 1}: {question.question}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              {question.type}
                            </span>
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              {question.points} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Question Content Based on Type */}
                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-300 font-medium">Options:</div>
                          <div className="space-y-2">
                            {question.options.map((option: any, optIndex: number) => (
                              <div 
                                key={optIndex} 
                                className={`p-2 rounded-lg border ${
                                  option.isCorrect 
                                    ? 'bg-green-900/30 border-green-500/50 text-green-200' 
                                    : 'bg-gray-800/30 border-gray-600 text-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                    option.isCorrect 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-600 text-gray-400'
                                  }`}>
                                    {String.fromCharCode(65 + optIndex)} {/* A, B, C, D */}
                                  </span>
                                  <span className="flex-1">{option.text}</span>
                                  {option.isCorrect && (
                                    <span className="text-green-400 text-xs font-medium">✓ Correct</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {question.type === 'true-false' && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-300 font-medium">Correct Answer:</div>
                          <div className="p-2 bg-green-900/30 border border-green-500/50 rounded-lg">
                            <span className="text-green-200 font-medium capitalize">{question.correctAnswer}</span>
                          </div>
                        </div>
                      )}



                      {/* Explanation */}
                      {question.explanation && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-300 font-medium">Explanation:</div>
                          <div className="p-2 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                            <span className="text-purple-200 text-sm">{question.explanation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Attendance Dialog */}
    <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text flex items-center">
            <Clock className="w-6 h-6 mr-2" />
            Mark Attendance
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Mark attendance for {selectedCourseForAttendance?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Select Student *</Label>
            <Select
              value={attendanceForm.studentId}
              onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, studentId: value }))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  // Use enrolled students if available, otherwise fall back to available students
                  const studentsToShow = (enrolledStudents && enrolledStudents.length > 0) ? enrolledStudents : availableStudents
                  
                  return studentsToShow && studentsToShow.length > 0 ? (
                    studentsToShow.map((student: any) => (
                      <SelectItem key={student._id || student.id} value={student._id || student.id}>
                        {student.name || student.studentName} ({student.email || student.studentEmail})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled className="text-gray-500">
                      No students available
                    </SelectItem>
                  )
                })()}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Attendance Status *</Label>
            <Select
              value={attendanceForm.status}
              onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Present
                  </div>
                </SelectItem>
                <SelectItem value="absent">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    Absent
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Session Title</Label>
            <Input
              value={attendanceForm.sessionTitle}
              onChange={(e) => setAttendanceForm(prev => ({ ...prev, sessionTitle: e.target.value }))}
              placeholder="e.g., Introduction to React"
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Session Description</Label>
            <Textarea
              value={attendanceForm.sessionDescription}
              onChange={(e) => setAttendanceForm(prev => ({ ...prev, sessionDescription: e.target.value }))}
              placeholder="Brief description of the session..."
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Date & Time *</Label>
            <Input
              type="datetime-local"
              value={attendanceForm.scheduledDate}
              onChange={(e) => setAttendanceForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Teacher Notes</Label>
            <Textarea
              value={attendanceForm.teacherNotes}
              onChange={(e) => setAttendanceForm(prev => ({ ...prev, teacherNotes: e.target.value }))}
              placeholder="Any additional notes about the student's attendance..."
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAttendanceDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={markAttendance}
              disabled={!attendanceForm.studentId}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Clock className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>

      {/* Submissions Modal */}
      <Dialog open={showSubmissionsModal} onOpenChange={setShowSubmissionsModal}>
        <DialogContent className="bg-gray-900 border-gray-700 w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Assignment Submissions
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedAssignment ? `Viewing submissions for "${selectedAssignment.title}"` : 'Loading...'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Assignment Details */}
            {selectedAssignment && (
              <div className="p-4 glass-card rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Subject</p>
                    <p className="text-white font-medium">{selectedAssignment.subject}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Type</p>
                    <p className="text-white font-medium capitalize">{selectedAssignment.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Points</p>
                    <p className="text-white font-medium">{selectedAssignment.points}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Due Date</p>
                    <p className="text-white font-medium">
                      {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submissions List */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Student Submissions ({submissions.length})
              </h3>
              
              {loadingSubmissions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading submissions...</p>
                </div>
              ) : submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((submission, index) => (
                    <div key={index} className="p-4 glass-card rounded-lg hover:bg-white/5 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {submission.studentName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{submission.studentName}</h4>
                            <p className="text-sm text-gray-400">{submission.studentEmail}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Score</p>
                            <p className={`font-bold text-lg ${
                              submission.score >= 90 ? 'text-green-400' :
                              submission.score >= 80 ? 'text-blue-400' :
                              submission.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {submission.score}%
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Points Earned</p>
                            <p className="font-bold text-lg text-purple-400">
                              {submission.pointsEarned}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Submitted</p>
                            <p className="text-white text-sm">
                              {new Date(submission.completedAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(submission.completedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No submissions yet</p>
                  <p className="text-gray-500 text-sm mt-2">Students haven't submitted this assignment yet.</p>
                </div>
              )}
            </div>

            {/* Summary Statistics */}
            {submissions.length > 0 && (
              <div className="p-4 glass-card rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {submissions.length}
                    </p>
                    <p className="text-gray-400 text-sm">Total Submissions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)}%
                    </p>
                    <p className="text-gray-400 text-sm">Average Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">
                      {Math.round(submissions.reduce((sum, s) => sum + s.pointsEarned, 0) / submissions.length)}
                    </p>
                    <p className="text-gray-400 text-sm">Avg Points Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">
                      {Math.max(...submissions.map(s => s.score))}%
                    </p>
                    <p className="text-gray-400 text-sm">Highest Score</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowSubmissionsModal(false)}
              className="border-gray-600 text-gray-300 hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
