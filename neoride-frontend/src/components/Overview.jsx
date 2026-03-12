import { useState } from 'react'
import SectionHeader from './SectionHeader'

const cards = [
  { icon: '📡', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',  title: 'NASA ALT Dataset',         text: '1.1M+ rows from a 2×18650 Li-ion pack covering 300+ hours of reference discharges, impedance measurements, and ageing cycles. BoL cycle: 3,674 points, 3,503 s, 2.52 A constant current.' },
  { icon: '⚙️', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', title: 'Equivalent Circuit Model', text: '1RC Thévenin model with series resistance R₀ for ohmic drop and parallel R₁–C₁ pair for polarisation dynamics. L-BFGS-B optimisation achieving 14.1 mV voltage RMSE.' },
  { icon: '🎯', color: '#10b981', bg: 'rgba(16,185,129,0.1)', title: 'Extended Kalman Filter',    text: 'State vector x = [SOC, V_RC]ᵀ. Fuses ECM predictions with real-time voltage measurements. Converges from 50% wrong init to within 2% of true SOC in under 1 second.' },
  { icon: '📈', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', title: 'OCV–SOC Polynomial',        text: '9th-degree polynomial fitted to OCV–SOC pairs via least squares. 13.3 mV RMSE across the full SOC range. Derivative dOCV/dSOC feeds the EKF Jacobian for linearisation.' },
  { icon: '🔒', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  title: 'Robustness Validated',      text: 'EKF tested from 5 initial SOC guesses (10%, 30%, 50%, 70%, 90%). All converge within 18 s to final error of −0.62% — confirming the filter is insensitive to initialisation.' },
  { icon: '⚡', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',  title: 'Production Ready',          text: 'Full pipeline executes in under 3 seconds. EKF loop is a few matrix multiplications per step — straightforwardly portable to embedded C. Minimal deps: NumPy, SciPy, Pandas.' },
]

function OvCard({ icon, color, bg, title, text }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0d1b35',
        border: `1px solid ${hovered ? 'rgba(0,212,255,0.35)' : 'rgba(0,212,255,0.15)'}`,
        borderRadius: 16, padding: 28, position: 'relative', overflow: 'hidden',
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hovered ? '0 10px 40px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg,${color},#7c3aed)`,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
      }} />
      <div style={{
        width: 50, height: 50, borderRadius: 12, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', marginBottom: 16,
      }}>{icon}</div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.7 }}>{text}</p>
    </div>
  )
}

export default function Overview() {
  return (
    <section id="overview" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <SectionHeader
          tag="Project Overview"
          title="What We Built"
          desc="An automated end-to-end workflow for OCV–SOC characterisation, ECM parameter identification, and real-time SOC estimation using the NASA ALT Battery Dataset."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))',
          gap: 24,
        }}>
          {cards.map(c => <OvCard key={c.title} {...c} />)}
        </div>
      </div>
    </section>
  )
}
