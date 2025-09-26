"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <header className="relative z-10 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">ShapingCareer</h1>
          </Link>
          <Link href="/" className="hidden sm:block">
            <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
              Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-5xl">
        <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">About ShapingCareer</h2>
        <p className="text-lg sm:text-xl text-gray-300 mb-8">
          We empower students, mentors, teachers, and employers to connect through AI‑powered assessments,
          personalized learning, and real opportunities. Our goal is to help you discover strengths, sharpen
          skills, and take the next step in your career journey.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-semibold mb-2">AI Assessment</h3>
            <p className="text-gray-300 text-sm">Understand your aptitude and receive clear, actionable guidance.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Mentorship</h3>
            <p className="text-gray-300 text-sm">Book mentors from industry to accelerate your learning and career.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Opportunities</h3>
            <p className="text-gray-300 text-sm">Explore jobs and internships aggregated and posted on the platform.</p>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/contact">
            <Button className="btn-primary">Contact Us</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}


