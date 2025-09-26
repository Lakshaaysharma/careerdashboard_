"use client"

import Link from "next/link"
import { TrendingUp } from "lucide-react"

export default function PrivacyPage() {
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
        <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6">Privacy Policy</h2>
        <p className="text-gray-300 mb-8">Last updated: {new Date().toISOString().slice(0,10)}</p>

        <section className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h3>
            <p>Account data (name, email, role), assessment responses, usage analytics, device data, and files you upload. Payments are handled by third‑party processors; we store limited metadata.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">2. How We Use Information</h3>
            <p>To provide services, personalize results, connect mentors/employers, improve the product, prevent fraud, and communicate with you.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">3. Sharing</h3>
            <p>We share data with service providers (hosting, analytics, payments) and, as needed, with mentors/employers for matching. We may disclose information to comply with laws. We do not sell personal data.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">4. Cookies & Tracking</h3>
            <p>We use essential and analytics cookies. You can manage preferences via your browser and device settings.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">5. Retention</h3>
            <p>We retain data only as long as necessary for the purposes described or as required by law, then delete or anonymize it.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">6. Security</h3>
            <p>We apply technical and organizational measures to protect your data but cannot guarantee absolute security.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">7. International Transfers</h3>
            <p>Your data may be transferred across borders with appropriate safeguards.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">8. Children</h3>
            <p>Our services are not directed to children under the applicable age of consent. If we learn of such data, we will delete it.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">9. Your Rights</h3>
            <p>You may request access, correction, deletion, or portability of your data, and object to or restrict processing where applicable.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">10. AI Disclosures</h3>
            <p>Assessment data may be processed by AI providers to generate results. We monitor quality and provide explanations and improvement guidance.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">11. Changes</h3>
            <p>We will post updates to this policy and update the “Last Updated” date.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">12. Contact</h3>
            <p>Privacy inquiries: <a href="mailto:privacy@shapingcareer.com" className="text-blue-400">privacy@shapingcareer.com</a></p>
          </div>
        </section>
      </main>
    </div>
  )
}


