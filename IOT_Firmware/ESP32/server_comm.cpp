#include "server_comm.h"
#include <WiFi.h>
#include <HTTPClient.h>

const char* serverUrl = "https://ecofarmiq-final.onrender.com/api/sensorData";

void sendJsonToServer(const String &json) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    Serial.println("📤 Sending JSON to server:");
    Serial.println(json);

    int httpResponseCode = http.POST(json);

    Serial.print("📡 HTTP Response code: ");
    Serial.println(httpResponseCode);

    String response = http.getString();
    Serial.println("🌐 Server Response:");
    Serial.println(response);

    http.end();
  } else {
    Serial.println("🚫 Wi-Fi not connected.");
  }
}
