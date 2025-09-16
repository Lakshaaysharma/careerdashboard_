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

      {/* Header */}
      <header className="relative z-10 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">CareerLaunch</h1>
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
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Results Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center neon-glow">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <Badge className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border-green-500/30 mb-4 text-lg px-4 py-2">
            <Target className="w-5 h-5 mr-2" />
            AI Analysis Complete
          </Badge>
          <h1 className="text-6xl font-bold mb-4 gradient-text">Your Career Profile</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Instant AI-powered analysis of your cognitive patterns and career potential
          </p>
        </div>

        {/* Primary Match */}
        <Card className="mb-12 glass-card border-2 border-blue-500/30 neon-glow">
          <CardHeader className="text-center pb-6">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 mb-4 text-lg px-4 py-2 mx-auto w-fit">
              Recommended Career Path
            </Badge>
            <CardTitle className="text-4xl gradient-text mb-2">{results.recommendedCareer}</CardTitle>
            <CardDescription className="text-xl text-gray-300">
              Your optimal career match based on AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl mb-6 text-green-400">{results.careerMatch}% Match</div>
            <Progress value={results.careerMatch} className="h-4 bg-gray-800 mb-6" />
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
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
