#include <ModbusMaster.h>         // For Modbus communication
#include <Adafruit_SI1145.h>      // For UV sensor
#include <Wire.h>                 // For I2C communication
#include <LiquidCrystal_I2C.h>    // For LCD display
#include <RTClib.h>               // For real-time clock

#include "sensors.h"
#include "pumps.h"
#include "utils.h"

// Define pin assignments
#define MAX485_RE_DE 23           // RS485 direction control pin

// Motor 1 pins (Water pump)
#define MOTOR1_IN1 30            // Motor 1 direction pin 1
#define MOTOR1_IN2 31            // Motor 1 direction pin 2
#define MOTOR1_EN 6               // Motor 1 enable/PWM pin

// Motor 2 pins (Fertilizer pump)
#define MOTOR2_IN1 24             // Motor 2 direction pin 1
#define MOTOR2_IN2 25             // Motor 2 direction pin 2
#define MOTOR2_EN 5               // Motor 2 enable/PWM pin

// Other peripherals
#define BUZZER_PIN 26             // Buzzer pin
#define RGB_RED 27                // RGB LED red pin
#define RGB_GREEN 28              // RGB LED green pin
#define RGB_BLUE 29               // RGB LED blue pin
#define WATER_LEVEL_PIN A0        // Water level sensor analog pin

// Create instances of library objects
ModbusMaster node;                // Modbus object
Adafruit_SI1145 uv = Adafruit_SI1145();  // UV sensor object
LiquidCrystal_I2C lcd(0x27, 16, 4);  // LCD object (I2C address 0x27, 16 columns, 4 rows)
RTC_DS3231 rtc;                  // Real-time clock object

// Variables for blinking LED and pump states
unsigned long previousBlinkMillis = 0;  // Last time LED was toggled
const unsigned long blinkInterval = 500;  // Blink interval in milliseconds
bool greenLedState = LOW;         // Current state of green LED
bool pump1State = false;          // Water pump state
bool pump2State = false;          // Fertilizer pump state
unsigned long startupTime;        // System startup time
const unsigned long startupDelayMs = 3000;  // Initial delay before pumps can activate
float currentPH = 6.3;            // Current pH value (initial value)

// Function called before Modbus transmission
void preTransmission() {
  digitalWrite(MAX485_RE_DE, HIGH);  // Enable RS485 transmitter
}

// Function called after Modbus transmission
void postTransmission() {
  digitalWrite(MAX485_RE_DE, LOW);   // Disable RS485 transmitter
}

// Setup function - runs once at startup
void setup() {
  // Initialize serial communications
  Serial.begin(9600);              // Debug serial
  Serial1.begin(9600);             // RS485 sensor serial
  Serial3.begin(9600);             // ESP32 communication serial

  // Initialize digital pins
  pinMode(MAX485_RE_DE, OUTPUT); digitalWrite(MAX485_RE_DE, LOW);
  pinMode(MOTOR1_IN1, OUTPUT); pinMode(MOTOR1_IN2, OUTPUT); pinMode(MOTOR1_EN, OUTPUT);
  pinMode(MOTOR2_IN1, OUTPUT); pinMode(MOTOR2_IN2, OUTPUT); pinMode(MOTOR2_EN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RGB_RED, OUTPUT); pinMode(RGB_GREEN, OUTPUT); pinMode(RGB_BLUE, OUTPUT);

  // Initialize LCD
  lcd.init(); lcd.backlight(); lcd.clear();

  // Initialize Modbus communication
  node.begin(1, Serial1);          // Set Modbus slave ID and serial port
  node.preTransmission(preTransmission);  // Set pre-transmission callback
  node.postTransmission(postTransmission);  // Set post-transmission callback

  // Initialize UV sensor
  if (!uv.begin()) Serial.println("Failed to initialize UV sensor!");
  
  // Initialize RTC
  if (!rtc.begin()) {
    Serial.println("Couldn't find RTC");
    while (1);  // Halt if RTC not found
  }
  if (rtc.lostPower()) {
    Serial.println("RTC lost power, setting time!");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));  // Set RTC to compile time
  }

  // Record startup time and print initialization message
  startupTime = millis();
  Serial.println("📡 System Initialized");
  Serial.println("⏳ Waiting for sensor stabilization...");
}

// Main loop function - runs continuously
void loop() {
  handleSensorsAndControls();
  delay(500);
}
