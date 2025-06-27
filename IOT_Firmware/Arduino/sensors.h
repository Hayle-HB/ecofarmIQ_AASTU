#ifndef SENSORS_H
#define SENSORS_H

#include <ModbusMaster.h>
#include <Adafruit_SI1145.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>

// External objects from main.ino
extern ModbusMaster node;
extern Adafruit_SI1145 uv;
extern LiquidCrystal_I2C lcd;
extern RTC_DS3231 rtc;

extern float currentPH;
extern bool pump1State;
extern bool pump2State;

void handleSensorsAndControls();

#endif
