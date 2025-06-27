#include "sensors.h"
#include "pumps.h"
#include "utils.h"

#define WATER_LEVEL_PIN A0
#define BUZZER_PIN 26
#define RGB_RED 27
#define RGB_GREEN 28
#define RGB_BLUE 29

// Timing variables
extern unsigned long previousBlinkMillis;
extern const unsigned long blinkInterval;
extern bool greenLedState;
extern unsigned long startupTime;
extern const unsigned long startupDelayMs;

// Global variables for sensor readings
float soilMoisture = 0;
float soilTemperature = 0;
float waterLevel = 0;
float nitrogenLevel = 0;
float phosphorusLevel = 0;
float potassiumLevel = 0;
float phLevel = 0;
float uvIndex = 0;

// Function to handle commands from ESP32
void handleCommand(String command) {
  if (command.startsWith("CMD:")) {
    String cmd = command.substring(4); // Remove "CMD:"
    
    // Split into individual commands
    while (cmd.length() > 0) {
      int endIndex = cmd.indexOf(';');
      if (endIndex == -1) break;
      
      String singleCmd = cmd.substring(0, endIndex);
      executeCommand(singleCmd);
      
      cmd = cmd.substring(endIndex + 1);
    }
  }
}

// Execute individual commands
void executeCommand(String cmd) {
  if (cmd.startsWith("LED")) {
    handleLEDCommand(cmd);
  }
  else if (cmd.startsWith("BUZZER")) {
    handleBuzzerCommand(cmd);
  }
  else if (cmd.startsWith("WPUMP")) {
    handleWaterPumpCommand(cmd);
  }
  else if (cmd.startsWith("FPUMP")) {
    handleFertilizerPumpCommand(cmd);
  }
}

// Handle LED commands
void handleLEDCommand(String cmd) {
  // Format: LED,color,mode
  int firstComma = cmd.indexOf(',');
  int secondComma = cmd.indexOf(',', firstComma + 1);
  
  String color = cmd.substring(firstComma + 1, secondComma);
  String mode = cmd.substring(secondComma + 1);
  
  if (color == "red") {
    digitalWrite(RGB_RED, HIGH);
    digitalWrite(RGB_GREEN, LOW);
    digitalWrite(RGB_BLUE, LOW);
  }
  else if (color == "green") {
    digitalWrite(RGB_RED, LOW);
    digitalWrite(RGB_GREEN, HIGH);
    digitalWrite(RGB_BLUE, LOW);
  }
  else if (color == "blue") {
    digitalWrite(RGB_RED, LOW);
    digitalWrite(RGB_GREEN, LOW);
    digitalWrite(RGB_BLUE, HIGH);
  }
}

// Handle buzzer commands
void handleBuzzerCommand(String cmd) {
  // Format: BUZZER,time
  int comma = cmd.indexOf(',');
  int time = cmd.substring(comma + 1).toInt();
  
  digitalWrite(BUZZER_PIN, HIGH);
  delay(time * 1000);
  digitalWrite(BUZZER_PIN, LOW);
}

// Handle water pump commands
void handleWaterPumpCommand(String cmd) {
  // Format: WPUMP,state
  int comma = cmd.indexOf(',');
  String state = cmd.substring(comma + 1);
  
  if (state == "ON") {
    digitalWrite(MOTOR1_IN1, HIGH);
    digitalWrite(MOTOR1_IN2, LOW);
    analogWrite(MOTOR1_EN, 90);
    pump1State = true;
  }
  else {
    analogWrite(MOTOR1_EN, 0);
    digitalWrite(MOTOR1_IN1, LOW);
    digitalWrite(MOTOR1_IN2, LOW);
    pump1State = false;
  }
}

// Handle fertilizer pump commands
void handleFertilizerPumpCommand(String cmd) {
  // Format: FPUMP,state
  int comma = cmd.indexOf(',');
  String state = cmd.substring(comma + 1);
  
  if (state == "ON") {
    digitalWrite(MOTOR2_IN1, HIGH);
    digitalWrite(MOTOR2_IN2, LOW);
    analogWrite(MOTOR2_EN, 90);
    pump2State = true;
  }
  else {
    analogWrite(MOTOR2_EN, 0);
    digitalWrite(MOTOR2_IN1, LOW);
    digitalWrite(MOTOR2_IN2, LOW);
    pump2State = false;
  }
}

void handleSensorsAndControls() {
  // Read all sensors
  readSensors();
  
  // Create JSON with sensor data
  String jsonData = createSensorJson();
  
  // Send to ESP32
  Serial3.println(jsonData);
  
  // Check for commands from ESP32
  while (Serial3.available()) {
    String command = Serial3.readStringUntil('\n');
    handleCommand(command);
  }
}

void readSensors() {
  // Read Modbus sensors
  uint8_t result = node.readHoldingRegisters(0x00, 8);
  if (result == node.ku8MBSuccess) {
    soilMoisture = node.getResponseBuffer(0) / 10.0;
    soilTemperature = node.getResponseBuffer(1) / 10.0;
    nitrogenLevel = node.getResponseBuffer(2);
    phosphorusLevel = node.getResponseBuffer(3);
    potassiumLevel = node.getResponseBuffer(4);
    phLevel = node.getResponseBuffer(5) / 10.0;
  }
  
  // Read water level
  waterLevel = analogRead(WATER_LEVEL_PIN);
  
  // Read UV sensor
  uvIndex = uv.readUV() / 100.0;
  
  // Update LCD
  updateLCD();
}

String createSensorJson() {
  String json = "{";
  json += "\"moisture\":" + String(soilMoisture) + ",";
  json += "\"temperature\":" + String(soilTemperature) + ",";
  json += "\"waterLevel\":" + String(waterLevel) + ",";
  json += "\"nitrogen\":" + String(nitrogenLevel) + ",";
  json += "\"phosphorus\":" + String(phosphorusLevel) + ",";
  json += "\"potassium\":" + String(potassiumLevel) + ",";
  json += "\"ph\":" + String(phLevel) + ",";
  json += "\"uvIndex\":" + String(uvIndex);
  json += "}";
  return json;
}

void updateLCD() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Moist: " + String(soilMoisture) + "%");
  lcd.setCursor(0, 1);
  lcd.print("Temp: " + String(soilTemperature) + "C");
  lcd.setCursor(0, 2);
  lcd.print("N:" + String(nitrogenLevel) + " P:" + String(phosphorusLevel) + " K:" + String(potassiumLevel));
  lcd.setCursor(0, 3);
  lcd.print("pH:" + String(phLevel) + " UV:" + String(uvIndex));
}
