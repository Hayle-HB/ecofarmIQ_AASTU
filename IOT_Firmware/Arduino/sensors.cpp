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

void handleSensorsAndControls() {
  static unsigned long lastSensorRead = 0;
  unsigned long currentMillis = millis();

  // Blink green LED if either pump is running
  if (pump1State || pump2State) {
    if (currentMillis - previousBlinkMillis >= blinkInterval) {
      previousBlinkMillis = currentMillis;
      greenLedState = !greenLedState;
      digitalWrite(RGB_GREEN, greenLedState);
    }
  } else {
    digitalWrite(RGB_GREEN, LOW);
  }

  // Read sensors every 5 seconds
  if (currentMillis - lastSensorRead >= 5000) {
    lastSensorRead = currentMillis;

    uint8_t result = node.readInputRegisters(0x00, 6);
    float moisture = 0, temperature = 0, ec = 0;
    int nitrogen = 0, phosphorus = 0, potassium = 0;

    if (result == node.ku8MBSuccess) {
      moisture = node.getResponseBuffer(0) / 10.0;
      temperature = (node.getResponseBuffer(1) / 10.0) - 59.5;
      ec = node.getResponseBuffer(2);
      nitrogen = node.getResponseBuffer(3);
      phosphorus = node.getResponseBuffer(4);
      potassium = node.getResponseBuffer(5);
    } else {
      Serial.println("❌ Sensor read error! Check wiring or sensor status.");
    }

    // Simulate pH fluctuation when water pump is running
    if (pump1State) {
      float delta = random(-5, 6) / 100.0;
      currentPH += delta;
      currentPH = constrain(currentPH, 6.0, 6.5);
    }

    float uvIndex = uv.readUV() / 100.0;
    int waterLevelRaw = analogRead(WATER_LEVEL_PIN);
    float waterLevelPercent = map(waterLevelRaw, 0, 1023, 0, 100);
    DateTime now = rtc.now();

    // Handle UV alerts
    if (uvIndex > 8) {
      digitalWrite(RGB_RED, HIGH);
      tone(BUZZER_PIN, 1000);
      printEvent(now, "UV Index HIGH! (>8) - Alert, Critical Radition");
    } else if (uvIndex > 6) {
      digitalWrite(RGB_RED, millis() % 1000 < 500 ? HIGH : LOW);
      noTone(BUZZER_PIN);
      printEvent(now, "UV Index Moderate (>6) - Alert");
    } else {
      digitalWrite(RGB_RED, LOW); noTone(BUZZER_PIN);
    }

    // Handle low water level alert
    if (waterLevelPercent < 20) {
      digitalWrite(RGB_RED, HIGH);
      printEvent(now, "Water Level LOW (<20%) - Red LED ON");
    }

    // After startup delay, control pumps
    if (currentMillis - startupTime > startupDelayMs) {
      controlWaterPump(moisture, now);
      controlFertilizerPump(nitrogen, now);
    }

    // Print sensor data
    Serial.println("📈 Soil Sensor Data:");
    Serial.print("🌧  Moisture (%): "); Serial.println(moisture);
    Serial.print("🌡  Temperature (°C): "); Serial.println(temperature);
    Serial.print("⚡️ EC (µS/cm): "); Serial.println(ec);
    Serial.print("🌱 Nitrogen (mg/kg): "); Serial.println(nitrogen);
    Serial.print("🧪 Phosphorus (mg/kg): "); Serial.println(phosphorus);
    Serial.print("🪨 Potassium (mg/kg): "); Serial.println(potassium);
    Serial.print("pH Level: "); Serial.println(currentPH);
    Serial.print("☀️  UV Index: "); Serial.println(uvIndex);
    Serial.print("💧 Water Tank Level (%): "); Serial.println(waterLevelPercent);
    Serial.println("-----------------------------");

    // Create JSON string
    String json = "{";
    json += "\"moisture\":" + String(moisture, 1) + ",";
    json += "\"temp\":" + String(temperature, 1) + ",";
    json += "\"ph\":" + String(currentPH, 2) + ",";
    json += "\"ec\":" + String(ec) + ",";
    json += "\"n\":" + String(nitrogen) + ",";
    json += "\"p\":" + String(phosphorus) + ",";
    json += "\"k\":" + String(potassium) + ",";
    json += "\"uv\":" + String(uvIndex, 2) + ",";
    json += "\"waterLevel\":" + String(waterLevelPercent, 1);
    json += "}";

    Serial.println("📤 Sending to ESP32:");
    Serial.println(json);
    Serial3.println(json);
    Serial.println("✅ Sent!\n");

    // Update LCD display
    lcd.clear();
    lcd.setCursor(0, 0); lcd.print("Mois:"); lcd.print(moisture, 1); lcd.print("%");
    lcd.setCursor(0, 1); lcd.print("EC:"); lcd.print(ec);
    lcd.setCursor(-4, 2); lcd.print("N:"); lcd.print(nitrogen); lcd.print(" P:"); lcd.print(phosphorus); lcd.print(" K:"); lcd.print(potassium);
    lcd.setCursor(-4, 3); lcd.print("Tem:"); lcd.print(temperature, 1); lcd.print(" UV:"); lcd.print(uvIndex, 2);
  }
}
