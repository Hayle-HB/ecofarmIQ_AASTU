const express = require("express");
const router = express.Router();
const controller = require("../controllers/sensorCommand.controller");

// Command routes
router.get("/buzzer", controller.buzzerCommand);
router.get("/water-pump", controller.waterPumpCommand);
router.get("/fertilizer-pump", controller.fertilizerPumpCommand);
router.get("/water-level-alert", controller.waterLevelAlertCommand);

// High alert routes
router.get("/temperature-high-alert", controller.temperatureHighAlert);
router.get("/moisture-high-alert", controller.moistureHighAlert);
router.get("/water-level-high-alert", controller.waterLevelHighAlert);
router.get("/ph-high-alert", controller.phHighAlert);
router.get("/nitrogen-high-alert", controller.nitrogenHighAlert);
router.get("/phosphorus-high-alert", controller.phosphorusHighAlert);
router.get("/potassium-high-alert", controller.potassiumHighAlert);

// Low alert routes
router.get("/temperature-low-alert", controller.temperatureLowAlert);
router.get("/moisture-low-alert", controller.moistureLowAlert);
router.get("/water-level-low-alert", controller.waterLevelLowAlert);
router.get("/ph-low-alert", controller.phLowAlert);
router.get("/nitrogen-low-alert", controller.nitrogenLowAlert);
router.get("/phosphorus-low-alert", controller.phosphorusLowAlert);
router.get("/potassium-low-alert", controller.potassiumLowAlert);

module.exports = router;
