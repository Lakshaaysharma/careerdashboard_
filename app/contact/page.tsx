"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, Mail, MessageCircle, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <header className="relative z-10 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center neon-glow">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">ShapingCareer</h1>
          </Link>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Home</Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-4xl">
        <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6">Contact Us</h2>
        <p className="text-gray-300 mb-8">We'd love to hear from you. Reach out for support, partnerships, or general inquiries.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-semibold">Email</h3>
            </div>
            <a href="mailto:contact@shapingcareer.com" className="text-blue-400 hover:text-blue-300 break-all">
              contact@shapingcareer.com
            </a>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-green-400" />
              <h3 className="text-xl font-semibold">Phone</h3>
            </div>
            <p className="text-gray-300">+1 (555) 010-2030</p>
          </div>
          
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Quick Message</h3>
          <p className="text-gray-300 text-sm mb-4">Prefer your email app? Click below and we’ll draft an email for you.</p>
          <a href="mailto:contact@shapingcareer.com?subject=Support%20Request&body=Please%20describe%20your%20issue%20and%20include%20your%20role%20(student%2C%20teacher%2C%20mentor%2C%20employer)." className="inline-block">
            <Button className="btn-primary">Email Support</Button>
          </a>
        </div>
      </main>
    </div>
  )
}


