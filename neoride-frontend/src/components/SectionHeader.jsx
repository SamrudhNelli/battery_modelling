export default function SectionHeader({ tag, title, desc }) {
  return (
    <div style={{ textAlign:'center', marginBottom:56 }}>
      <span style={{
        display:'inline-block',
        background:'rgba(0,212,255,0.08)',
        border:'1px solid rgba(0,212,255,0.2)',
        color:'#00d4ff', padding:'4px 14px', borderRadius:20,
        fontSize:'0.76rem', fontWeight:700, letterSpacing:'0.08em',
        textTransform:'uppercase', marginBottom:14,
      }}>{tag}</span>
      <h2 style={{
        fontSize:'clamp(1.7rem,3vw,2.5rem)',
        fontWeight:800, marginBottom:14,
        lineHeight:1.2,
      }}>{title}</h2>
      {desc && (
        <p style={{ fontSize:'1rem', color:'#94a3b8', maxWidth:580, margin:'0 auto', lineHeight:1.75 }}>
          {desc}
        </p>
      )}
    </div>
  )
}
