import SectionHeader from './SectionHeader'
import { limitations } from '../data/projectData'

export default function Limitations() {
  return (
    <section id="limitations" style={{ padding: '80px 0', background: 'linear-gradient(180deg,transparent,#0a1628 15%,#0a1628 85%,transparent)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <SectionHeader
          tag="Limitations & Future Work"
          title="What We Know Can Be Improved"
          desc="Transparent about constraints — and what the next version of this pipeline would address."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 18 }}>
          {limitations.map(lim => (
            <div key={lim.title} style={{
              background: '#0d1b35',
              border: '1px solid rgba(0,212,255,0.12)',
              borderRadius: 14, padding: 22,
              display: 'flex', gap: 16,
            }}>
              <span style={{ fontSize: '1.6rem', flexShrink: 0, marginTop: 2 }}>{lim.icon}</span>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 7 }}>{lim.title}</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.65 }}>{lim.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
