# SOC Estimation for Li-ion Cells Using ECM and Extended Kalman Filter

**ES60208 — Rechargeable Battery Performance Modelling**
**Team NeoRide**

---

## 1. Introduction

Knowing how much charge is left in a lithium-ion battery (its State of Charge, or SOC) is fundamental for any battery management system. You cannot measure SOC directly — it has to be estimated from things we can measure: voltage, current, and temperature. This project builds a complete SOC estimation pipeline starting from raw experimental data, going through model identification, and ending with a real-time estimator. We used the NASA Ames Prognostics battery ageing dataset, specifically the first reference discharge cycle from a 2-series 18650 Li-ion pack.

## 2. Methodology

The pipeline has six stages, each building on the previous one.

**Data extraction.** The raw CSV has over 1.1 million rows covering months of testing. We filter for reference discharge events (mode = –1, mission_type = 0) and segment them by detecting time gaps greater than 100 seconds. The Beginning-of-Life cycle gives us 3,674 data points over 3,503 seconds at roughly 2.52 A constant current, yielding a measured capacity of 2.452 Ah.

**Coulomb Counting.** SOC is computed by integrating the discharge current over time:

    SOC[k] = SOC[k–1] – I[k] · Δt / (Q_max × 3600)

This serves as our ground-truth reference. Coulomb Counting is simple but drifts in practice due to current sensor noise and bias — which is exactly why we need something better.

**OCV–SOC characterisation.** During slow (or rest) discharge, the terminal voltage approximates the open-circuit voltage. We divide pack voltage by 2 to get per-cell values, pair them with the Coulomb Counting SOC, and fit a 9th-degree polynomial using least squares. The fit achieves an RMSE of 13.3 mV across the full SOC range. The polynomial also gives us the derivative dOCV/dSOC, which the EKF needs for its linearisation step.

**Equivalent Circuit Model.** We use a first-order Thévenin model (1RC): a series resistance R₀ for the instantaneous ohmic drop, and a parallel R₁–C₁ pair for the polarisation dynamics. The terminal voltage equation is:

    V_terminal = OCV(SOC) – I · R₀ – V_RC

where V_RC evolves as a first-order exponential with time constant τ = R₁ · C₁.

**Parameter identification.** R₀, R₁, and C₁ are found by minimising the RMSE between the ECM-simulated voltage and the measured cell voltage. We use scipy's L-BFGS-B optimiser with bounds (R₀, R₁ ∈ [1, 200] mΩ; C₁ ∈ [100, 50 000] F). The optimiser converges to R₀ = 1.00 mΩ, R₁ = 1.00 mΩ, C₁ = 5,000 F (τ = 5.0 s), giving a voltage RMSE of 14.1 mV. The low resistance values occur because the OCV polynomial was fit from loaded discharge data, so some resistance is already captured in the polynomial itself.

**Extended Kalman Filter.** The EKF estimates the state vector x = [SOC, V_RC]ᵀ by combining the ECM prediction step with a correction from the measured voltage. The key matrices are:
- F (state transition): diagonal, with the SOC row equal to 1 and the V_RC row using the exponential decay exp(–Δt/τ).
- H (observation): [dOCV/dSOC, –1], linearised around the predicted SOC.
- Q (process noise): diag(1×10⁻⁸, 1×10⁻⁶).
- R (measurement noise): 2.5×10⁻⁵.

We deliberately initialise the EKF at 50% SOC while the true starting SOC is 100%, to test convergence from a wrong guess.

## 3. Results

The table below summarises all key accuracy metrics.

| Metric                          | Value     |
|---------------------------------|-----------|
| OCV polynomial RMSE             | 13.3 mV   |
| ECM voltage RMSE                | 14.1 mV   |
| ECM voltage MAE                 | 8.7 mV    |
| ECM max voltage error           | 159.2 mV  |
| EKF SOC RMSE (init 50%)        | 1.14 %    |
| EKF SOC MAE                    | 0.64 %    |
| EKF convergence time (< 2%)    | ~1 s      |
| EKF final SOC error            | –0.62 %   |
| Capacity prediction error       | 0.62 %    |

The ECM voltage fit is tight across most of the SOC range, with the largest errors appearing below 5% SOC where the voltage curve steepens sharply. The voltage residual shows a slight positive mean bias of 4.6 mV, suggesting the model underestimates the terminal voltage on average.

For the EKF, convergence from 50% to within 2% of the reference happens within about 1 second. After convergence, the SOC error stays below 2% for the remainder of the discharge. We tested robustness by running the EKF from five starting points (10%, 30%, 50%, 70%, 90%). All five converge to the same final error of –0.62%, confirming that the filter is not sensitive to initialisation. The signed final error indicates that the EKF slightly underestimates the remaining charge — a conservative and safe bias for practical BMS use.

The capacity prediction error of 0.62% is computed by comparing the Coulomb-Counting-integrated capacity from the EKF's SOC trace (with correct initial SOC) against the measured reference capacity: the EKF predicts 2.467 Ah vs the actual 2.452 Ah.

## 4. Limitations and Future Work

The biggest limitation is that we only used one cycle at one temperature and one C-rate. In practice, ECM parameters vary significantly with temperature (internal resistance roughly doubles per 20°C drop) and with ageing. A production system would need lookup tables or adaptive estimation for R₀, R₁, C₁ across operating conditions.

The 1RC model captures the dominant polarisation dynamics but misses slower diffusion processes visible in the residual patterns. A 2RC model would add a second time constant to cover this, at the cost of two more parameters.

Our OCV curve was extracted from loaded discharge data rather than from a proper low-rate or pulse-relaxation test. This causes some internal resistance to be absorbed into the OCV polynomial, which is why the identified R₀ and R₁ are at their lower bounds. A dedicated OCV test protocol (e.g., C/25 rate or GITT) would give a cleaner separation of OCV and resistance.

The EKF currently does not use temperature as an input or state. Adding temperature-dependent parameter scheduling and a thermal model would improve accuracy across real operating conditions.

Finally, all testing was done on a constant-current discharge profile. Validation on dynamic profiles such as UDDS or US06 drive cycles would be necessary before deploying to an actual vehicle BMS.

## 5. Deployment Notes

The estimator runs as a Python module. Given the current array, time array, and measured voltage, the EKF produces a real-time SOC estimate at each time step. The entire pipeline — from raw data to validated SOC — executes in under 3 seconds on a standard laptop (Python 3.11, no GPU). For embedded deployment, the EKF loop is a few matrix multiplications per step and ports straightforwardly to C.

Dependencies are minimal: numpy, scipy, pandas, and matplotlib. All code is version-controlled, modular, and each module can be tested independently via its `__main__` block.

---

*Team NeoRide — ES60208, 2026*
