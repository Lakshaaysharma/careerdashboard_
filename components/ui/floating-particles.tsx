"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  speed: number
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      const headerHeight = 120 // Approximate header height
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight - headerHeight) + headerHeight, // Start particles below header
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.5 + 0.1,
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
    window.addEventListener("resize", generateParticles)
    return () => window.removeEventListener("resize", generateParticles)
  }, [])

  useEffect(() => {
    const animateParticles = () => {
      const headerHeight = 120 // Approximate header height
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          y: particle.y < -10 ? window.innerHeight + 10 : particle.y - particle.speed,
        })),
      )
    }

    const interval = setInterval(animateParticles, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="particle-bg" style={{ pointerEvents: 'none', zIndex: 1 }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            background: `radial-gradient(circle, rgba(59, 130, 246, ${particle.opacity}), transparent)`,
            position: 'absolute',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  )
}
