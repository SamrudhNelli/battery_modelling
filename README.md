# Real-Time Battery SOC Estimation (NASA Dataset)

This repository contains a hybrid Python and Go pipeline for Equivalent Circuit Model (ECM) parameter extraction and real-time, closed-loop State of Charge (SOC) estimation. It processes the NASA Battery Dataset to build a digital twin of a lithium-ion cell and evaluates it using a high-performance Luenberger Observer.

**Final Model Accuracy:** The estimator achieved a Root Mean Square Error (RMSE) of **0.0083 V** (8.3 mV) against the physical NASA hardware sensors over the Beginning-of-Life cycle.

---

## System Architecture

The project is split into two distinct phases to mimic a production environment where model characterization (Python) is separated from embedded hardware inference (Go).

### 1. Data Characterization (`/extract_parameters`)
* **Language:** Python (`pandas`, `numpy`)
* **Library:** `batteryDAT`
* **Function:** Ingests the raw 300MB NASA dataset (`battery01.csv`) and isolates the exact Beginning-of-Life (BoL) discharge cycle. It mathematically extracts the First-Order Thevenin Equivalent Circuit Model parameters:
  * Ohmic Resistance ($R_0$)
  * Polarization Resistance ($R_p$)
  * Polarization Capacitance ($C_p$)
  * Open-Circuit Voltage (OCV) vs. SOC Lookup Tables
* **Output:** A lightweight `ecm_parameters.json` payload acting as the battery's "Digital Twin".

### 2. Real-Time SOC Estimator (`/src`)
* **Language:** Go
* **Function:** Acts as the firmware for a simulated Battery Management System (BMS). It parses the JSON Digital Twin and streams the massive NASA CSV file row-by-row using a high-performance buffered reader. 
* **Algorithm:** Implements a closed-loop Luenberger Observer. It predicts the SOC using standard Coulomb Counting, models the expected transient voltage using the ECM parameters, and continuously corrects the SOC estimate based on the real-time voltage error.

---

## 🚀 Getting Started

### Prerequisites
* **Python 3.10+** (with `pandas`, `numpy`)
* **Go 1.20+**
* **Git LFS** (Required to download the raw NASA dataset)

### Installation & Setup

1. **Clone the repository and pull the LFS data:**
   ```bash
   git clone https://github.com/SamrudhNelli/battery_modelling.git
   cd battery_modelling
   git lfs pull