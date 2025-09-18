"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { apiCall } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { ProgressRing } from "@/components/ui/progress-ring"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FloatingParticles } from "@/components/ui/floating-particles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatDialog } from "@/components/ui/chat-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  TrendingUp,
  Target,
  CalendarIcon,
  Star,
  Trophy,
  Zap,
  CheckCircle,
  Sparkles,
  Flame,
  TrendingDown,
  ArrowUp,
  Minus,
  Bell,
  Settings,
  LogOut,
  BookOpen,
  Clock,
  Crown,
  Brain,
  Medal,
  LineChart,
  PieChart,
  CreditCard,
  ShoppingCart,
  Phone,
  Video,
  MessageCircle,
  BadgeIcon as IdCard,
  Users,
} from "lucide-react"

export default function StudentDashboard() {
  // All hooks at the top
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [animatedStats, setAnimatedStats] = useState({
    level: 0,
    points: 0,
    completedAssignments: 0,
    streak: 0,
    rank: 0,
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showCourseDialog, setShowCourseDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [studentId, setStudentId] = useState("")
  const [purchasedCourses, setPurchasedCourses] = useState<any[]>([])
  // Add state for available courses
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  // Add state for profile dialog
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  // Add state for edit mode and form
  const [editProfile, setEditProfile] = useState(false)
  const [editForm, setEditForm] = useState({ name: user?.name || '', email: user?.email || '' })
  // Add state for chat dialog
  const [showChatDialog, setShowChatDialog] = useState(false)
  
  // Add state for mentors
  const [mentors, setMentors] = useState<any[]>([])
  const [loadingMentors, setLoadingMentors] = useState(false)
  


  // Quiz taking state
  const [currentQuiz, setCurrentQuiz] = useState<any>(null)
  const [quizAnswers, setQuizAnswers] = useState<any>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizTimeLeft, setQuizTimeLeft] = useState(0)
  const [quizTimer, setQuizTimer] = useState<NodeJS.Timeout | null>(null)
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null)

  // File upload state for homework
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [currentHomework, setCurrentHomework] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Student data state
  const [studentData, setStudentData] = useState<{
    level: number;
    points: number;
    nextLevelPoints: number;
    completedAssignments: number;
    totalAssignments: number;
    currentStreak: number;
    weeklyGoal: number;
    completedThisWeek: number;
    globalRank: number;
    classRank: number;
    progressPercentage: number;
    levelProgress: number;
    attendance: number;
  }>({
    level: 1,
    points: 0,
    nextLevelPoints: 100,
    completedAssignments: 0,
    totalAssignments: 0,
    currentStreak: 0,
    weeklyGoal: 5,
    completedThisWeek: 0,
    globalRank: 0,
    classRank: 0,
    progressPercentage: 0,
    levelProgress: 0,
    attendance: 85
  })



  // Add state for assignments
  const [availableAssignments, setAvailableAssignments] = useState<any[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  



  const fetchUserAndStudentData = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      console.log('Student Dashboard: Token exists:', !!token)
      console.log('Student Dashboard: Token preview:', token ? token.substring(0, 20) + '...' : 'No token')
      
      if (!token) {
        setError("Not authenticated. Please log in.")
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        setLoading(false)
        return
      }
      
      // Fetch user data
      console.log('Student Dashboard: Fetching user data...')
      const userResponse = await apiCall("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('Student Dashboard: User response status:', userResponse.status)
      const userData = await userResponse.json()
      console.log('Student Dashboard: User data response:', userData)
      
      if (userResponse.ok && userData.success) {
        setUser(userData.data)
        
        // Fetch student dashboard data
        const studentResponse = await apiCall("/api/students/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const studentData = await studentResponse.json()
        
        if (studentResponse.ok && studentData.success) {
          setStudentData(studentData.data.student)
          // Update animated stats with real data
          setAnimatedStats({
            level: studentData.data.student.level,
            points: studentData.data.student.totalPoints,
            completedAssignments: studentData.data.student.completedAssignments,
            streak: studentData.data.student.currentStreak,
            rank: studentData.data.student.globalRank,
          })
        } else {
          console.error("Failed to fetch student data:", studentData.message)
        }

        

        // Fetch assignment data
        await fetchAssignmentData(token)
        
        // Fetch available courses
        await fetchAvailableCourses(token)
        
        // Fetch enrolled courses
        await fetchEnrolledCourses(token)
      } else {
        console.log('Student Dashboard: Authentication failed:', userData)
        // If authentication failed, clear invalid token and redirect to login
        if (userResponse.status === 401 || userData.message?.includes('Invalid token') || userData.message?.includes('Unauthorized')) {
          console.log('Student Dashboard: Clearing invalid token and redirecting to login')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          setError("Session expired. Redirecting to login...")
        } else {
          setError(userData.message || "Failed to fetch user data.")
        }
      }
    } catch (err) {
      console.error('Student Dashboard: Error in fetchUserAndStudentData:', err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function AttendanceBySubject({ studentId }: { studentId: string }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [subjects, setSubjects] = useState<Array<{ subject: string; total: number; present: number; absent: number; percentage: number }>>([])
    const [hasFetched, setHasFetched] = useState(false)

    useEffect(() => {
      const fetchSummary = async () => {
        if (!studentId) return
        // Avoid hard flicker if we already have data
        if (subjects.length === 0) setLoading(true)
        setError("")
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
          const res = await apiCall(`/api/attendance/student/${studentId}/subjects-summary`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          })
          const data = await res.json()
          if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load attendance')
          setSubjects(data.data.subjects || [])
          setHasFetched(true)
        } catch (e: any) {
          setError(e.message || 'Failed to load attendance')
        } finally {
          setLoading(false)
        }
      }
      fetchSummary()
    }, [studentId])

    if (!studentId) {
      return <div className="text-gray-400">Student not loaded yet.</div>
    }

    if (loading) {
      return (
        <div className="space-y-3">
          <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
          <div className="h-40 w-full bg-white/5 rounded animate-pulse" />
        </div>
      )
    }

    if (error) {
      return <div className="text-red-400">{error}</div>
    }

    if (subjects.length === 0 && hasFetched) {
      return <div className="text-gray-400">No attendance records found.</div>
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-200">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="py-2 pr-4">Subject</th>
              <th className="py-2 pr-4">Present</th>
              <th className="py-2 pr-4">Absent</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.subject} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 pr-4 font-medium text-white">{s.subject}</td>
                <td className="py-2 pr-4 text-green-300">{s.present}</td>
                <td className="py-2 pr-4 text-red-300">{s.absent}</td>
                <td className="py-2 pr-4">{s.total}</td>
                <td className="py-2 pr-4 font-semibold">{s.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  useEffect(() => {
    fetchUserAndStudentData()
    fetchMentors()
  }, [])



  const fetchAssignmentData = async (token: string) => {
    setLoadingAssignments(true)
    try {
      // Fetch available assignments
      const availableResponse = await apiCall("/api/students/assignments/available", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const availableData = await availableResponse.json()

      if (availableResponse.ok && availableData.success) {
        console.log("Available assignments:", availableData.data.assignments)
        setAvailableAssignments(availableData.data.assignments)
      }

      // Fetch assignment history
      const historyResponse = await apiCall("/api/students/assignments/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const historyData = await historyResponse.json()

      if (historyResponse.ok && historyData.success) {
        setAssignmentHistory(historyData.data.assignments)
      }
    } catch (error) {
      console.error("Failed to fetch assignment data:", error)
    } finally {
      setLoadingAssignments(false)
    }
  }

  const fetchAvailableCourses = async (token: string) => {
    setLoadingCourses(true)
    try {
      const response = await apiCall("/api/students/courses/available", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setAvailableCourses(data.data.courses)
      } else {
        console.error("Failed to fetch available courses:", data.message)
      }
    } catch (error) {
      console.error("Failed to fetch available courses:", error)
    } finally {
      setLoadingCourses(false)
    }
  }



  const fetchEnrolledCourses = async (token: string) => {
    try {
      const response = await apiCall("/api/enrollments/my-courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setPurchasedCourses(data.data.courses)
      } else {
        console.error('Failed to fetch enrolled courses:', data.message)
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
    }
  }

  const fetchMentors = async () => {
    setLoadingMentors(true)
    try {
      const response = await apiCall("/api/mentors", {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log("Mentors fetched successfully:", data.data.mentors)
          setMentors(data.data.mentors || [])
        }
      } else {
        console.error("Failed to fetch mentors:", response.status)
      }
    } catch (error) {
      console.error("Error fetching mentors:", error)
    } finally {
      setLoadingMentors(false)
    }
  }

  const handleAssignmentSubmit = async (assignment: any) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      // Validate assignment data
      if (!assignment.id || !assignment.title || !assignment.points) {
        setError("Invalid assignment data. Please try again.")
        return
      }

      // For now, simulate assignment submission with a score
      const score = Math.floor(Math.random() * 30) + 70 // Random score between 70-100
      const pointsEarned = Math.floor((score / 100) * assignment.points)

      console.log("Submitting assignment:", {
        assignmentId: assignment.id,
        title: assignment.title,
        score,
        pointsEarned,
      })

      const response = await apiCall("/api/students/assignments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId: assignment.id,
          title: assignment.title,
          score,
          pointsEarned,
          type: assignment.type || 'assignment',
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Show success message
        setError("") // Clear any previous errors
        toast({
          title: "Assignment Submitted!",
          description: `You earned ${pointsEarned} points with a score of ${score}%`,
          variant: "default",
        })
        // Refresh assignment data
        await fetchAssignmentData(token)
        // Refresh student data
        await fetchUserAndStudentData()
      } else {
        setError(data.message || "Failed to submit assignment")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  // Quiz taking functions
  const startQuiz = (assignment: any) => {
    if (assignment.type === 'quiz' && assignment.questions && assignment.questions.length > 0) {
      setCurrentQuiz(assignment)
      setQuizAnswers({})
      setCurrentQuestionIndex(0)
      setQuizScore(0)
      setQuizCompleted(false)
      setShowQuizModal(true)
      
      // Set timer if assignment has time limit (default 30 minutes)
      // Ensure timeLimit is a valid positive number
      let timeLimit = 30 * 60 // Default 30 minutes in seconds
      
      if (assignment.timeLimit !== undefined && assignment.timeLimit !== null) {
        const assignmentTimeLimit = parseInt(assignment.timeLimit)
        if (!isNaN(assignmentTimeLimit) && assignmentTimeLimit > 0) {
          timeLimit = assignmentTimeLimit
        }
      }
      
      console.log('Quiz Debug: assignment.timeLimit (raw):', assignment.timeLimit)
      console.log('Quiz Debug: assignment.timeLimit (type):', typeof assignment.timeLimit)
      console.log('Quiz Debug: calculated timeLimit:', timeLimit)
      console.log('Quiz Debug: assignment object keys:', Object.keys(assignment))
      console.log('Quiz Debug: assignment created:', assignment.createdAt)
      console.log('Quiz Debug: assignment id:', assignment.id || assignment._id)
      
      // Ensure timeLimit is reasonable (between 1 minute and 3 hours)
      if (timeLimit < 60) {
        console.log('Quiz Debug: timeLimit too small, setting to 30 minutes')
        timeLimit = 30 * 60
      } else if (timeLimit > 180 * 60) {
        console.log('Quiz Debug: timeLimit too large, setting to 3 hours')
        timeLimit = 180 * 60
      }
      
      setQuizTimeLeft(timeLimit)
      setQuizStartTime(Date.now()) // Record when quiz started
      
      // Add a small delay before starting timer to prevent immediate submission
      setTimeout(() => {
        console.log('Quiz Debug: Starting timer with', timeLimit, 'seconds (after delay)')
        // Start timer
        const timer = setInterval(() => {
          setQuizTimeLeft((prev) => {
            // Prevent auto-submission if quiz was started less than 10 seconds ago
            const timeElapsed = (Date.now() - (quizStartTime || Date.now())) / 1000
            if (prev <= 1 && timeElapsed >= 10) {
              console.log('Quiz Debug: Timer expired after', timeElapsed, 'seconds, auto-submitting')
              clearInterval(timer)
              submitQuiz()
              return 0
            } else if (prev <= 1 && timeElapsed < 10) {
              console.log('Quiz Debug: Timer would expire but quiz just started, extending by 30 minutes')
              return 30 * 60 // Reset to 30 minutes if quiz just started
            }
            return prev - 1
          })
        }, 1000)
        setQuizTimer(timer)
      }, 100) // Small delay to ensure state is properly set
    } else if (assignment.type === 'homework') {
      // For homework assignments, use file upload
      startHomework(assignment)
    } else {
      // For other assignments, use the old submission method
      handleAssignmentSubmit(assignment)
    }
  }

  const handleQuizAnswer = (questionIndex: number, answer: any) => {
    setQuizAnswers((prev: any) => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateQuizScore = () => {
    let correctAnswers = 0
    const totalQuestions = currentQuiz.questions.length

    currentQuiz.questions.forEach((question: any, index: number) => {
      const userAnswer = quizAnswers[index]
      
      if (!userAnswer) return

      switch (question.type) {
        case 'multiple-choice':
          const correctOptionIndex = question.options.findIndex((opt: any) => opt.isCorrect)
          if (userAnswer === correctOptionIndex) {
            correctAnswers++
          }
          break
        case 'true-false':
          if (userAnswer === question.correctAnswer) {
            correctAnswers++
          }
          break
        case 'short-answer':
          // For short answer, check if keywords match (simple implementation)
          const userAnswerLower = userAnswer.toLowerCase()
          const hasKeyword = question.keywords?.some((keyword: string) => 
            userAnswerLower.includes(keyword.toLowerCase())
          )
          if (hasKeyword) {
            correctAnswers++
          }
          break
      }
    })

    return Math.round((correctAnswers / totalQuestions) * 100)
  }

  const submitQuiz = async () => {
    // Prevent accidental immediate submission
    const timeElapsed = quizStartTime ? (Date.now() - quizStartTime) / 1000 : 0
    console.log('Quiz Debug: submitQuiz called after', timeElapsed, 'seconds')
    
    if (timeElapsed < 5) {
      console.log('Quiz Debug: Preventing immediate submission, quiz just started')
      toast({
        title: "Quiz Just Started",
        description: "Please wait a moment before submitting the quiz.",
        variant: "destructive",
      })
      return
    }
    
    if (quizTimer) {
      clearInterval(quizTimer)
      setQuizTimer(null)
    }

    const score = calculateQuizScore()
    const pointsEarned = Math.floor((score / 100) * currentQuiz.points)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      // Validate quiz data
      if (!currentQuiz.id || !currentQuiz.title || !currentQuiz.points) {
        setError("Invalid quiz data. Please try again.")
        return
      }

      console.log("Submitting quiz:", {
        assignmentId: currentQuiz.id,
        title: currentQuiz.title,
        score,
        pointsEarned,
      })

      const response = await apiCall("/api/students/assignments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId: currentQuiz.id,
          title: currentQuiz.title,
          score,
          pointsEarned,
          type: 'quiz',
          answers: quizAnswers,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setQuizScore(score)
        setQuizCompleted(true)
        // Clear any previous errors
        setError("")
        toast({
          title: "Quiz Completed!",
          description: `You earned ${pointsEarned} points with a score of ${score}%`,
          variant: "default",
        })
        // Refresh assignment data
        await fetchAssignmentData(token)
        // Refresh student data
        await fetchUserAndStudentData()
      } else {
        setError(data.message || "Failed to submit quiz")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const closeQuizModal = () => {
    if (quizTimer) {
      clearInterval(quizTimer)
      setQuizTimer(null)
    }
    setShowQuizModal(false)
    setCurrentQuiz(null)
    setQuizAnswers({})
    setCurrentQuestionIndex(0)
    setQuizScore(0)
    setQuizCompleted(false)
    setQuizTimeLeft(0)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Generate unique Student ID
  useEffect(() => {
    let storedStudentId = localStorage.getItem("studentId")
    if (!storedStudentId) {
      storedStudentId = `CL${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
      localStorage.setItem("studentId", storedStudentId)
    }
    setStudentId(storedStudentId)

    // Load enrolled courses from database
    const token = localStorage.getItem("token")
    if (token) {
      fetchEnrolledCourses(token)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        level: studentData.level,
        points: studentData.points,
        completedAssignments: studentData.completedAssignments,
        streak: studentData.currentStreak,
        rank: studentData.globalRank,
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleMentorBooking = (mentor: any) => {
    setSelectedMentor(mentor)
    setShowBookingDialog(true)
  }

  const handleCourseEnroll = (course: any) => {
    setSelectedCourse(course)
    setShowCourseDialog(true)
  }

  const handleCoursePurchase = async () => {
    if (selectedCourse) {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error('No token found')
          return
        }

        const response = await apiCall("/api/enrollments/enroll", {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: selectedCourse.id,
            paymentInfo: selectedCourse.isFree ? null : {
              method: 'credit_card',
              transactionId: `TXN-${Date.now()}`
            }
          }),
        })

        const data = await response.json()
        if (response.ok && data.success) {
          // Refresh enrolled courses from database
          await fetchEnrolledCourses(token)
          setShowCourseDialog(false)
          // Show success message
          console.log('Successfully enrolled in course')
        } else {
          console.error('Failed to enroll:', data.message)
          // Show user-friendly error message
          alert(`Enrollment failed: ${data.message}`)
        }
      } catch (error) {
        console.error('Error enrolling in course:', error)
      }
    }
  }

  const initializeTestData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await apiCall("/api/students/init-test-data", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (response.ok && data.success) {
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to initialize test data:', error)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4 text-green-400" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />
    }
  }

  // File upload functions for homework
  const startHomework = (assignment: any) => {
    if (assignment.type === 'homework') {
      setCurrentHomework(assignment)
      setUploadedFiles([])
      setUploadProgress(0)
      setShowHomeworkModal(true)
    } else {
      // For non-homework assignments, use the old submission method
      handleAssignmentSubmit(assignment)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please upload PDF, Word, or image files.' }
    }

    return { valid: true }
  }

  const submitHomework = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one file")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated. Please log in.")
        return
      }

      // Validate homework data
      if (!currentHomework.id || !currentHomework.title || !currentHomework.points) {
        setError("Invalid homework data. Please try again.")
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('assignmentId', currentHomework.id)
      formData.append('title', currentHomework.title)
      formData.append('type', 'homework')
      formData.append('points', currentHomework.points.toString())

      // Add files to FormData
      uploadedFiles.forEach((file, index) => {
        formData.append(`files`, file)
      })

      console.log("Submitting homework:", {
        assignmentId: currentHomework.id,
        title: currentHomework.title,
        filesCount: uploadedFiles.length,
        files: uploadedFiles.map(f => f.name)
      })

      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log('FormData entry:', key, value);
      }

      const response = await apiCall("/api/students/assignments/submit-homework", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Clear any previous errors
        setError("")
        toast({
          title: "Homework Submitted!",
          description: `Successfully uploaded ${uploadedFiles.length} file(s)`,
          variant: "default",
        })
        // Refresh assignment data
        await fetchAssignmentData(token)
        // Refresh student data
        await fetchUserAndStudentData()
        // Close modal
        setShowHomeworkModal(false)
        setCurrentHomework(null)
        setUploadedFiles([])
        setUploadProgress(0)
      } else {
        console.error('Homework submission failed:', data);
        setError(data.message || data.error || "Failed to submit homework")
      }
    } catch (error) {
      console.error('Homework submission error:', error);
      setError("Network error. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const closeHomeworkModal = () => {
    setShowHomeworkModal(false)
    setCurrentHomework(null)
    setUploadedFiles([])
    setUploadProgress(0)
    setIsUploading(false)
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

  const aiAssessmentResults = {
    overallScore: 87,
    strengths: [
      { area: "Logical Reasoning", score: 95, description: "Exceptional problem-solving abilities" },
      { area: "Analytical Thinking", score: 92, description: "Strong data interpretation skills" },
      { area: "Technical Aptitude", score: 88, description: "Quick to learn new technologies" },
      { area: "Creative Problem Solving", score: 85, description: "Innovative approach to challenges" },
    ],
    weaknesses: [
      {
        area: "Public Speaking",
        score: 62,
        description: "Needs improvement in presentation skills",
        improvement: "Practice with Toastmasters or join speaking clubs",
      },
      {
        area: "Team Leadership",
        score: 68,
        description: "Developing leadership capabilities",
        improvement: "Take on small team projects to build experience",
      },
      {
        area: "Time Management",
        score: 71,
        description: "Room for better organization",
        improvement: "Use productivity tools and time-blocking techniques",
      },
    ],
    recommendedCareer: "AI/ML Engineer",
    careerMatch: 94,
  }

  const performanceData = {
    weeklyProgress: [] as any[],
    subjectPerformance: [] as any[],
  }

  const completedTests: any[] = []

  const leaderboard: any[] = []


  const courses = availableCourses



  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced Header */}
      <header className="relative z-10 glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center neon-glow float-animation hover-scale">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Shaping Career</h1>
              <p className="text-sm text-gray-400 font-medium">Student Dashboard</p>
            </div>
          </Link>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              {/* Chat Icon */}
              <div 
                className="cursor-pointer hover-lift"
                onClick={() => setShowChatDialog(true)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center border-2 border-green-400/30 hover:border-green-400/50 transition-all duration-200">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Profile Dialog Trigger */}
              <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                <DialogTrigger asChild>
                  <div className="cursor-pointer" onClick={() => setShowProfileDialog(true)}>
                    <Avatar className="w-16 h-16 border-3 border-blue-500/30 hover-lift">
                      <AvatarImage src="/placeholder.svg?height=64&width=64" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                        {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'ST'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
                  <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl gradient-text flex items-center justify-center">
                      <Users className="w-6 h-6 mr-2" />
                      Profile Details
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 px-4">
                    {/* Combined Profile Information */}
                    <div className="p-6 glass-card rounded-lg border border-white/10">
                      <div className="flex flex-col items-center space-y-4 mb-6">
                        <Avatar className="w-20 h-20 border-2 border-blue-500/30">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                            {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'ST'}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="space-y-4">
                        {editProfile ? (
                          <form className="space-y-4" onSubmit={e => { e.preventDefault(); setUser({ ...user, ...editForm }); setEditProfile(false); }}>
                            <div>
                              <label className="block text-gray-400 mb-2 text-center">Full Name</label>
                              <input
                                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none transition-colors text-center"
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 mb-2 text-center">Email Address</label>
                              <input
                                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 outline-none transition-colors text-center"
                                value={editForm.email}
                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                required
                              />
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Save Changes
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setEditProfile(false)} className="border-gray-600 text-gray-300 hover:bg-white/10">
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="text-center">
                              <label className="block text-gray-400 mb-1">Full Name</label>
                              <p className="text-white font-medium">{user.name}</p>
                            </div>
                            <div className="text-center">
                              <label className="block text-gray-400 mb-1">Email Address</label>
                              <p className="text-white font-medium text-sm">{user.email}</p>
                            </div>
                            <div className="text-center">
                              <label className="block text-gray-400 mb-1">Student ID</label>
                              <p className="text-white font-medium font-mono">{studentId}</p>
                            </div>
                            
                            {/* Academic Information Section */}

                            
                            <Button 
                              onClick={() => { setEditForm({ name: user.name, email: user.email }); setEditProfile(true); }}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              

              
              <div>
                <p className="font-medium text-white text-xl">{user.name}</p>
              </div>

              <Button variant="ghost" size="sm" className="hover-scale">
                <LogOut className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            top: "10%",
            left: "10%",
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        ></div>
        <div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            bottom: "10%",
            right: "10%",
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
          }}
        ></div>
      </div>

            <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Enhanced Welcome Section with Calendar on the right */}
        <div className="mb-12 slide-up-animation flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-6xl font-bold gradient-text mb-4 text-glow">Welcome back, {user.name}!</h2>
            <p className="text-2xl text-gray-300 mb-6">Continue your journey to career excellence</p>
            
            {/* Student Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="glass-card border border-white/10 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <IdCard className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Student Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Student ID:</span>
                    <span className="text-white font-mono">{studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Level:</span>
                    <span className="text-blue-400 font-semibold">{studentData.level || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Points:</span>
                    <span className="text-yellow-400 font-semibold">{studentData.points?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card border border-white/10 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <BookOpen className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Learning Progress</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assignments:</span>
                    <span className="text-white">{studentData.completedAssignments || 0}/{studentData.totalAssignments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completion Rate:</span>
                    <span className="text-green-400 font-semibold">
                      {studentData.totalAssignments > 0 ? Math.round((studentData.completedAssignments / studentData.totalAssignments) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Enrollment Status */}
            {purchasedCourses.length > 0 && (
              <div className="glass-card border border-green-500/20 p-4 rounded-lg bg-green-500/5">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Active Enrollments</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">
                    {purchasedCourses.length} Course{purchasedCourses.length > 1 ? "s" : ""} Enrolled
                  </span>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Active
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Latest: {purchasedCourses[purchasedCourses.length - 1]?.title}
                </div>
              </div>
            )}

            {/* Test Data Initialization (Development Only) */}
            {process.env.NODE_ENV === 'development' && (!studentData.points || studentData.points === 0) && (
              <div className="mt-4">
                <Button 
                  onClick={initializeTestData}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  🚀 Initialize Test Data
                </Button>
              </div>
            )}
          </div>
          
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="glass-card-hover group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="pt-8 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter end={animatedStats.level || 1} className="text-5xl font-bold text-white" />
                  <p className="text-gray-400 font-medium">Current Level</p>
                </div>
                <ProgressRing progress={studentData.levelProgress || 0} size={80}>
                  <Target className="w-8 h-8 text-blue-400" />
                </ProgressRing>
              </div>
            </CardContent>
          </Card>


          <Card className="glass-card-hover group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="pt-8 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <AnimatedCounter end={animatedStats.completedAssignments || 0} className="text-5xl font-bold text-white" />
                  <p className="text-gray-400 font-medium">Completed</p>
                </div>
                <CheckCircle className="w-16 h-16 text-green-400 group-hover:neon-glow transition-all duration-300" />
              </div>
            </CardContent>
          </Card>

          
        </div>

        <Tabs defaultValue="performance" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 p-1">
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
              Performance
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-cyan-600">
              Attendance
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-green-600">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="mentors" className="data-[state=active]:bg-pink-600">
              Mentors
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-indigo-600">
              Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text flex items-center">
                  <LineChart className="w-6 h-6 mr-2" />
                  Assignment Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Quiz Performance Line Graph */}
                {assignmentHistory.filter(assignment => assignment.type === 'quiz').length > 0 ? (
                  <div className="mb-6">
                    <div className="p-4 glass-card rounded-lg">
                      <h4 className="font-semibold text-white text-lg mb-4">Quiz Performance Trend</h4>
                      
                      {/* Quiz Statistics Summary */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 glass-card rounded-lg">
                          <p className="text-sm text-gray-400">Total Quizzes</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {assignmentHistory.filter(assignment => assignment.type === 'quiz').length}
                          </p>
                        </div>
                        <div className="text-center p-3 glass-card rounded-lg">
                          <p className="text-sm text-gray-400">Average Score</p>
                          <p className="text-2xl font-bold text-green-400">
                            {Math.round(
                              assignmentHistory
                                .filter(assignment => assignment.type === 'quiz')
                                .reduce((sum, assignment) => sum + assignment.score, 0) / 
                                assignmentHistory.filter(assignment => assignment.type === 'quiz').length
                            )}%
                          </p>
                        </div>
                        <div className="text-center p-3 glass-card rounded-lg">
                          <p className="text-sm text-gray-400">Total Points</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {assignmentHistory
                              .filter(assignment => assignment.type === 'quiz')
                              .reduce((sum, assignment) => sum + assignment.pointsEarned, 0)}
                          </p>
                        </div>
                      </div>

                      {/* Line Chart */}
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart
                            data={assignmentHistory
                              .filter(assignment => assignment.type === 'quiz')
                              .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
                              .map(assignment => ({
                                name: assignment.title,
                                score: assignment.score,
                                date: new Date(assignment.completedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                }),
                                points: assignment.pointsEarned
                              }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#9CA3AF"
                              fontSize={12}
                            />
                            <YAxis 
                              stroke="#9CA3AF"
                              fontSize={12}
                              domain={[0, 100]}
                              tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }}
                              labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#8B5CF6" 
                              strokeWidth={3}
                              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm text-gray-400">
                          Quiz scores over time - hover over points to see details
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="p-4 glass-card rounded-lg text-center">
                      <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No quiz assignments completed yet</p>
                      <p className="text-gray-500 text-sm mt-2">Complete quiz assignments to see your performance trend here.</p>
                    </div>
                  </div>
                )}

                {/* Assignment Scores */}
                {assignmentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {assignmentHistory.map((assignment, index) => (
                      <div key={index} className="p-4 glass-card rounded-lg hover:bg-white/5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white text-lg">{assignment.title}</h4>
                            <p className="text-sm text-gray-400">
                              {new Date(assignment.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg px-3 py-1">
                                {assignment.score}%
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                +{assignment.pointsEarned} pts
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Progress value={assignment.score} className="h-3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <LineChart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No completed assignments yet</p>
                    <p className="text-gray-500 text-sm mt-2">Complete assignments to see your scores here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceBySubject studentId={studentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            {/* Available Assignments */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text flex items-center">
                  <BookOpen className="w-6 h-6 mr-2" />
                  Available Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAssignments ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading assignments...</p>
                  </div>
                ) : availableAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {availableAssignments.map((assignment, index) => (
                      <div key={index} className="p-4 glass-card rounded-lg hover:bg-white/5 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white text-lg">{assignment.title}</h4>
                            <p className="text-sm text-gray-400">{assignment.subject} • {assignment.teacherName}</p>
                            <p className="text-sm text-gray-300 mt-1">{assignment.description}</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            {assignment.points} points
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-400">Due Date</p>
                            <p className="font-medium text-white">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Type</p>
                            <p className="font-medium text-white capitalize">{assignment.type}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                          onClick={() => startQuiz(assignment)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Submit Assignment
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No available assignments</p>
                    <p className="text-gray-500 text-sm mt-2">Teachers will create assignments for you to complete.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment History */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Assignment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAssignments ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading history...</p>
                  </div>
                ) : assignmentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {assignmentHistory.map((assignment, index) => (
                      <div key={index} className="p-4 glass-card rounded-lg hover:bg-white/5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white text-lg">{assignment.title}</h4>
                            <p className="text-sm text-gray-400">
                              {new Date(assignment.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg px-3 py-1">
                                {assignment.score}%
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                +{assignment.pointsEarned} pts
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Progress value={assignment.score} className="h-3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No completed assignments yet</p>
                    <p className="text-gray-500 text-sm mt-2">Complete assignments to see your history here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="mentors" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-3xl gradient-text flex items-center">
                  <Users className="w-8 h-8 mr-3" />
                  Connect with Expert Mentors
                </CardTitle>
                <p className="text-gray-300 text-lg mt-2">Get personalized guidance from industry professionals</p>
              </CardHeader>
              <CardContent>
                {loadingMentors ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading mentors...</p>
                    </div>
                  </div>
                ) : mentors.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {mentors.map((mentor) => (
                      <Card key={mentor._id || mentor.id} className="glass-card-hover group">
                        <CardContent className="pt-6">
                          <div className="text-center mb-4">
                            <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-blue-500/30">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                                {mentor.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'M'}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-bold text-white text-xl mb-1">{mentor.name}</h3>
                            <p className="text-sm text-gray-400 mb-2">{mentor.title}</p>
                            <div className="flex items-center justify-center space-x-2 mb-3">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                <span className="text-white font-medium">{mentor.stats?.averageRating || 4.5}</span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-400">{mentor.stats?.totalSessions || 0} sessions</span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-300 mb-1">Expertise:</p>
                              <div className="flex flex-wrap gap-1">
                                {mentor.expertise?.slice(0, 3).map((skill: string, index: number) => (
                                  <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                    {skill}
                                  </Badge>
                                )) || <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">General</Badge>}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-300 mb-1">Company:</p>
                              <div className="flex flex-wrap gap-1">
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                  {mentor.company || 'Freelance'}
                                </Badge>
                              </div>
                            </div>

                            <div className="text-sm text-gray-400">
                              <div className="flex items-center mb-1">
                                <Clock className="w-4 h-4 mr-2" />
                                Response: {mentor.responseTime || '< 24 hours'}
                              </div>
                              <div>Experience: {mentor.experience || 'Not specified'}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">${mentor.hourlyRate || 0}</div>
                              <div className="text-xs text-gray-400">per hour</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">Languages:</div>
                              <div className="text-sm text-white">{(mentor.languages || ['English']).join(", ")}</div>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleMentorBooking(mentor)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Book Session
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No mentors available</h3>
                    <p className="text-gray-400">Check back later for expert mentors to guide your journey.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {/* Purchased Courses Section */}
            {purchasedCourses.length > 0 && (
              <Card className="glass-card border-2 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-3xl gradient-text flex items-center">
                    <CheckCircle className="w-8 h-8 mr-3 text-green-400" />
                    Your Enrolled Courses
                  </CardTitle>
                  <p className="text-gray-300 text-lg mt-2">Continue your learning journey</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {purchasedCourses.map((course, index) => (
                      <Card key={index} className="glass-card-hover border border-green-500/20">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-4xl">{course.thumbnail}</div>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Enrolled</Badge>
                          </div>
                          <h3 className="font-bold text-white text-xl mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-400 mb-4">by {course.instructor}</p>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-300">Progress</span>
                              <span className="text-white">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-3" />
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                            <span>Student ID: {course.studentId}</span>
                            <span>Purchased: {new Date(course.purchaseDate).toLocaleDateString()}</span>
                          </div>

                          <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                            Continue Learning
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Courses */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-3xl gradient-text flex items-center">
                  <BookOpen className="w-8 h-8 mr-3" />
                  Courses You Can Purchase
                </CardTitle>
                <p className="text-gray-300 text-lg mt-2">Expand your skills with premium courses</p>
              </CardHeader>
              <CardContent>
                {loadingCourses ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading available courses...</p>
                  </div>
                ) : courses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                                          <Card key={course.id} className="glass-card-hover group relative overflow-hidden">
                        {course.bestseller && (
                          <Badge className="absolute top-4 left-4 bg-orange-500 text-white z-10">Bestseller</Badge>
                        )}
                        {course.popular && (
                          <Badge className="absolute top-4 left-4 bg-purple-500 text-white z-10">Popular</Badge>
                        )}
                        {course.new && <Badge className="absolute top-4 left-4 bg-green-500 text-white z-10">New</Badge>}

                        {/* Price Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          {course.isFree ? (
                            <Badge className="bg-green-500 text-white">Free</Badge>
                          ) : (
                            <Badge className="bg-purple-500 text-white">
                              {course.currency === 'USD' ? '$' : 
                               course.currency === 'EUR' ? '€' : 
                               course.currency === 'GBP' ? '£' : 
                               course.currency === 'INR' ? '₹' : '$'}
                              {course.price}
                            </Badge>
                          )}
                        </div>

                        <CardContent className="pt-6">
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-4">{course.thumbnail}</div>
                          <h3 className="font-bold text-white text-xl mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-400 mb-2">by {course.instructor}</p>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-400">★</span>
                              <span className="text-white">{course.rating}</span>
                              <span className="text-gray-400">({course.students} students)</span>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{course.level}</Badge>
                          </div>

                          <p className="text-sm text-gray-300">{course.description}</p>

                          <div className="flex justify-between text-xs text-gray-400">
                            <div>⏱️ {course.duration}</div>
                            <div>📚 {course.modules} modules</div>
                            {course.certificate && <div>🏆 Certificate</div>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            {course.isFree ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-green-400">Free</span>
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Free Course</Badge>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl font-bold text-white">
                                    {course.currency === 'USD' ? '$' : 
                                     course.currency === 'EUR' ? '€' : 
                                     course.currency === 'GBP' ? '£' : 
                                     course.currency === 'INR' ? '₹' : '$'}
                                    {course.price}
                                  </span>
                                  {course.originalPrice > course.price && (
                                    <span className="text-lg text-gray-400 line-through">
                                      {course.currency === 'USD' ? '$' : 
                                       course.currency === 'EUR' ? '€' : 
                                       course.currency === 'GBP' ? '£' : 
                                       course.currency === 'INR' ? '₹' : '$'}
                                      {course.originalPrice}
                                    </span>
                                  )}
                                </div>
                                {course.originalPrice > course.price && (
                                  <div className="text-xs text-green-400">
                                    Save {course.currency === 'USD' ? '$' : 
                                          course.currency === 'EUR' ? '€' : 
                                          course.currency === 'GBP' ? '£' : 
                                          course.currency === 'INR' ? '₹' : '$'}
                                    {course.originalPrice - course.price}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleCourseEnroll(course)}
                          className={`w-full ${
                            course.isFree 
                              ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          }`}
                        >
                          {course.isFree ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Enroll Free
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Purchase Course
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No courses available</p>
                  <p className="text-gray-500 text-sm mt-2">Teachers will create courses for you to enroll in.</p>
                </div>
              )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mentor Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="glass-card border border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Book a Session with {selectedMentor?.name}</DialogTitle>
            <DialogDescription className="text-gray-300">
              Schedule a personalized mentoring session to accelerate your career growth
            </DialogDescription>
          </DialogHeader>

          {selectedMentor && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 glass-card rounded-lg">
                <Avatar className="w-16 h-16 border-2 border-blue-500/30">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg">
                    {selectedMentor.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedMentor.name}</h3>
                  <p className="text-gray-400">{selectedMentor.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">{selectedMentor.rating}</span>
                    <span className="text-gray-400">• ${selectedMentor.price}/hour</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white mb-2 block">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="glass-card rounded-lg border border-white/20"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Session Type</Label>
                    <Select>
                      <SelectTrigger className="glass-card border-white/20">
                        <SelectValue placeholder="Choose session type" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="career-guidance">Career Guidance</SelectItem>
                        <SelectItem value="technical-review">Technical Review</SelectItem>
                        <SelectItem value="interview-prep">Interview Prep</SelectItem>
                        <SelectItem value="project-feedback">Project Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Preferred Time</Label>
                    <Select>
                      <SelectTrigger className="glass-card border-white/20">
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Session Duration</Label>
                    <Select>
                      <SelectTrigger className="glass-card border-white/20">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="30">30 minutes - ${selectedMentor.price / 2}</SelectItem>
                        <SelectItem value="60">60 minutes - ${selectedMentor.price}</SelectItem>
                        <SelectItem value="90">90 minutes - ${selectedMentor.price * 1.5}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Communication Method</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                        <Video className="w-4 h-4 mr-2" />
                        Video Call
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Call
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Session Goals (Optional)</Label>
                <Textarea
                  placeholder="What would you like to focus on during this session?"
                  className="glass-card border-white/20 text-white placeholder-gray-400"
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingDialog(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Book & Pay ${selectedMentor.price}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Purchase Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="glass-card border border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Purchase Course</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enroll in this course and get lifetime access to all materials
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 glass-card rounded-lg">
                <div className="text-6xl">{selectedCourse.thumbnail}</div>
                <div>
                  <h3 className="font-bold text-white text-xl">{selectedCourse.title}</h3>
                  <p className="text-gray-400">by {selectedCourse.instructor}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">{selectedCourse.rating}</span>
                    <span className="text-gray-400">• {selectedCourse.students} students</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Course Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{selectedCourse.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Level:</span>
                      <span className="text-white">{selectedCourse.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Modules:</span>
                      <span className="text-white">{selectedCourse.modules}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Certificate:</span>
                      <span className="text-green-400">✓ Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lifetime Access:</span>
                      <span className="text-green-400">✓ Yes</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">Pricing</h4>
                  {selectedCourse.isFree ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">Price:</span>
                        <span className="text-2xl font-bold text-green-400">Free</span>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                        <p className="text-sm text-green-300">
                          🎉 This course is completely free! No payment required.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Original Price:</span>
                        <span className="text-gray-400 line-through">${selectedCourse.originalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Discount:</span>
                        <span className="text-green-400">-${selectedCourse.originalPrice - selectedCourse.price}</span>
                      </div>
                      <div className="border-t border-white/20 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-white">${selectedCourse.price}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                    <p className="text-sm text-blue-300">
                      💡 Your unique Student ID ({studentId}) will be linked to this course for tracking progress and
                      certification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 glass-card rounded-lg">
                <h4 className="font-semibold text-white mb-2">What's Included:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>✓ {selectedCourse.modules} comprehensive modules</li>
                  <li>✓ Hands-on projects and exercises</li>
                  <li>✓ Certificate of completion</li>
                  <li>✓ Lifetime access to course materials</li>
                  <li>✓ Access to course community</li>
                  <li>✓ Regular content updates</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCourseDialog(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCoursePurchase}
                  className={`flex-1 ${
                    selectedCourse.isFree 
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {selectedCourse.isFree ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enroll Free
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase for ${selectedCourse.price}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                {currentQuiz?.title}
              </div>
              {quizTimeLeft > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-red-400" />
                  <span className={`text-lg font-mono ${quizTimeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(quizTimeLeft)}
                  </span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {quizCompleted ? 'Quiz completed! Here are your results.' : 'Answer all questions to complete the quiz.'}
            </DialogDescription>
          </DialogHeader>

          {!quizCompleted ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Question {currentQuestionIndex + 1} of {currentQuiz?.questions?.length}</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / (currentQuiz?.questions?.length || 1)) * 100)}%</span>
                </div>
                <Progress 
                  value={((currentQuestionIndex + 1) / (currentQuiz?.questions?.length || 1)) * 100} 
                  className="h-2" 
                />
              </div>

              {/* Current Question */}
              {currentQuiz?.questions && currentQuiz.questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <div className="p-4 glass-card rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {(currentQuiz.questions[currentQuestionIndex].type || 'multiple-choice').replace('-', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {currentQuiz.questions[currentQuestionIndex].points} points
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {currentQuiz.questions[currentQuestionIndex].question}
                    </h3>

                    {/* Multiple Choice Question */}
                    {currentQuiz.questions[currentQuestionIndex].type === 'multiple-choice' && (
                      <div className="space-y-3">
                        {currentQuiz.questions[currentQuestionIndex].options?.map((option: any, optionIndex: number) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              quizAnswers[currentQuestionIndex] === optionIndex
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                            }`}
                            onClick={() => handleQuizAnswer(currentQuestionIndex, optionIndex)}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                quizAnswers[currentQuestionIndex] === optionIndex
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-400'
                              }`}>
                                {quizAnswers[currentQuestionIndex] === optionIndex && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className="text-white">{option.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False Question */}
                    {currentQuiz.questions[currentQuestionIndex].type === 'true-false' && (
                      <div className="space-y-3">
                        <div
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            quizAnswers[currentQuestionIndex] === true
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                          }`}
                          onClick={() => handleQuizAnswer(currentQuestionIndex, true)}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                              quizAnswers[currentQuestionIndex] === true
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-400'
                            }`}>
                              {quizAnswers[currentQuestionIndex] === true && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="text-white">True</span>
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            quizAnswers[currentQuestionIndex] === false
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                          }`}
                          onClick={() => handleQuizAnswer(currentQuestionIndex, false)}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                              quizAnswers[currentQuestionIndex] === false
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-400'
                            }`}>
                              {quizAnswers[currentQuestionIndex] === false && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="text-white">False</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Short Answer Question */}
                    {currentQuiz.questions[currentQuestionIndex].type === 'short-answer' && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your answer here..."
                          value={quizAnswers[currentQuestionIndex] || ''}
                          onChange={(e) => handleQuizAnswer(currentQuestionIndex, e.target.value)}
                          className="glass-card border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
                        />
                        {currentQuiz.questions[currentQuestionIndex].maxLength && (
                          <div className="text-sm text-gray-400">
                            Maximum {currentQuiz.questions[currentQuestionIndex].maxLength} characters
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="border-gray-600 text-gray-300 hover:bg-white/10"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {currentQuestionIndex < (currentQuiz?.questions?.length || 0) - 1 ? (
                    <Button
                      onClick={nextQuestion}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      onClick={submitQuiz}
                      className="bg-gradient-to-r from-green-600 to-blue-600"
                    >
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Quiz Results */
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {quizScore >= 80 ? '🎉' : quizScore >= 60 ? '👍' : '📚'}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Quiz Completed!
                </h3>
                <div className="text-4xl font-bold gradient-text mb-4">
                  {quizScore}%
                </div>
                <p className="text-gray-300">
                  {quizScore >= 80 ? 'Excellent work!' : quizScore >= 60 ? 'Good job!' : 'Keep studying!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 glass-card rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{quizScore}%</div>
                  <div className="text-sm text-gray-400">Score</div>
                </div>
                <div className="p-4 glass-card rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.floor((quizScore / 100) * (currentQuiz?.points || 0))}
                  </div>
                  <div className="text-sm text-gray-400">Points Earned</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={closeQuizModal}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
                >
                  Close
                </Button>
                <Button
                  onClick={closeQuizModal}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
                >
                  View Assignment History
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Homework Modal */}
      <Dialog open={showHomeworkModal} onOpenChange={setShowHomeworkModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Submit Homework: {currentHomework?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Upload your homework files. Supported formats: PDF, Word documents, images, and text files.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Assignment Details */}
            <div className="p-4 glass-card rounded-lg">
              <h3 className="font-semibold text-white mb-2">Assignment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subject:</span>
                  <span className="text-white">{currentHomework?.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Points:</span>
                  <span className="text-white">{currentHomework?.points} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Due Date:</span>
                  <span className="text-white">
                    {currentHomework?.dueDate ? new Date(currentHomework.dueDate).toLocaleDateString() : 'No due date'}
                  </span>
                </div>
              </div>
              {currentHomework?.description && (
                <div className="mt-3">
                  <span className="text-gray-400 text-sm">Description:</span>
                  <p className="text-white text-sm mt-1">{currentHomework.description}</p>
                </div>
              )}
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Upload Files</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="text-4xl">📁</div>
                      <div className="text-white font-medium">Click to upload files</div>
                      <div className="text-gray-400 text-sm">
                        PDF, Word, Images, or Text files (Max 10MB each)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => {
                      const validation = validateFile(file)
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 ${
                            validation.valid
                              ? 'border-green-500/30 bg-green-500/10'
                              : 'border-red-500/30 bg-red-500/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {file.type.includes('pdf') ? '📄' : 
                                 file.type.includes('word') ? '📝' : 
                                 file.type.includes('image') ? '🖼️' : '📄'}
                              </div>
                              <div>
                                <div className="text-white font-medium">{file.name}</div>
                                <div className="text-gray-400 text-sm">{formatFileSize(file.size)}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!validation.valid && (
                                <span className="text-red-400 text-sm">{validation.error}</span>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFile(index)}
                                className="border-red-600 text-red-300 hover:bg-red-500/10"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Uploading...</span>
                    <span className="text-white">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={closeHomeworkModal}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={submitHomework}
                disabled={uploadedFiles.length === 0 || isUploading}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Submit Homework
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Chat Dialog */}
      <ChatDialog 
        open={showChatDialog} 
        onOpenChange={setShowChatDialog} 
      />
      
      <Toaster />
    </div>
  )
}
