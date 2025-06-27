#ifndef PUMPS_H
#define PUMPS_H

#include <RTClib.h>

extern bool pump1State;
extern bool pump2State;

void controlWaterPump(float moisture, DateTime now);
void controlFertilizerPump(int nitrogen, DateTime now);

#endif
