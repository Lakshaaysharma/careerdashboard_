"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  const params = useSearchParams()
  const router = useRouter()
  const mentorId = params.get('mentorId') || ''
  const [mentor, setMentor] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadMentor = async () => {
      if (!mentorId) {
        setError('Missing mentor id')
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`http://localhost:5000/api/mentors/${mentorId}`)
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load mentor')
        setMentor(json.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load mentor')
      } finally {
        setLoading(false)
      }
    }
    loadMentor()
  }, [mentorId])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="glass-card p-8 rounded-2xl border border-white/10 w-full max-w-lg">
        <h1 className="text-2xl font-semibold mb-2">Payment Successful</h1>
        <p className="text-gray-300 mb-6">Thanks for your purchase. Here are your mentor's contact details.</p>
        {loading ? (
          <div className="text-gray-400">Loading mentor...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : mentor ? (
          <div className="space-y-3">
            <div><span className="text-gray-400">Mentor:</span> {mentor.name}</div>
            <div><span className="text-gray-400">Email:</span> {mentor.email || '—'}</div>
            <div><span className="text-gray-400">Phone:</span> {mentor.phone || '—'}</div>
          </div>
        ) : null}
        <div className="mt-6 flex justify-end">
          <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-blue-600 to-purple-600">Go to Home</Button>
        </div>
      </div>
    </div>
  )
}


