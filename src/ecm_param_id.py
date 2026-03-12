import numpy as np
from scipy.optimize import minimize
from src.ecm_model import simulate_ecm


def ecm_cost_function(params, current, time_s, voltage_measured, q_max, ocv_poly):
    """
    Cost function for ECM parameter identification.

    Parameters
    ----------
    params           : list [R0, R1, C1]
    current          : array — current (A)
    time_s           : array — time (s)
    voltage_measured : array — measured per-cell voltage (V)
    q_max            : float — capacity (Ah)
    ocv_poly         : np.poly1d — OCV polynomial

    Returns
    -------
    rmse : float — root mean squared error (V)
    """
    R0, R1, C1 = params
    _, _, v_sim = simulate_ecm(current, time_s, q_max, ocv_poly, R0, R1, C1)
    error = v_sim - voltage_measured
    return np.sqrt(np.mean(error ** 2))


def identify_parameters(current, time_s, voltage_measured, q_max, ocv_poly,
                        x0=None, bounds=None):
    """
    Find optimal R0, R1, C1 by minimizing RMSE between ECM and measured voltage.

    Parameters
    ----------
    current          : array — current (A)
    time_s           : array — time (s)
    voltage_measured : array — measured per-cell voltage (V)
    q_max            : float — capacity (Ah)
    ocv_poly         : np.poly1d — OCV polynomial
    x0               : list — initial guess [R0, R1, C1] (default: [0.03, 0.02, 5000])
    bounds           : list of tuples — parameter bounds (default provided)

    Returns
    -------
    result : dict with keys:
        'R0', 'R1', 'C1'  : optimal parameters
        'tau'              : R1 * C1 (time constant)
        'rmse'             : final RMSE (V)
        'success'          : bool — optimizer converged?
        'scipy_result'     : full scipy OptimizeResult
    """
    if x0 is None:
        x0 = [0.030, 0.020, 5000.0]

    if bounds is None:
        bounds = [
            (0.001, 0.200),     # R0: 1–200 mΩ
            (0.001, 0.200),     # R1: 1–200 mΩ
            (100.0, 50000.0),   # C1: 100–50000 F
        ]

    res = minimize(
        ecm_cost_function,
        x0,
        args=(current, time_s, voltage_measured, q_max, ocv_poly),
        method='L-BFGS-B',
        bounds=bounds,
        options={'maxiter': 200, 'ftol': 1e-12}
    )

    R0_opt, R1_opt, C1_opt = res.x

    return {
        'R0': R0_opt,
        'R1': R1_opt,
        'C1': C1_opt,
        'tau': R1_opt * C1_opt,
        'rmse': res.fun,
        'success': res.success,
        'scipy_result': res
    }


if __name__ == "__main__":
    from src.data_loader import get_bol_data
    from src.coulomb_counting import coulomb_counting
    from src.ocv_soc import extract_ocv_soc_raw, fit_ocv_polynomial

    # Load data
    bol = get_bol_data("data/nasa_alt/battery00.csv")
    current = bol["current_load"].values
    time_s = bol["time_relative"].values
    voltage_cell = bol["voltage_load"].values / 2.0

    # Build OCV polynomial
    q_max = current.mean() * time_s[-1] / 3600
    soc_ref = coulomb_counting(current, time_s, q_max)
    soc_sorted, ocv_sorted = extract_ocv_soc_raw(bol["voltage_load"].values, soc_ref)
    ocv_poly = fit_ocv_polynomial(soc_sorted, ocv_sorted)

    # Skip row 0 (transient glitch)
    current_clean = current[1:]
    time_clean = time_s[1:]
    voltage_clean = voltage_cell[1:]

    # Run parameter identification
    print("Running parameter identification...")
    result = identify_parameters(current_clean, time_clean, voltage_clean, q_max, ocv_poly)

    print(f"\nOptimization {'CONVERGED' if result['success'] else 'FAILED'}")
    print(f"Optimal Parameters:")
    print(f"  R0  = {result['R0']*1000:.2f} mΩ")
    print(f"  R1  = {result['R1']*1000:.2f} mΩ")
    print(f"  C1  = {result['C1']:.1f} F")
    print(f"  τ   = {result['tau']:.1f} s")
    print(f"  RMSE = {result['rmse']*1000:.2f} mV")
