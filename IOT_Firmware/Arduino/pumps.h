#ifndef PUMPS_H
#define PUMPS_H

#include <RTClib.h>

// Pump types
enum PumpType {
    WATER_PUMP,
    FERTILIZER_PUMP
};

// Pump actions
enum PumpAction {
    PUMP_ON,
    PUMP_OFF,
    PUMP_SPEED
};

extern bool pump1State;
extern bool pump2State;

// Core pump control function
void controlPump(PumpType pumpType, PumpAction action, int speed);

// API command handlers
void handleWaterPumpCommand(const char* command, const char* value);
void handleFertilizerPumpCommand(const char* command, const char* value);

#endif
