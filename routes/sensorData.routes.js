const express = require("express");
const router = express.Router();
const controller = require("../controllers/sensorData.controller");

// Routes
router.get("/", controller.getAllData);
router.get("/:id", controller.getDataById);
router.post("/", express.json(), controller.createData);
router.put("/:id", express.json(), controller.updateData);
router.delete("/:id", controller.deleteData);

module.exports = router;
