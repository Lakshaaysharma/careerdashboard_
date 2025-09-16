"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Users, Zap } from "lucide-react"

export default function AptitudeTestClient() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(600)
  const [loading, setLoading] = useState(false)
  const [dynamicQuestions, setDynamicQuestions] = useState<any[] | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [quizQuestions, setQuizQuestions] = useState<any[] | null>(null)
  const [quizCorrect, setQuizCorrect] = useState<number[]>([])
  const [quizCategories, setQuizCategories] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedSubject = useMemo(() => searchParams.get("subject") || "", [searchParams])

  const fallbackQuestions = [
    { question: "When faced with a complex problem, what's your first instinct?", options: ["Break it down into smaller, manageable parts","Visualize the problem and sketch out solutions","Discuss it with others to get different perspectives","Research similar problems and their solutions"], category: "Problem Solving" },
    { question: "In a team project, which role energizes you the most?", options: ["The technical architect who designs the system","The creative director who shapes the vision","The team leader who coordinates everyone","The analyst who ensures data-driven decisions"], category: "Leadership" },
    { question: "What type of work environment makes you most productive?", options: ["Quiet, focused spaces with minimal distractions","Dynamic, creative spaces with inspiring visuals","Collaborative spaces with constant interaction","Organized spaces with access to resources and data"], category: "Work Style" },
    { question: "When learning a new skill, you prefer to:", options: ["Follow structured tutorials and documentation","Experiment and learn through trial and error","Learn from mentors and peer discussions","Study theory first, then apply practically"], category: "Learning Style" },
    { question: "What motivates you most in your career?", options: ["Building innovative solutions that solve real problems","Creating beautiful, user-friendly experiences","Leading teams and driving organizational change","Discovering insights that inform strategic decisions"], category: "Motivation" },
    { question: "How do you handle tight deadlines?", options: ["Create a systematic plan and execute methodically","Focus on the most impactful elements first","Rally the team and delegate effectively","Analyze what's truly essential and prioritize"], category: "Stress Management" },
    { question: "What excites you most about technology?", options: ["The logical elegance of well-written code","The potential to create engaging user experiences","The ability to connect and empower people","The insights that can be extracted from data"], category: "Technology Interest" },
    { question: "In your ideal job, you would spend most time:", options: ["Coding, debugging, and optimizing systems","Designing interfaces and user experiences","Managing projects and coordinating teams","Analyzing data and generating insights"], category: "Daily Activities" },
  ]

  const buildLocalQuestions = (subject: string) => {
    const s = subject.toLowerCase()
    if (s.includes("software")) {
      return [
        { question: "Which data structure uses LIFO?", options: ["Queue","Stack","Tree","Graph"], correct: 1, category: "Programming Basics" },
        { question: "Which HTTP method is idempotent?", options: ["POST","PUT","PATCH","CONNECT"], correct: 1, category: "Web Basics" },
        { question: "OOP stands for?", options: ["Object Oriented Programming","Operational Output Program","Order of Program","Object Operated Process"], correct: 0, category: "OOP" },
        { question: "Big-O of binary search?", options: ["O(n)","O(log n)","O(n log n)","O(1)"], correct: 1, category: "Problem Solving" },
        { question: "Git command to create branch?", options: ["git new branch","git branch feature","git create feature","git make branch"], correct: 1, category: "Tools" },
        { question: "SQL to get all rows?", options: ["PICK * FROM","GET * FROM","SELECT * FROM","SHOW * FROM"], correct: 2, category: "Databases" }
      ]
    }
    if (s.includes("data science") || s.includes("ml")) {
      return [
        { question: "Mean of [2,4,6,8]?", options: ["4","5","6","20"], correct: 1, category: "Statistics" },
        { question: "Which library is for dataframes in Python?", options: ["NumPy","Pandas","Matplotlib","Seaborn"], correct: 1, category: "Python" },
        { question: "Overfitting occurs when?", options: ["Model too simple","Model memorizes noise","Too little data","No regularization ever"], correct: 1, category: "ML Basics" },
        { question: "Which is a classification metric?", options: ["MSE","RMSE","Accuracy","MAE"], correct: 2, category: "ML Basics" },
        { question: "CSV best loaded using?", options: ["np.load","pd.read_csv","json.load","pickle.load"], correct: 1, category: "Data Handling" },
        { question: "Visualization lib?", options: ["Requests","Matplotlib","Flask","Scikit-learn"], correct: 1, category: "Visualization" }
      ]
    }
    if (s.includes("problem solving")) {
      return [
        { question: "You have 8L and 5L jugs; how to get 4L?", options: ["Fill 5L, pour to 8L twice","Fill 8L, remove 4L","Fill 5L, pour to 8L, refill 5L, top up 8L","Impossible"], correct: 2, category: "Logical Reasoning" },
        { question: "Pattern: 2, 6, 12, 20, ?", options: ["30","28","26","24"], correct: 1, category: "Patterns" },
        { question: "Shortest path algorithms find?", options: ["Local optimum","Global minimum distance","Random path","Tree only"], correct: 1, category: "Optimization" },
        { question: "Divide and conquer example?", options: ["Bubble sort","Merge sort","Linear search","Counting sort"], correct: 1, category: "Strategies" },
        { question: "First step in problem solving?", options: ["Implement","Test","Define the problem","Optimize"], correct: 2, category: "Process" },
        { question: "Given constraints, choose solution by?", options: ["Aesthetics","Cost-benefit and constraints","Random","Popularity"], correct: 1, category: "Decision Making" }
      ]
    }
    if (s.includes("critical thinking")) {
      return [
        { question: "Critical thinking primarily involves?", options: ["Memorization","Unquestioned acceptance","Analysis and evaluation","Guesswork"], correct: 2, category: "Core Skill" },
        { question: "Which is a logical fallacy?", options: ["Strawman","Evidence-based claim","Valid deduction","Strong analogy"], correct: 0, category: "Reasoning" },
        { question: "Best way to assess a claim?", options: ["Check source, evidence, bias","Trust majority","Rely on intuition","Look at headlines"], correct: 0, category: "Evaluation" },
        { question: "Correlation vs causation matters because?", options: ["Same thing","Correlation implies causation","Avoid false conclusions","Never useful"], correct: 2, category: "Analysis" },
        { question: "Which strengthens an argument?", options: ["Irrelevant anecdote","Reliable data","Ad hominem","Ambiguity"], correct: 1, category: "Argumentation" },
        { question: "Cognitive bias that seeks confirming info?", options: ["Anchoring","Confirmation bias","Recency bias","Framing"], correct: 1, category: "Biases" }
      ]
    }
    if (s.includes("ui ux")) {
      return [
        { question: "Primary goal of UX?", options: ["Beauty","Usability","Animations","SEO"], correct: 1, category: "UX Principles" },
        { question: "Which is a wireframing tool?", options: ["Figma","Nginx","MongoDB","Docker"], correct: 0, category: "Tools" },
        { question: "Color contrast matters for?", options: ["Accessibility","Performance","SEO","Security"], correct: 0, category: "Accessibility" },
        { question: "Which follows heuristic evaluation?", options: ["Nielsen","Knuth","Turing","Dijkstra"], correct: 0, category: "UX Evaluation" },
        { question: "Which grid is common on web?", options: ["5-col","8-col","12-col","20-col"], correct: 2, category: "Layout" },
        { question: "UX persona represents?", options: ["Real dev","Imagined hacker","Target user archetype","Stakeholder"], correct: 2, category: "Research" }
      ]
    }
    return null
  }

  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedSubject) return
      try {
        setLoading(true)
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"
        const url = `${base}/api/quiz?subject=${encodeURIComponent(selectedSubject)}&difficulty=intermediate&count=8`
        const res = await fetch(url)
        const data = await res.json()
        if (data?.success && Array.isArray(data.questions) && data.questions.length > 0) {
          const normalized = data.questions.map((q: any) => {
            if (q.type === 'true-false') {
              return { question: q.question, options: ["true","false"] }
            }
            const optionTexts = (q.options || []).map((o: any) => o.text || o)
            return { question: q.question, options: optionTexts.length ? optionTexts : ["A","B","C","D"] }
          })
          setDynamicQuestions(normalized)
          const correct = data.questions.map((q: any) => {
            if (q.type === 'true-false') return (String(q.correctAnswer).toLowerCase() === 'true') ? 0 : 1
            const idx = (q.options || []).findIndex((o: any) => o.isCorrect)
            return idx >= 0 ? idx : -1
          })
          setCorrectAnswers(correct)
          const cats = data.questions.map((_: any, i: number) => `Area ${i + 1}`)
          setCategories(cats)
          setQuizQuestions(normalized)
          setQuizCorrect(correct)
          setQuizCategories(cats)
          return
        }
      } catch (e) {
        console.error('Failed to fetch quiz questions', e)
      } finally {
        setLoading(false)
      }
      const local = buildLocalQuestions(selectedSubject)
      if (local) {
        const qs = local.map(q => ({ question: q.question, options: q.options }))
        const corr = local.map(q => q.correct)
        const cats = local.map(q => q.category)
        setDynamicQuestions(qs)
        setCorrectAnswers(corr)
        setCategories(cats)
        setQuizQuestions(qs)
        setQuizCorrect(corr)
        setQuizCategories(cats)
      } else {
        setDynamicQuestions(fallbackQuestions)
        setCorrectAnswers([])
        const cats = fallbackQuestions.map(q => q.category)
        setCategories(cats)
        setQuizQuestions(fallbackQuestions)
        setQuizCorrect([])
        setQuizCategories(cats)
      }
    }
    loadQuestions()
  }, [selectedSubject])

  const questions = quizQuestions || []

  const handleNext = () => {
    if (selectedAnswer) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedAnswer
      setAnswers(newAnswers)
      setSelectedAnswer("")
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        generateAndStoreResults(newAnswers)
        router.push("/test-results")
      }
    }
  }

  const generateAndStoreResults = (finalAnswers: string[]) => {
    const subject = selectedSubject || 'General'
    const perQuestionCorrect = finalAnswers.map((ans, idx) => {
      const correctIndex = correctAnswers[idx]
      const opts = questions[idx].options
      if (typeof correctIndex === 'number' && correctIndex >= 0) {
        const isCorrect = String(opts[correctIndex]).trim().toLowerCase() === String(ans).trim().toLowerCase()
        return isCorrect ? 1 : 0
      }
      const selectedIdx = opts.findIndex(o => String(o).trim().toLowerCase() === String(ans).trim().toLowerCase())
      const weights = [1, 0.8, 0.6, 0.4]
      if (selectedIdx >= 0) return weights[selectedIdx] ?? 0.5
      return (idx % 2 === 0) ? 0.6 : 0.4
    })

    const catToScores: Record<string, number[]> = {}
    const cats = quizCategories.length ? quizCategories : (questions.map((_: any, i: number) => `Area ${i + 1}`))
    cats.forEach((cat, i) => {
      if (!catToScores[cat]) catToScores[cat] = []
      catToScores[cat].push(perQuestionCorrect[i] || 0)
    })

    const catSummaries = Object.entries(catToScores).map(([area, scores]) => {
      const pct = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
      return { area, score: pct }
    })

    const sorted = [...catSummaries].sort((a, b) => b.score - a.score)
    const strengthCandidates = sorted.filter(s => s.score >= 60)
    const weaknessCandidates = sorted.filter(s => s.score < 60)

    const strengthsSource = strengthCandidates.length > 0 ? strengthCandidates : sorted.slice(0, Math.min(3, sorted.length))
    const weaknessesSource = weaknessCandidates.length > 0 ? weaknessCandidates : sorted.slice(-Math.min(3, sorted.length))

    const strengths = strengthsSource.slice(0, 3).map(s => ({ area: s.area, score: s.score, description: "You performed well in this area compared to others." }))
    const weaknesses = weaknessesSource.slice(0, 3).map(w => ({ area: w.area, score: w.score, description: "This area needs attention based on your answers.", improvement: "Review fundamentals and practice with targeted exercises." }))

    const recommendedCareer = subject.toLowerCase().includes('software') ? 'Software Engineer' :
      subject.toLowerCase().includes('data') ? 'Data Scientist' :
      subject.toLowerCase().includes('ui') ? 'Product Designer' :
      subject.toLowerCase().includes('product') ? 'Product Manager' : 'Professional'

    const overallScore = Math.round(sorted.reduce((a, c) => a + c.score, 0) / Math.max(sorted.length, 1))
    const careerMatch = Math.min(100, Math.max(0, overallScore))

    const results = { overallScore, strengths, weaknesses, recommendedCareer, careerMatch, recommendedCourses: [] }
    localStorage.setItem("aiAssessmentResults", JSON.stringify(results))
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1] || "")
    }
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <header className="relative z-10 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">CareerLaunch</h1>
          </Link>
          <div className="flex items-center space-x-6 text-sm text-gray-300">
            <div className="flex items-center glass-card px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 mr-2 text-blue-400" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
            <div className="flex items-center glass-card px-3 py-2 rounded-lg">
              <Users className="w-4 h-4 mr-2 text-purple-400" />
              50,000+ completed
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {selectedSubject && (
          <div className="mb-6 text-gray-300">Field selected: <span className="text-white font-semibold">{selectedSubject}</span></div>
        )}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-2xl font-bold gradient-text">
                Question {questions.length > 0 ? currentQuestion + 1 : 0} of {questions.length}
              </span>
              {questions.length > 0 && (
                <Badge className="ml-3 bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {(quizCategories[currentQuestion] || (questions[currentQuestion] as any)?.category || 'General')}
                </Badge>
              )}
            </div>
            <span className="text-lg font-medium text-gray-300">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 bg-gray-800" />
        </div>

        <Card className="glass-card shadow-2xl mb-8">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl text-white leading-relaxed">{questions[currentQuestion]?.question || 'Generating quiz...'}</CardTitle>
            <CardDescription className="text-lg text-gray-300">Choose the option that best describes your natural preference</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-gray-400 mb-4">Generating quiz...</div>}
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-4">
              {(questions[currentQuestion]?.options || []).map((option, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 border border-transparent hover:border-white/10">
                  <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-lg text-gray-200 leading-relaxed">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="border-gray-600 text-gray-300 hover:bg-white/10 px-8 py-3 bg-transparent">Previous</Button>
          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index < currentQuestion ? "bg-green-500" : index === currentQuestion ? "bg-blue-500 neon-glow" : "bg-gray-700"}`} />
            ))}
          </div>
          <Button onClick={handleNext} disabled={!selectedAnswer} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 neon-glow px-8 py-3 text-lg">
            {currentQuestion === questions.length - 1 ? (<><Zap className="w-5 h-5 mr-2" />View Results</>) : ("Next Question")}
          </Button>
        </div>
      </div>
    </div>
  )
}


