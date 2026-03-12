import SectionHeader from './SectionHeader'

const steps = [
  { n: 1, title: 'Clone the Repository',   desc: 'Get the source code from GitHub.' },
  { n: 2, title: 'Install Dependencies',   desc: 'All requirements in requirements.txt — Python 3.8+, NumPy, SciPy, Pandas, Matplotlib.' },
  { n: 3, title: 'Run the Full Pipeline',  desc: 'One command runs all six stages and saves the plot to outputs/pipeline_results.png.' },
  { n: 4, title: 'Explore Notebooks',      desc: 'Seven self-contained Jupyter notebooks in notebooks/ — step-by-step from raw data to EKF.' },
]

const terminalCode = `# 1. Clone the repository
git clone https://github.com/upendra512/NeoRide_Battery_Modelling.git
cd NeoRide_Battery_Modelling

# 2. Install dependencies (Python 3.8+)
pip install -r requirements.txt

# 3. Run the full pipeline
python -m scripts.run_pipeline

# 4. Run individual modules
python -m src.data_loader
python -m src.coulomb_counting
python -m src.ocv_soc
python -m src.ecm_model
python -m src.ecm_param_id
python -m src.ekf_estimator

# 5. Open interactive notebooks
jupyter notebook notebooks/`

const reqCode = `numpy>=1.24
pandas>=2.0
scipy>=1.10
matplotlib>=3.7
jupyter          # for notebooks
ipykernel        # for VS Code notebooks`

function CodeBlock({ title, code, lang }) {
  return (
    <div style={{
      background: '#050d1a',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        background: '#0f1f3a',
        padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(0,212,255,0.1)',
      }}>
        <div style={{ display:'flex', gap:5 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#ff5f57' }}/>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#febc2e' }}/>
          <div style={{ width:10, height:10, borderRadius:'50%', background:'#28c840' }}/>
        </div>
        <span style={{ fontSize:'0.76rem', color:'#64748b' }}>{title}</span>
      </div>
      <pre style={{
        padding: '16px 18px', margin: 0,
        fontSize: '0.8rem', lineHeight: 1.75,
        color: '#94a3b8', overflowX: 'auto',
        fontFamily: "'JetBrains Mono','Courier New',monospace",
      }}>{code}</pre>
    </div>
  )
}

export default function QuickStart() {
  return (
    <section id="quickstart" style={{ padding: '80px 0', background: 'linear-gradient(180deg,transparent,#0f1f3a 20%,#0f1f3a 80%,transparent)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <SectionHeader
          tag="Quick Start"
          title="Get Up and Running"
          desc="Clone, install, and run the full pipeline in three commands."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Steps */}
          <div>
            {steps.map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 16, marginBottom: 22, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#00d4ff,#7c3aed)',
                  color: '#000', fontWeight: 800, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{s.n}</div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 4 }}>{s.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}

            {/* Dependency cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              {[
                { icon:'🔢', name:'NumPy ≥1.24',     desc:'Array math' },
                { icon:'🐼', name:'Pandas ≥2.0',      desc:'CSV / timeseries' },
                { icon:'🔬', name:'SciPy ≥1.10',      desc:'L-BFGS-B optimiser' },
                { icon:'📊', name:'Matplotlib ≥3.7',  desc:'Diagnostic plots' },
              ].map(d => (
                <div key={d.name} style={{
                  background: '#0d1b35',
                  border: '1px solid rgba(0,212,255,0.12)',
                  borderRadius: 10, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <CodeBlock title="bash — Terminal" code={terminalCode} />
            <CodeBlock title="requirements.txt"  code={reqCode} />
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:860px){
          #quickstart > div > div { grid-template-columns:1fr !important; }
        }
      `}</style>
    </section>
  )
}
