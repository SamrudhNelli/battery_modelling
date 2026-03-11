"""
NeoRide Battery Modelling — Unified Flask Application
Serves React frontend + Flask API backend in one place
"""

import os
import sys
import traceback
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tempfile

# ── Make sure src/ is importable ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from src.data_loader    import get_bol_data
from src.coulomb_counting import coulomb_counting
from src.ocv_soc        import extract_ocv_soc_raw, fit_ocv_polynomial
from src.ecm_model      import simulate_ecm
from src.ecm_param_id   import identify_parameters
from src.ekf_estimator  import run_ekf
from src.utils          import rmse, mae, max_abs_error

# ── Flask app with React build folder ────────────────────────────────────────
app = Flask(__name__, 
            static_folder='neoride-frontend/dist',
            static_url_path='')
CORS(app)


# ── Serve React App ──────────────────────────────────────────────────────────
@app.route('/')
def serve_react():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_react_routes(path):
    # Serve static files if they exist
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Otherwise serve index.html for React routing
    return send_from_directory(app.static_folder, 'index.html')


# ── API Routes ───────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'NeoRide API is running'})


@app.route('/api/run-pipeline', methods=['POST'])
def run_pipeline():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    suffix = '.csv'
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        f.save(tmp_path)

    try:
        steps_log = []

        # ── STEP 1: Load Data ─────────────────────────────────────────────
        steps_log.append({'step': 1, 'name': 'Loading Data', 'status': 'running'})
        bol = get_bol_data(tmp_path)
        current_full = bol['current_load'].values
        time_full    = bol['time_relative'].values
        voltage_pack = bol['voltage_load'].values
        q_max = current_full.mean() * time_full[-1] / 3600
        steps_log[-1]['status'] = 'done'
        steps_log[-1]['details'] = f'{len(current_full)} data points, Q_max = {q_max:.3f} Ah'

        # ── STEP 2: Coulomb Counting ──────────────────────────────────────
        steps_log.append({'step': 2, 'name': 'Coulomb Counting', 'status': 'running'})
        soc_ref_full = coulomb_counting(current_full, time_full, q_max)
        steps_log[-1]['status'] = 'done'
        steps_log[-1]['details'] = f'SOC: {soc_ref_full[0]*100:.1f}% → {soc_ref_full[-1]*100:.1f}%'

        # ── STEP 3: OCV–SOC Polynomial ───────────────────────────────────
        steps_log.append({'step': 3, 'name': 'OCV–SOC Polynomial Fit', 'status': 'running'})
        soc_sorted, ocv_sorted = extract_ocv_soc_raw(voltage_pack, soc_ref_full)
        ocv_poly = fit_ocv_polynomial(soc_sorted, ocv_sorted)
        ocv_rmse_val = rmse(ocv_sorted, ocv_poly(soc_sorted))
        steps_log[-1]['status'] = 'done'
        steps_log[-1]['details'] = f'Degree 9 polynomial, RMSE = {ocv_rmse_val*1000:.1f} mV'

        # ── Prepare clean arrays ──────────────────────────────────────────
        current     = current_full[1:]
        time_s      = time_full[1:]
        voltage_cell = voltage_pack[1:] / 2.0
        soc_ref     = coulomb_counting(current, time_s, q_max)

        # ── STEP 4: ECM Parameter Identification ─────────────────────────
        steps_log.append({'step': 4, 'name': 'ECM Parameter Identification', 'status': 'running'})
        params = identify_parameters(current, time_s, voltage_cell, q_max, ocv_poly)
        R0, R1, C1 = params['R0'], params['R1'], params['C1']
        steps_log[-1]['status'] = 'done'
        steps_log[-1]['details'] = (
            f'R0={R0*1000:.2f} mΩ, R1={R1*1000:.2f} mΩ, '
            f'C1={C1:.0f} F, τ={params["tau"]:.1f} s, '
            f'RMSE={params["rmse"]*1000:.2f} mV'
        )

        # ── STEP 5: ECM Simulation ────────────────────────────────────────
        steps_log.append({'step': 5, 'name': 'ECM Simulation', 'status': 'running'})
        soc_ecm, vrc_ecm, v_ecm = simulate_ecm(current, time_s, q_max, ocv_poly, R0, R1, C1)
        ecm_rmse_val = rmse(voltage_cell, v_ecm)
        ecm_mae_val  = mae(voltage_cell, v_ecm)
        ecm_max_val  = max_abs_error(voltage_cell, v_ecm)
        steps_log[-1]['status'] = 'done'
        steps_log[-1]['details'] = f'Voltage RMSE = {ecm_rmse_val*1000:.2f} mV, MAE = {ecm_mae_val*1000:.2f} mV'

        # ── STEP 6: EKF SOC Estimation ────────────────────────────────────
        steps_log.append({'step': 6, 'name': 'EKF SOC Estimation', 'status': 'running'})
        ekf_result = run_ekf(current, time_s, voltage_cell, q_max, ocv_poly, R0, R1, C1, soc_init=0.5)
        soc_ekf = ekf_result['soc']
        soc_error = (soc_ekf - soc_ref) * 100

        converged = np.where(np.abs(soc_error) < 2.0)[0]
        t_converge = float(time_s[converged[0]]) if len(converged) > 0 else float('inf')

        ekf_rmse_val = rmse(soc_ref[100:] * 100, soc_ekf[100:] * 100)
        ekf_mae_val  = mae(soc_ref[100:] * 100, soc_ekf[100:] * 100)
        ekf_final_err = float(soc_error[-1])

        # Multi-start robustness test
        multi_results = {}
        for init_soc in [0.1, 0.3, 0.5, 0.7, 0.9]:
            res = run_ekf(current, time_s, voltage_cell, q_max, ocv_poly, R0, R1, C1, soc_init=init_soc)
            err = (res['soc'] - soc_ref) * 100
            conv = np.where(np.abs(err) < 2.0)[0]
            multi_results[f'init{int(init_soc*100)}'] = {
                'soc': _downsample(res['soc'].tolist(), 200),
                'conv_time': float(time_s[conv[0]]) if len(conv) > 0 else None,
                'final_error': float(err[-1]),
            }

        # Capacity prediction
        ekf_correct = run_ekf(current, time_s, voltage_cell, q_max, ocv_poly, R0, R1, C1, soc_init=1.0)
        q_ref = float(np.sum(current[1:] * np.diff(time_s)) / 3600)
        q_ekf = float((ekf_correct['soc'][0] - ekf_correct['soc'][-1]) * q_max)
        cap_error = abs(q_ekf - q_ref) / q_ref * 100 if q_ref > 0 else 0

        steps_log[-1]['status'] = 'done'
        steps_log[-1]['details'] = (
            f'RMSE={ekf_rmse_val:.2f}%, MAE={ekf_mae_val:.2f}%, '
            f'Conv={t_converge:.0f}s, Final err={ekf_final_err:.2f}%'
        )

        # ── Build chart data ──────────────────────────────────────────────
        n_ocv = min(len(soc_sorted), 100)
        idx_ocv = np.linspace(0, len(soc_sorted)-1, n_ocv, dtype=int)
        ocv_chart = [
            {
                'soc':      round(float(soc_sorted[i]) * 100, 1),
                'measured': round(float(ocv_sorted[i]), 4),
                'fit':      round(float(ocv_poly(soc_sorted[i])), 4),
            }
            for i in idx_ocv
        ]

        N = len(time_s)
        ds = max(1, N // 400)
        idx = list(range(0, N, ds))

        ecm_chart = [
            {
                'time':      int(time_s[i]),
                'measured':  round(float(voltage_cell[i]), 4),
                'simulated': round(float(v_ecm[i]), 4),
            }
            for i in idx
        ]

        ekf_chart = [
            {
                'time':      int(time_s[i]),
                'reference': round(float(soc_ref[i]) * 100, 2),
                'ekf':       round(float(soc_ekf[i]) * 100, 2),
            }
            for i in idx
        ]

        error_chart = [
            {
                'time':  int(time_s[i]),
                'error': round(float(soc_error[i]), 3),
            }
            for i in idx
        ]

        # Multi-start chart - optimized
        multi_chart = []
        multi_ekf_runs = {}
        for init_soc in [0.1, 0.3, 0.5, 0.7, 0.9]:
            key = f'init{int(init_soc*100)}'
            multi_ekf_runs[key] = run_ekf(current, time_s, voltage_cell, q_max, ocv_poly, R0, R1, C1, soc_init=init_soc)['soc']
        
        for i in idx:
            row = {'time': int(time_s[i]), 'reference': round(float(soc_ref[i]) * 100, 2)}
            for init_soc in [0.1, 0.3, 0.5, 0.7, 0.9]:
                key = f'init{int(init_soc*100)}'
                row[key] = round(float(multi_ekf_runs[key][i]) * 100, 2)
            multi_chart.append(row)

        # ── Return response ───────────────────────────────────────────────
        return jsonify({
            'success': True,
            'steps':   steps_log,
            'metrics': {
                'dataset': {
                    'n_points':         len(current_full),
                    'q_max_ah':         round(float(q_max), 3),
                    'duration_s':       int(time_full[-1]),
                    'avg_current_a':    round(float(current_full.mean()), 3),
                },
                'ocv': {
                    'polynomial_degree': 9,
                    'rmse_mv':          round(float(ocv_rmse_val * 1000), 2),
                },
                'ecm': {
                    'R0_mohm':  round(float(R0 * 1000), 3),
                    'R1_mohm':  round(float(R1 * 1000), 3),
                    'C1_F':     round(float(C1), 1),
                    'tau_s':    round(float(params['tau']), 2),
                    'rmse_mv':  round(float(ecm_rmse_val * 1000), 2),
                    'mae_mv':   round(float(ecm_mae_val * 1000), 2),
                    'max_mv':   round(float(ecm_max_val * 1000), 1),
                },
                'ekf': {
                    'rmse_pct':      round(float(ekf_rmse_val), 3),
                    'mae_pct':       round(float(ekf_mae_val), 3),
                    'final_error_pct': round(float(ekf_final_err), 3),
                    'conv_time_s':   round(float(t_converge), 1),
                    'init_soc':      50.0,
                    'q_ekf_ah':      round(float(q_ekf), 3),
                    'q_ref_ah':      round(float(q_ref), 3),
                    'cap_error_pct': round(float(cap_error), 3),
                },
                'multi_start': {
                    k: {
                        'conv_time_s':   v['conv_time'],
                        'final_error_pct': round(v['final_error'], 3),
                    }
                    for k, v in multi_results.items()
                },
            },
            'charts': {
                'ocv':   ocv_chart,
                'ecm':   ecm_chart,
                'ekf':   ekf_chart,
                'error': error_chart,
                'multi': multi_chart,
            },
        })

    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': str(e), 'traceback': tb}), 500

    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def _downsample(lst, n):
    if len(lst) <= n:
        return lst
    step = len(lst) // n
    return lst[::step][:n]


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
