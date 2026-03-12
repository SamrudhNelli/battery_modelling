import { useState, useEffect } from 'react'

const links = [
  { href: '#overview',  label: 'Overview' },
  { href: '#pipeline',  label: 'Pipeline' },
  { href: '#modules',   label: 'Modules' },
  { href: '#results',   label: 'Results' },
  { href: '#charts',    label: 'Charts' },
  { href: '#quickstart',label: 'Quick Start' },
  { href: '#team',      label: 'Team' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive]     = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const sections = document.querySelectorAll('section[id]')
      let cur = ''
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 100) cur = s.id
      })
      setActive(cur)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 64,
      background: scrolled ? 'rgba(5,13,26,0.92)' : 'rgba(5,13,26,0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,212,255,0.15)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      transition: 'background 0.3s',
    }}>
      {/* Logo */}
      <a href="#hero" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <div style={{
          width:36, height:36, borderRadius:8,
          background:'linear-gradient(135deg,#00d4ff,#7c3aed)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.1rem', fontWeight:800,
        }}>⚡</div>
        <span style={{ fontSize:'1.1rem', fontWeight:800, color:'#00d4ff' }}>
          NeoRide <span style={{ color:'#e2e8f0' }}>Battery</span>
        </span>
      </a>

      {/* Desktop links */}
      <ul style={{ display:'flex', gap:'1.6rem', listStyle:'none', margin:0, padding:0 }}
          className="nav-desktop">
        {links.map(l => (
          <li key={l.href}>
            <a href={l.href} style={{
              color: active === l.href.slice(1) ? '#00d4ff' : '#94a3b8',
              fontSize:'0.88rem', fontWeight:500,
              transition:'color 0.2s',
              textDecoration:'none',
            }}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Badge */}
      <span style={{
        background:'linear-gradient(135deg,#00d4ff,#7c3aed)',
        color:'#fff', padding:'4px 14px', borderRadius:20,
        fontSize:'0.76rem', fontWeight:700,
      }}>
        ES60208 — 2026
      </span>

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
