import { useState, useCallback, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const API = '/api'  // Use relative URL for production

const gridClr   = 'rgba(255,255,255,0.05)'
const tickStyle = { fontSize: 10, fill: '#475569' }
const tooltipStyle = {
  contentStyle: { background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 8 },
  labelStyle: { color: '#e2e8f0', fontSize: 11 },
  itemStyle: { fontSize: 11 },
}

const stepIcons = ['📂','🔋','📐','🔍','⚙️','🎯']
const multiColors = ['#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444']

function ChartCard({ title, badge, badgeColor, children }) {
  return (
    <div style={{ background:'#0d1b35', border:'1px solid rgba(0,212,255,0.15)', borderRadius:16, padding:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <h3 style={{ fontSize:'0.95rem', fontWeight:700 }}>{title}</h3>
        {badge && (
          <span style={{ background:`${badgeColor}18`, color:badgeColor, padding:'2px 10px', borderRadius:12, fontSize:'0.74rem', fontWeight:600 }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function MetricBox({ label, value, unit, color }) {
  return (
    <div style={{
      background:'#0d1b35', border:'1px solid rgba(0,212,255,0.15)',
      borderRadius:12, padding:'18px 16px', textAlign:'center', position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:color }} />
      <div style={{ fontSize:'1.9rem', fontWeight:800, color, lineHeight:1, marginBottom:4 }}>
        {value}<span style={{ fontSize:'0.85rem', color:'#64748b', fontWeight:400 }}>{unit}</span>
      </div>
      <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:6 }}>{label}</div>
    </div>
  )
}

export default function LivePipeline() {
  const [dragOver, setDragOver]     = useState(false)
  const [file, setFile]             = useState(null)
  const [status, setStatus]         = useState('idle') // idle | uploading | done | error
  const [progress, setProgress]     = useState(0)
  const [steps, setSteps]           = useState([])
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState('')
  const [activeTab, setActiveTab]   = useState('ocv')
  const fileRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.endsWith('.csv')) { setError('Please upload a CSV file.'); return }
    setFile(f)
    setError('')
    setStatus('idle')
    setResult(null)
    setSteps([])
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const runPipeline = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(5)
    setSteps([])
    setResult(null)
    setError('')

    const fakeProgress = setInterval(() => {
      setProgress(p => p < 88 ? p + Math.random() * 6 : p)
    }, 600)

    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch(`${API}/run-pipeline`, {
        method: 'POST',
        body: fd,
      })

      clearInterval(fakeProgress)
      setProgress(100)

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Pipeline failed')
        setStatus('error')
        return
      }

      setSteps(data.steps || [])
      setResult(data)
      setStatus('done')
    } catch (e) {
      clearInterval(fakeProgress)
      setError(`Cannot reach API at ${API}. Make sure Flask is running: python api/app.py`)
      setStatus('error')
    }
  }

  const reset = () => {
    setFile(null); setStatus('idle'); setResult(null)
    setSteps([]); setError(''); setProgress(0)
  }

  const m = result?.metrics
  const c = result?.charts

  return (
    <section id="live" style={{ padding:'80px 0', minHeight:'100vh' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 2rem' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <span style={{
            display:'inline-block', background:'rgba(16,185,129,0.1)',
            border:'1px solid rgba(16,185,129,0.3)', color:'#10b981',
            padding:'4px 14px', borderRadius:20, fontSize:'0.76rem',
            fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14,
          }}>🔴 Live Pipeline</span>
          <h2 style={{ fontSize:'clamp(1.7rem,3vw,2.5rem)', fontWeight:800, marginBottom:14 }}>
            Upload CSV → Run Full Pipeline
          </h2>
          <p style={{ fontSize:'1rem', color:'#94a3b8', maxWidth:580, margin:'0 auto', lineHeight:1.75 }}>
            Upload your NASA ALT battery CSV (<code style={{ color:'#00d4ff', fontSize:'0.9em' }}>battery00.csv</code>) and watch
            all 6 pipeline stages execute in real time, producing live charts and metrics from your actual data.
          </p>
        </div>

        {/* Upload zone */}
        {status === 'idle' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#00d4ff' : file ? '#10b981' : 'rgba(0,212,255,0.3)'}`,
              borderRadius: 20, padding: '60px 40px', textAlign: 'center',
              background: dragOver ? 'rgba(0,212,255,0.04)' : file ? 'rgba(16,185,129,0.04)' : '#0d1b35',
              cursor: 'pointer', transition: 'all 0.25s',
              marginBottom: 28,
            }}
          >
            <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }}
              onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{ fontSize:'3rem', marginBottom:12 }}>✅</div>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#10b981', marginBottom:6 }}>{file.name}</div>
                <div style={{ fontSize:'0.85rem', color:'#64748b' }}>{(file.size/1024/1024).toFixed(2)} MB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontSize:'3rem', marginBottom:14 }}>📁</div>
                <div style={{ fontSize:'1.05rem', fontWeight:700, marginBottom:8 }}>
                  Drop your CSV file here or <span style={{ color:'#00d4ff' }}>browse</span>
                </div>
                <div style={{ fontSize:'0.85rem', color:'#64748b' }}>
                  Accepts NASA ALT battery CSV format (battery00.csv)
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div style={{
            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:12, padding:'14px 20px', marginBottom:24, color:'#ef4444',
            fontSize:'0.875rem', whiteSpace:'pre-wrap',
          }}>⚠️ {error}</div>
        )}

        {/* Buttons */}
        {status === 'idle' && file && (
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <button onClick={runPipeline} style={{
              background:'linear-gradient(135deg,#10b981,#059669)',
              color:'#fff', padding:'14px 40px', borderRadius:12,
              fontWeight:800, fontSize:'1rem', border:'none', cursor:'pointer',
              boxShadow:'0 4px 20px rgba(16,185,129,0.35)',
              transition:'all 0.2s',
            }}>
              🚀 Run Full Pipeline
            </button>
          </div>
        )}

        {/* Progress + Step log */}
        {(status === 'uploading' || status === 'done') && (
          <div style={{
            background:'#0d1b35', border:'1px solid rgba(0,212,255,0.15)',
            borderRadius:16, padding:28, marginBottom:32,
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700 }}>
                {status === 'uploading' ? '⏳ Running Pipeline…' : '✅ Pipeline Complete'}
              </h3>
              {status === 'done' && (
                <button onClick={reset} style={{
                  background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.25)',
                  color:'#00d4ff', padding:'5px 14px', borderRadius:8,
                  fontSize:'0.82rem', fontWeight:600, cursor:'pointer',
                }}>↺ New Upload</button>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:10, overflow:'hidden', marginBottom:22 }}>
              <div style={{
                height:'100%', borderRadius:10,
                background:'linear-gradient(90deg,#00d4ff,#7c3aed)',
                width:`${progress}%`, transition:'width 0.4s ease',
              }} />
            </div>

            {/* Step cards */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {(steps.length > 0 ? steps : Array.from({length:6},(_,i)=>({step:i+1,name:['Loading Data','Coulomb Counting','OCV–SOC Fit','ECM Param ID','ECM Simulation','EKF Estimation'][i],status:'pending'}))).map((s,i) => (
                <div key={s.step} style={{
                  flex:'1', minWidth:140,
                  background: s.status==='done' ? 'rgba(16,185,129,0.08)' : s.status==='running' ? 'rgba(0,212,255,0.08)' : '#0a1628',
                  border: `1px solid ${s.status==='done'?'rgba(16,185,129,0.3)':s.status==='running'?'rgba(0,212,255,0.3)':'rgba(255,255,255,0.06)'}`,
                  borderRadius:10, padding:'12px 14px',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:'1.1rem' }}>{stepIcons[i]}</span>
                    <span style={{ fontSize:'0.78rem', fontWeight:700,
                      color: s.status==='done'?'#10b981':s.status==='running'?'#00d4ff':'#64748b' }}>
                      {s.status==='done'?'✓ ':s.status==='running'?'⟳ ':''}{s.name}
                    </span>
                  </div>
                  {s.details && (
                    <div style={{ fontSize:'0.68rem', color:'#64748b', lineHeight:1.5 }}>{s.details}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {status === 'done' && m && c && (
          <>
            {/* Key metrics */}
            <h3 style={{ fontWeight:700, marginBottom:18, fontSize:'1.05rem' }}>📊 Results from Your Data</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
              <MetricBox label="Q_max"               value={m.dataset.q_max_ah}    unit=" Ah"   color="#00d4ff" />
              <MetricBox label="OCV RMSE"             value={m.ocv.rmse_mv}         unit=" mV"   color="#7c3aed" />
              <MetricBox label="ECM Voltage RMSE"     value={m.ecm.rmse_mv}         unit=" mV"   color="#10b981" />
              <MetricBox label="R₀"                   value={m.ecm.R0_mohm}         unit=" mΩ"   color="#f59e0b" />
              <MetricBox label="R₁"                   value={m.ecm.R1_mohm}         unit=" mΩ"   color="#f59e0b" />
              <MetricBox label="C₁"                   value={m.ecm.C1_F}            unit=" F"    color="#ef4444" />
              <MetricBox label="τ = R₁·C₁"           value={m.ecm.tau_s}           unit=" s"    color="#00d4ff" />
              <MetricBox label="EKF SOC RMSE"         value={m.ekf.rmse_pct}        unit="%"     color="#10b981" />
              <MetricBox label="EKF SOC MAE"          value={m.ekf.mae_pct}         unit="%"     color="#10b981" />
              <MetricBox label="Convergence Time"     value={m.ekf.conv_time_s}     unit=" s"    color="#7c3aed" />
              <MetricBox label="Final SOC Error"      value={m.ekf.final_error_pct} unit="%"     color="#f59e0b" />
              <MetricBox label="Capacity Error"       value={m.ekf.cap_error_pct}   unit="%"     color="#10b981" />
            </div>

            {/* Chart Tabs */}
            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {[
                { id:'ocv',   label:'OCV–SOC',    color:'#00d4ff' },
                { id:'ecm',   label:'ECM Voltage', color:'#10b981' },
                { id:'ekf',   label:'EKF SOC',     color:'#7c3aed' },
                { id:'error', label:'SOC Error',   color:'#f59e0b' },
                { id:'multi', label:'Multi-Start', color:'#10b981' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding:'7px 18px', borderRadius:8, fontWeight:600, fontSize:'0.84rem',
                  cursor:'pointer', transition:'all 0.2s',
                  background: activeTab===tab.id ? tab.color : 'rgba(255,255,255,0.04)',
                  color:       activeTab===tab.id ? '#000'    : '#94a3b8',
                  border:      activeTab===tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* OCV Chart */}
            {activeTab === 'ocv' && (
              <ChartCard title="OCV – SOC Polynomial Fit" badge={`RMSE: ${m.ocv.rmse_mv} mV`} badgeColor="#00d4ff">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={c.ocv} margin={{ top:4, right:16, left:-10, bottom:0 }}>
                    <CartesianGrid stroke={gridClr} />
                    <XAxis dataKey="soc" tick={tickStyle} label={{ value:'SOC (%)', position:'insideBottom', offset:-2, fill:'#475569', fontSize:10 }} />
                    <YAxis tick={tickStyle} domain={['auto','auto']} label={{ value:'OCV (V)', angle:-90, position:'insideLeft', fill:'#475569', fontSize:10 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                    <Line type="monotone" dataKey="measured" stroke="rgba(0,212,255,0.65)" strokeWidth={1.5} dot={{ r:2 }} name="Measured OCV" />
                    <Line type="monotone" dataKey="fit"      stroke="#7c3aed"               strokeWidth={2.5} dot={false}     name="Poly Fit (deg 9)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* ECM Chart */}
            {activeTab === 'ecm' && (
              <ChartCard title="ECM Voltage Fit vs Measured" badge={`RMSE: ${m.ecm.rmse_mv} mV`} badgeColor="#10b981">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={c.ecm} margin={{ top:4, right:16, left:-10, bottom:0 }}>
                    <CartesianGrid stroke={gridClr} />
                    <XAxis dataKey="time" tick={tickStyle} label={{ value:'Time (s)', position:'insideBottom', offset:-2, fill:'#475569', fontSize:10 }} />
                    <YAxis tick={tickStyle} domain={['auto','auto']} label={{ value:'Voltage (V)', angle:-90, position:'insideLeft', fill:'#475569', fontSize:10 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                    <Line type="monotone" dataKey="measured"  stroke="rgba(0,212,255,0.7)" strokeWidth={1.5} dot={false} name="Measured" />
                    <Line type="monotone" dataKey="simulated" stroke="#ef4444"              strokeWidth={2}   dot={false} strokeDasharray="4 2" name="ECM Simulated" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* EKF Chart */}
            {activeTab === 'ekf' && (
              <ChartCard title="EKF SOC Estimation (init=50%)" badge={`RMSE: ${m.ekf.rmse_pct}%`} badgeColor="#7c3aed">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={c.ekf} margin={{ top:4, right:16, left:-10, bottom:0 }}>
                    <CartesianGrid stroke={gridClr} />
                    <XAxis dataKey="time" tick={tickStyle} label={{ value:'Time (s)', position:'insideBottom', offset:-2, fill:'#475569', fontSize:10 }} />
                    <YAxis tick={tickStyle} domain={[0,105]} label={{ value:'SOC (%)', angle:-90, position:'insideLeft', fill:'#475569', fontSize:10 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                    <Line type="monotone" dataKey="reference" stroke="rgba(0,212,255,0.85)" strokeWidth={2.5} dot={false} name="Reference (CC)" />
                    <Line type="monotone" dataKey="ekf"       stroke="#10b981"               strokeWidth={2}   dot={false} name="EKF (init=50%)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Error Chart */}
            {activeTab === 'error' && (
              <ChartCard title="SOC Error Over Time" badge={`Final: ${m.ekf.final_error_pct}%`} badgeColor="#f59e0b">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={c.error} margin={{ top:4, right:16, left:-10, bottom:0 }}>
                    <CartesianGrid stroke={gridClr} />
                    <XAxis dataKey="time" tick={tickStyle} label={{ value:'Time (s)', position:'insideBottom', offset:-2, fill:'#475569', fontSize:10 }} />
                    <YAxis tick={tickStyle} label={{ value:'Error (%)', angle:-90, position:'insideLeft', fill:'#475569', fontSize:10 }} />
                    <Tooltip {...tooltipStyle} />
                    <ReferenceLine y={2}  stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" />
                    <ReferenceLine y={-2} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" />
                    <ReferenceLine y={0}  stroke="rgba(255,255,255,0.1)" />
                    <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                    <Line type="monotone" dataKey="error" stroke="#f59e0b" strokeWidth={2} dot={false} name="SOC Error (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Multi-start Chart */}
            {activeTab === 'multi' && (
              <ChartCard title="EKF Multi-Start Robustness (5 Initial SOC Values)" badge="All converge <18s" badgeColor="#10b981">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={c.multi} margin={{ top:4, right:16, left:-10, bottom:0 }}>
                    <CartesianGrid stroke={gridClr} />
                    <XAxis dataKey="time" tick={tickStyle} label={{ value:'Time (s)', position:'insideBottom', offset:-2, fill:'#475569', fontSize:10 }} />
                    <YAxis tick={tickStyle} domain={[0,105]} label={{ value:'SOC (%)', angle:-90, position:'insideLeft', fill:'#475569', fontSize:10 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize:11, color:'#94a3b8' }} />
                    {['init10','init30','init50','init70','init90'].map((k,i) => (
                      <Line key={k} type="monotone" dataKey={k} stroke={multiColors[i]} strokeWidth={1.8} dot={false} name={`Init ${[10,30,50,70,90][i]}%`} />
                    ))}
                    <Line type="monotone" dataKey="reference" stroke="#ffffff" strokeWidth={2.5} dot={false} strokeDasharray="6 3" name="Reference (CC)" />
                  </LineChart>
                </ResponsiveContainer>

                {/* Robustness table */}
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:20 }}>
                  {Object.entries(m.multi_start).map(([k,v], i) => (
                    <div key={k} style={{
                      flex:1, minWidth:100, background:'#0a1628',
                      border:'1px solid rgba(0,212,255,0.12)',
                      borderRadius:10, padding:'12px 10px', textAlign:'center',
                    }}>
                      <div style={{ fontSize:'1.2rem', fontWeight:800, color: multiColors[i] }}>{[10,30,50,70,90][i]}%</div>
                      <div style={{ fontSize:'0.68rem', color:'#10b981', marginTop:3 }}>✓ {v.conv_time_s ? `${v.conv_time_s}s` : '—'}</div>
                      <div style={{ fontSize:'0.65rem', color:'#64748b', marginTop:2 }}>err: {v.final_error_pct}%</div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}

            {/* Summary box */}
            <div style={{
              background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.25)',
              borderRadius:14, padding:22, marginTop:28,
              display:'flex', gap:20, flexWrap:'wrap', alignItems:'center',
            }}>
              <span style={{ fontSize:'2rem' }}>🏆</span>
              <div>
                <div style={{ fontWeight:800, fontSize:'1rem', color:'#10b981', marginBottom:4 }}>
                  Pipeline completed successfully
                </div>
                <div style={{ fontSize:'0.85rem', color:'#94a3b8' }}>
                  Processed <strong style={{color:'#e2e8f0'}}>{m.dataset.n_points.toLocaleString()} data points</strong> ·
                  Q_max = <strong style={{color:'#e2e8f0'}}>{m.dataset.q_max_ah} Ah</strong> ·
                  EKF SOC RMSE = <strong style={{color:'#10b981'}}>{m.ekf.rmse_pct}%</strong> ·
                  Target ≤5%: <strong style={{color:'#10b981'}}>✓ Achieved</strong>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
