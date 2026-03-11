import SectionHeader from './SectionHeader'
import { ocvData, ecmData, ekfData, multiData, errorData } from '../data/projectData'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const chartBg  = '#0d1b35'
const gridClr  = 'rgba(255,255,255,0.05)'
const axisClr  = '#475569'
const tickStyle = { fontSize: 10, fill: '#475569' }

const tooltipStyle = {
  contentStyle: { background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 8 },
  labelStyle:   { color: '#e2e8f0', fontSize: 11 },
  itemStyle:    { fontSize: 11 },
}

function ChartCard({ title, badge, badgeColor, children }) {
  return (
    <div style={{
      background: chartBg,
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: 16, padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{title}</h3>
        <span style={{
          background: `${badgeColor}18`, color: badgeColor,
          padding: '2px 10px', borderRadius: 12, fontSize: '0.74rem', fontWeight: 600,
        }}>{badge}</span>
      </div>
      {children}
    </div>
  )
}

export default function Charts() {
  const multiKeys = ['init10','init30','init50','init70','init90']
  const multiColors = ['#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444']

  return (
    <section id="charts" style={{ padding: '80px 0', background: 'linear-gradient(180deg,transparent,#0a1628 10%,#0a1628 90%,transparent)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <SectionHeader
          tag="Interactive Charts"
          title="Visualise the Data"
          desc="Simulated data inspired by the NASA ALT battery dataset results — illustrating full pipeline performance."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(520px,1fr))', gap: 24 }}>

          {/* OCV-SOC */}
          <ChartCard title="🔵 OCV – SOC Polynomial Fit" badge="RMSE: 13.3 mV" badgeColor="#00d4ff">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ocvData} margin={{ top:4, right:12, left:-10, bottom:0 }}>
                <CartesianGrid stroke={gridClr} />
                <XAxis dataKey="soc" tick={tickStyle} label={{ value:'SOC (%)', position:'insideBottom', offset:-2, fill:axisClr, fontSize:10 }} />
                <YAxis tick={tickStyle} label={{ value:'OCV (V)', angle:-90, position:'insideLeft', fill:axisClr, fontSize:10 }} domain={['auto','auto']} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                <Line type="monotone" dataKey="measured" stroke="rgba(0,212,255,0.6)" strokeWidth={1.5} dot={{ r:2 }} name="Measured OCV" />
                <Line type="monotone" dataKey="fit"      stroke="#7c3aed"            strokeWidth={2.5} dot={false}     name="Poly Fit (deg 9)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ECM Voltage */}
          <ChartCard title="⚡ ECM Voltage Fit vs Measured" badge="RMSE: 14.1 mV" badgeColor="#10b981">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ecmData} margin={{ top:4, right:12, left:-10, bottom:0 }}>
                <CartesianGrid stroke={gridClr} />
                <XAxis dataKey="time" tick={tickStyle} label={{ value:'Time (s)', position:'insideBottom', offset:-2, fill:axisClr, fontSize:10 }} />
                <YAxis tick={tickStyle} label={{ value:'Voltage (V)', angle:-90, position:'insideLeft', fill:axisClr, fontSize:10 }} domain={['auto','auto']} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                <Line type="monotone" dataKey="measured"  stroke="rgba(0,212,255,0.7)" strokeWidth={1.5} dot={false} name="Measured V" />
                <Line type="monotone" dataKey="simulated" stroke="#ef4444"              strokeWidth={2}   dot={false} strokeDasharray="4 2" name="ECM Simulated" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* EKF SOC */}
          <ChartCard title="🎯 EKF SOC Estimation (init 50%)" badge="RMSE: 1.14%" badgeColor="#7c3aed">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ekfData} margin={{ top:4, right:12, left:-10, bottom:0 }}>
                <CartesianGrid stroke={gridClr} />
                <XAxis dataKey="time" tick={tickStyle} label={{ value:'Time (s)', position:'insideBottom', offset:-2, fill:axisClr, fontSize:10 }} />
                <YAxis tick={tickStyle} label={{ value:'SOC (%)', angle:-90, position:'insideLeft', fill:axisClr, fontSize:10 }} domain={[0,105]} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                <Line type="monotone" dataKey="reference" stroke="rgba(0,212,255,0.85)" strokeWidth={2.5} dot={false} name="Reference (CC)" />
                <Line type="monotone" dataKey="ekf"       stroke="#10b981"               strokeWidth={2}   dot={false} name="EKF (init=50%)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* SOC Error */}
          <ChartCard title="📉 SOC Error Over Time" badge="Final: −0.62%" badgeColor="#f59e0b">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={errorData} margin={{ top:4, right:12, left:-10, bottom:0 }}>
                <CartesianGrid stroke={gridClr} />
                <XAxis dataKey="time" tick={tickStyle} label={{ value:'Time (s)', position:'insideBottom', offset:-2, fill:axisClr, fontSize:10 }} />
                <YAxis tick={tickStyle} label={{ value:'Error (%)', angle:-90, position:'insideLeft', fill:axisClr, fontSize:10 }} />
                <Tooltip {...tooltipStyle} />
                <ReferenceLine y={2}  stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" />
                <ReferenceLine y={-2} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" />
                <ReferenceLine y={0}  stroke="rgba(255,255,255,0.1)" />
                <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                <Line type="monotone" dataKey="error" stroke="#f59e0b" strokeWidth={2} dot={false} name="SOC Error (%)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Multi-start chart – full width */}
        <div style={{ marginTop: 24 }}>
          <ChartCard title="🔄 EKF Multi-Start Robustness (5 Initial SOC Values)" badge="All converge <18s" badgeColor="#10b981">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={multiData} margin={{ top:4, right:20, left:-10, bottom:0 }}>
                <CartesianGrid stroke={gridClr} />
                <XAxis dataKey="time" tick={tickStyle} label={{ value:'Time (s)', position:'insideBottom', offset:-2, fill:axisClr, fontSize:10 }} />
                <YAxis tick={tickStyle} label={{ value:'SOC (%)', angle:-90, position:'insideLeft', fill:axisClr, fontSize:10 }} domain={[0,105]} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                {multiKeys.map((k, i) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={multiColors[i]} strokeWidth={1.8} dot={false} name={`Init ${[10,30,50,70,90][i]}%`} />
                ))}
                <Line type="monotone" dataKey="reference" stroke="#ffffff" strokeWidth={2.5} dot={false} strokeDasharray="6 3" name="Reference (CC)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </section>
  )
}
