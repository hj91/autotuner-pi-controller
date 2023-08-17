1. **Proportional-Integral (PI) Controller Algorithm:**
    - The PI controller is a type of feedback controller that uses both proportional and integral terms to generate a control output. The control output \( u(t) \) is calculated as follows:
        \[
        u(t) = K_p \cdot e(t) + K_i \cdot \int e(t) \, dt
        \]
    where:
        - \( u(t) \) is the control output at time \( t \)
        - \( K_p \) is the proportional gain
        - \( K_i \) is the integral gain
        - \( e(t) \) is the error signal at time \( t \), calculated as \( \text{setpoint} - \text{measuredValue} \)
        - \( dt \) is the time interval between updates

2. **Relay Feedback Test Algorithm for Auto-Tuning:**
    - The Relay Feedback Test is a method used to estimate the ultimate gain \( K_u \) and ultimate period \( P_u \) of a process, which are then used to calculate the PI gains. The steps involved are as follows:
        1. **Relay Feedback Test:**
            - A relay (an on-off controller with hysteresis) is introduced into the loop. The relay amplitude is known.
            - The relay causes the process output to oscillate. These oscillations are approximately of constant amplitude and period under certain conditions.
            - The time at which the relay switches is recorded.
        2. **Calculate Ultimate Gain \( K_u \) and Ultimate Period \( P_u \):**
            - The ultimate period \( P_u \) is calculated as the average of several observed oscillation periods.
            - The ultimate gain \( K_u \) is calculated using the amplitude of the relay and the amplitude of the oscillations, as follows:
                \[
                K_u = \frac{4 \cdot \text{relayAmplitude}}{\pi \cdot \left| \frac{\text{integral}}{\text{lastSwitchTime}} \right|}
                \]
        3. **Set Tuning Parameters:**
            - Based on the calculated \( K_u \) and \( P_u \), the PI controller gains are updated using some tuning rules. In this code, the following tuning rules (classic Ziegler-Nichols) are used:
                \[
                K_p = 0.45 \cdot K_u
                \]
                \[
                K_i = \frac{0.54 \cdot K_u}{P_u}
                \]

3. **Error Handling and Recovery:**
    - The algorithm includes error handling and recovery mechanisms. If abnormal conditions are detected (e.g., excessively large errors or unreasonable cycle times), the controller enters an error state. In this state, the controller can attempt to recover and resume normal operation.

This algorithm allows the PI controller to automatically tune its parameters based on the dynamics of the process it is controlling, making it adaptive to changes in the process characteristics.
