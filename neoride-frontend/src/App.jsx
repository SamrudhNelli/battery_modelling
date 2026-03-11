import { useState } from 'react'
import Navbar      from './components/Navbar'
import Hero        from './components/Hero'
import Overview    from './components/Overview'
import Pipeline    from './components/Pipeline'
import Modules     from './components/Modules'
import Results     from './components/Results'
import Charts      from './components/Charts'
import QuickStart  from './components/QuickStart'
import Notebooks   from './components/Notebooks'
import Limitations from './components/Limitations'
import Team        from './components/Team'
import Footer      from './components/Footer'
import LivePipeline from './components/LivePipeline'

export default function App() {
  const [page, setPage] = useState('home') // 'home' | 'live'

  return (
    <div style={{ minHeight: '100vh', background: '#050d1a', color: '#e2e8f0' }}>

      {/* ── Top navigation bar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 64,
        background: 'rgba(5,13,26,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,212,255,0.15)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
      }}>
        {/* Logo */}
        <a href="#hero" onClick={() => setPage('home')}
          style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', cursor:'pointer' }}>
          <div style={{
            width:36, height:36, borderRadius:8,
            background:'linear-gradient(135deg,#00d4ff,#7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.1rem',
          }}>⚡</div>
          <span style={{ fontSize:'1.1rem', fontWeight:800, color:'#00d4ff' }}>
            NeoRide <span style={{ color:'#e2e8f0' }}>Battery</span>
          </span>
        </a>

        {/* Page toggle */}
        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:4 }}>
          <button
            onClick={() => setPage('home')}
            style={{
              padding: '6px 18px', borderRadius: 7, fontWeight: 600, fontSize: '0.84rem',
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: page === 'home' ? 'rgba(0,212,255,0.15)' : 'transparent',
              color:      page === 'home' ? '#00d4ff' : '#64748b',
            }}>
            📖 Project Docs
          </button>
          <button
            onClick={() => setPage('live')}
            style={{
              padding: '6px 18px', borderRadius: 7, fontWeight: 600, fontSize: '0.84rem',
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: page === 'live' ? 'rgba(16,185,129,0.2)' : 'transparent',
              color:      page === 'live' ? '#10b981' : '#64748b',
            }}>
            🔴 Live Pipeline
          </button>
        </div>

        {/* Desktop nav links — only on home */}
        {page === 'home' && (
          <ul style={{ display:'flex', gap:'1.5rem', listStyle:'none', margin:0, padding:0 }} className="nav-desktop">
            {['overview','pipeline','modules','results','charts','team'].map(id => (
              <li key={id}>
                <a href={`#${id}`} style={{ color:'#94a3b8', fontSize:'0.87rem', fontWeight:500, textDecoration:'none' }}>
                  {id.charAt(0).toUpperCase()+id.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        )}

        {page === 'live' && (
          <span style={{ fontSize:'0.82rem', color:'#64748b' }}>
            Flask API: <code style={{ color:'#10b981' }}>localhost:5000</code>
          </span>
        )}

        <span style={{
          background:'linear-gradient(135deg,#00d4ff,#7c3aed)',
          color:'#fff', padding:'4px 14px', borderRadius:20,
          fontSize:'0.76rem', fontWeight:700,
        }}>ES60208 — 2026</span>

        <style>{`@media(max-width:1000px){ .nav-desktop { display:none !important } }`}</style>
      </nav>

      {/* ── Page content ── */}
      <main style={{ paddingTop: 64 }}>
        {page === 'home' ? (
          <>
            <Hero />
            <Overview />
            <Pipeline />
            <Modules />
            <Results />
            <Charts />
            <QuickStart />
            <Notebooks />
            <Limitations />
            <Team />
          </>
        ) : (
          <LivePipeline />
        )}
      </main>

      <Footer />
    </div>
  )
}
