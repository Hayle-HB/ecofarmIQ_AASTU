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

void controlWaterPump(float moisture, DateTime now) {
  if (moisture < 20 && !pump1State) {
    digitalWrite(MOTOR1_IN1, HIGH); digitalWrite(MOTOR1_IN2, LOW);
    analogWrite(MOTOR1_EN, 90);
    pump1State = true;
    printEvent(now, "Water Pump ON (Moisture < 20%)");
  } else if (moisture > 30 && pump1State) {
    analogWrite(MOTOR1_EN, 0); digitalWrite(MOTOR1_IN1, LOW); digitalWrite(MOTOR1_IN2, LOW);
    pump1State = false;
    printEvent(now, "Water Pump OFF (Moisture > 30%)");
  }
}

void controlFertilizerPump(int nitrogen, DateTime now) {
  if (nitrogen < 30 && !pump2State) {
    digitalWrite(MOTOR2_IN1, HIGH); digitalWrite(MOTOR2_IN2, LOW);
    analogWrite(MOTOR2_EN, 90);
    pump2State = true;
    printEvent(now, "Fertilizer Pump ON (Nitrogen < 30)");
  } else if (nitrogen > 40 && pump2State) {
    analogWrite(MOTOR2_EN, 0); digitalWrite(MOTOR2_IN1, LOW); digitalWrite(MOTOR2_IN2, LOW);
    pump2State = false;
    printEvent(now, "Fertilizer Pump OFF (Nitrogen > 40)");
  }
}
