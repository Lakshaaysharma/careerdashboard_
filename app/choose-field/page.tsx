"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ChooseFieldPage() {
  const [field, setField] = useState<string>("")
  const [other, setOther] = useState<string>("")
  const router = useRouter()

  const startTest = () => {
    const chosen = field === 'other' ? other.trim() : field
    if (!chosen) return
    router.push(`/aptitude-test?subject=${encodeURIComponent(chosen)}`)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Responsive Choose Field Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24 max-w-3xl">
        <Card className="glass-card">
          <CardHeader className="px-4 sm:px-6 pt-6 sm:pt-8">
            <CardTitle className="text-3xl sm:text-4xl gradient-text text-center sm:text-left">Choose Your Field</CardTitle>
            <CardDescription className="text-gray-300 text-base sm:text-lg text-center sm:text-left">
              Select the field you want to pursue. We will generate a tailored aptitude test.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-white text-base sm:text-lg">Field of Interest</Label>
              <Select onValueChange={(v) => setField(v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 sm:h-14 text-base sm:text-lg">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="software engineering" className="text-base sm:text-lg py-3">Software Engineering</SelectItem>
                  <SelectItem value="data science" className="text-base sm:text-lg py-3">Data Science & Machine Learning</SelectItem>
                  <SelectItem value="ui ux design" className="text-base sm:text-lg py-3">UI/UX Design</SelectItem>
                  <SelectItem value="product management" className="text-base sm:text-lg py-3">Product Management</SelectItem>
                  <SelectItem value="digital marketing" className="text-base sm:text-lg py-3">Digital Marketing</SelectItem>
                  <SelectItem value="cloud devops" className="text-base sm:text-lg py-3">Cloud & DevOps</SelectItem>
                  <SelectItem value="cybersecurity" className="text-base sm:text-lg py-3">Cybersecurity</SelectItem>
                  <SelectItem value="problem solving" className="text-base sm:text-lg py-3">Problem Solving</SelectItem>
                  <SelectItem value="critical thinking" className="text-base sm:text-lg py-3">Critical Thinking</SelectItem>
                  <SelectItem value="other" className="text-base sm:text-lg py-3">Other</SelectItem>
                </SelectContent>
              </Select>
              {field === 'other' && (
                <input
                  placeholder="Enter your field"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  className="mt-3 w-full bg-white/10 border border-white/20 rounded-md p-3 sm:p-4 text-base sm:text-lg text-white placeholder-gray-300"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white bg-transparent hover:bg-white/10 py-3 px-6">
                  Back
                </Button>
              </Link>
              <Button 
                onClick={startTest} 
                disabled={!field} 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 px-6 text-base sm:text-lg"
              >
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


