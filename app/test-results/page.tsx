"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Brain, Target, Zap, Award, BookOpen, Briefcase, Users, ShoppingCart } from "lucide-react"

export default function TestResultsPage() {
  const [results, setResults] = useState<any>(null)
  const [animatedScores, setAnimatedScores] = useState<any>({})

  useEffect(() => {
    // Get results from localStorage
    const storedResults = localStorage.getItem("aiAssessmentResults")
    if (storedResults) {
      const parsedResults = JSON.parse(storedResults)
      setResults(parsedResults)

      // Animate scores
      setTimeout(() => {
        const scores: any = {}
        parsedResults.strengths.forEach((strength: any) => {
          scores[strength.area] = strength.score
        })
        parsedResults.weaknesses.forEach((weakness: any) => {
          scores[weakness.area] = weakness.score
        })
        setAnimatedScores(scores)
      }, 500)
    }
  }, [])

  // Helper to map score to recommendation message
  const getMatchMessage = (score: number) => {
    if (score < 50) {
      return "No Match – Recommend to sharpen skills";
    }
    if (score >= 50 && score < 75) {
      return "Potential of Good Match with focus on skill development";
    }
    if (score >= 75 && score < 90) {
      return "Great Match – keep upskilling";
    }
    return "Excellent Match – acquire advanced skills to excel";
  }

  const recommendedCourses = [
    {
      id: 1,
      title: "Advanced React Patterns",
      instructor: "John Doe",
      price: 199,
      originalPrice: 299,
      rating: 4.8,
      students: 1250,
      duration: "12 hours",
      level: "Advanced",
      thumbnail: "🚀",
      description: "Master advanced React patterns including hooks, context, and performance optimization.",
      relevance: 95,
      bestseller: true,
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      instructor: "Dr. Jane Smith",
      price: 249,
      originalPrice: 349,
      rating: 4.9,
      students: 890,
      duration: "16 hours",
      level: "Intermediate",
      thumbnail: "🤖",
      description: "Complete introduction to ML algorithms, data preprocessing, and model evaluation.",
      relevance: 92,
      popular: true,
    },
    {
      id: 4,
      title: "Data Science with Python",
      instructor: "Maria Garcia",
      price: 229,
      originalPrice: 329,
      rating: 4.8,
      students: 1100,
      duration: "20 hours",
      level: "Beginner",
      thumbnail: "📊",
      description: "Learn data analysis, visualization, and statistical modeling with Python.",
      relevance: 88,
    },
  ]

  if (!results) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Responsive Header */}
      <header className="relative z-10 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">Shaping Career</h1>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent text-sm px-3 py-2"
              >
                Home
              </Button>
            </Link>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Shaping Career</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                >
                  Go to Home
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Responsive Results Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Results Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center neon-glow">
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border-green-500/30 mb-3 sm:mb-4 text-base sm:text-lg px-3 sm:px-4 py-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            AI Analysis Complete
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 gradient-text">Your Career Profile</h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Instant AI-powered analysis of your cognitive patterns and career potential
          </p>
        </div>

        {/* Primary Match */}
        <Card className="mb-8 sm:mb-12 glass-card border-2 border-blue-500/30 neon-glow">
          <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 mb-3 sm:mb-4 text-base sm:text-lg px-3 sm:px-4 py-2 mx-auto w-fit">
              Recommended Career Path
            </Badge>
            <CardTitle className="text-3xl sm:text-4xl gradient-text mb-2">{results.recommendedCareer}</CardTitle>
            <CardDescription className="text-lg sm:text-xl text-gray-300">
              Your optimal career match based on AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-4 sm:px-6">
            <div className="text-2xl sm:text-3xl mb-4 sm:mb-6 text-green-400">{results.careerMatch}% Match</div>
            <Progress value={results.careerMatch} className="h-3 sm:h-4 bg-gray-800 mb-4 sm:mb-6" />
            <p className="text-sm sm:text-base text-gray-400 mb-2">{getMatchMessage(results.careerMatch)}</p>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Your cognitive profile shows exceptional alignment with {results.recommendedCareer} roles, combining
              strong analytical thinking with innovative problem-solving abilities.
            </p>
          </CardContent>
        </Card>

        {/* Strengths and Weaknesses sections removed */}

        {/* Recommended Courses and Next Steps removed to show only core results */}
      </div>
    </div>
  )
}
