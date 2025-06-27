const express = require("express");
const router = express.Router();

// Default state for the buzzer command
let buzzerCommand = { turnOn: true, time: 3 };

/**
 * IoT device polls this endpoint to get the current command
 * GET /api/test/buzzer
 * Response: { time: <number in ms>, turnOn: <boolean> }
 */
router.get("/buzzer", (req, res) => {
  res
    .status(200)
    .json({ time: buzzerCommand.time, turnOn: buzzerCommand.turnOn });
});

module.exports = router;
