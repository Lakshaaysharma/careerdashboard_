"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { FloatingParticles } from "@/components/ui/floating-particles"
import {
  Star,
  Lightbulb,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  Rocket,
  Brain,
  ChevronRight,
  Globe,
  Shield,
  Clock,
  Users,
  CheckCircle,
  Briefcase,
  Calendar,
  MessageCircle,
  Video,
  Phone,
  CreditCard,
  ShoppingCart,
  User,
  GraduationCap,
  Code,
  Database,
  Palette,
  BarChart,
  Zap,
  MapPin,
  Languages,
  Heart,
  BookOpen,
  Cpu,
  PieChart,
  Menu,
  X,
} from "lucide-react"

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [studentId, setStudentId] = useState("")
  const [purchasedCourses, setPurchasedCourses] = useState<string[]>([])
  const [bookedMentors, setBookedMentors] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showMentorDialog, setShowMentorDialog] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3)
    }, 6000)

    // Generate unique Student ID
    const generateStudentId = () => {
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      return `CL${timestamp}${random}`
    }

    if (!studentId) {
      setStudentId(generateStudentId())
    }

    return () => clearInterval(interval)
  }, [studentId])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const testimonials = [
    {
      name: "Alex Thompson",
      role: "Software Engineer at Meta",
      content:
        "Shaping Career's AI assessment revealed strengths I didn't know I had. The mentorship program connected me with a Meta engineer who guided me through the interview process. Dream job achieved!",
      rating: 5,
      salary: "$165k",
      image: "AT",
      company: "Meta",
    },
    {
      name: "Priya Patel",
      role: "Data Scientist at Spotify",
      content:
        "The personalized learning path was incredible. I went from zero coding experience to landing a data science role at Spotify in just 8 months. The ROI on this platform is insane.",
      rating: 5,
      salary: "$140k",
      image: "PP",
      company: "Spotify",
    },
    {
      name: "James Wilson",
      role: "Product Manager at Uber",
      content:
        "Transitioned from engineering to product management seamlessly. The courses and 1-on-1 mentoring gave me the confidence and skills to make the switch. Now earning 40% more!",
      rating: 5,
      salary: "$180k",
      image: "JW",
      company: "Uber",
    },
  ]

  const stats = [
    {
      label: "Students Placed",
      value: 15000,
      prefix: "",
      suffix: "+",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Average Salary Increase",
      value: 67,
      prefix: "",
      suffix: "%",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Partner Companies",
      value: 500,
      prefix: "",
      suffix: "+",
      icon: Briefcase,
      color: "from-purple-500 to-pink-500",
    },
    { label: "Success Rate", value: 94, prefix: "", suffix: "%", icon: Award, color: "from-orange-500 to-red-500" },
  ]

  const courses = [
    {
      id: "1",
      title: "Full Stack Web Development",
      description: "Master React, Node.js, MongoDB, and deployment. Build 5 real-world projects.",
      price: 299,
      originalPrice: 499,
      rating: 4.9,
      students: 12500,
      duration: "12 weeks",
      level: "Beginner to Advanced",
      instructor: "Sarah Chen",
      instructorImage: "SC",
      skills: ["React", "Node.js", "MongoDB", "AWS"],
      icon: Code,
      color: "from-blue-500 to-cyan-500",
      badge: "Most Popular",
      badgeColor: "bg-green-500",
    },
    {
      id: "2",
      title: "Data Science & Machine Learning",
      description: "Python, pandas, scikit-learn, TensorFlow. Work on real datasets from top companies.",
      price: 399,
      originalPrice: 599,
      rating: 4.8,
      students: 8900,
      duration: "16 weeks",
      level: "Intermediate",
      instructor: "Dr. Michael Rodriguez",
      instructorImage: "MR",
      skills: ["Python", "TensorFlow", "Pandas", "SQL"],
      icon: Database,
      color: "from-purple-500 to-pink-500",
      badge: "High Demand",
      badgeColor: "bg-purple-500",
    },
    {
      id: "3",
      title: "UI/UX Design Mastery",
      description: "Figma, Adobe XD, user research, prototyping. Design apps used by millions.",
      price: 249,
      originalPrice: 399,
      rating: 4.7,
      students: 6700,
      duration: "10 weeks",
      level: "Beginner",
      instructor: "Emma Thompson",
      instructorImage: "ET",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      icon: Palette,
      color: "from-pink-500 to-orange-500",
      badge: "Creative",
      badgeColor: "bg-pink-500",
    },
    {
      id: "4",
      title: "Digital Marketing & Analytics",
      description: "SEO, Google Ads, social media marketing, conversion optimization strategies.",
      price: 199,
      originalPrice: 349,
      rating: 4.6,
      students: 9200,
      duration: "8 weeks",
      level: "Beginner to Intermediate",
      instructor: "David Park",
      instructorImage: "DP",
      skills: ["SEO", "Google Ads", "Analytics", "Social Media"],
      icon: BarChart,
      color: "from-green-500 to-blue-500",
      badge: "ROI Focused",
      badgeColor: "bg-green-500",
    },
  ]

  const mentors = [
    {
      id: "1",
      name: "Sarah Johnson",
      title: "Senior Software Engineer",
      company: "Google",
      experience: "8 years",
      rating: 4.9,
      sessions: 450,
      price: 150,
      expertise: ["System Design", "Algorithms", "Career Growth", "Interview Prep"],
      languages: ["English", "Spanish"],
      timezone: "PST",
      image: "SJ",
      bio: "Former Meta and Google engineer. Helped 200+ engineers land FAANG jobs. Specializes in system design and coding interviews.",
      availability: "Mon-Fri 6-9 PM PST",
      responseTime: "< 2 hours",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      title: "Principal Data Scientist",
      company: "Netflix",
      experience: "12 years",
      rating: 4.8,
      sessions: 320,
      price: 200,
      expertise: ["Machine Learning", "Data Strategy", "Leadership", "Research"],
      languages: ["English", "Mandarin"],
      timezone: "PST",
      image: "MC",
      bio: "PhD in ML from Stanford. Led data teams at Netflix and Uber. Expert in scaling ML systems and building data-driven products.",
      availability: "Weekends 10 AM - 4 PM PST",
      responseTime: "< 4 hours",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      title: "Head of Design",
      company: "Airbnb",
      experience: "10 years",
      rating: 4.9,
      sessions: 280,
      price: 175,
      expertise: ["Product Design", "Design Systems", "User Research", "Team Leadership"],
      languages: ["English", "Portuguese"],
      timezone: "EST",
      image: "ER",
      bio: "Design leader at Airbnb and Spotify. Built design systems used by millions. Passionate about mentoring the next generation of designers.",
      availability: "Tue-Thu 7-10 PM EST",
      responseTime: "< 1 hour",
      color: "from-pink-500 to-orange-500",
    },
    {
      id: "4",
      name: "Alex Kumar",
      title: "VP of Engineering",
      company: "Stripe",
      experience: "15 years",
      rating: 5.0,
      sessions: 180,
      price: 250,
      expertise: ["Engineering Leadership", "Startup Scaling", "Technical Strategy", "Team Building"],
      languages: ["English", "Hindi"],
      timezone: "PST",
      image: "AK",
      bio: "Built and scaled engineering teams from 5 to 200+ engineers. Former CTO at two successful startups. Expert in technical leadership.",
      availability: "Sat-Sun 9 AM - 1 PM PST",
      responseTime: "< 6 hours",
      color: "from-green-500 to-blue-500",
    },
  ]

  const companies = [
    { name: "Google", logo: "LG" },
    { name: "Microsoft", logo: "Meta" },
    { name: "Apple", logo: "Sony" },
    { name: "Meta", logo: "Ola" },
    { name: "Netflix", logo: "Tata" },
    { name: "Spotify", logo: "SBI" },
    { name: "Uber", logo: "Uber" },
    { name: "Airbnb", logo: "Dell" },
     { name: "Google", logo: "LG" },
    { name: "Microsoft", logo: "Meta" },
    { name: "Apple", logo: "Sony" },
    { name: "Meta", logo: "Ola" },
 
  ]

  // Simple course categories (minimal tiles)
  const courseCategories = [
    { label: "Medical", color: "bg-blue-600", icon: Heart, href: "/courses?category=medical" },
    { label: "Geography", color: "bg-orange-600", icon: Globe, href: "/courses?category=geography" },
    { label: "Sales", color: "bg-green-600", icon: TrendingUp, href: "/courses?category=sales" },
    { label: "Teacher", color: "bg-yellow-500", icon: BookOpen, href: "/courses?category=teacher" },
    { label: "B.Tech", color: "bg-blue-500", icon: Code, href: "/courses?category=btech" },
    { label: "MBA", color: "bg-orange-500", icon: Briefcase, href: "/courses?category=mba" },
    { label: "Digitalization", color: "bg-green-500", icon: Cpu, href: "/courses?category=digitalization" },
    { label: "Marketing", color: "bg-yellow-600", icon: PieChart, href: "/courses?category=marketing" },
  ]

  // Hardcoded: Top Popular Courses (frontend only)
  const popularCourses = [
    {
      id: "c1",
      title: "Full‑Stack Web Dev Bootcamp",
      subtitle: "React • Node.js • MongoDB • Deploy",
      color: "from-blue-500 to-cyan-500",
      badge: "Top Rated",
      badgeColor: "bg-green-500",
      rating: 4.9,
      students: 12500,
      points: ["Build and deploy 3 production apps", "Interview-ready projects"],
      href: "/courses/fullstack-bootcamp",
    },
    {
      id: "c2",
      title: "Practical Machine Learning",
      subtitle: "Python • scikit‑learn • TensorFlow",
      color: "from-purple-500 to-pink-500",
      badge: "In Demand",
      badgeColor: "bg-purple-500",
      rating: 4.8,
      students: 9100,
      points: ["Train and deploy ML models", "Work on real datasets"],
      href: "/courses/practical-ml",
    },
    {
      id: "c3",
      title: "UI/UX Design Mastery",
      subtitle: "Figma • Design Systems • Research",
      color: "from-pink-500 to-orange-500",
      badge: "Creative",
      badgeColor: "bg-pink-500",
      rating: 4.7,
      students: 6600,
      points: ["Design portfolios that convert", "Ship production-quality UIs"],
      href: "/courses/uiux-mastery",
    },
    {
      id: "c4",
      title: "Digital Marketing Sprint",
      subtitle: "Ads • SEO • Analytics • CRO",
      color: "from-green-500 to-blue-500",
      badge: "Bestseller",
      badgeColor: "bg-orange-500",
      rating: 4.6,
      students: 6400,
      points: ["Launch and scale paid campaigns", "Measure what matters"],
      href: "/courses/marketing-sprint",
    },
  ]

  // Hardcoded: Teachers with their top courses (frontend only)
  const teacherCourses = [
    {
      id: "t1",
      teacher: {
        name: "Sarah Chen",
        avatar: "SC",
        title: "Senior Software Engineer • Google",
      },
      rating: 4.9,
      studentsTotal: 9000,
      badge: "Top Rated",
      badgeColor: "bg-green-500",
      color: "from-blue-500 to-cyan-500",
      courses: [
        { title: "Full‑Stack Web Dev Bootcamp", outcome: "Build and deploy 3 production apps", students: 5200 },
        { title: "System Design for Beginners", outcome: "Crack FAANG L4 interviews", students: 3800 },
      ],
      links: { profile: "/teachers/sarah-chen", course: "/courses/fullstack-bootcamp" },
    },
    {
      id: "t2",
      teacher: {
        name: "Dr. Michael Rodriguez",
        avatar: "MR",
        title: "Principal Data Scientist • Netflix",
      },
      rating: 4.8,
      studentsTotal: 9100,
      badge: "In Demand",
      badgeColor: "bg-purple-500",
      color: "from-purple-500 to-pink-500",
      courses: [
        { title: "Practical Machine Learning", outcome: "Train and deploy ML models", students: 6100 },
        { title: "SQL to Analytics Pro", outcome: "Answer business questions with data", students: 3000 },
      ],
      links: { profile: "/teachers/michael-rodriguez", course: "/courses/practical-ml" },
    },
    {
      id: "t3",
      teacher: {
        name: "Emma Thompson",
        avatar: "ET",
        title: "Head of Design • Airbnb",
      },
      rating: 4.7,
      studentsTotal: 6600,
      badge: "Creative",
      badgeColor: "bg-pink-500",
      color: "from-pink-500 to-orange-500",
      courses: [
        { title: "UI/UX Design Mastery", outcome: "Design portfolios that convert", students: 4500 },
        { title: "Design Systems 101", outcome: "Ship consistent product UIs", students: 2100 },
      ],
      links: { profile: "/teachers/emma-thompson", course: "/courses/uiux-mastery" },
    },
    {
      id: "t4",
      teacher: {
        name: "David Park",
        avatar: "DP",
        title: "Growth Lead • Stripe",
      },
      rating: 4.6,
      studentsTotal: 6400,
      badge: "Bestseller",
      badgeColor: "bg-orange-500",
      color: "from-green-500 to-blue-500",
      courses: [
        { title: "Digital Marketing Sprint", outcome: "Launch and scale paid campaigns", students: 3900 },
        { title: "Analytics for Marketers", outcome: "Measure what matters", students: 2500 },
      ],
      links: { profile: "/teachers/david-park", course: "/courses/marketing-sprint" },
    },
  ]

  const handlePurchaseCourse = (course: any) => {
    setSelectedCourse(course)
    setShowPurchaseDialog(true)
  }

  const handleBookMentor = (mentor: any) => {
    setSelectedMentor(mentor)
    setShowMentorDialog(true)
  }

  const completePurchase = () => {
    if (selectedCourse) {
      setPurchasedCourses([...purchasedCourses, selectedCourse.id])
      setShowPurchaseDialog(false)
      setSelectedCourse(null)
    }
  }

  const completeMentorBooking = () => {
    if (selectedMentor) {
      setBookedMentors([...bookedMentors, selectedMentor.id])
      setShowMentorDialog(false)
      setSelectedMentor(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative m-0 p-0">
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
        <div
          className="absolute w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        ></div>
      </div>

      {/* Enhanced Responsive Header */}
      <header
        className={`relative z-50 glass-card border-b border-white/10 transition-all duration-1000 ${isVisible ? "slide-up-animation" : "opacity-0"}`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">SHAPINGcareer</h1>
                <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Transform Your Future</p>
              </div>
            </div>
            
            {/* Mobile Menu Toggle & Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-400 hover:bg-blue-500/10 px-3 py-2 text-sm border border-blue-500/50"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="hidden sm:block">
                <Button size="sm" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4">
              <nav className="flex flex-col space-y-2">
                <Link href="/internships" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                    <Sparkles className="w-4 h-4 mr-3" />
                    Internships
                  </Button>
                </Link>
                <Link href="/jobs" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                    <Rocket className="w-4 h-4 mr-3" />
                    Jobs
                  </Button>
                </Link>
                <Link href="/mentors" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                    <Users className="w-4 h-4 mr-3" />
                    Mentors
                  </Button>
                </Link>
                <div className="flex space-x-2 pt-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-blue-400 border-blue-500/50">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full btn-primary">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center neon-glow float-animation group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full animate-pulse border-2 border-black"></div>
                <div className="absolute -bottom-2 -right-2 orbit-element">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold gradient-text text-glow">SHAPINGcareer</h1>
              </div>
            </div>
            
            <nav className="flex items-center space-x-8">
              <Link href="/internships">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group text-lg px-6 py-3"
                >
                  <Sparkles className="w-5 h-5 mr-3 group-hover:animate-spin" />
                  Internships
                </Button>
              </Link>
              <Link href="/jobs">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group text-lg px-6 py-3"
                >
                  <Rocket className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                  Jobs
                </Button>
              </Link>
              <Link href="/mentors">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group text-lg px-6 py-3"
                >
                  <Users className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                  Mentors
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent transition-all duration-300 hover-glow text-lg px-6 py-3"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="btn-primary text-lg px-8 py-3 hover-scale">
                  Sign Up
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced Responsive Hero Section */}
      <section className="relative z-10 py-20 sm:py-32 lg:py-40 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <div
            className={`mb-8 sm:mb-12 transition-all duration-1000 delay-300 ${isVisible ? "slide-up-animation" : "opacity-0 translate-y-10"}`}
          >
           {/* <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 mb-8 text-xl px-8 py-4 hover-lift shimmer-effect">
              <Brain className="w-6 h-6 mr-3" />
              AI-Powered Career Intelligence
              <Sparkles className="w-5 h-5 ml-3" />
            </Badge>*/}
          </div>

          <div
            className={`transition-all duration-1000 delay-500 ${isVisible ? "scale-in-animation" : "opacity-0 scale-95"}`}
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 sm:mb-8 lg:mb-12 leading-tight text-shadow">
              Shape Your Career with <span className="gradient-text typewriter block mt-2 sm:mt-4">Intelligence</span>
            </h2>
          </div>

          <div
            className={`transition-all duration-1000 delay-700 ${isVisible ? "slide-up-animation" : "opacity-0 translate-y-10"}`}
          >
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 sm:mb-12 lg:mb-16 max-w-5xl mx-auto leading-relaxed font-light px-4">
              Discover your potential through AI-powered assessments, connect with industry mentors, find exclusive
              opportunities, and build the skills you need to dominate tomorrow's job market.
            </p>
          </div>

          <div
            className={`flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-10 justify-center transition-all duration-1000 delay-1000 ${isVisible ? "bounce-in-animation" : "opacity-0"}`}
          >
            <Link href="/choose-field" className="w-full sm:w-auto">
              <Button size="lg" className="btn-primary w-full sm:w-auto text-lg sm:text-xl lg:text-2xl px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 hover-scale group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-4 group-hover:animate-spin relative z-10" />
                <span className="relative z-10">Unlock Your Potential</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 sm:ml-4 relative z-10" />
              </Button>
            </Link>
            <Link href="/startup-ideas" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-3 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent text-lg sm:text-xl lg:text-2xl px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 hover-scale group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-4 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">Team Up for a Startup</span>
              </Button>
            </Link>
          </div>

          {/* Trusted by Companies */}
          <div className="mt-12 sm:mt-16 lg:mt-24">
            <p className="text-lg sm:text-xl text-gray-400 mb-8 sm:mb-12 font-medium">Trusted by students at top companies</p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12">
              {companies.map((company, index) => (
                <div
                  key={index}
                  className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center hover-lift group"
                >
                  <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                    {company.logo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      

      {/* Responsive Course Categories Section */}
      <section className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-3">Learning Domains</h3>
            <p className="text-base sm:text-lg text-gray-300">Explore categories and start learning</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {courseCategories.map((cat, idx) => (
              <Link key={idx} href={cat.href} className="block">
                <div className={`rounded-2xl ${cat.color} hover:opacity-90 transition-opacity shadow-lg p-8 flex items-center justify-center h-32 glass-card-hover`}>
                  <div className="flex items-center space-x-4">
                    <cat.icon className="w-8 h-8 text-white" />
                    <span className="text-2xl font-semibold text-white">{cat.label}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Responsive Stats Section */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-4 sm:mb-6">Proven Results</h3>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300">Real impact on real careers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card-hover text-center group relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <CardContent className="pt-8 sm:pt-12 pb-6 sm:pb-8 relative z-10">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${stat.color} rounded-3xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:neon-glow transition-all duration-300 group-hover:scale-110`}
                  >
                    <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <AnimatedCounter
                      end={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      duration={2000 + index * 200}
                    />
                  </div>
                  <p className="text-gray-400 text-lg sm:text-xl font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Responsive Courses Section */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border-green-500/30 mb-6 sm:mb-8 text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Learn From Our Teachers
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
            </Badge>
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 gradient-text text-glow">Courses Taught by Our Teachers</h3>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-5xl mx-auto leading-relaxed px-4">
              Explore top courses curated and taught by experienced industry professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {teacherCourses.map((item) => (
              <Card key={item.id} className="glass-card-hover group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white">{item.courses[0]?.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-400">{item.courses[0]?.outcome}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={`${item.badgeColor} text-white mb-2`}>{item.badge}</Badge>
                      <div className="flex items-center justify-end space-x-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-300">{item.rating}</span>
                        <span className="text-sm text-gray-400">({item.studentsTotal.toLocaleString()} students)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {item.courses.map((c, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-white font-semibold line-clamp-1">{c.title}</div>
                        <div className="text-sm text-gray-400 line-clamp-2">{c.outcome}</div>
                        <div className="text-xs text-gray-500 mt-1">{c.students.toLocaleString()} students</div>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Connection System */}
      <section className="relative z-10 py-32 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 mb-8 text-xl px-8 py-4">
              <Users className="w-6 h-6 mr-3" />
              Expert Mentorship
            </Badge>
            <h3 className="text-7xl font-bold mb-8 gradient-text text-glow">Connect with Industry Mentors</h3>
            <p className="text-3xl text-gray-300 max-w-5xl mx-auto leading-relaxed">
              Get personalized guidance from senior professionals at top tech companies. Accelerate your career growth
              with 1-on-1 mentorship.
            </p>
          </div>

          <div className="text-center">
            <Link href="/mentors">
              <Button 
                size="lg" 
                className="btn-primary text-2xl px-16 py-8 hover-scale group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Users className="w-7 h-7 mr-4 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">Explore All Mentors</span>
                <ChevronRight className="w-6 h-6 ml-4 group-hover:translate-x-1 transition-transform relative z-10" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Responsive Testimonials Carousel */}
      <section className="relative z-10 py-20 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30 mb-6 sm:mb-8 text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Success Stories
            </Badge>
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 gradient-text text-glow">Real Results, Real People</h3>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 px-4">Hear from our community of successful career shapers</p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="glass-card p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl hover-lift">
              <div className="flex items-center justify-center mb-8 sm:mb-12">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-400 fill-current mx-1 sm:mx-2 hover:scale-110 transition-transform duration-300"
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 sm:mb-8 flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-bold text-white neon-glow hover-scale">
                    {testimonials[currentTestimonial].image}
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                </div>

                <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 sm:mb-8 italic leading-relaxed font-light max-w-4xl mx-auto px-4">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xl sm:text-2xl font-bold text-white">{testimonials[currentTestimonial].name}</h4>
                  <p className="text-lg sm:text-xl text-gray-400">{testimonials[currentTestimonial].role}</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg sm:text-xl px-4 sm:px-6 py-2 sm:py-3">
                      {testimonials[currentTestimonial].salary}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-lg sm:text-xl px-4 sm:px-6 py-2 sm:py-3">
                      {testimonials[currentTestimonial].company}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-12 space-x-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-6 h-6 rounded-full transition-all duration-300 hover-scale ${
                    index === currentTestimonial ? "bg-blue-500 neon-glow scale-125" : "bg-gray-600 hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Responsive CTA Section */}
      <section className="relative z-10 py-20 sm:py-32 lg:py-40 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <div className="gradient-border max-w-6xl mx-auto hover-lift">
            <div className="gradient-border-content p-8 sm:p-12 lg:p-16">
              <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text mb-6 sm:mb-8 text-glow">Ready to Shape Your Career?</h3>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
                Join thousands of students who have transformed their careers with our AI-powered platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center mb-8 sm:mb-12">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="btn-primary w-full sm:w-auto text-lg sm:text-xl lg:text-2xl px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 hover-scale group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-4 relative z-10" />
                    <span className="relative z-10">Get Started Today</span>
                  </Button>
                </Link>
                <Link href="/choose-field" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-3 border-white/20 text-white hover:bg-white/10 bg-transparent text-lg sm:text-xl lg:text-2xl px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 hover-scale group"
                  >
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-4" />
                    Unlock Your Potential
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-12 text-sm sm:text-base lg:text-lg text-gray-400">
                <div className="flex items-center hover-scale">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-green-400" />
                  <span className="whitespace-nowrap">100% Secure</span>
                </div>
                <div className="flex items-center hover-scale">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-400" />
                  <span className="whitespace-nowrap">Setup in 2 minutes</span>
                </div>
                <div className="flex items-center hover-scale">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-400" />
                  <span className="whitespace-nowrap">Used by 50k+ students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> 
      {/* Enhanced Responsive Footer */}
      <footer className="relative z-10 glass-card border-t border-white/10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 mt-20 sm:mt-24 lg:mt-32">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center neon-glow">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text">ShapingCareer</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Empowering the next generation of tech leaders with AI-powered career intelligence.
              </p>
              <div className="flex space-x-4">
                {["Twitter", "LinkedIn", "GitHub", "Discord"].map((social, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 glass-card rounded-xl flex items-center justify-center hover-lift cursor-pointer"
                  >
                    <span className="text-sm font-bold text-white">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-xl">Platform</h4>
              <ul className="space-y-4 text-gray-400 text-lg">
                <li>
                  <Link href="/aptitude-test" className="hover:text-white transition-colors hover-scale inline-block">
                    AI Assessment
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-white transition-colors hover-scale inline-block">
                    Job Board
                  </Link>
                </li>
                <li>
                  <Link href="/internships" className="hover:text-white transition-colors hover-scale inline-block">
                    Internships
                  </Link>
                </li>
                <li>
                  <Link href="/mentors" className="hover:text-white transition-colors hover-scale inline-block">
                    Mentorship
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-xl">Resources</h4>
              <ul className="space-y-4 text-gray-400 text-lg">
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors hover-scale inline-block">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="hover:text-white transition-colors hover-scale inline-block">
                    Career Guides
                  </Link>
                </li>
                <li>
                  <Link href="/webinars" className="hover:text-white transition-colors hover-scale inline-block">
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-white transition-colors hover-scale inline-block">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-xl">Company</h4>
              <ul className="space-y-4 text-gray-400 text-lg">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors hover-scale inline-block">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors hover-scale inline-block">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors hover-scale inline-block">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors hover-scale inline-block">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-lg">
                              © 2024 Shaping Career. All rights reserved. Built with ❤️ for ambitious minds.
            </p>
          </div>
        </div>
      </footer>

      {/* Course Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="glass-card border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Complete Your Purchase</DialogTitle>
            <DialogDescription className="text-gray-300">
              You're about to purchase {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 glass-card rounded-lg">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${selectedCourse.color} rounded-2xl flex items-center justify-center`}
                >
                  <selectedCourse.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{selectedCourse.title}</h3>
                  <p className="text-gray-300">{selectedCourse.instructor}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-300">{selectedCourse.rating}</span>
                    <span className="text-sm text-gray-400">• {selectedCourse.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${selectedCourse.price}</div>
                  <div className="text-sm text-gray-400 line-through">${selectedCourse.originalPrice}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">
                      First Name
                    </Label>
                    <Input id="firstName" className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">
                      Last Name
                    </Label>
                    <Input id="lastName" className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input id="email" type="email" className="bg-white/10 border-white/20 text-white" />
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="text-white">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="text-white">
                      Expiry Date
                    </Label>
                    <Input id="expiry" placeholder="MM/YY" className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-white">
                      CVV
                    </Label>
                    <Input id="cvv" placeholder="123" className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Course Price:</span>
                  <span className="text-white">${selectedCourse.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Student ID:</span>
                  <span className="text-blue-400 font-mono">{studentId}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-white">${selectedCourse.price}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseDialog(false)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={completePurchase}
                  className={`flex-1 bg-gradient-to-r ${selectedCourse.color} hover:scale-105 transition-transform duration-300`}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Complete Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mentor Booking Dialog */}
      <Dialog open={showMentorDialog} onOpenChange={setShowMentorDialog}>
        <DialogContent className="glass-card border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Book Mentor Session</DialogTitle>
            <DialogDescription className="text-gray-300">
              Schedule a 1-on-1 session with {selectedMentor?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 glass-card rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                  {selectedMentor.image}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{selectedMentor.name}</h3>
                  <p className="text-gray-300">{selectedMentor.title}</p>
                  <p className="text-blue-400">{selectedMentor.company}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-300">{selectedMentor.rating}</span>
                    <span className="text-sm text-gray-400">• {selectedMentor.sessions} sessions</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">${selectedMentor.price}</div>
                  <div className="text-sm text-gray-400">per hour</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionType" className="text-white">
                    Session Type
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="career-guidance">Career Guidance</SelectItem>
                      <SelectItem value="interview-prep">Interview Preparation</SelectItem>
                      <SelectItem value="resume-review">Resume Review</SelectItem>
                      <SelectItem value="skill-development">Skill Development</SelectItem>
                      <SelectItem value="project-review">Project Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sessionDate" className="text-white">
                    Preferred Date
                  </Label>
                  <Input id="sessionDate" type="date" className="bg-white/10 border-white/20 text-white" />
                </div>

                <div>
                  <Label htmlFor="sessionTime" className="text-white">
                    Preferred Time
                  </Label>
                  <Input id="sessionTime" type="time" className="bg-white/10 border-white/20 text-white" />
                </div>

                <div>
                  <Label htmlFor="communicationMethod" className="text-white">
                    Communication Method
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select communication method" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="video">
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          Video Call
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Call
                        </div>
                      </SelectItem>
                      <SelectItem value="chat">
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Text Chat
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sessionGoals" className="text-white">
                    Session Goals
                  </Label>
                  <Textarea
                    id="sessionGoals"
                    placeholder="What would you like to achieve in this session?"
                    className="bg-white/10 border-white/20 text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-white">
                    Your Experience Level
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid-level">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior-level">Senior Level (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Session Fee:</span>
                  <span className="text-white">${selectedMentor.price}/hour</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Student ID:</span>
                  <span className="text-blue-400 font-mono">{studentId}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-white">${selectedMentor.price}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowMentorDialog(false)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={completeMentorBooking}
                  className={`flex-1 bg-gradient-to-r ${selectedMentor.color} hover:scale-105 transition-transform duration-300`}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      
    </div>
  )
}

