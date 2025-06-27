#include "wifi_manager.h"
#include <WiFi.h>

const char* ssid = "aaaa";
const char* password = "123456780";

void connectToWiFi() {
  Serial.println("\n🌐 Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected to Wi-Fi");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Failed to connect to Wi-Fi..");
  }
}
