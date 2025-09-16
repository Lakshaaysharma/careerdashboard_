"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Clock, User, CreditCard } from "lucide-react"

export default function BookingSuccessPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    
    if (sessionId) {
      // In a real implementation, you would fetch the session details from your backend
      // For now, we'll just show a success message
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Processing your booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-green-500/30">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-400 mb-2">
                Booking Successful!
              </CardTitle>
              <p className="text-gray-300">
                Your session has been booked and payment processed successfully.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Session Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">Date & Time:</span>
                    <span className="text-white">To be confirmed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-white">To be confirmed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Mentor:</span>
                    <span className="text-white">To be confirmed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">Payment:</span>
                    <span className="text-green-400">Completed</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">What's Next?</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• You'll receive a confirmation email with session details</li>
                  <li>• The mentor will be notified of your booking</li>
                  <li>• Meeting link will be sent closer to the session time</li>
                  <li>• You can manage your bookings in your dashboard</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/mentors" className="flex-1">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    Browse More Mentors
                  </Button>
                </Link>
                <Link href="/dashboard/student" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    View My Bookings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
