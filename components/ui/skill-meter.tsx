"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface SkillMeterProps {
  skill: string
  level: number
  maxLevel?: number
  color?: string
  animated?: boolean
}

export function SkillMeter({ skill, level, maxLevel = 100, color = "blue", animated = true }: SkillMeterProps) {
  const [animatedLevel, setAnimatedLevel] = useState(0)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedLevel(level), 300)
      return () => clearTimeout(timer)
    } else {
      setAnimatedLevel(level)
    }
  }, [level, animated])

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-cyan-500",
      purple: "from-purple-500 to-pink-500",
      green: "from-green-500 to-emerald-500",
      orange: "from-orange-500 to-red-500",
      yellow: "from-yellow-500 to-orange-500",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-3 p-4 glass-card rounded-lg hover-lift">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-white">{skill}</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {animatedLevel}/{maxLevel}
          </span>
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getColorClasses(color)} neon-glow`} />
        </div>
      </div>
      <div className="relative">
        <Progress value={(animatedLevel / maxLevel) * 100} className="h-3" />
        <div
          className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${getColorClasses(color)} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${(animatedLevel / maxLevel) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Beginner</span>
        <span>Expert</span>
      </div>
    </div>
  )
}
