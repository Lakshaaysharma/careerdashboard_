"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CheckoutClient() {
  const params = useSearchParams()
  const mentorId = params.get('mentorId') || ''
  const name = params.get('name') || 'Mentor'
  const amount = params.get('amount') || '0'
  const paymentBase = process.env.NEXT_PUBLIC_PAYMENT_URL

  const goToGateway = () => {
    const query = `mentorId=${encodeURIComponent(mentorId)}&amount=${encodeURIComponent(amount)}&name=${encodeURIComponent(name)}`
    if (paymentBase) {
      const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout/success?${query}` : ''
      const redirectUrl = `${paymentBase}${paymentBase.includes('?') ? '&' : '?'}${query}&returnUrl=${encodeURIComponent(returnUrl)}`
      window.location.href = redirectUrl
    } else {
      alert('Payment gateway URL not configured. Set NEXT_PUBLIC_PAYMENT_URL')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="glass-card p-8 rounded-2xl border border-white/10 w-full max-w-lg">
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
        <div className="space-y-2 text-gray-300">
          <div><span className="text-gray-400">Mentor:</span> {name}</div>
          <div><span className="text-gray-400">Amount:</span> ${amount}</div>
        </div>
        <Button onClick={goToGateway} className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600">Pay Now</Button>
      </div>
    </div>
  )
}
