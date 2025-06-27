#include "pumps.h"
#include "utils.h"

// Motor 1 pins
#define MOTOR1_IN1 30
#define MOTOR1_IN2 31
#define MOTOR1_EN 6

// Motor 2 pins
#define MOTOR2_IN1 24
#define MOTOR2_IN2 25
#define MOTOR2_EN 5

extern bool pump1State;
extern bool pump2State;

void controlPump(PumpType pumpType, PumpAction action, int speed) {
    int in1Pin, in2Pin, enPin;
    bool* pumpState;
    
    // Select pump pins based on type
    if (pumpType == WATER_PUMP) {
        in1Pin = MOTOR1_IN1;
        in2Pin = MOTOR1_IN2;
        enPin = MOTOR1_EN;
        pumpState = &pump1State;
    } else {
        in1Pin = MOTOR2_IN1;
        in2Pin = MOTOR2_IN2;
        enPin = MOTOR2_EN;
        pumpState = &pump2State;
    }

    // Execute pump action
    switch (action) {
        case PUMP_ON:
            digitalWrite(in1Pin, HIGH);
            digitalWrite(in2Pin, LOW);
            analogWrite(enPin, speed);
            *pumpState = true;
            break;

        case PUMP_OFF:
            analogWrite(enPin, 0);
            digitalWrite(in1Pin, LOW);
            digitalWrite(in2Pin, LOW);
            *pumpState = false;
            break;

        case PUMP_SPEED:
            if (*pumpState) {
                analogWrite(enPin, speed);
            }
            break;
    }
}

// API command handlers
void handleWaterPumpCommand(const char* command, const char* value) {
    if (strcmp(command, "ON") == 0) {
        controlPump(WATER_PUMP, PUMP_ON, 90);  // 90% power by default
        printEvent(rtc.now(), "Water Pump ON via API");
    }
    else if (strcmp(command, "OFF") == 0) {
        controlPump(WATER_PUMP, PUMP_OFF, 0);
        printEvent(rtc.now(), "Water Pump OFF via API");
    }
    else if (strcmp(command, "SPEED") == 0) {
        int speed = atoi(value);
        controlPump(WATER_PUMP, PUMP_SPEED, speed);
        printEvent(rtc.now(), "Water Pump speed changed via API");
    }
}

void handleFertilizerPumpCommand(const char* command, const char* value) {
    if (strcmp(command, "ON") == 0) {
        controlPump(FERTILIZER_PUMP, PUMP_ON, 90);  // 90% power by default
        printEvent(rtc.now(), "Fertilizer Pump ON via API");
    }
    else if (strcmp(command, "OFF") == 0) {
        controlPump(FERTILIZER_PUMP, PUMP_OFF, 0);
        printEvent(rtc.now(), "Fertilizer Pump OFF via API");
    }
    else if (strcmp(command, "SPEED") == 0) {
        int speed = atoi(value);
        controlPump(FERTILIZER_PUMP, PUMP_SPEED, speed);
        printEvent(rtc.now(), "Fertilizer Pump speed changed via API");
    }
}
