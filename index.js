/***

autotuner-pi-controller/index.js  Copyright 2023, Harshad Joshi and Bufferstack.IO Analytics Technology LLP. Pune

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

***/




class RelayAutoTuningPIController {
    /**
     * Constructs a new RelayAutoTuningPIController.
     * 
     * @param {number} initialKp - Initial proportional gain. Default is 1.0.
     * @param {number} initialKi - Initial integral gain. Default is 0.0.
     * @param {number} dt - Time interval between updates. Default is 1.0.
     * @param {number} initialMeasuredValue - Initial value measured from the system. Default is 0.0.
     */
    constructor(initialKp = 1.0, initialKi = 0.0, dt = 1.0, initialMeasuredValue = 0.0) {
        this.kp = initialKp;
        this.ki = initialKi;
        this.dt = dt;

        this.integral = 0;

        this.relayAmplitude = 1.0;
        this.lastSwitchTime = Date.now();
        // Corrected relayState for both positive and negative values handling 
        this.relayState = (initialMeasuredValue >= 0) ? -1 : 1;
        this.cycleTimes = [];

        // Error recovery state
        this.inErrorState = false;
    }

    /**
     * Updates the controller based on the setpoint and measured value.
     * 
     * @param {number} setpoint - Desired target value.
     * @param {number} measuredValue - Current value measured from the system.
     * @returns {number} - Control output based on the PI calculation.
     */
    update(setpoint, measuredValue) {
        const error = setpoint - measuredValue;

        // Check for large errors and enter error state if necessary
        if (Math.abs(error) > 100) {
            this.enterErrorState();
            return 0; // Return a safe control output
        }

        const proportional = this.kp * error;
        this.integral += error * this.dt;
        const integral = this.ki * this.integral;

        return proportional + integral;
    }

    /**
     * Implements the relay feedback test.
     * 
     * @param {number} measuredValue - Current value measured from the system.
     * @returns {number} - Relay control output.
     */
    relayFeedbackTest(measuredValue) {
        if (this.relayState * measuredValue < 0) {
            const currentTime = Date.now();
            const cycleTime = currentTime - this.lastSwitchTime;
            this.lastSwitchTime = currentTime;

            if (cycleTime > 100 && cycleTime < 10000) {
                this.cycleTimes.push(cycleTime);
                if (this.cycleTimes.length > 10) {
                    this.cycleTimes.shift();
                }
            } else {
                this.enterErrorState();
                return 0; // Return a safe control output
            }

            this.relayState *= -1;
        }

        return this.relayAmplitude * this.relayState;
    }

    /**
     * Calculates the ultimate gain (Ku) and ultimate period (Pu) based on the recorded cycle times.
     * 
     * @returns {Object} - Ultimate gain (Ku) and ultimate period (Pu).
     */
    calculateUltimateGainAndPeriod() {
        if (this.cycleTimes.length === 0) {
            this.enterErrorState();
            return { Ku: 0, Pu: 0 }; // Return safe values
        }

        const averageCycleTime = this.cycleTimes.reduce((sum, time) => sum + time, 0) / this.cycleTimes.length;
        const Pu = averageCycleTime;
        const Ku = (4 * this.relayAmplitude) / (Math.PI * Math.abs(this.integral / this.lastSwitchTime));

        return { Ku, Pu };
    }

    /**
     * Sets the PI gains based on the calculated ultimate gain (Ku) and ultimate period (Pu).
     * 
     * @param {number} Ku - Ultimate gain.
     * @param {number} Pu - Ultimate period.
     */
    setTuningParameters(Ku, Pu) {
        if (Ku <= 0 || Pu <= 0) {
            this.enterErrorState();
            return; // Do not update the tuning parameters
        }

        this.kp = 0.45 * Ku;
        this.ki = (0.54 * Ku) / Pu;
    }

    /**
     * Performs the relay feedback test, calculates the ultimate gain and period,
     * sets the PI gains, and then calculates the control output.
     * 
     * @param {number} setpoint - Desired target value.
     * @param {number} measuredValue - Current value measured from the system.
     * @returns {number} - Control output.
     */
    autoTune(setpoint, measuredValue) {
        if (this.inErrorState) {
            return 0; // Return a safe control output
        }

        const controlOutput = this.relayFeedbackTest(measuredValue);
        const { Ku, Pu } = this.calculateUltimateGainAndPeriod();

        if (Ku > 0 && Pu > 0) {
            this.setTuningParameters(Ku, Pu);
        }

        return this.update(setpoint, measuredValue) + controlOutput;
    }

    /**
     * Enter an error state and reset integral and cycle times.
     * This function is called when abnormal conditions are detected.
     */
    enterErrorState() {
        this.inErrorState = true;
        this.integral = 0;
        this.cycleTimes = [];
        console.error('Controller has entered an error state due to abnormal conditions.');
    }

    /**
     * Exit the error state and attempt to recover normal operation.
     * This function is called to attempt to recover from an error state.
     */
    exitErrorState() {
        this.inErrorState = false;
        this.integral = 0;
        this.cycleTimes = [];
        console.log('Controller has exited the error state and is attempting to recover.');
    }
}

module.exports = RelayAutoTuningPIController;

