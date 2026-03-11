import numpy as np


def coulomb_counting(current, time, q_max, soc_init=1.0):
    """
    Calculate SOC using Coulomb Counting.

    Parameters
    ----------
    current : array  - Current at each time step (Amps, positive = discharge)
    time    : array  - Time at each step (seconds)
    q_max   : float  - Battery capacity (Ah)
    soc_init: float  - Starting SOC (default 1.0 = 100%)

    Returns
    -------
    array - SOC at each time step (0 to 1)
    """
    n = len(current)
    soc = np.zeros(n)
    soc[0] = soc_init

    for k in range(1, n):
        dt = time[k] - time[k - 1]
        soc[k] = soc[k - 1] - (current[k] * dt) / (q_max * 3600)

    # Clip to [0, 1] range (can't go below 0% or above 100%)
    soc = np.clip(soc, 0.0, 1.0)

    return soc


# Test: run this file directly to verify
if __name__ == "__main__":
    from src.data_loader import get_bol_data

    bol = get_bol_data("data/nasa_alt/battery00.csv")
    current = bol['current_load'].values
    time = bol['time_relative'].values
    q_max = current.mean() * time[-1] / 3600

    soc = coulomb_counting(current, time, q_max)
    print(f"SOC: {soc[0]*100:.1f}% → {soc[-1]*100:.1f}%")
    print(f"Data points: {len(soc)}")