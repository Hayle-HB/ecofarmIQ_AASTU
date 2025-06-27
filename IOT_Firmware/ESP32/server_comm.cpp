#include "server_comm.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* serverUrl = "https://ecofarmiq-final.onrender.com/api";

// Send sensor data to server
void sendJsonToServer(const String &json) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl + String("/sensorData"));
    http.addHeader("Content-Type", "application/json");

    Serial.println("📤 Sending sensor data to server:");
    Serial.println(json);

    int httpResponseCode = http.POST(json);
    handleResponse(http, httpResponseCode);
    http.end();
  }
}

// Check sensor thresholds and get commands
void checkSensorThresholds(const String &sensorData) {
  if (WiFi.status() == WL_CONNECTED) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, sensorData);
    
    if (error) {
      Serial.println("Failed to parse sensor data");
      return;
    }

    // Check all thresholds
    checkEndpoint("/moisture-high-alert", "Checking moisture high threshold");
    checkEndpoint("/moisture-low-alert", "Checking moisture low threshold");
    checkEndpoint("/water-level-high-alert", "Checking water level high threshold");
    checkEndpoint("/water-level-low-alert", "Checking water level low threshold");
    checkEndpoint("/nitrogen-high-alert", "Checking nitrogen high threshold");
    checkEndpoint("/nitrogen-low-alert", "Checking nitrogen low threshold");
    checkEndpoint("/ph-high-alert", "Checking pH high threshold");
    checkEndpoint("/ph-low-alert", "Checking pH low threshold");
  }
}

// Check individual endpoint and send command to Arduino
void checkEndpoint(const char* endpoint, const char* message) {
  HTTPClient http;
  http.begin(serverUrl + String("/sensorCommand") + String(endpoint));
  
  Serial.println(message);
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error && doc["success"]) {
      // Format command for Arduino
      String command = formatCommand(doc);
      Serial2.println(command); // Send to Arduino
    }
  }
  
  http.end();
}

// Format command for Arduino
String formatCommand(const JsonDocument& doc) {
  String command = "CMD:";
  
  // Add LED command if present
  if (doc.containsKey("led")) {
    command += "LED,";
    command += doc["led"]["color"].as<String>() + ",";
    command += doc["led"]["blink"] ? "BLINK" : "ON";
    command += ";";
  }
  
  // Add buzzer command if present
  if (doc.containsKey("buzzer")) {
    command += "BUZZER,";
    command += doc["buzzer"]["time"].as<String>();
    command += ";";
  }
  
  // Add pump commands if present
  if (doc.containsKey("waterPump")) {
    command += "WPUMP,";
    command += doc["waterPump"]["state"].as<String>();
    command += ";";
  }
  
  if (doc.containsKey("fertilizerPump")) {
    command += "FPUMP,";
    command += doc["fertilizerPump"]["state"].as<String>();
    command += ";";
  }
  
  return command;
}

void handleResponse(HTTPClient &http, int httpResponseCode) {
  Serial.print("📡 HTTP Response code: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("🌐 Server Response:");
    Serial.println(response);
    
    // Parse and handle any commands from server
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error && doc["success"]) {
      String command = formatCommand(doc);
      if (command.length() > 4) { // If there are actual commands
        Serial2.println(command); // Send to Arduino
      }
    }
  }
}
