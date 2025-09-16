"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Building2, GraduationCap, BookOpen, Users, Calendar, CheckCircle, Mail } from "lucide-react"

interface StudentHierarchyData {
  instituteName: string
  manualInstituteName?: string
  className: string
  section: string
  batchYear: string
}

interface StudentHierarchyFormProps {
  onComplete: (data: StudentHierarchyData) => void
  onBack: () => void
  isLoading?: boolean
}

export function StudentHierarchyForm({ onComplete, onBack, isLoading = false }: StudentHierarchyFormProps) {
  const [formData, setFormData] = useState<StudentHierarchyData>({
    instituteName: "",
    manualInstituteName: "",
    className: "",
    section: "",
    batchYear: ""
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Predefined options for better UX
  const instituteOptions = [
    "IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
    "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT Indore", "IIT Jodhpur",
    "IIT Patna", "IIT Ropar", "IIT Bhubaneswar", "IIT Gandhinagar", "IIT Mandi",
    "IIT Varanasi", "IIT Dhanbad", "IIT Bhilai", "IIT Goa", "IIT Jammu",
    "IIT Palakkad", "IIT Tirupati", "IIT Dharwad", "IIT Jodhpur", "IIT Bhubaneswar",
    "Delhi University", "Mumbai University", "Pune University", "Calcutta University",
    "Madras University", "Bangalore University", "Hyderabad University", "Punjab University",
    "BITS Pilani", "Manipal University", "Amity University", "SRM University",
    "VIT University", "Thapar University", "DTU Delhi", "NSIT Delhi",
    "IGDTUW Delhi", "GGSIPU Delhi", "Jamia Millia Islamia", "JNU Delhi",
    "St. Stephen's College", "Lady Shri Ram College", "Hindu College", "Miranda House",
    "St. Xavier's College Mumbai", "St. Xavier's College Kolkata", "Presidency College",
    "Fergusson College", "Elphinstone College", "Wilson College", "St. Xavier's College Ahmedabad",
    "Other"
  ]

  const classOptions = [
    "Class X", "Class XI", "Class XII",
    "B.Tech 1st Year", "B.Tech 2nd Year", "B.Tech 3rd Year", "B.Tech 4th Year",
    "B.Sc 1st Year", "B.Sc 2nd Year", "B.Sc 3rd Year",
    "BBA 1st Year", "BBA 2nd Year", "BBA 3rd Year",
    "MBA 1st Year", "MBA 2nd Year",
    "M.Tech 1st Year", "M.Tech 2nd Year",
    "PhD"
  ]

  const sectionOptions = ["A", "B", "C", "D", "E", "F", "G", "H"]

  const batchYearOptions = [
    "2024-25", "2025-26", "2026-27", "2027-28", "2028-29"
  ]

  const handleInputChange = (field: keyof StudentHierarchyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {}

    switch (step) {
      case 1:
        if (!formData.instituteName.trim()) {
          newErrors.instituteName = "Institute name is required"
        } else if (formData.instituteName === "Other" && (!formData.manualInstituteName || !formData.manualInstituteName.trim())) {
          newErrors.manualInstituteName = "Please enter your institute name"
        }
        break
      case 2:
        if (!formData.className) {
          newErrors.className = "Please select your class"
        }
        break
      case 3:
        if (!formData.section) {
          newErrors.section = "Please select your section"
        }
        break
      case 4:
        if (!formData.batchYear) {
          newErrors.batchYear = "Please select your batch year"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
        setCompletedSteps(prev => [...prev, currentStep])
      } else {
        // All steps completed, prepare final data
        const finalData = { ...formData }
        
        // If "Other" was selected, use the manual institute name
        if (formData.instituteName === "Other" && formData.manualInstituteName) {
          finalData.instituteName = formData.manualInstituteName
        }
        
        // Remove the manualInstituteName field from final data
        delete finalData.manualInstituteName
        
        // Submit the form
        onComplete(finalData)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      onBack()
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Building2 className="w-5 h-5" />
      case 2: return <GraduationCap className="w-5 h-5" />
      case 3: return <Users className="w-5 h-5" />
      case 4: return <Calendar className="w-5 h-5" />
      default: return null
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Institute Name"
      case 2: return "Class"
      case 3: return "Section"
      case 4: return "Batch Year"
      default: return ""
    }
  }

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return "Select your institute or university from the list"
      case 2: return "Select your current class or year"
      case 3: return "Select your section"
      case 4: return "Select your batch year"
      default: return ""
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instituteName" className="text-gray-300">Institute Name</Label>
              <Select value={formData.instituteName} onValueChange={(value) => handleInputChange('instituteName', value)}>
                <SelectTrigger className={`bg-gray-800/50 border-gray-600 text-white ${errors.instituteName ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select your institute or university" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                  {instituteOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.instituteName && (
                <p className="text-red-400 text-sm">{errors.instituteName}</p>
              )}
              
              {/* Show manual input if "Other" is selected */}
              {formData.instituteName === "Other" && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="manualInstituteName" className="text-gray-300">Enter Institute Name</Label>
                  <Input 
                    id="manualInstituteName" 
                    placeholder="Enter your institute or university name" 
                    value={formData.manualInstituteName}
                    onChange={(e) => handleInputChange('manualInstituteName', e.target.value)}
                    className={`bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 ${errors.manualInstituteName ? 'border-red-500' : ''}`}
                  />
                  {errors.manualInstituteName && (
                    <p className="text-red-400 text-sm">{errors.manualInstituteName}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className" className="text-gray-300">Class</Label>
              <Select value={formData.className} onValueChange={(value) => handleInputChange('className', value)}>
                <SelectTrigger className={`bg-gray-800/50 border-gray-600 text-white ${errors.className ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                  {classOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.className && (
                <p className="text-red-400 text-sm">{errors.className}</p>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section" className="text-gray-300">Section</Label>
              <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)}>
                <SelectTrigger className={`bg-gray-800/50 border-gray-600 text-white ${errors.section ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select your section" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {sectionOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.section && (
                <p className="text-red-400 text-sm">{errors.section}</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchYear" className="text-gray-300">Batch Year</Label>
              <Select value={formData.batchYear} onValueChange={(value) => handleInputChange('batchYear', value)}>
                <SelectTrigger className={`bg-gray-800/50 border-gray-600 text-white ${errors.batchYear ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select your batch year" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {batchYearOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.batchYear && (
                <p className="text-red-400 text-sm">{errors.batchYear}</p>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <Card className="glass-card shadow-2xl border border-white/10">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl gradient-text">Student Information</CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Step {currentStep} of 4: {getStepTitle(currentStep)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="mb-8">
                             <div className="flex justify-between items-center">
                 {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${step === currentStep 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : completedSteps.includes(step)
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-400'
                      }
                    `}>
                      {completedSteps.includes(step) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        getStepIcon(step)
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-400 hidden sm:block">
                      {getStepTitle(step)}
                    </span>
                  </div>
                ))}
              </div>
                             <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                   style={{ width: `${(currentStep / 4) * 100}%` }}
                 ></div>
               </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{getStepTitle(currentStep)}</h3>
                <p className="text-gray-400">{getStepDescription(currentStep)}</p>
              </div>
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={handleBack}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {currentStep === 1 ? "Back to Signup" : "Previous"}
              </Button>
              
                             <Button
                 onClick={handleNext}
                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                 disabled={isLoading}
               >
                 {isLoading ? "Processing..." : currentStep === 4 ? "Complete Setup" : "Next"}
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 