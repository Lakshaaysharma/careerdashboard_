import { Suspense } from "react"
import PaymentSuccessClient from "./PaymentSuccessClient"

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  )
}


