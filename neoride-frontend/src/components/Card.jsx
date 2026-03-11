import { useState } from 'react'

export default function Card({ children, style = {} }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0d1b35',
        border: `1px solid ${hovered ? 'rgba(0,212,255,0.35)' : 'rgba(0,212,255,0.15)'}`,
        borderRadius: 16,
        padding: 28,
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 40px rgba(0,0,0,0.4),0 0 24px rgba(0,212,255,0.15)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
