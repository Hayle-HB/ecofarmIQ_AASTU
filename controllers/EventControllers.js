// controllers/EventControllers.js

function getTemperatureEvent(temp) {
  // Soil Temp (°C)
  if (temp < 10) return "cold";
  if (temp < 18) return "cool";
  if (temp <= 30) return "optimal";
  if (temp > 35) return "too hot";
  return "optimal";
}

function getMoistureEvent(moisture) {
  // Moisture (%)
  if (moisture < 15) return "dry";
  if (moisture < 35) return "moderate";
  if (moisture < 60) return "wet";
  return "saturated";
}

function getNitrogenEvent(nitrogen) {
  // Nitrogen (mg/kg)
  if (nitrogen < 20) return "low";
  if (nitrogen < 50) return "moderate";
  if (nitrogen < 100) return "good";
  return "very high";
}

function getPhosphorusEvent(phosphorus) {
  // Phosphorus (mg/kg)
  if (phosphorus < 10) return "low";
  if (phosphorus < 30) return "moderate";
  if (phosphorus < 60) return "good";
  return "high";
}

function getPotassiumEvent(potassium) {
  // Potassium (mg/kg)
  if (potassium < 50) return "low";
  if (potassium < 100) return "adequate";
  if (potassium < 200) return "high";
  return "very high";
}

function getUVEvent(uv) {
  // UV index
  if (uv < 1) return "indoor";
  if (uv < 2) return "low";
  if (uv < 3) return "low";
  if (uv < 6) return "moderate";
  if (uv < 8) return "high";
  if (uv < 11) return "very high";
  return "critical";
}

function getWaterLevelEvent(waterLevel) {
  // No new mapping provided, keep as is
  if (waterLevel < 20) return "low";
  return "normal";
}

function getPhEvent(ph) {
  // No new mapping provided, keep as is
  if (ph < 6.0) return "acidic";
  if (ph > 6.5) return "alkaline";
  return "optimal";
}

function getECEvent(ec) {
  // EC (µS/cm)
  if (ec < 300) return "very low";
  if (ec < 700) return "low";
  if (ec < 1200) return "moderate";
  if (ec < 2000) return "high";
  return "very high";
}

module.exports = {
  getTemperatureEvent,
  getMoistureEvent,
  getNitrogenEvent,
  getPhosphorusEvent,
  getPotassiumEvent,
  getUVEvent,
  getWaterLevelEvent,
  getPhEvent,
  getECEvent,
};
