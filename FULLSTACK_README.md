# 🔋 NeoRide Battery Modelling — Full-Stack Application

A complete **React + Flask** web application showcasing the NeoRide Battery Modelling pipeline with:
- 📖 **Interactive Project Documentation** — Full project overview with visualizations
- 🔴 **Live Pipeline Execution** — Upload CSV → Run real Python backend → View results in real-time

---

## 🚀 Quick Start

### **1. Start the Flask API Backend** (Terminal 1)

```bash
cd "d:\react n\NeoRide_Battery_Modelling"
python api/app.py
```

✅ Flask running at: `http://localhost:5000`

### **2. Start the React Frontend** (Terminal 2)

```bash
cd "d:\react n\NeoRide_Battery_Modelling\neoride-frontend"
npm run dev
```

✅ React running at: `http://localhost:5173`

### **3. Open in Browser**

Navigate to **`http://localhost:5173`** and you'll see:

#### **📖 Project Docs Tab** (Default)
- Hero section with animated particles
- Project overview cards
- 6-step pipeline visualization with ECM circuit diagram
- Module documentation (7 Python modules)
- Validation results table + key metrics
- Interactive charts (OCV-SOC, ECM, EKF, Multi-start)
- Quick start guide + Jupyter notebooks
- Limitations & future work
- Team info

#### **🔴 Live Pipeline Tab** (Click top button)
- **Drag & drop CSV upload** (or click to browse)
- **Run full 6-step pipeline** on your actual data:
  1. 📂 Data Loader
  2. 🔋 Coulomb Counting
  3. 📐 OCV–SOC Fit
  4. 🔍 ECM Param ID
  5. ⚙️ ECM Simulation
  6. 🎯 EKF Estimation
- **Real-time progress bar** + step-by-step log with details
- **Live metrics** from your data (12 metric boxes)
- **Interactive charts** with your results:
  - OCV–SOC polynomial fit
  - ECM voltage vs measured
  - EKF SOC estimation
  - SOC error over time
  - Multi-start robustness (5 initial SOC values)
- **Summary box** with final results

---

## 📁 Project Structure

```
NeoRide_Battery_Modelling/
├── api/
│   ├── app.py                    # Flask backend with /api/run-pipeline endpoint
│   └── requirements.txt          # Flask dependencies
├── neoride-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx          # Landing hero with canvas animation
│   │   │   ├── Overview.jsx      # 6 overview cards
│   │   │   ├── Pipeline.jsx      # Visual pipeline + ECM diagram
│   │   │   ├── Modules.jsx       # 7 Python module docs
│   │   │   ├── Results.jsx       # Metrics table + robustness
│   │   │   ├── Charts.jsx        # 5 interactive charts (simulated data)
│   │   │   ├── LivePipeline.jsx  # 🔴 CSV upload → run → real charts
│   │   │   ├── QuickStart.jsx    # Installation guide
│   │   │   ├── Notebooks.jsx     # 7 Jupyter notebooks
│   │   │   ├── Limitations.jsx   # Known constraints
│   │   │   ├── Team.jsx          # Team info
│   │   │   └── Footer.jsx        # Footer links
│   │   ├── data/
│   │   │   └── projectData.js    # Static data for demo charts
│   │   ├── App.jsx               # Main app with page toggle
│   │   └── main.jsx              # Entry point
│   ├── package.json
│   └── vite.config.js
├── src/                          # ✅ Your existing Python pipeline
│   ├── data_loader.py
│   ├── coulomb_counting.py
│   ├── ocv_soc.py
│   ├── ecm_model.py
│   ├── ecm_param_id.py
│   ├── ekf_estimator.py
│   └── utils.py
├── data/
│   └── nasa_alt/
│       └── battery00.csv         # ← Upload this in Live Pipeline!
└── notebooks/                    # 7 Jupyter notebooks
```

---

## 🎯 How to Use the Live Pipeline

1. **Click "🔴 Live Pipeline"** in the top navigation
2. **Drag and drop** `data/nasa_alt/battery00.csv` (or browse)
3. **Click "🚀 Run Full Pipeline"**
4. Watch the **progress bar** and **6-step cards** update in real-time
5. View **12 live metrics** computed from your CSV:
   - Q_max, OCV RMSE, ECM Voltage RMSE
   - R₀, R₁, C₁, τ
   - EKF SOC RMSE/MAE, Convergence Time, Final Error, Capacity Error
6. Switch between **5 chart tabs** showing your real data:
   - **OCV–SOC**: Measured OCV vs 9th-degree polynomial fit
   - **ECM Voltage**: Measured cell voltage vs ECM simulation
   - **EKF SOC**: Reference SOC (Coulomb counting) vs EKF estimate
   - **SOC Error**: Error over time with ±2% reference lines
   - **Multi-Start**: 5 different initial SOC guesses converging
7. **"↺ New Upload"** to run again with a different CSV

---

## 🔧 Flask API Endpoints

### `GET /api/health`
Returns `{"status": "ok", "message": "NeoRide API is running"}`

### `POST /api/run-pipeline`
- **Request**: `multipart/form-data` with `file` (CSV)
- **Response**: JSON with:
  - `steps`: Array of 6 step logs with status/details
  - `metrics`: Nested object with dataset/ocv/ecm/ekf/multi_start metrics
  - `charts`: 5 arrays (ocv, ecm, ekf, error, multi) with downsampled data points

---

## 📊 Features

### **Documentation Page (📖 Project Docs)**
- ✅ Animated hero section with particle background
- ✅ 6 overview cards explaining the project
- ✅ Interactive pipeline flow with hover effects
- ✅ 1RC Thévenin ECM circuit diagram
- ✅ 7 module cards with equations + tags
- ✅ Validation results table (13 rows)
- ✅ 6 key metric cards
- ✅ 5 interactive Recharts charts (simulated data)
- ✅ Quick start guide with code blocks
- ✅ 7 Jupyter notebook cards
- ✅ 6 limitation cards
- ✅ Team section with specs
- ✅ Responsive design (mobile-friendly)

### **Live Pipeline Page (🔴 Live Pipeline)**
- ✅ Drag-and-drop CSV upload zone
- ✅ File validation (CSV only)
- ✅ Progress bar with smooth animation
- ✅ 6 step cards showing status (pending → running → done)
- ✅ Live step details from Flask API
- ✅ 12 metric boxes with live data
- ✅ 5 chart tabs:
  1. OCV–SOC (scatter + line)
  2. ECM Voltage (measured vs simulated)
  3. EKF SOC (reference vs EKF)
  4. SOC Error (with reference lines)
  5. Multi-Start (5 lines + convergence table)
- ✅ Success summary box with totals
- ✅ Error handling (API down, wrong file, etc.)
- ✅ "New Upload" button to reset

---

## 🎨 Tech Stack

### **Frontend**
- **React 18** with Hooks (useState, useCallback, useRef, useEffect)
- **Vite** for fast dev server + HMR
- **Recharts** for interactive charts (LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend)
- **Inline CSS-in-JS** for styling (no external CSS framework)
- **Canvas API** for particle animation in Hero

### **Backend**
- **Flask 3.x** with debug mode
- **Flask-CORS** for cross-origin requests
- **NumPy, Pandas, SciPy** for pipeline computation
- **Your existing Python modules** (`src/`)

---

## 📦 Dependencies

### **Frontend** (`neoride-frontend/package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.15.0"
  }
}
```

### **Backend** (`api/requirements.txt`)
```txt
flask>=3.0.0
flask-cors>=4.0.0
numpy>=1.24
pandas>=2.0
scipy>=1.10
matplotlib>=3.7
```

---

## 🧪 Testing the Live Pipeline

### **With NASA ALT Data**
```bash
# In browser, navigate to Live Pipeline tab
# Upload: data/nasa_alt/battery00.csv
# Expected results:
# - Q_max ≈ 2.452 Ah
# - OCV RMSE ≈ 13.3 mV
# - ECM RMSE ≈ 14.1 mV
# - EKF SOC RMSE ≈ 1.14%
# - Convergence <1s
```

---

## 🐛 Troubleshooting

### **"Cannot reach API at http://localhost:5000"**
- ✅ Make sure Flask is running: `python api/app.py`
- ✅ Check terminal for Flask logs
- ✅ Verify health: `curl http://localhost:5000/api/health`

### **Flask imports fail**
- ✅ Install: `pip install flask flask-cors`
- ✅ Existing deps already installed (numpy, pandas, scipy from main requirements.txt)

### **React hot-reload not working**
- ✅ Kill and restart: `npm run dev`
- ✅ Clear browser cache

### **Charts not rendering**
- ✅ Check browser console for errors
- ✅ Recharts requires data in exact format (array of objects with matching keys)

---

## 🚀 Deployment

### **Frontend (Vercel, Netlify, etc.)**
```bash
cd neoride-frontend
npm run build
# Deploy the dist/ folder
```

### **Backend (Render, Railway, Heroku, etc.)**
```bash
# Use api/app.py as entry point
# Install api/requirements.txt + main requirements.txt
# Set port to $PORT environment variable
```

### **Full-Stack (Docker)**
```dockerfile
# Create Dockerfile for Flask + serve React build
# Use nginx reverse proxy
```

---

## 📝 Summary

You now have a **complete full-stack application** that:

1. **Documents your entire project** with a beautiful, interactive UI
2. **Runs the real Python pipeline** on uploaded CSV files
3. **Displays live results** with charts and metrics from your actual data
4. **Works end-to-end** with Flask backend + React frontend

### **What You Built:**
- ✅ 20+ React components (Hero, Overview, Pipeline, Modules, Results, Charts, LivePipeline, etc.)
- ✅ Flask REST API with 2 endpoints (health, run-pipeline)
- ✅ Full 6-step pipeline integration (data loader → Coulomb counting → OCV–SOC → ECM param ID → ECM sim → EKF)
- ✅ Drag-and-drop file upload
- ✅ Real-time progress tracking
- ✅ 5 interactive chart types with your data
- ✅ 12 live metrics computed from CSV
- ✅ Multi-start robustness test (5 initial SOC values)
- ✅ Responsive design with animations

### **URLs:**
- 🌐 **React Frontend**: http://localhost:5173
- 🔧 **Flask Backend**: http://localhost:5000
- 📖 **Project Docs**: Click "📖 Project Docs" in nav
- 🔴 **Live Pipeline**: Click "🔴 Live Pipeline" in nav

---

## 👥 Credits

**Team NeoRide** · ES60208 Rechargeable Battery Performance Modelling · 2026

**Dataset**: NASA Ames PCoE Battery Ageing Repository

**GitHub**: https://github.com/upendra512/NeoRide_Battery_Modelling

---

## 📄 License

MIT License — Feel free to use, modify, and distribute this project.

---

**Built with ❤️ by Team NeoRide**
