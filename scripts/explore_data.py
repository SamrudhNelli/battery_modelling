import pandas as pd

# Step 1: Load the CSV file
df = pd.read_csv("data/nasa_alt/battery00.csv")

# Step 2: How big is the data?
print("Shape:", df.shape)

# Step 3: What are the columns?
print("\nColumns:", df.columns.tolist())

# Step 4: First 10 rows
print("\nFirst 10 rows:")
print(df.head(10))

# Step 5: Data types
print("\nData types:")
print(df.dtypes)

# Step 6: Statistics (min, max, mean, etc.)
print("\nStatistics:")
print(df.describe())

import matplotlib.pyplot as plt

# Plot 1: Voltage over time (full dataset)
plt.figure(figsize=(14, 5))
plt.plot(df['time'] / 3600, df['voltage_charger'], linewidth=0.3)
plt.xlabel('Time (hours)')
plt.ylabel('Pack Voltage (V)')
plt.title('Battery Voltage Over Entire Test')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('data/plot_voltage_full.png', dpi=150)
plt.show()

# Plot 2: Zoom into first discharge cycle
# Filter: mode == -1 (discharge) and mission_type == 0 (reference)
ref_discharge = df[(df['mode'] == -1) & (df['mission_type'] == 0)]
print(f"\nReference discharge data: {len(ref_discharge)} rows")
print(f"Voltage range: {ref_discharge['voltage_load'].min():.3f} to {ref_discharge['voltage_load'].max():.3f} V")
print(f"Current range: {ref_discharge['current_load'].min():.3f} to {ref_discharge['current_load'].max():.3f} A")