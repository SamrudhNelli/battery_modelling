import { useState } from 'react'
import SectionHeader from './SectionHeader'
import { pipelineSteps } from '../data/projectData'

export default function Pipeline() {
  const [hover, setHover] = useState(null)

  return (
    <section id="pipeline" style={{ padding: '80px 0', background: 'linear-gradient(180deg,transparent,#0a1628 15%,#0a1628 85%,transparent)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <SectionHeader
          tag="Pipeline"
          title="End-to-End SOC Estimation Pipeline"
          desc="Six tightly-coupled stages, each building on the previous, turning raw CSV data into a validated real-time SOC estimate."
        />

        {/* Pipeline flow */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', gap: 0, marginBottom: 60 }}>
          {pipelineSteps.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: 130 }}
              >
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  border: '2px solid #00d4ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', background: hover === i ? 'rgba(0,212,255,0.15)' : '#0a1628',
                  transition: 'all 0.3s', marginBottom: 12,
                  transform: hover === i ? 'scale(1.12)' : 'scale(1)',
                  boxShadow: hover === i ? '0 0 20px rgba(0,212,255,0.35)' : 'none',
                  cursor: 'default',
                }}>{step.icon}</div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>{step.label}</h4>
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{step.sub}</p>
              </div>
              {i < pipelineSteps.length - 1 && (
                <span style={{ fontSize: '1.3rem', color: '#00d4ff', opacity: 0.5, paddingTop: 22, flexShrink: 0 }}>→</span>
              )}
            </div>
          ))}
        </div>

        {/* ECM Diagram */}
        <div>
          <h3 style={{ textAlign: 'center', marginBottom: 24, fontSize: '1.05rem', fontWeight: 700 }}>
            1RC Thévenin Equivalent Circuit Model
          </h3>
          <div style={{
            background: '#0a1628',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 14, padding: '28px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: 12,
          }}>
            {/* Cell */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:'0.7rem', color:'#00d4ff' }}>V⁺</span>
              <div style={{ width:18, height:28, border:'2px solid #00d4ff', borderRadius:4, background:'rgba(0,212,255,0.07)' }}/>
              <span style={{ fontSize:'0.65rem', color:'#64748b' }}>Cell</span>
            </div>
            <div style={{ width:44, height:2, background:'rgba(0,212,255,0.6)' }}/>

            {/* R0 */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:'0.65rem', color:'#64748b' }}>Ohmic</span>
              <div style={{ padding:'8px 16px', border:'2px solid #00d4ff', borderRadius:8, fontFamily:'monospace', fontSize:'0.85rem', fontWeight:700, color:'#00d4ff', background:'rgba(0,212,255,0.06)' }}>R₀</div>
              <span style={{ fontSize:'0.65rem', color:'#f59e0b' }}>1.00 mΩ</span>
            </div>
            <div style={{ width:24, height:2, background:'rgba(0,212,255,0.6)' }}/>

            {/* R1C1 parallel */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, border:'2px dashed rgba(0,212,255,0.3)', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ padding:'6px 10px', border:'2px solid #00d4ff', borderRadius:7, fontFamily:'monospace', fontSize:'0.78rem', fontWeight:700, color:'#00d4ff', background:'rgba(0,212,255,0.06)' }}>R₁ = 1.00 mΩ</div>
              <span style={{ fontSize:'0.65rem', color:'#64748b' }}>‖ parallel ‖</span>
              <div style={{ padding:'6px 10px', border:'2px solid #00d4ff', borderRadius:7, fontFamily:'monospace', fontSize:'0.78rem', fontWeight:700, color:'#00d4ff', background:'rgba(0,212,255,0.06)' }}>C₁ = 5000 F</div>
              <span style={{ fontSize:'0.65rem', color:'#10b981' }}>τ = 5.0 s</span>
            </div>
            <div style={{ width:24, height:2, background:'rgba(0,212,255,0.6)' }}/>

            {/* Vterm */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:'0.65rem', color:'#64748b' }}>Terminal</span>
              <div style={{ padding:'8px 16px', border:'2px solid #10b981', borderRadius:8, fontFamily:'monospace', fontSize:'0.85rem', fontWeight:700, color:'#10b981', background:'rgba(16,185,129,0.06)' }}>V_term</div>
              <span style={{ fontSize:'0.65rem', color:'#64748b' }}>Measured</span>
            </div>

            {/* Equation box */}
            <div style={{
              marginLeft: 28, background: '#0f1f3a',
              border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10,
              padding: '14px 18px', fontFamily: 'monospace', fontSize: '0.82rem',
            }}>
              <div style={{ color: '#64748b', marginBottom: 6, fontSize: '0.7rem' }}>Terminal Voltage Equation:</div>
              <div style={{ color: '#10b981' }}>V = OCV(SOC) − I·R₀ − V_RC</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 6 }}>V_RC follows 1st-order exponential:</div>
              <div style={{ color: '#7c3aed', marginTop: 3 }}>τ = R₁ · C₁ = 5.0 s</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
