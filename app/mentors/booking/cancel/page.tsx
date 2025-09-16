"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-red-500/30">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-red-400 mb-2">
                Booking Cancelled
              </CardTitle>
              <p className="text-gray-300">
                Your booking was cancelled. No payment has been processed.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">What happened?</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• You cancelled the booking process</li>
                  <li>• No payment was processed</li>
                  <li>• No session was scheduled</li>
                  <li>• You can try booking again anytime</li>
                </ul>
              </div>

              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-300 mb-3">
                  If you experienced any issues during the booking process, please contact our support team.
                </p>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Contact Support
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/mentors" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
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
