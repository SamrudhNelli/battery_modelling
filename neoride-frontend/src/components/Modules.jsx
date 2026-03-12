import { useState } from 'react'
import SectionHeader from './SectionHeader'
import { modules } from '../data/projectData'

function ModuleCard({ mod }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#0d1b35',
        border: `1px solid ${hov ? 'rgba(0,212,255,0.35)' : 'rgba(0,212,255,0.15)'}`,
        borderRadius: 16, overflow: 'hidden',
        transition: 'all 0.3s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 8px 40px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '18px 22px 14px',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 13,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, background: mod.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', flexShrink: 0,
        }}>{mod.icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{mod.name}</div>
          <div style={{ fontSize: '0.73rem', color: mod.color, fontFamily: 'monospace', marginTop: 2 }}>{mod.file}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 22px' }}>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: 14 }}>{mod.desc}</p>

        {/* Equation box */}
        <div style={{
          background: '#0a1628',
          borderLeft: `3px solid ${mod.color}`,
          border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 8, padding: '10px 14px',
          fontFamily: 'monospace', fontSize: '0.78rem',
          color: '#10b981', lineHeight: 1.85, whiteSpace: 'pre-wrap',
        }}>{mod.equation}</div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
          {mod.tags.map(t => (
            <span key={t} style={{
              background: mod.bg, color: mod.color,
              padding: '2px 9px', borderRadius: 6,
              fontSize: '0.72rem', fontWeight: 600,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Modules() {
  return (
    <section id="modules" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <SectionHeader
          tag="Source Modules"
          title="Python Module Documentation"
          desc="Seven purpose-built modules under src/, each independently testable via its __main__ block."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
          gap: 22,
        }}>
          {modules.map(m => <ModuleCard key={m.name} mod={m} />)}
        </div>
      </div>
    </section>
  )
}
