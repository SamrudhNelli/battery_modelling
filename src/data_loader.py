import pandas as pd


# ============================================================
# FUNCTION 1: Load the raw CSV file
# ============================================================
def load_raw_data(filepath):
    """
    Read the battery CSV file and return a DataFrame.

    Parameters
    ----------
    filepath : str
        Path to the CSV file (e.g., "data/nasa_alt/battery00.csv")

    Returns
    -------
    pd.DataFrame
        The raw data with all 10 columns.
    """
    df = pd.read_csv(filepath)
    return df


# ============================================================
# FUNCTION 2: Extract all reference discharge cycles
# ============================================================
def extract_reference_discharges(df):
    """
    Find all reference discharge cycles in the data.

    Logic (same as what we did in the notebook):
    1. Filter rows where mode == -1 (discharge) AND mission_type == 0 (reference)
    2. Find time gaps > 100 seconds (these are boundaries between cycles)
    3. Split the data at these gaps into individual cycles
    4. Add a 'time_relative' column to each cycle (time starting from 0)

    Returns
    -------
    list of pd.DataFrame
        Each DataFrame is one complete reference discharge cycle.
    """
    # Step 1: Filter reference discharge rows
    ref_discharge = df[(df['mode'] == -1) & (df['mission_type'] == 0)].copy()

    # Step 2: Find time gaps (boundaries between cycles)
    time_diff = ref_discharge['time'].diff()
    gap_indices = time_diff[time_diff > 100].index

    # Step 3: Split into individual cycles
    cycles = []
    start_idx = ref_discharge.index[0]

    for gap_idx in gap_indices:
        cycle = ref_discharge.loc[start_idx:gap_idx - 1].copy()
        cycles.append(cycle)
        start_idx = gap_idx

    # Don't forget the last cycle (after the last gap)
    cycles.append(ref_discharge.loc[start_idx:].copy())

    # Step 4: Add time_relative to each cycle (starts from 0)
    for cycle in cycles:
        cycle['time_relative'] = cycle['time'] - cycle['time'].iloc[0]

    return cycles


# ============================================================
# FUNCTION 3: Get the BoL (first) discharge cycle
# ============================================================
def get_bol_data(filepath):
    """
    Main function: load the data and return the first reference discharge.

    This is the function other modules will call.

    Returns
    -------
    pd.DataFrame
        The BoL (Beginning of Life) discharge cycle.
    """
    df = load_raw_data(filepath)
    cycles = extract_reference_discharges(df)
    bol_discharge = cycles[0]  # First cycle = BoL
    return bol_discharge


# ============================================================
# TEST: Run this file directly to verify it works
# ============================================================
if __name__ == "__main__":
    bol = get_bol_data("data/nasa_alt/battery00.csv")

    duration = bol['time_relative'].max()
    avg_current = bol['current_load'].mean()
    capacity = avg_current * duration / 3600

    print("=== BoL Reference Discharge ===")
    print(f"Rows:          {len(bol)}")
    print(f"Duration:      {duration:.0f} seconds ({duration/60:.1f} minutes)")
    print(f"Avg current:   {avg_current:.3f} A")
    print(f"Capacity:      {capacity:.3f} Ah")
    print(f"Pack voltage:  {bol['voltage_load'].iloc[0]:.3f} → {bol['voltage_load'].iloc[-1]:.3f} V")
    print(f"Cell voltage:  {bol['voltage_load'].iloc[0]/2:.3f} → {bol['voltage_load'].iloc[-1]/2:.3f} V")

def extract_references_discharges(df):
     mode_counts = df['mode'].value_counts().sort_index()
     print('Mode counts')
     for mode in mode_counts.item():
        m
