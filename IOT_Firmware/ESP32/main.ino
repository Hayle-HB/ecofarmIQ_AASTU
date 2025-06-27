#include <WiFi.h>
#include <HTTPClient.h>
#include "wifi_manager.h"
#include "server_comm.h"

#define RXD2 21  // ESP32 RX (connect to Mega TX)
#define TXD2 22  // ESP32 TX (connect to Mega RX)

String latestJson = "";
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);  // Serial2 for Mega comms

  connectToWiFi();
}

void loop() {
  // Receive data from Mega via Serial2
  if (Serial2.available()) {
    latestJson = Serial2.readStringUntil('\n');
    latestJson.trim();
    if (latestJson.length() > 0) {
      Serial.println("📥 Received JSON from Mega:");
      Serial.println(latestJson);
    }
  }

  // Send JSON to server every 5 seconds if available
  if (millis() - lastSendTime >= sendInterval && latestJson.length() > 0) {
    lastSendTime = millis();
    sendJsonToServer(latestJson);
  }
}
