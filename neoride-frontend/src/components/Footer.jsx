export default function Footer() {
  return (
    <footer style={{
      background: '#050d1a',
      borderTop: '1px solid rgba(0,212,255,0.12)',
      padding: '36px 0',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#e2e8f0' }}>NeoRide Battery Modelling</span>
          <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: 10 }}>· ES60208 Rechargeable Battery Performance Modelling</span>
        </div>
        <p style={{ fontSize: '0.83rem', color: '#64748b' }}>
          Dataset:{' '}
          <a href="https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/"
             target="_blank" rel="noreferrer"
             style={{ color: '#00d4ff', textDecoration: 'none' }}>
            NASA Ames PCoE Repository
          </a>
          {' · '}
          <a href="https://github.com/upendra512/NeoRide_Battery_Modelling"
             target="_blank" rel="noreferrer"
             style={{ color: '#00d4ff', textDecoration: 'none' }}>
            GitHub
          </a>
          {' · Team NeoRide 2026'}
        </p>
      </div>
    </footer>
  )
}
