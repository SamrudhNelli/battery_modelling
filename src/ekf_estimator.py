import numpy as np
from src.ocv_soc import get_ocv_from_soc, get_docv_dsoc


def run_ekf(current, time_s, voltage_measured, q_max, ocv_poly,
            R0, R1, C1, Q=None, R=None, soc_init=0.5, P_init=None):
    """
    Extended Kalman Filter for SOC estimation using a 1RC ECM.

    State: x = [SOC, V_RC]^T
    Input: u = I (current, positive = discharge)
    Measurement: z = V_terminal

    Parameters
    ----------
    current          : array — current (A)
    time_s           : array — time (s)
    voltage_measured : array — measured per-cell voltage (V)
    q_max            : float — battery capacity (Ah)
    ocv_poly         : np.poly1d — OCV-SOC polynomial
    R0               : float — ohmic resistance (Ω)
    R1               : float — RC resistance (Ω)
    C1               : float — RC capacitance (F)
    Q                : 2×2 array — process noise covariance (default provided)
    R                : 1×1 array — measurement noise covariance (default provided)
    soc_init         : float — initial SOC guess (default 0.5)
    P_init           : 2×2 array — initial error covariance (default provided)

    Returns
    -------
    dict with keys:
        'soc'           : array — EKF SOC estimate
        'v_rc'          : array — EKF V_RC estimate
        'kalman_gains'  : array (N×2) — Kalman gains at each step
        'P_trace'       : array — trace of P (total uncertainty)
    """
    tau = R1 * C1
    dt_arr = np.diff(time_s, prepend=time_s[0])
    N = len(time_s)

    if Q is None:
        Q = np.diag([1e-8, 1e-6])
    if R is None:
        R = np.array([[2.5e-5]])
    if P_init is None:
        P_init = np.diag([0.5, 0.001])

    # Storage
    soc_ekf = np.zeros(N)
    vrc_ekf = np.zeros(N)
    kalman_gains = np.zeros((N, 2))
    P_trace = np.zeros(N)

    # Initialize
    x = np.array([soc_init, 0.0])
    P = P_init.copy()

    soc_ekf[0] = x[0]
    vrc_ekf[0] = x[1]
    P_trace[0] = np.trace(P)

    I_mat = np.eye(2)

    for k in range(1, N):
        dt = dt_arr[k]
        I = current[k]
        exp_dt_tau = np.exp(-dt / tau)

        # ── PREDICT ──
        soc_pred = x[0] - (I * dt) / (q_max * 3600)
        vrc_pred = x[1] * exp_dt_tau + R1 * I * (1 - exp_dt_tau)
        x_pred = np.array([soc_pred, vrc_pred])

        F = np.array([
            [1.0,        0.0],
            [0.0, exp_dt_tau]
        ])
        P_pred = F @ P @ F.T + Q

        # ── UPDATE ──
        ocv_pred = get_ocv_from_soc(x_pred[0], ocv_poly)
        v_pred = ocv_pred - I * R0 - x_pred[1]
        y = voltage_measured[k] - v_pred

        dOCV = get_docv_dsoc(x_pred[0], ocv_poly)
        H = np.array([[dOCV, -1.0]])

        S = H @ P_pred @ H.T + R
        K = P_pred @ H.T @ np.linalg.inv(S)

        x = x_pred + (K @ np.array([[y]])).flatten()
        P = (I_mat - K @ H) @ P_pred

        # Store
        soc_ekf[k] = x[0]
        vrc_ekf[k] = x[1]
        kalman_gains[k] = K.flatten()
        P_trace[k] = np.trace(P)

    return {
        'soc': soc_ekf,
        'v_rc': vrc_ekf,
        'kalman_gains': kalman_gains,
        'P_trace': P_trace
    }


if __name__ == "__main__":
    from src.data_loader import get_bol_data
    from src.coulomb_counting import coulomb_counting
    from src.ocv_soc import extract_ocv_soc_raw, fit_ocv_polynomial
    from src.ecm_param_id import identify_parameters

    # Load data
    bol = get_bol_data("data/nasa_alt/battery00.csv")
    current_full = bol["current_load"].values
    time_full = bol["time_relative"].values

    q_max = current_full.mean() * time_full[-1] / 3600
    soc_ref_full = coulomb_counting(current_full, time_full, q_max)
    soc_sorted, ocv_sorted = extract_ocv_soc_raw(bol["voltage_load"].values, soc_ref_full)
    ocv_poly = fit_ocv_polynomial(soc_sorted, ocv_sorted)

    # Clean data (skip row 0 glitch)
    current = current_full[1:]
    time_s = time_full[1:]
    voltage_cell = bol["voltage_load"].values[1:] / 2.0
    soc_ref = coulomb_counting(current, time_s, q_max)

    # Get optimized ECM parameters
    params = identify_parameters(current, time_s, voltage_cell, q_max, ocv_poly)
    R0, R1, C1 = params['R0'], params['R1'], params['C1']

    # Run EKF with wrong initial SOC
    print("Running EKF (initial SOC = 50%, true = 100%)...")
    result = run_ekf(current, time_s, voltage_cell, q_max, ocv_poly,
                     R0, R1, C1, soc_init=0.5)

    soc_ekf = result['soc']
    soc_error = (soc_ekf - soc_ref) * 100

    print(f"  SOC: {soc_ekf[0]*100:.1f}% → {soc_ekf[-1]*100:.1f}%")
    print(f"  Ref: {soc_ref[0]*100:.1f}% → {soc_ref[-1]*100:.1f}%")
    print(f"  Max error after 100s: {np.max(np.abs(soc_error[100:])):.2f}%")
    print(f"  Final error: {soc_error[-1]:.2f}%")
