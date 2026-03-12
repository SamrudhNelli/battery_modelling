"""
NeoRide Battery Modelling — Full Pipeline
==========================================
Runs the complete SOC estimation pipeline:
  1. Load data
  2. Coulomb Counting (reference SOC)
  3. OCV-SOC polynomial fitting
  4. ECM parameter identification
  5. EKF SOC estimation (from wrong initial SOC)
  6. Validation metrics & plots
"""

import numpy as np
import matplotlib.pyplot as plt

from src.data_loader import get_bol_data
from src.coulomb_counting import coulomb_counting
from src.ocv_soc import extract_ocv_soc_raw, fit_ocv_polynomial
from src.ecm_model import simulate_ecm
from src.ecm_param_id import identify_parameters
from src.ekf_estimator import run_ekf
from src.utils import rmse, mae, max_abs_error


def main():
    print("=" * 60)
    print("  NeoRide Battery Modelling — Full Pipeline")
    print("=" * 60)

    # ── Step 1: Load Data ──
    print("\n[1/6] Loading data...")
    bol = get_bol_data("data/nasa_alt/battery00.csv")
    current_full = bol["current_load"].values
    time_full = bol["time_relative"].values
    voltage_pack = bol["voltage_load"].values

    # Compute capacity
    q_max = current_full.mean() * time_full[-1] / 3600
    print(f"  {len(current_full)} data points, Q_max = {q_max:.3f} Ah")

    # ── Step 2: Coulomb Counting ──
    print("\n[2/6] Coulomb Counting (reference SOC)...")
    soc_ref_full = coulomb_counting(current_full, time_full, q_max)
    print(f"  SOC: {soc_ref_full[0]*100:.1f}% → {soc_ref_full[-1]*100:.1f}%")

    # ── Step 3: OCV-SOC Polynomial ──
    print("\n[3/6] Fitting OCV-SOC polynomial...")
    soc_sorted, ocv_sorted = extract_ocv_soc_raw(voltage_pack, soc_ref_full)
    ocv_poly = fit_ocv_polynomial(soc_sorted, ocv_sorted)
    ocv_rmse = rmse(ocv_sorted, ocv_poly(soc_sorted))
    print(f"  Degree 9 polynomial, RMSE = {ocv_rmse*1000:.1f} mV")

    # ── Clean data (skip row 0 glitch) ──
    current = current_full[1:]
    time_s = time_full[1:]
    voltage_cell = voltage_pack[1:] / 2.0
    soc_ref = coulomb_counting(current, time_s, q_max)

    # ── Step 4: ECM Parameter Identification ──
    print("\n[4/6] ECM Parameter Identification...")
    params = identify_parameters(current, time_s, voltage_cell, q_max, ocv_poly)
    R0, R1, C1 = params['R0'], params['R1'], params['C1']
    print(f"  R0 = {R0*1000:.2f} mΩ, R1 = {R1*1000:.2f} mΩ, C1 = {C1:.0f} F")
    print(f"  τ = {params['tau']:.1f} s, ECM RMSE = {params['rmse']*1000:.2f} mV")

    # ── Step 5: ECM Simulation (with optimized params) ──
    print("\n[5/6] ECM Simulation...")
    soc_ecm, vrc_ecm, v_ecm = simulate_ecm(
        current, time_s, q_max, ocv_poly, R0, R1, C1
    )
    ecm_voltage_rmse = rmse(voltage_cell, v_ecm)
    print(f"  Voltage RMSE = {ecm_voltage_rmse*1000:.2f} mV")

    # ── Step 6: EKF SOC Estimation ──
    print("\n[6/6] EKF SOC Estimation (initial SOC = 50%)...")
    ekf_result = run_ekf(
        current, time_s, voltage_cell, q_max, ocv_poly,
        R0, R1, C1, soc_init=0.5
    )
    soc_ekf = ekf_result['soc']

    # ── Validation Metrics ──
    print("\n" + "=" * 60)
    print("  VALIDATION RESULTS")
    print("=" * 60)

    soc_error = (soc_ekf - soc_ref) * 100  # percentage points

    # Find convergence time (< 2% error)
    converged = np.where(np.abs(soc_error) < 2.0)[0]
    t_converge = time_s[converged[0]] if len(converged) > 0 else float('inf')

    print(f"\n  ECM Voltage Fit:")
    print(f"    RMSE     = {ecm_voltage_rmse*1000:.2f} mV")
    print(f"    MAE      = {mae(voltage_cell, v_ecm)*1000:.2f} mV")
    print(f"    Max Error = {max_abs_error(voltage_cell, v_ecm)*1000:.1f} mV")

    print(f"\n  EKF SOC Estimation (started at 50%):")
    print(f"    Convergence time (< 2%) = {t_converge:.0f} s")
    print(f"    RMSE (after conv.)      = {rmse(soc_ref[100:]*100, soc_ekf[100:]*100):.2f} %")
    print(f"    MAE  (after conv.)      = {mae(soc_ref[100:]*100, soc_ekf[100:]*100):.2f} %")
    print(f"    Max error (after conv.) = {max_abs_error(soc_ref[100:]*100, soc_ekf[100:]*100):.2f} %")
    print(f"    Final SOC error         = {soc_error[-1]:.2f} %")

    # Capacity prediction error (EKF with correct init SOC)
    ekf_correct = run_ekf(
        current, time_s, voltage_cell, q_max, ocv_poly,
        R0, R1, C1, soc_init=1.0
    )
    q_ref = np.sum(current[1:] * np.diff(time_s)) / 3600
    q_ekf = (ekf_correct['soc'][0] - ekf_correct['soc'][-1]) * q_max
    cap_error = abs(q_ekf - q_ref) / q_ref * 100
    print(f"\n  Capacity Prediction (EKF init=100%):")
    print(f"    Reference Q  = {q_ref:.3f} Ah")
    print(f"    EKF Q        = {q_ekf:.3f} Ah")
    print(f"    Cap. Error   = {cap_error:.2f} %")

    # ── Generate Plots ──
    print("\n  Generating plots...")
    fig, axes = plt.subplots(3, 1, figsize=(12, 12), sharex=True)

    # Panel 1: Voltage — ECM vs Measured
    axes[0].plot(time_s, voltage_cell, 'b-', label='Measured', alpha=0.8)
    axes[0].plot(time_s, v_ecm, 'r--', label=f'ECM (RMSE={ecm_voltage_rmse*1000:.1f}mV)', alpha=0.8)
    axes[0].set_ylabel('Voltage (V)')
    axes[0].set_title('ECM Voltage Fit')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Panel 2: SOC — EKF vs Reference
    axes[1].plot(time_s, soc_ref * 100, 'b-', label='Reference (CC)', linewidth=2)
    axes[1].plot(time_s, soc_ekf * 100, 'r-', label='EKF (init=50%)', linewidth=2)
    axes[1].set_ylabel('SOC (%)')
    axes[1].set_title('EKF SOC Estimation')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    # Panel 3: SOC Error
    axes[2].plot(time_s, soc_error, 'g-', linewidth=1.5)
    axes[2].axhline(y=0, color='k', alpha=0.3)
    axes[2].axhline(y=2, color='gray', linestyle=':', alpha=0.5)
    axes[2].axhline(y=-2, color='gray', linestyle=':', alpha=0.5)
    axes[2].set_xlabel('Time (s)')
    axes[2].set_ylabel('SOC Error (%)')
    axes[2].set_title(f'SOC Error (final = {soc_error[-1]:.2f}%)')
    axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('outputs/pipeline_results.png', dpi=150, bbox_inches='tight')
    plt.show()

    print(f"  Plot saved: outputs/pipeline_results.png")
    print("\n" + "=" * 60)
    print("  Pipeline complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
