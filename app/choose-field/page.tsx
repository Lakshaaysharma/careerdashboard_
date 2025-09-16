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

      <div className="relative z-10 container mx-auto px-6 py-24 max-w-3xl">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-4xl gradient-text">Choose Your Field</CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Select the field you want to pursue. We will generate a tailored aptitude test.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">Field of Interest</Label>
              <Select onValueChange={(v) => setField(v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="software engineering">Software Engineering</SelectItem>
                  <SelectItem value="data science">Data Science & Machine Learning</SelectItem>
                  <SelectItem value="ui ux design">UI/UX Design</SelectItem>
                  <SelectItem value="product management">Product Management</SelectItem>
                  <SelectItem value="digital marketing">Digital Marketing</SelectItem>
                  <SelectItem value="cloud devops">Cloud & DevOps</SelectItem>
                  <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="problem solving">Problem Solving</SelectItem>
                  <SelectItem value="critical thinking">Critical Thinking</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {field === 'other' && (
                <input
                  placeholder="Enter your field"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  className="mt-3 w-full bg-white/10 border border-white/20 rounded-md p-3 text-white placeholder-gray-300"
                />
              )}
            </div>

            <div className="flex gap-4">
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10">
                  Back
                </Button>
              </Link>
              <Button onClick={startTest} disabled={!field} className="bg-gradient-to-r from-blue-600 to-purple-600">
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


