import numpy as np
from src.ocv_soc import get_ocv_from_soc


def simulate_ecm(current, time_s, q_max, ocv_poly, R0, R1, C1, soc_init=1.0):
    """
    Run a full 1RC Thevenin ECM simulation.

    Parameters
    ----------
    current   : array — current values (A), positive = discharge
    time_s    : array — time values (s)
    q_max     : float — battery capacity (Ah)
    ocv_poly  : np.poly1d — OCV-SOC polynomial
    R0        : float — ohmic resistance (Ω)
    R1        : float — RC resistance (Ω)
    C1        : float — RC capacitance (F)
    soc_init  : float — initial SOC (default 1.0 = 100%)

    Returns
    -------
    soc    : array — SOC at each time step
    v_rc   : array — RC polarization voltage (V)
    v_term : array — terminal voltage (V)
    """
    tau = R1 * C1
    dt_arr = np.diff(time_s, prepend=time_s[0])
    N = len(time_s)

    soc = np.zeros(N)
    v_rc = np.zeros(N)
    v_term = np.zeros(N)

    soc[0] = soc_init
    v_rc[0] = 0.0
    v_term[0] = get_ocv_from_soc(soc[0], ocv_poly) - current[0] * R0

    for k in range(1, N):
        dt = dt_arr[k]
        I = current[k]

        # Equation 1: SOC update
        soc[k] = soc[k - 1] - (I * dt) / (q_max * 3600)

        # Equation 2: RC voltage update
        exp_t = np.exp(-dt / tau)
        v_rc[k] = v_rc[k - 1] * exp_t + R1 * I * (1 - exp_t)

        # Equation 3: Terminal voltage
        v_term[k] = get_ocv_from_soc(soc[k], ocv_poly) - I * R0 - v_rc[k]

    return soc, v_rc, v_term


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

    # Run ECM with guessed parameters
    R0, R1, C1 = 0.030, 0.020, 5000.0
    soc, v_rc, v_term = simulate_ecm(current, time_s, q_max, ocv_poly, R0, R1, C1)

    rmse = np.sqrt(np.mean((v_term - voltage_cell) ** 2)) * 1000
    print(f"ECM Simulation: {len(current)} points")
    print(f"  R0={R0*1000:.0f}mΩ, R1={R1*1000:.0f}mΩ, C1={C1:.0f}F (τ={R1*C1:.0f}s)")
    print(f"  SOC: {soc[0]*100:.1f}% → {soc[-1]*100:.1f}%")
    print(f"  V_sim:  {v_term[0]:.4f} → {v_term[-1]:.4f} V")
    print(f"  V_meas: {voltage_cell[0]:.4f} → {voltage_cell[-1]:.4f} V")
    print(f"  RMSE = {rmse:.1f} mV (guessed params — will improve after optimization)")
