"use client"

import { useState } from "react"
import { TeacherHierarchyForm } from "@/components/ui/teacher-hierarchy-form"
import { teacherProfileService } from "@/services/teacherProfileService"
import { toast } from "sonner"

interface TeacherSetupData {
  instituteName: string
  className: string
  subjects: string[]
  section: string
  courses: {
    name: string
    description?: string
    level?: string
  }[]
  batchYear: string
}

export default function TeacherSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [savedData, setSavedData] = useState<TeacherSetupData | null>(null)

  const handleSaveToDatabase = async (data: TeacherSetupData) => {
    try {
      setIsLoading(true)
      console.log('Saving teacher profile data:', data)
      
      const result = await teacherProfileService.saveCompleteProfile(data)
      
      if (result.success) {
        toast.success('Teacher profile saved successfully!')
        setSavedData(data)
        console.log('Profile saved:', result.data)
      } else {
        toast.error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Error saving profile. Please try again.')
      throw error // Re-throw to prevent form completion
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = (data: TeacherSetupData) => {
    console.log('Form completed with data:', data)
    setSetupComplete(true)
    setSavedData(data)
  }

  const handleBack = () => {
    console.log('Going back to previous step')
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">Setup Complete! 🎉</h1>
            <p className="text-gray-300 mb-6">
              Your teacher profile has been successfully created and saved to the database.
            </p>
            
            {savedData && (
              <div className="bg-gray-800/30 rounded-lg p-6 text-left mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Summary</h2>
                <div className="space-y-3 text-gray-300">
                  <div><strong>Institute:</strong> {savedData.instituteName}</div>
                  <div><strong>Class:</strong> {savedData.className}</div>
                  <div><strong>Section:</strong> {savedData.section}</div>
                  <div><strong>Batch Year:</strong> {savedData.batchYear}</div>
                  <div><strong>Subjects:</strong> {savedData.subjects.join(', ')}</div>
                  <div><strong>Courses:</strong> {savedData.courses.length} courses</div>
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setSetupComplete(false)
                setSavedData(null)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TeacherHierarchyForm
      onComplete={handleComplete}
      onBack={handleBack}
      isLoading={isLoading}
      onSaveToDatabase={handleSaveToDatabase}
    />
  )
}
