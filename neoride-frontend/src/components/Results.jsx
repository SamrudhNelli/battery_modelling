import SectionHeader from './SectionHeader'
import { keyMetrics, resultsTable } from '../data/projectData'

const colorMap = {
  blue:   { val: '#00d4ff', bar: '#00d4ff' },
  green:  { val: '#10b981', bar: '#10b981' },
  purple: { val: '#7c3aed', bar: '#7c3aed' },
  amber:  { val: '#f59e0b', bar: '#f59e0b' },
}

const statusStyle = {
  excellent: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  label: '✓ Excellent' },
  good:      { bg: 'rgba(16,185,129,0.1)',   color: '#10b981',  label: '✓ Good' },
  ok:        { bg: 'rgba(0,212,255,0.1)',    color: '#00d4ff',  label: '✓ OK' },
  warn:      { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b',  label: '⚠ Note' },
}

const robustness = [
  { soc: '10%', time: '~16s' },
  { soc: '30%', time: '~10s' },
  { soc: '50%', time: '<1s' },
  { soc: '70%', time: '~8s' },
  { soc: '90%', time: '~18s' },
]

export default function Results() {
  return (
    <section id="results" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <SectionHeader
          tag="Results"
          title="Validation Metrics"
          desc="All targets achieved. EKF SOC error stays well below the 5% BMS requirement throughout the entire discharge."
        />

        {/* Key metrics grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
          gap: 18, marginBottom: 36,
        }}>
          {keyMetrics.map(m => {
            const c = colorMap[m.color] || colorMap.blue
            return (
              <div key={m.label} style={{
                background: '#0d1b35',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 14, padding: '22px 18px',
                textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                  background: c.bar,
                }} />
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: c.val, lineHeight: 1, marginBottom: 4 }}>
                  {m.val}<span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>{m.unit}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>{m.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{m.sub}</div>
              </div>
            )
          })}
        </div>

        {/* Table */}
        <div style={{
          background: '#0d1b35',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 16, overflow: 'hidden', marginBottom: 28,
        }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(0,212,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Full Results Summary</h3>
            <span style={{
              background: 'rgba(16,185,129,0.15)', color: '#10b981',
              padding: '3px 12px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700,
            }}>✓ Target ≤5% SOC Error — Achieved</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,212,255,0.05)' }}>
                  <th style={{ padding: '11px 22px', textAlign: 'left', fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Metric</th>
                  <th style={{ padding: '11px 22px', textAlign: 'left', fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Value</th>
                  <th style={{ padding: '11px 22px', textAlign: 'left', fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {resultsTable.map((row, i) => {
                  const s = statusStyle[row.status] || statusStyle.ok
                  return (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '13px 22px', fontSize: '0.875rem', color: '#94a3b8' }}>{row.metric}</td>
                      <td style={{ padding: '13px 22px', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'monospace', color: s.color }}>{row.value}</td>
                      <td style={{ padding: '13px 22px' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 10, fontSize: '0.76rem', fontWeight: 700 }}>
                          {row.note || s.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Robustness strip */}
        <div style={{
          background: '#0d1b35',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 16, padding: 24,
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>EKF Multi-Start Robustness</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 20 }}>
            All 5 starting points converge to the same −0.62% final error within 18 seconds, confirming initialisation-independence.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {robustness.map(r => (
              <div key={r.soc} style={{
                flex: 1, minWidth: 100,
                background: '#0a1628',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 10, padding: '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed' }}>{r.soc}</div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 4 }}>✓ Converged</div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>{r.time} to &lt;2%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
