const express = require("express");
const router = express.Router();
const controller = require("../controllers/sensorList.controller");

// Routes
router.get("/", controller.getAllSensors);
router.get("/types", controller.getSensorTypes);
router.get("/:id", controller.getSensorById);
router.post("/", express.json(), controller.createSensor);
router.put("/:id", express.json(), controller.updateSensor);
router.delete("/:id", controller.deleteSensor);

module.exports = router;
