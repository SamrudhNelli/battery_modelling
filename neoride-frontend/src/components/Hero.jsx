import { useEffect, useRef } from 'react'

const stats = [
  { val: '1.14%', lbl: 'EKF SOC RMSE' },
  { val: '<1s',   lbl: 'Convergence' },
  { val: '13.3mV',lbl: 'OCV-SOC RMSE' },
  { val: '3,674', lbl: 'Data Points' },
]

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let particles = []
    let animId

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * 1920, y: Math.random() * 1080,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.45 + 0.1,
      })
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${p.a})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${0.07 * (1 - d / 110)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      paddingTop: 64,
    }}>
      {/* particle bg */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, zIndex: 0,
        pointerEvents: 'none', opacity: 0.45,
      }} />

      {/* grid overlay */}
      <div style={{
        position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(0,212,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.025) 1px,transparent 1px)',
        backgroundSize:'50px 50px',
      }} />

      {/* glow orbs */}
      <div style={{ position:'absolute', top:-200, left:-200, width:600, height:600, borderRadius:'50%', background:'rgba(0,212,255,0.06)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'absolute', bottom:'15%', right:-150, width:500, height:500, borderRadius:'50%', background:'rgba(124,58,237,0.07)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 2rem', position:'relative', zIndex:1, width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ maxWidth: 700 }}>
          {/* tag */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(0,212,255,0.1)',
            border:'1px solid rgba(0,212,255,0.3)',
            color:'#00d4ff', padding:'6px 16px', borderRadius:20,
            fontSize:'0.8rem', fontWeight:600, letterSpacing:'0.05em',
            marginBottom:24, textTransform:'uppercase',
          }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#00d4ff', animation:'pulse 1.5s infinite' }}/>
            ES60208 · Rechargeable Battery Performance Modelling
          </div>

          <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.8rem)', fontWeight:800, lineHeight:1.1, marginBottom:20 }}>
            Real-Time SOC Estimation<br />
            <span style={{
              background:'linear-gradient(135deg,#00d4ff,#7c3aed)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>
              for Li-Ion Batteries
            </span>
          </h1>

          <p style={{ fontSize:'1.1rem', color:'#94a3b8', maxWidth:580, marginBottom:40, lineHeight:1.8 }}>
            A complete pipeline from raw NASA battery data to real-time State of Charge estimation using
            an <strong style={{color:'#e2e8f0'}}>ECM</strong> and <strong style={{color:'#e2e8f0'}}>Extended Kalman Filter</strong> —
            achieving <strong style={{color:'#00d4ff'}}>1.14% SOC RMSE</strong> with convergence in under 1 second.
          </p>

          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:56 }}>
            <a href="#pipeline" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'linear-gradient(135deg,#00d4ff,#0099bb)',
              color:'#000', padding:'12px 28px', borderRadius:10,
              fontWeight:700, fontSize:'0.92rem',
              boxShadow:'0 4px 20px rgba(0,212,255,0.3)',
              transition:'all 0.2s', textDecoration:'none',
            }}>🔬 Explore Pipeline</a>
            <a href="#results" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              border:'1px solid rgba(0,212,255,0.25)',
              color:'#e2e8f0', padding:'12px 28px', borderRadius:10,
              fontWeight:600, fontSize:'0.92rem', textDecoration:'none',
              transition:'all 0.2s',
            }}>📊 View Results</a>
            <a href="https://github.com/upendra512/NeoRide_Battery_Modelling"
              target="_blank" rel="noreferrer"
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                border:'1px solid rgba(0,212,255,0.25)',
                color:'#e2e8f0', padding:'12px 28px', borderRadius:10,
                fontWeight:600, fontSize:'0.92rem', textDecoration:'none',
              }}>⭐ GitHub</a>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:40, flexWrap:'wrap' }}>
            {stats.map(s => (
              <div key={s.lbl} style={{ textAlign:'center' }}>
                <span style={{ display:'block', fontSize:'1.9rem', fontWeight:800, color:'#00d4ff' }}>{s.val}</span>
                <span style={{ fontSize:'0.75rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right SVG visual */}
        <svg width="420" height="420" viewBox="0 0 400 400" fill="none" style={{ opacity:0.18, flexShrink:0 }}>
          <circle cx="200" cy="200" r="180" stroke="#00d4ff" strokeWidth="1" strokeDasharray="4 6"/>
          <circle cx="200" cy="200" r="130" stroke="#7c3aed" strokeWidth="1" strokeDasharray="2 8"/>
          <circle cx="200" cy="200" r="80"  stroke="#10b981" strokeWidth="1"/>
          <text x="200" y="215" textAnchor="middle" fill="#00d4ff" fontSize="56" fontFamily="monospace">⚡</text>
          <circle r="7" fill="#00d4ff">
            <animateMotion dur="4s" repeatCount="indefinite"><mpath href="#o1"/></animateMotion>
          </circle>
          <circle r="5" fill="#7c3aed">
            <animateMotion dur="6s" repeatCount="indefinite" begin="-2s"><mpath href="#o2"/></animateMotion>
          </circle>
          <circle r="4" fill="#10b981">
            <animateMotion dur="3s" repeatCount="indefinite" begin="-1s"><mpath href="#o3"/></animateMotion>
          </circle>
          <path id="o1" d="M380,200 A180,180 0 1,1 379.9,200"/>
          <path id="o2" d="M330,200 A130,130 0 1,1 329.9,200"/>
          <path id="o3" d="M280,200 A80,80 0 1,1  279.9,200"/>
        </svg>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        @media(max-width:900px){ #hero svg { display:none } }
      `}</style>
    </section>
  )
}
