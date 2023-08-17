# Relay Auto-Tuning PI Controller

## Overview

`autotuner-pi-controller` is a Proportional-Integral (PI) controller that uses the Relay Feedback Test for auto-tuning. The Relay Feedback Test is used to estimate the ultimate gain (Ku) and ultimate period (Pu) of a process. These parameters are then used to calculate the PI gains.

## Installation

Copy the `autotuner-pi-controller/index.js` file to your project directory or install it using `npm install autotuner-pi-controller` in your project directory

## Usage

```javascript
const RelayAutoTuningPIController = require('./path/to/autotuner-pi-controller/index.js');

// Create a new controller with initial parameters
const piController = new RelayAutoTuningPIController(1.0, 0.0, 1.0);

// Simulate a process and auto-tune the controller
const setpoint = 50;
let measuredValue = 40;
let controlOutput = piController.autoTune(setpoint, measuredValue);

// Use the controller to calculate the control output
controlOutput = piController.update(setpoint, measuredValue);
```

## Methods

- `update(setpoint, measuredValue)`: Calculates the control output based on the setpoint and measured value.
- `relayFeedbackTest(measuredValue)`: Implements the relay feedback test.
- `calculateUltimateGainAndPeriod()`: Calculates the ultimate gain (Ku) and ultimate period (Pu) based on the recorded cycle times.
- `setTuningParameters(Ku, Pu)`: Sets the PI gains based on the calculated Ku and Pu.
- `autoTune(setpoint, measuredValue)`: Performs the relay feedback test, calculates Ku and Pu, sets the PI gains, and then calculates the control output.
- `enterErrorState()`: Enters an error state and resets integral and cycle times when abnormal conditions are detected.
- `exitErrorState()`: Exits the error state and attempts to recover normal operation.

## Error Handling

The controller includes error handling and recovery mechanisms. When abnormal conditions are detected (e.g., unusually large errors or invalid tuning parameters), the controller enters an error state. In this state, the controller stops normal operation and returns a safe control output. The controller can attempt to recover from an error state by calling the `exitErrorState()` method.

## License

Apache-2.0

## Author 

Harshad Joshi @ Bufferstack.IO Analytics Technology LLP, Pune 

