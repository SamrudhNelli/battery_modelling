import { useState } from 'react'
import SectionHeader from './SectionHeader'
import { notebooks } from '../data/projectData'

function NbCard({ nb }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#0d1b35',
        border: `1px solid ${hov ? 'rgba(0,212,255,0.35)' : 'rgba(0,212,255,0.15)'}`,
        borderRadius: 14, padding: 24, position: 'relative', overflow: 'hidden',
        transition: 'all 0.3s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 8px 35px rgba(0,0,0,0.35)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: nb.color, opacity: hov ? 1 : 0, transition: 'opacity 0.3s',
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 11, background: nb.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.95rem', fontWeight: 800, color: nb.color,
        marginBottom: 14,
      }}>{nb.num}</div>
      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: 8 }}>{nb.name}</h3>
      <div style={{
        fontFamily: 'monospace', fontSize: '0.72rem',
        color: nb.color, marginBottom: 10,
        background: `${nb.color}18`, padding: '2px 8px', borderRadius: 5,
        display: 'inline-block',
      }}>{nb.file}</div>
      <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.65 }}>{nb.desc}</p>
    </div>
  )
}

export default function Notebooks() {
  return (
    <section id="notebooks" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <SectionHeader
          tag="Notebooks"
          title="Interactive Jupyter Notebooks"
          desc="Seven self-contained notebooks, each step-numbered. Run cells top-to-bottom for a guided walkthrough."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 20 }}>
          {notebooks.map(nb => <NbCard key={nb.num} nb={nb} />)}
        </div>
      </div>
    </section>
  )
}
