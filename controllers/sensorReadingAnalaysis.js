const path = require("path");
const { readJsonFile } = require("../service/readFile");

const DATA_PATH = path.join(__dirname, "../data/sensorData.json");
const ATTR_THRESHOLDS_PATH = path.join(
  __dirname,
  "../data/attributeTrashhold.json"
);

function makeLowChecker(attr, jsonKey = attr) {
  return () => {
    const data = readJsonFile(DATA_PATH, []);
    const thresholds = readJsonFile(ATTR_THRESHOLDS_PATH, {});
    if (!Array.isArray(data) || data.length === 0) return false;
    const lowStr = thresholds[attr]?.low;
    const low = parseFloat(lowStr);
    if (isNaN(low)) return false;
    const sorted = data
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const top5 = sorted.slice(0, 5);
    return (
      top5.length === 5 &&
      top5.every(
        (entry) => typeof entry[jsonKey] === "number" && entry[jsonKey] < low
      )
    );
  };
}

const isTemperatureLow = makeLowChecker("temperature");
const isMoistureLow = makeLowChecker("moisture");
const isWaterLevelLow = makeLowChecker("waterLevel");
const isPhLow = makeLowChecker("ph", "pH");
const isNitrogenLow = makeLowChecker("nitrogen");
const isPhosphorusLow = makeLowChecker("phosphorus");
const isPotassiumLow = makeLowChecker("potassium");

function makeHighChecker(attr, jsonKey = attr) {
  return () => {
    const data = readJsonFile(DATA_PATH, []);
    const thresholds = readJsonFile(ATTR_THRESHOLDS_PATH, {});
    if (!Array.isArray(data) || data.length === 0) return false;
    const highStr = thresholds[attr]?.high;
    const high = parseFloat(highStr);
    if (isNaN(high)) return false;
    const sorted = data
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const top5 = sorted.slice(0, 5);
    return (
      top5.length === 5 &&
      top5.every(
        (entry) => typeof entry[jsonKey] === "number" && entry[jsonKey] > high
      )
    );
  };
}

const isTemperatureHigh = makeHighChecker("temperature");
const isMoistureHigh = makeHighChecker("moisture");
const isWaterLevelHigh = makeHighChecker("waterLevel");
const isPhHigh = makeHighChecker("ph", "pH");
const isNitrogenHigh = makeHighChecker("nitrogen");
const isPhosphorusHigh = makeHighChecker("phosphorus");
const isPotassiumHigh = makeHighChecker("potassium");

module.exports = {
  isTemperatureLow,
  isMoistureLow,
  isWaterLevelLow,
  isPhLow,
  isNitrogenLow,
  isPhosphorusLow,
  isPotassiumLow,
  isTemperatureHigh,
  isMoistureHigh,
  isWaterLevelHigh,
  isPhHigh,
  isNitrogenHigh,
  isPhosphorusHigh,
  isPotassiumHigh,
};
