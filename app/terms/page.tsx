"use client"

import Link from "next/link"
import { TrendingUp } from "lucide-react"

export default function TermsPage() {
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
        <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6">Terms of Service</h2>
        <p className="text-gray-300 mb-8">Last updated: {new Date().toISOString().slice(0,10)}</p>

        <section className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">1. Service Description</h3>
            <p>ShapingCareer provides AI‑powered assessments, mentorship booking, and job/internship discovery tools.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">2. Eligibility & Accounts</h3>
            <p>Users must provide accurate information and maintain account security. Separate accounts are permitted per role.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">3. User Conduct</h3>
            <p>Prohibited: unlawful content, harassment, scraping, spamming, security abuse, or infringement.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">4. Content & Licenses</h3>
            <p>You retain ownership of content you submit. You grant us a limited license to host, display, and process it to provide the service.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">5. Payments & Refunds</h3>
            <p>Where applicable, prices and taxes are shown at checkout. Refunds are governed by the offer terms and local law.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">6. Mentorship & Opportunities</h3>
            <p>We facilitate connections but do not guarantee outcomes, employment, or compensation levels.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">7. Intellectual Property</h3>
            <p>Our brand, code, and designs are protected. Report alleged infringement to privacy@shapingcareer.com.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">8. Disclaimers</h3>
            <p>Service provided “as‑is” without warranties. AI guidance may be imperfect and should be used with judgment.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">9. Liability & Indemnity</h3>
            <p>To the maximum permitted by law, our liability is limited. You agree to indemnify us for misuse or violations.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">10. Termination</h3>
            <p>We may suspend or terminate accounts for violations or risk. Certain terms survive termination.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">11. Governing Law & Disputes</h3>
            <p>These terms are governed by applicable local laws. Venue and dispute resolution procedures may apply.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">12. Changes</h3>
            <p>We may update these terms; material changes will be announced with a new effective date.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">13. Contact</h3>
            <p>Questions? Email <a href="mailto:privacy@shapingcareer.com" className="text-blue-400">privacy@shapingcareer.com</a>.</p>
          </div>
        </section>
      </main>
    </div>
  )
}


