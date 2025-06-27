// Make sure you're running Node.js v18+ for built-in fetch.
// Otherwise, install node-fetch: npm i node-fetch and import it.

const fetch = globalThis.fetch || require("node-fetch"); // support older node

// Configuration
const URL = "https://ecofarmiq-final.onrender.com/api/sensorData"; // <-- change port if needed
const NUM_REQUESTS = 400;
const DELAY_MS = 200; // delay between requests in ms

// Random generators
function randomMoisture() {
  return Math.floor(Math.random() * 101); // 0 to 100 (%)
}
function randomTemp() {
  return +(Math.random() * (35 - 15) + 15).toFixed(1); // 15.0 to 35.0°C
}
function randomPH() {
  return +(Math.random() * (14 - 4) + 4).toFixed(2); // 4.00 to 14.00
}
function randomEC() {
  return +(Math.random() * (5 - 0.1) + 0.1).toFixed(2); // 0.1 to 5.0
}
function randomN() {
  return Math.floor(Math.random() * 200); // N
}
function randomP() {
  return Math.floor(Math.random() * 200); // P
}
function randomK() {
  return Math.floor(Math.random() * 200); // K
}
function randomUV() {
  return +(Math.random() * 10).toFixed(1); // UV index 0.0 to 10.0
}
function randomWaterLevel() {
  return Math.floor(Math.random() * 101); // 0 to 100 (%)
}

// Generate one sensor data payload
function generateSensorData() {
  return {
    moisture: randomMoisture(),
    temp: randomTemp(),
    ph: randomPH(),
    ec: randomEC(),
    n: randomN(),
    p: randomP(),
    k: randomK(),
    uv: randomUV(),
    waterLevel: randomWaterLevel(),
  };
}

// Utility to wait for a delay
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Send one request
function sendRequest() {
  const payload = generateSensorData();

  return fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => res.text()) // get raw text to check for errors
    .then((text) => {
      try {
        const data = JSON.parse(text);
        console.log("Sent:", payload, "| Response:", data);
      } catch {
        console.error("Error: Response is not JSON:", text);
      }
    })
    .catch((error) => console.error("Error:", error));
}

// Main
(async () => {
  for (let i = 0; i < NUM_REQUESTS; i++) {
    await sendRequest();
    await wait(DELAY_MS); // wait between requests
  }
  console.log(`✅ Completed ${NUM_REQUESTS} requests.`);
})();
