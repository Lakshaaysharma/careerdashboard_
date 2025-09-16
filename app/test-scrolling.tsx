"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestScrolling() {
  const [showDialog, setShowDialog] = useState(false)
  const [items, setItems] = useState<string[]>([])

  const addItems = () => {
    const newItems = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
    setItems(newItems)
  }

  return (
    <div className="p-8">
      <Button onClick={() => setShowDialog(true)}>Test Scrolling Dialog</Button>
      <Button onClick={addItems} className="ml-4">Add Test Items</Button>
      
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full mx-4 dialog-content">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Test Scrolling</h2>
              <p className="text-gray-300">This dialog tests scrolling functionality</p>
            </div>
            
            <div className="p-6 dialog-body custom-scrollbar">
              <div className="space-y-4">
                <p className="text-white">Scroll down to see more content...</p>
                
                {items.map((item, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">{item}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">
                        This is test content for {item}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                      </p>
                    </CardContent>
                  </Card>
                ))}
                
                <p className="text-white text-center py-4">End of content</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700">
              <Button onClick={() => setShowDialog(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





