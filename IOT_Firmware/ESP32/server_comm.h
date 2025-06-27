#ifndef SERVER_COMM_H
#define SERVER_COMM_H

#include <Arduino.h>

void sendJsonToServer(const String &json);
void checkSensorThresholds(const String &sensorData);
void checkEndpoint(const char* endpoint, const char* message);
String formatCommand(const JsonDocument& doc);
void handleResponse(HTTPClient &http, int httpResponseCode);

#endif
