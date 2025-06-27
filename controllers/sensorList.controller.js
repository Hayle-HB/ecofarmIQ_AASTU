const path = require("path");
const { readJsonFile } = require("../service/readFile");
const { writeJsonFile } = require("../service/writeFile");

const DATA_PATH = path.join(__dirname, "../data/sensorList.json");

// Data access methods
const getAll = () => readJsonFile(DATA_PATH);
const getById = (id) => getAll().find((s) => s.id == id);
const create = (item) => {
  const data = getAll();
  const id = Date.now();
  const newItem = { ...item, id };
  data.push(newItem);
  writeJsonFile(DATA_PATH, data);
  return newItem;
};
const update = (id, updates) => {
  const data = getAll();
  const idx = data.findIndex((s) => s.id == id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates };
  writeJsonFile(DATA_PATH, data);
  return data[idx];
};
const remove = (id) => {
  const data = getAll();
  const idx = data.findIndex((s) => s.id == id);
  if (idx === -1) return null;
  const deleted = data.splice(idx, 1)[0];
  writeJsonFile(DATA_PATH, data);
  return deleted;
};
const getTypes = () => {
  const data = getAll();
  return [...new Set(data.map((s) => s.type))];
};

// HTTP handlers
exports.getAllSensors = (req, res) => {
  res.status(200).json({
    message: "Sensors fetched successfully",
    data: { sensors: getAll() },
  });
};

exports.getSensorById = (req, res) => {
  const sensor = getById(req.params.id);
  if (!sensor) return res.status(404).json({ message: "Sensor not found" });
  res.status(200).json({
    message: "Sensor fetched successfully",
    data: { sensor },
  });
};

exports.createSensor = (req, res) => {
  const newSensor = create(req.body);
  res.status(201).json({
    message: "Sensor added successfully",
    data: { sensor: newSensor },
  });
};

exports.updateSensor = (req, res) => {
  const updated = update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Sensor not found" });
  res.status(200).json({
    message: "Sensor updated successfully",
    data: { sensor: updated },
  });
};

exports.deleteSensor = (req, res) => {
  const deleted = remove(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Sensor not found" });
  res.status(200).json({
    message: "Sensor deleted successfully",
    data: { sensor: deleted },
  });
};

exports.getSensorTypes = (req, res) => {
  const types = getTypes();
  res.status(200).json({
    message: "Sensor types fetched successfully",
    data: { types },
  });
};
