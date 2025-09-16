import { Suspense } from "react"
import AptitudeTestClient from "./AptitudeTestClient"

export const dynamic = 'force-dynamic'

export default function AptitudeTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <AptitudeTestClient />
    </Suspense>
  )
}
