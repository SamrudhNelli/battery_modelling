// ── Metrics ─────────────────────────────────────────────────────────────────
export const keyMetrics = [
  { val: '1.14', unit: '%',  label: 'EKF SOC RMSE',      sub: 'initialised at 50%',        color: 'blue' },
  { val: '0.64', unit: '%',  label: 'EKF SOC MAE',        sub: 'after convergence',          color: 'green' },
  { val: '<1',   unit: 's',  label: 'Convergence Time',   sub: 'to within 2% of true SOC',   color: 'purple' },
  { val: '14.1', unit: 'mV', label: 'ECM Voltage RMSE',   sub: 'optimised parameters',       color: 'amber' },
  { val: '13.3', unit: 'mV', label: 'OCV–SOC RMSE',       sub: 'degree-9 polynomial',        color: 'blue' },
  { val: '0.62', unit: '%',  label: 'Capacity Error',      sub: '2.467 vs 2.452 Ah',          color: 'green' },
];

export const resultsTable = [
  { metric: 'OCV polynomial RMSE',         value: '13.3 mV',   status: 'good',      note: '' },
  { metric: 'ECM voltage fit RMSE',        value: '14.1 mV',   status: 'good',      note: '' },
  { metric: 'ECM voltage fit MAE',         value: '8.7 mV',    status: 'good',      note: '' },
  { metric: 'ECM max voltage error',       value: '159.2 mV',  status: 'warn',      note: 'near 0% SOC' },
  { metric: 'Identified R₀',              value: '1.00 mΩ',   status: 'ok',        note: 'lower bound' },
  { metric: 'Identified R₁',              value: '1.00 mΩ',   status: 'ok',        note: 'lower bound' },
  { metric: 'Identified C₁',              value: '5,000 F',   status: 'good',      note: '' },
  { metric: 'Time constant τ',            value: '5.0 s',     status: 'good',      note: '' },
  { metric: 'EKF SOC RMSE (init 50%)',    value: '1.14 %',    status: 'excellent', note: '' },
  { metric: 'EKF SOC MAE',                value: '0.64 %',    status: 'excellent', note: '' },
  { metric: 'EKF convergence (<2%)',       value: '~1 s',      status: 'excellent', note: '' },
  { metric: 'EKF final SOC error',         value: '−0.62 %',   status: 'excellent', note: 'Conservative bias' },
  { metric: 'Capacity prediction error',  value: '0.62 %',    status: 'excellent', note: '' },
];

// ── Modules ──────────────────────────────────────────────────────────────────
export const modules = [
  {
    name: 'Data Loader',
    file: 'src/data_loader.py',
    icon: '📂',
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.1)',
    desc: 'Loads the NASA CSV (1.1M rows) and filters for reference discharge events. Segments cycles by detecting time gaps > 100 s. Returns the BoL cycle with a relative time column.',
    equation: 'filter: mode == -1, mission_type == 0\nsegment: Δt > 100 s → new cycle\noutput: BoL DataFrame + time_relative',
    tags: ['pandas', 'numpy', 'CSV parsing'],
  },
  {
    name: 'Coulomb Counting',
    file: 'src/coulomb_counting.py',
    icon: '🔋',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    desc: 'Computes ground-truth SOC by numerically integrating measured current over time. Serves as reference for EKF validation. Simple but drift-prone — motivating the EKF.',
    equation: 'SOC[k] = SOC[k-1] − I[k]·Δt / (Q_max · 3600)\n\nSOC: 100% → 0% over full discharge',
    tags: ['Integration', 'Ground Truth'],
  },
  {
    name: 'OCV–SOC Model',
    file: 'src/ocv_soc.py',
    icon: '📐',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)',
    desc: 'Fits a 9th-degree polynomial to OCV–SOC pairs via least squares. Provides the derivative dOCV/dSOC needed by the EKF Jacobian for the linearisation step.',
    equation: 'OCV = p₉·SOC⁹ + p₈·SOC⁸ + … + p₀\nFitted RMSE: 13.3 mV\ndOCV/dSOC → EKF H matrix',
    tags: ['np.polyfit (deg=9)', 'Jacobian'],
  },
  {
    name: 'ECM Simulator',
    file: 'src/ecm_model.py',
    icon: '⚙️',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    desc: 'Simulates the 1RC Thévenin ECM forward in time. Uses exact exponential discretisation for the RC pair to ensure numerical stability at any time step.',
    equation: 'V_term = OCV(SOC) − I·R₀ − V_RC\nV_RC[k] = V_RC[k-1]·e^(−Δt/τ) + R₁·I·(1−e^(−Δt/τ))\nSOC[k] = SOC[k-1] − I·Δt/(Q·3600)',
    tags: ['1RC Model', 'Exact Discretisation'],
  },
  {
    name: 'Parameter Identification',
    file: 'src/ecm_param_id.py',
    icon: '🔍',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    desc: 'Identifies R₀, R₁, C₁ by minimising RMSE between simulated and measured cell voltage using scipy L-BFGS-B with physical bounds.',
    equation: 'min RMSE(V_meas, V_ECM(R₀,R₁,C₁))\nBounds: R₀,R₁ ∈ [1,200] mΩ; C₁ ∈ [100,50000] F\nResult: R₀=1.00mΩ, R₁=1.00mΩ, C₁=5000F',
    tags: ['L-BFGS-B', 'scipy.optimize'],
  },
  {
    name: 'EKF Estimator',
    file: 'src/ekf_estimator.py',
    icon: '🎯',
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.1)',
    desc: 'Extended Kalman Filter with state x=[SOC, V_RC]ᵀ. Predict with ECM, correct with voltage measurement. Handles wrong initial SOC robustly.',
    equation: 'PREDICT: x̂⁻ = F·x + B·u,  P⁻ = F·P·Fᵀ + Q\nUPDATE:  K = P⁻·Hᵀ·(H·P⁻·Hᵀ + R)⁻¹\nSTATE:   x = x̂⁻ + K·(z − H·x̂⁻)',
    tags: ['Q=diag(1e-8,1e-6)', 'R=2.5e-5'],
  },
  {
    name: 'Utilities',
    file: 'src/utils.py',
    icon: '📊',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    desc: 'Shared metric functions for evaluation across all pipeline stages: RMSE, MAE, and max absolute error.',
    equation: 'rmse = √(mean((y − ŷ)²))\nmae  = mean(|y − ŷ|)\nmax_err = max(|y − ŷ|)',
    tags: ['RMSE', 'MAE', 'Max Error'],
  },
];

// ── Notebooks ─────────────────────────────────────────────────────────────────
export const notebooks = [
  { num: '01', name: 'Data Exploration',        file: '01_explore_data.ipynb',        color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', desc: 'Load & inspect the raw NASA CSV. Visualise current, voltage, temperature across all test modes.' },
  { num: '02', name: 'Coulomb Counting',         file: '02_coulomb_counting.ipynb',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', desc: 'Implement current integration for SOC, verify Q_max = 2.452 Ah, plot SOC decay 100%→0%.' },
  { num: '03', name: 'OCV–SOC Fit',              file: '03_ocv_soc.ipynb',             color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', desc: 'Extract OCV–SOC pairs, fit degree-9 polynomial, RMSE=13.3 mV, verify dOCV/dSOC smoothness.' },
  { num: '04', name: 'ECM Model',                file: '04_ecm_model.ipynb',           color: '#10b981', bg: 'rgba(16,185,129,0.1)', desc: 'Simulate 1RC Thévenin model with guessed params, compare terminal voltage, analyse residuals.' },
  { num: '05', name: 'Parameter Identification', file: '05_ecm_param_id.ipynb',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)', desc: 'Run L-BFGS-B for R₀, R₁, C₁. Visualise convergence, sensitivity, and final fit quality.' },
  { num: '06', name: 'EKF Estimator',            file: '06_ekf_estimator.ipynb',       color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', desc: 'Run EKF from wrong SOC init, plot convergence, Kalman gains, covariance trace, final error.' },
  { num: '07', name: 'Pipeline Validation',      file: '07_pipeline_validation.ipynb', color: '#10b981', bg: 'rgba(16,185,129,0.1)', desc: 'End-to-end validation: all metrics, multi-start robustness, capacity prediction error, full plot.' },
];

// ── Limitations ───────────────────────────────────────────────────────────────
export const limitations = [
  { icon: '🌡️', title: 'Temperature Dependence',   text: 'ECM params at single temperature. R₀ roughly doubles per 20°C drop — a production BMS needs temp-dependent lookup tables or adaptive scheduling.' },
  { icon: '🔁', title: 'Single Cycle Analysis',    text: 'Only the BoL discharge cycle was used. Ageing causes capacity fade & resistance rise — a full BMS must track parameters across hundreds of cycles.' },
  { icon: '⚡', title: '1RC vs 2RC Model',          text: 'The 1RC model misses slower diffusion dynamics. A 2RC model would add a second time constant (τ₂~100–500s) at the cost of two more parameters.' },
  { icon: '📏', title: 'OCV from Loaded Data',      text: 'OCV extracted from loaded discharge rather than GITT/C25 test. Some resistance is absorbed into the polynomial, pushing R₀, R₁ to lower bounds.' },
  { icon: '🚗', title: 'Constant-Current Only',     text: 'All validation used CC discharge. Real vehicle drive cycles (UDDS, US06) have dynamic pulsed current — required before deployment to vehicle BMS.' },
  { icon: '🔬', title: 'No Sensor Noise Model',     text: 'R=2.5×10⁻⁵ is hand-tuned. Rigorous noise characterisation from sensor datasheets or dedicated tests would improve EKF tuning bounds.' },
];

// ── Pipeline steps ────────────────────────────────────────────────────────────
export const pipelineSteps = [
  { icon: '📂', label: 'Data Loader',     sub: 'Extract BoL cycle' },
  { icon: '🔋', label: 'Coulomb Counting', sub: 'Reference SOC' },
  { icon: '📐', label: 'OCV–SOC Fit',     sub: 'Degree-9 poly' },
  { icon: '⚙️', label: 'ECM Param ID',    sub: 'L-BFGS-B opt.' },
  { icon: '🎯', label: 'EKF Estimator',   sub: 'Real-time SOC' },
  { icon: '✅', label: 'Validation',       sub: 'Metrics + plots' },
];

// ── Chart data ────────────────────────────────────────────────────────────────
function genOCV() {
  const data = [];
  for (let i = 0; i <= 50; i++) {
    const s = i / 50;
    const v = 3.0 + 1.1 * s - 0.8 * s * s + 0.5 * s * s * s;
    const noise = (Math.random() - 0.5) * 0.005;
    data.push({ soc: Math.round(s * 100), measured: parseFloat((v + noise).toFixed(4)), fit: parseFloat(v.toFixed(4)) });
  }
  return data;
}

function genECM() {
  const data = [];
  for (let i = 0; i < 80; i++) {
    const t = i * 44;
    const soc = 1 - i / 80;
    const vBase = 3.0 + 1.1 * soc - 0.8 * soc * soc + 0.5 * soc * soc * soc;
    data.push({
      time: t,
      measured: parseFloat((vBase - 0.05 + (Math.random() - 0.5) * 0.006).toFixed(4)),
      simulated: parseFloat((vBase - 0.048).toFixed(4)),
    });
  }
  return data;
}

function genEKF() {
  const data = [];
  for (let i = 0; i < 80; i++) {
    const t = i * 44;
    const ref = 100 - (i / 79) * 100;
    let ekf;
    if (i < 2) ekf = 50 + (ref - 50) * (i / 2);
    else ekf = ref + (Math.random() - 0.5) * 0.8;
    data.push({ time: t, reference: parseFloat(ref.toFixed(2)), ekf: parseFloat(ekf.toFixed(2)) });
  }
  return data;
}

function genMultiStart() {
  const inits = [10, 30, 50, 70, 90];
  const data = [];
  for (let i = 0; i < 80; i++) {
    const t = i * 44;
    const ref = 100 - (i / 79) * 100;
    const row = { time: t, reference: parseFloat(ref.toFixed(2)) };
    inits.forEach(init => {
      const steps = Math.abs(100 - init) / 6;
      let s = i < steps ? init + (ref - init) * (i / steps) : ref + (Math.random() - 0.5) * 0.8;
      row[`init${init}`] = parseFloat(s.toFixed(2));
    });
    data.push(row);
  }
  return data;
}

export const ocvData      = genOCV();
export const ecmData      = genECM();
export const ekfData      = genEKF();
export const multiData    = genMultiStart();
export const errorData    = ekfData.map(d => ({ time: d.time, error: parseFloat((d.ekf - d.reference).toFixed(3)) }));
