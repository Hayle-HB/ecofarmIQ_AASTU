const path = require("path");
const { readJsonFile } = require("../service/readFile");
const { writeJsonFile } = require("../service/writeFile");
const {
  getTemperatureEvent,
  getMoistureEvent,
  getNitrogenEvent,
  getPhosphorusEvent,
  getPotassiumEvent,
  getUVEvent,
  getWaterLevelEvent,
  getPhEvent,
  getECEvent,
} = require("./EventControllers");

const DATA_PATH = path.join(__dirname, "../data/sensorData.json");

// Data access methods
const getAll = () => readJsonFile(DATA_PATH);
const getById = (id) => getAll().find((d) => d.id == id);
const create = (item) => {
  const data = getAll();
  const id = Date.now().toString();
  const newItem = { id, ...item, timestamp: new Date().toISOString() };
  data.push(newItem);
  writeJsonFile(DATA_PATH, data);
  return newItem;
};
const update = (id, updates) => {
  const data = getAll();
  const idx = data.findIndex((d) => d.id == id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates };
  writeJsonFile(DATA_PATH, data);
  return data[idx];
};
const remove = (id) => {
  const data = getAll();
  const idx = data.findIndex((d) => d.id == id);
  if (idx === -1) return null;
  const deleted = data.splice(idx, 1)[0];
  writeJsonFile(DATA_PATH, data);
  return deleted;
};

// HTTP handlers
exports.getAllData = (req, res) => {
  const data = getAll();
  data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(data);
};

exports.getDataById = (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
};

exports.createData = (req, res) => {
  const { moisture, temp, ph, ec, n, p, k, uv, waterLevel, ...other } =
    req.body;
  if (
    moisture === undefined ||
    temp === undefined ||
    ph === undefined ||
    ec === undefined ||
    n === undefined ||
    p === undefined ||
    k === undefined ||
    uv === undefined ||
    waterLevel === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Map to professional names
  const mappedItem = {
    moisture,
    temperature: temp,
    pH: ph,
    electricConductivity: ec,
    nitrogen: n,
    phosphorus: p,
    potassium: k,
    UV: uv,
    waterLevel,
    moistureEvent: getMoistureEvent(moisture),
    temperatureEvent: getTemperatureEvent(temp),
    phEvent: getPhEvent(ph),
    ecEvent: getECEvent(ec),
    nitrogenEvent: getNitrogenEvent(n),
    phosphorusEvent: getPhosphorusEvent(p),
    potassiumEvent: getPotassiumEvent(k),
    uvEvent: getUVEvent(uv),
    waterLevelEvent: getWaterLevelEvent(waterLevel),
    ...other,
  };

  const newItem = create(mappedItem);
  res.status(201).json(newItem);
};

exports.updateData = (req, res) => {
  const updated = update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};

exports.deleteData = (req, res) => {
  const deleted = remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json(deleted);
};
