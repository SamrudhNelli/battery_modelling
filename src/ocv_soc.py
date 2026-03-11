import numpy as np


def extract_ocv_soc_raw(voltage, soc):
    """
    Clean and prepare OCV-SOC pairs from discharge data.

    Steps:
    1. Convert pack voltage to per-cell (divide by 2)
    2. Skip first row (transient glitch)
    3. Remove any NaN values
    4. Sort by SOC ascending

    Parameters
    ----------
    voltage : array - Pack terminal voltage during discharge (V)
    soc     : array - SOC at each point (from Coulomb Counting, 0 to 1)

    Returns
    -------
    tuple: (soc_sorted, ocv_sorted) - cleaned per-cell arrays sorted by SOC
    """
    voltage = np.array(voltage)
    soc = np.array(soc)

    # Convert pack voltage to per-cell (2 cells in series)
    voltage_cell = voltage / 2.0

    # Skip first row (transient glitch at discharge start)
    voltage_cell = voltage_cell[1:]
    soc = soc[1:]

    # Remove NaN values
    valid = ~(np.isnan(voltage_cell) | np.isnan(soc))
    soc = soc[valid]
    voltage_cell = voltage_cell[valid]

    # Sort by SOC ascending
    sort_idx = np.argsort(soc)
    soc_sorted = soc[sort_idx]
    ocv_sorted = voltage_cell[sort_idx]

    return soc_sorted, ocv_sorted


def fit_ocv_polynomial(soc, ocv, degree=9):
    """
    Fit a polynomial to the OCV-SOC data.

    Parameters
    ----------
    soc    : array - SOC values (0 to 1)
    ocv    : array - OCV values (V per cell)
    degree : int   - Polynomial degree (default 9)

    Returns
    -------
    np.poly1d - Fitted polynomial that can be called like a function
    """
    coeffs = np.polyfit(soc, ocv, degree)
    poly = np.poly1d(coeffs)
    return poly


def get_ocv_from_soc(soc_value, ocv_poly):
    """
    Get OCV for a given SOC using the fitted polynomial.

    Parameters
    ----------
    soc_value : float or array - SOC (0 to 1)
    ocv_poly  : np.poly1d      - Fitted polynomial from fit_ocv_polynomial()

    Returns
    -------
    float or array - OCV in Volts (per cell)
    """
    return ocv_poly(soc_value)


def get_docv_dsoc(soc_value, ocv_poly):
    """
    Get the derivative dOCV/dSOC at a given SOC.

    This is needed by the EKF for the Jacobian (linearization).
    The derivative of a polynomial is just another polynomial (one degree lower).

    Parameters
    ----------
    soc_value : float or array - SOC (0 to 1)
    ocv_poly  : np.poly1d      - Fitted polynomial

    Returns
    -------
    float or array - dOCV/dSOC (V per unit SOC)
    """
    deriv_poly = np.polyder(ocv_poly)
    return deriv_poly(soc_value)


# Test: run this file directly to verify
if __name__ == "__main__":
    from src.data_loader import get_bol_data
    from src.coulomb_counting import coulomb_counting

    # Load data and compute SOC
    bol = get_bol_data("data/nasa_alt/battery00.csv")
    current = bol['current_load'].values
    time = bol['time_relative'].values
    voltage = bol['voltage_load'].values
    q_max = current.mean() * time[-1] / 3600
    soc = coulomb_counting(current, time, q_max)

    # Extract and fit
    soc_sorted, ocv_sorted = extract_ocv_soc_raw(voltage, soc)
    ocv_poly = fit_ocv_polynomial(soc_sorted, ocv_sorted)

    # Calculate RMSE
    rmse = np.sqrt(np.mean((ocv_sorted - ocv_poly(soc_sorted)) ** 2))

    print("=== OCV-SOC Polynomial Fit ===")
    print(f"Data points: {len(soc_sorted)}")
    print(f"RMSE: {rmse*1000:.2f} mV")
    print(f"\nOCV at key SOC values:")
    for s in [1.0, 0.5, 0.0]:
        print(f"  SOC={s*100:.0f}%  →  OCV={get_ocv_from_soc(s, ocv_poly):.3f} V")
        print(f"           dOCV/dSOC={get_docv_dsoc(s, ocv_poly):.3f} V")
