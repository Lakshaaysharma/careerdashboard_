"use client"

import { useState } from "react"
import { StudentHierarchyForm } from "@/components/ui/student-hierarchy-form"

interface StudentHierarchyData {
  instituteName: string
  className: string
  section: string
  batchYear: string
}

export default function StudentHierarchyDemo() {
  const [showForm, setShowForm] = useState(false)
  const [completedData, setCompletedData] = useState<StudentHierarchyData | null>(null)

  const handleFormComplete = (data: StudentHierarchyData) => {
    setCompletedData(data)
    setShowForm(false)
    console.log("Completed student hierarchy data:", data)
  }

  const handleBackToDemo = () => {
    setShowForm(false)
    setCompletedData(null)
  }

  if (showForm) {
    return (
      <StudentHierarchyForm
        onComplete={handleFormComplete}
        onBack={handleBackToDemo}
        isLoading={false}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Student Hierarchy Form Demo</h1>
          <p className="text-xl text-gray-300">Multi-step form for collecting student information</p>
        </div>

        {completedData ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">✅ Form Completed Successfully!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-4">
                 

                 
                 <div className="bg-gray-700/50 p-4 rounded-lg">
                   <h3 className="text-lg font-semibold text-green-400 mb-2">Institute Information</h3>
                   <p className="text-gray-300"><span className="font-medium">Institute:</span> {completedData.instituteName}</p>
                   <p className="text-gray-300"><span className="font-medium">Class:</span> {completedData.className}</p>
                   <p className="text-gray-300"><span className="font-medium">Section:</span> {completedData.section}</p>
                 </div>
                
                                 <div className="bg-gray-700/50 p-4 rounded-lg">
                   <h3 className="text-lg font-semibold text-green-400 mb-2">Academic Details</h3>
                   <p className="text-gray-300"><span className="font-medium">Batch Year:</span> {completedData.batchYear}</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Form Features</h3>
                  <ul className="text-gray-300 space-y-2">
                                         <li>• 4-step progressive form</li>
                    <li>• Real-time validation</li>
                    <li>• Visual progress indicator</li>
                    <li>• Predefined options for better UX</li>
                    <li>• Responsive design</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Data Structure</h3>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-auto">
{JSON.stringify(completedData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={handleBackToDemo}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Preview */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">📋 Form Preview</h2>
              <div className="space-y-4">
                                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                   <div>
                     <h3 className="text-white font-medium">Institute Name</h3>
                     <p className="text-gray-400 text-sm">Select your institute or university</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold">2</div>
                   <div>
                     <h3 className="text-gray-400 font-medium">Class</h3>
                     <p className="text-gray-500 text-sm">Select your current class or year</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold">3</div>
                   <div>
                     <h3 className="text-gray-400 font-medium">Section</h3>
                     <p className="text-gray-500 text-sm">Select your section</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold">4</div>
                   <div>
                     <h3 className="text-gray-400 font-medium">Batch Year</h3>
                     <p className="text-gray-500 text-sm">Select your batch year</p>
                   </div>
                 </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">✨ Features</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">✓</div>
                  <div>
                    <h3 className="text-white font-medium">Progressive Form</h3>
                    <p className="text-gray-400 text-sm">Step-by-step data collection with visual progress</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">✓</div>
                  <div>
                    <h3 className="text-white font-medium">Predefined Options</h3>
                    <p className="text-gray-400 text-sm">Dropdown menus with common options for better UX</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">✓</div>
                  <div>
                    <h3 className="text-white font-medium">Real-time Validation</h3>
                    <p className="text-gray-400 text-sm">Instant error feedback and field validation</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">✓</div>
                  <div>
                    <h3 className="text-white font-medium">Responsive Design</h3>
                    <p className="text-gray-400 text-sm">Works perfectly on all device sizes</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mt-0.5">✓</div>
                  <div>
                    <h3 className="text-white font-medium">Modern UI</h3>
                    <p className="text-gray-400 text-sm">Beautiful glass-morphism design with animations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!completedData && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              🚀 Start Student Hierarchy Form
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 