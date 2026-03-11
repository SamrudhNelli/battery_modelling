# NeoRide Battery Modelling

**ES60208: Rechargeable Battery Performance Modelling**

Automated workflow for OCV–SOC characterisation, ECM parameter identification, and real-time SOC estimation on Li-ion cells using the NASA ALT Battery Dataset.

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd NeoRide_Battery_Modelling

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the full pipeline
python -m scripts.run_pipeline
```

Output plot is saved to `outputs/pipeline_results.png`.

---

## Project Structure

```
NeoRide_Battery_Modelling/
├── data/
│   └── nasa_alt/
│       └── battery00.csv          # NASA ALT battery test data
├── notebooks/
│   ├── 01_explore_data.ipynb      # Raw data exploration
│   ├── 02_coulomb_counting.ipynb  # Coulomb Counting for reference SOC
│   ├── 03_ocv_soc.ipynb           # OCV-SOC polynomial fitting
│   ├── 04_ecm_model.ipynb         # 1RC Thevenin ECM simulation
│   ├── 05_ecm_param_id.ipynb      # ECM parameter optimisation
│   ├── 06_ekf_estimator.ipynb     # Extended Kalman Filter for SOC
│   └── 07_pipeline_validation.ipynb  # End-to-end validation & metrics
├── src/
│   ├── data_loader.py             # Load & extract discharge cycles
│   ├── coulomb_counting.py        # SOC via current integration
│   ├── ocv_soc.py                 # OCV-SOC polynomial fit & derivatives
│   ├── ecm_model.py               # 1RC ECM forward simulation
│   ├── ecm_param_id.py            # L-BFGS-B parameter identification
│   ├── ekf_estimator.py           # EKF SOC estimator
│   └── utils.py                   # RMSE, MAE, max error metrics
├── scripts/
│   ├── run_pipeline.py            # One-command full pipeline
│   └── explore_data.py            # Initial data exploration
├── outputs/
│   └── pipeline_results.png       # Generated validation plot
├── requirements.txt
└── README.md
```

---

## Dataset

**NASA Ames Li-ion Battery Ageing Dataset (ALT)**  
- File: `battery00.csv` (~1.1 M rows × 10 columns)  
- Cell chemistry: 2×18650 Li-ion in series (pack)  
- Test duration: ~300 hours, includes reference discharges, impedance, and ageing cycles  
- Beginning-of-Life (BoL) reference discharge: 3 674 data points, constant current ~2.52 A, 3 503 s duration  
- Measured capacity Q_max = 2.452 Ah  

Source: [NASA Prognostics Center of Excellence](https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/)

---

## Pipeline Overview

```
battery00.csv
     │
     ▼
 ┌─────────────────┐
 │   Data Loader    │  Extract BoL reference discharge cycle
 └────────┬────────┘
          ▼
 ┌─────────────────┐
 │ Coulomb Counting │  Integrate current → reference SOC (100% → 0%)
 └────────┬────────┘
          ▼
 ┌─────────────────┐
 │  OCV-SOC Fit     │  Degree-9 polynomial: OCV = f(SOC)
 └────────┬────────┘
          ▼
 ┌─────────────────┐
 │  ECM Param ID    │  Optimise R₀, R₁, C₁ via L-BFGS-B
 └────────┬────────┘
          ▼
 ┌─────────────────┐
 │  EKF Estimator   │  Real-time SOC from voltage + current
 └────────┬────────┘
          ▼
    Validation metrics + plots
```

---

## Modules

### `src/data_loader.py`
Loads the NASA CSV and extracts individual reference discharge cycles by detecting time gaps > 100 s. Returns the BoL (first) cycle with a relative time column.

### `src/coulomb_counting.py`
Computes SOC by integrating measured current:

    SOC[k] = SOC[k-1] − I[k] · Δt / (Q_max · 3600)

Used as the ground-truth reference for EKF validation.

### `src/ocv_soc.py`
Fits a 9th-degree polynomial to the OCV–SOC relationship extracted from discharge data. Also provides the derivative dOCV/dSOC needed by the EKF Jacobian.

### `src/ecm_model.py`
Simulates a 1RC Thevenin equivalent circuit model:

    V_terminal = OCV(SOC) − I · R₀ − V_RC

where V_RC follows a first-order exponential with time constant τ = R₁ · C₁.

### `src/ecm_param_id.py`
Identifies R₀, R₁, C₁ by minimising the RMSE between simulated and measured cell voltage using `scipy.optimize.minimize` (L-BFGS-B, bounded).

### `src/ekf_estimator.py`
Extended Kalman Filter with state vector x = [SOC, V_RC]ᵀ. Fuses the ECM prediction with voltage measurements to estimate SOC in real time.

### `src/utils.py`
Metric functions: `rmse()`, `mae()`, `max_abs_error()`.

---

## Results Summary

| Metric | Value |
|--------|-------|
| OCV-SOC polynomial RMSE | 13.3 mV |
| ECM voltage fit RMSE | 14.1 mV |
| ECM voltage fit MAE | 8.7 mV |
| Identified R₀ | 1.00 mΩ |
| Identified R₁ | 1.00 mΩ |
| Identified C₁ | 5 000 F |
| Time constant τ | 5.0 s |
| EKF SOC RMSE (init 50%) | 1.14 % |
| EKF SOC MAE | 0.64 % |
| EKF convergence time (< 2%) | ~1 s |
| EKF final SOC error | −0.62 % |
| **Target: SOC error ≤ 5%** | **Achieved** |

EKF robustness tested from 5 initial SOC guesses (10%, 30%, 50%, 70%, 90%) — all converge within 18 s to < 2% error.

---

## How to Reproduce

### Run the full pipeline
```bash
python -m scripts.run_pipeline
```

### Run individual modules
```bash
python -m src.data_loader
python -m src.coulomb_counting
python -m src.ocv_soc
python -m src.ecm_model
python -m src.ecm_param_id
python -m src.ekf_estimator
```

### Interactive notebooks
Open any notebook in `notebooks/` with Jupyter or VS Code. Each notebook is self-contained and follows the step numbering above. Run cells top to bottom.

```bash
jupyter notebook notebooks/
```

---

## Dependencies

- Python 3.8+
- numpy
- pandas
- scipy
- matplotlib

Install with:
```bash
pip install -r requirements.txt
```

---

## Limitations

- Analysis limited to a single BoL discharge cycle at one temperature and one C-rate.
- ECM uses a 1RC model; a 2RC model would better capture slow diffusion dynamics.
- OCV polynomial was fit from discharge data, so internal resistance is partially baked into the OCV curve, causing R₀ and R₁ to hit their lower bounds during optimisation.
- EKF does not incorporate temperature as a state or parameter.
- Constant-current profile only; dynamic drive cycles (UDDS, US06) not tested.

---

## Team

**Team NeoRide** — ES60208 Rechargeable Battery Performance Modelling
