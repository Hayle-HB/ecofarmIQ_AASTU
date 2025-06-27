#include "utils.h"
#include <Arduino.h>

void printEvent(DateTime now, const char* message) {
  Serial.print("[");
  Serial.print(now.timestamp());
  Serial.print("] ");
  Serial.println(message);
}
