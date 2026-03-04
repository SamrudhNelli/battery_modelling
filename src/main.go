package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"os"
	"strconv"
	"strings"
)

type ECMParameters struct {
	CapacityAh      float64   `json:"Capacity_Ah"`
	R0              float64   `json:"R0_Ohms"`
	Rp              float64   `json:"Rp_Ohms"`
	Cp              float64   `json:"Cp_Farads"`
	OCVSOCTable     []float64 `json:"OCV_SOC_Table"`
	OCVVoltageTable []float64 `json:"OCV_Voltage_Table"`
}

type BatteryState struct {
	SOC           float64
	PolarizationV float64
}

func getOCV(soc float64, params ECMParameters) float64 {
	if soc >= 1.0 { return params.OCVVoltageTable[0] }
	if soc <= 0.0 { return params.OCVVoltageTable[len(params.OCVVoltageTable)-1] }

	for i := 0; i < len(params.OCVSOCTable)-1; i++ {
		highSOC := params.OCVSOCTable[i]
		lowSOC := params.OCVSOCTable[i+1]
		if soc <= highSOC && soc >= lowSOC {
			vHigh := params.OCVVoltageTable[i]
			vLow := params.OCVVoltageTable[i+1]
			ratio := (soc - lowSOC) / (highSOC - lowSOC)
			return vLow + ratio*(vHigh - vLow)
		}
	}
	return params.OCVVoltageTable[len(params.OCVVoltageTable)-1]
}

func main() {
	// 1. Load Digital Twin with strict error checking
	paramFile, err := os.ReadFile("../extract_parameters/ecm_parameters.json")
	if err != nil {
		fmt.Println("FATAL: Could not read JSON file.", err)
		return
	}
	
	var params ECMParameters
	if err := json.Unmarshal(paramFile, &params); err != nil {
		fmt.Println("FATAL: Could not parse JSON.", err)
		return
	}

	// 2. Open the Massive NASA CSV File
	csvFile, err := os.Open("../data/battery_alt_dataset/regular_alt_batteries/battery01.csv")
	if err != nil {
		fmt.Println("FATAL: CSV file not found.")
		return
	}
	defer csvFile.Close()

	// 3. Configure a forgiving CSV Reader
	reader := csv.NewReader(csvFile)
	reader.FieldsPerRecord = -1 // Ignore rows with extra/missing commas
	reader.LazyQuotes = true    // Ignore malformed quotes
	reader.Read()               // Skip header row

	const colTime, colVoltageCharger, colVoltageLoad, colCurrent = 1, 3, 5, 6

	state := BatteryState{SOC: 1.0, PolarizationV: 0.0}
	const K = 0.01 
	
	var lastTime, lastPrintTime float64
	var totalSqErr float64
	var count int

	fmt.Printf("%-10s | %-10s | %-10s | %-10s\n", "Time (s)", "Current (A)", "Voltage (V)", "Est. SOC %")
	fmt.Println("-----------------------------------------------------------------")

	for {
		row, err := reader.Read()
		if err == io.EOF { break }
		if len(row) < 7 { continue } 
		
		// Clean the strings of any weird NASA whitespace before parsing
		timeStr := strings.TrimSpace(row[colTime])
		currentStr := strings.TrimSpace(row[colCurrent])
		vStr := strings.TrimSpace(row[colVoltageLoad])
		
		if vStr == "" { vStr = strings.TrimSpace(row[colVoltageCharger]) }
		
		currentTime, _ := strconv.ParseFloat(timeStr, 64)
		voltage, _ := strconv.ParseFloat(vStr, 64)
		currentRaw, _ := strconv.ParseFloat(currentStr, 64)
		
		current := -math.Abs(currentRaw) 
		
		if math.Abs(current) < 0.1 || voltage < 1.0 { 
			lastTime = currentTime
			continue 
		}
	
		dt := currentTime - lastTime
		if dt <= 0 || dt > 100 { dt = 1.0 }

		// --- THE ESTIMATION ENGINE ---
		state.SOC += (current * (dt / 3600.0)) / params.CapacityAh

		tau := params.Rp * params.Cp
		expFact := math.Exp(-dt / tau)
		state.PolarizationV = state.PolarizationV*expFact + current*params.Rp*(1-expFact)

		predictedV := getOCV(state.SOC, params) + (current * params.R0) + state.PolarizationV
		
		errorV := voltage - predictedV
		state.SOC += K * errorV 

		totalSqErr += errorV * errorV
		count++

		if state.SOC > 1.0 { state.SOC = 1.0 }
		if state.SOC < 0.0 { state.SOC = 0.0 }

		if currentTime - lastPrintTime >= 50 {
			fmt.Printf("%-10.1f | %-10.2f | %-10.2f | %-10.2f%%\n", 
				currentTime, current, voltage, state.SOC*100)
			lastPrintTime = currentTime
		}
		
		lastTime = currentTime

		// Break when the first cycle ends
		if state.SOC <= 0.05 {
			break
		}
	}

	if count > 0 {
		rmse := math.Sqrt(totalSqErr / float64(count))
		fmt.Println("-----------------------------------------------------------------")
		fmt.Printf("Cycle 1 Simulation Complete.\n")
		fmt.Printf("Total Data Points Processed: %d\n", count)
		fmt.Printf("Final Voltage RMSE: %.4f V\n", rmse)
	} else {
		fmt.Println("No valid discharge data points were found in the file.")
	}
}