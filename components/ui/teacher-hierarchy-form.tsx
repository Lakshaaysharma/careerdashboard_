"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

interface TeacherSetupData {
  instituteName: string
}

interface TeacherHierarchyFormProps {
  onComplete: (data: TeacherSetupData) => void
  onBack: () => void
  isLoading?: boolean
  onSaveToDatabase?: (data: TeacherSetupData) => Promise<void>
}

export function TeacherHierarchyForm({ onComplete, onBack, isLoading = false, onSaveToDatabase }: TeacherHierarchyFormProps) {
  const [formData, setFormData] = useState<TeacherSetupData>({
    instituteName: ""
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [customInstituteName, setCustomInstituteName] = useState("")

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

  const handleInput = (field: keyof TeacherSetupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const e: {[key: string]: string} = {}
    
    if (!formData.instituteName.trim()) {
      e.instituteName = "Institute name is required"
    } else if (formData.instituteName === "Other" && !customInstituteName.trim()) {
      e.instituteName = "Please enter your institute name"
    }
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    // Prepare final data
    const finalData = { ...formData }
    
    // If "Other" was selected for institute, use the custom name
    if (formData.instituteName === "Other" && customInstituteName.trim()) {
      finalData.instituteName = customInstituteName.trim()
    }
    
    // Save to database if callback is provided
    if (onSaveToDatabase) {
      try {
        await onSaveToDatabase(finalData)
      } catch (error) {
        console.error('Error saving to database:', error)
        // You can add error handling here (show toast, etc.)
      }
    }
    
    onComplete(finalData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card border-white/10">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl gradient-text flex items-center justify-center">
          <Building2 className="w-8 h-8 mr-3" />
          Teacher Information
        </CardTitle>
        <CardDescription className="text-xl text-gray-300">
          Institute Name
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-gray-300">Institute Name</Label>
          <Select value={formData.instituteName} onValueChange={(v) => handleInput('instituteName', v)}>
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
          {errors.instituteName && <p className="text-red-400 text-sm">{errors.instituteName}</p>}
          
          {/* Show manual input if "Other" is selected */}
          {formData.instituteName === "Other" && (
            <div className="mt-4 space-y-2">
              <Label className="text-gray-300">Enter Institute Name</Label>
              <Input 
                placeholder="Enter your institute or university name" 
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                value={customInstituteName}
                onChange={(e) => setCustomInstituteName(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? "Saving..." : "Save Institute"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
