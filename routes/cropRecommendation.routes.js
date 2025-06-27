const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const { getBestCropMatch } = require("../utils/tempCropsTest");

// Get the absolute path to the ML model directory
const ML_MODEL_DIR = path.join(__dirname, "..", "ML_Model", "ML_Model");
const PREDICT_SCRIPT = path.join(ML_MODEL_DIR, "predict.py");

// Updated validation ranges based on training data
const validations = {
  n: { min: 60, max: 100 }, // Nitrogen (60-100 kg/ha)
  p: { min: 35, max: 60 }, // Phosphorus (35-60 kg/ha)
  k: { min: 15, max: 45 }, // Potassium (15-45 kg/ha)
  temperature: { min: 18, max: 27 }, // Temperature in Celsius
  humidity: { min: 55, max: 85 }, // Relative humidity %
  ph: { min: 5.0, max: 8.0 }, // pH level
  rainfall: { min: 60, max: 200 }, // Annual rainfall in mm
};

router.post("/predict", async (req, res) => {
  try {
    console.log("Received prediction request:", req.body);

    const { n, p, k, temperature, humidity, ph, rainfall } = req.body;

    // Log each parameter and its type
    console.log("Parameters received:", {
      n: { value: n, type: typeof n },
      p: { value: p, type: typeof p },
      k: { value: k, type: typeof k },
      temperature: { value: temperature, type: typeof temperature },
      humidity: { value: humidity, type: typeof humidity },
      ph: { value: ph, type: typeof ph },
      rainfall: { value: rainfall, type: typeof rainfall },
    });

    // Validate input presence
    const missingParams = [];
    if (n === undefined || n === null || n === "") missingParams.push("n");
    if (p === undefined || p === null || p === "") missingParams.push("p");
    if (k === undefined || k === null || k === "") missingParams.push("k");
    if (temperature === undefined || temperature === null || temperature === "")
      missingParams.push("temperature");
    if (humidity === undefined || humidity === null || humidity === "")
      missingParams.push("humidity");
    if (ph === undefined || ph === null || ph === "") missingParams.push("ph");
    if (rainfall === undefined || rainfall === null || rainfall === "")
      missingParams.push("rainfall");

    if (missingParams.length > 0) {
      console.log("Missing parameters:", missingParams);
      return res.status(400).json({
        error: "Missing required parameters",
        missingParams: missingParams,
      });
    }

    // Parse values to float
    const parsedData = {
      n: parseFloat(n),
      p: parseFloat(p),
      k: parseFloat(k),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall),
    };

    console.log("Parsed data:", parsedData);

    // Check for NaN values after parsing
    const nanParams = Object.entries(parsedData)
      .filter(([_, value]) => isNaN(value))
      .map(([key]) => key);

    if (nanParams.length > 0) {
      console.log("Invalid number parameters:", nanParams);
      return res.status(400).json({
        error: "Invalid number format",
        invalidParams: nanParams,
      });
    }

    // Validate ranges
    const outOfRangeParams = [];
    for (const [key, value] of Object.entries(parsedData)) {
      const range = validations[key];
      if (value < range.min || value > range.max) {
        outOfRangeParams.push({
          parameter: key,
          value: value,
          allowedRange: range,
        });
      }
    }

    if (outOfRangeParams.length > 0) {
      console.log("Out of range parameters:", outOfRangeParams);
      return res.status(400).json({
        error: "Parameters out of valid range",
        invalidRanges: outOfRangeParams,
      });
    }

    console.log("Spawning Python process with data:", parsedData);

    // Spawn Python process with working directory set to ML model directory
    const pythonProcess = spawn(
      "python",
      [PREDICT_SCRIPT, JSON.stringify(parsedData)],
      {
        cwd: ML_MODEL_DIR,
      }
    );

    let result = "";
    let error = "";

    // Collect data from script
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
      console.log("Python stdout:", data.toString());
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
      console.error("Python error:", data.toString());
    });

    // Handle process completion
    pythonProcess.on("close", (code) => {
      console.log("Python process exited with code:", code);
      if (code !== 0) {
        console.error("Python process error:", error);
        return res.status(500).json({
          error: "Failed to process prediction",
          details: error,
        });
      }
      try {
        const prediction = JSON.parse(result);
        console.log("Prediction result:", prediction);
        res.json(prediction);
      } catch (e) {
        console.error("Parse error:", e);
        res.status(500).json({
          error: "Failed to parse prediction result",
          details: e.message,
        });
      }
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// New route for JavaScript-based crop prediction
router.post("/test-predict", async (req, res) => {
  try {
    console.log("Received test prediction request:", req.body);

    const { n, p, k, temperature, humidity, ph, rainfall } = req.body;

    // Log each parameter and its type
    console.log("Parameters received:", {
      n: { value: n, type: typeof n },
      p: { value: p, type: typeof p },
      k: { value: k, type: typeof k },
      temperature: { value: temperature, type: typeof temperature },
      humidity: { value: humidity, type: typeof humidity },
      ph: { value: ph, type: typeof ph },
      rainfall: { value: rainfall, type: typeof rainfall },
    });

    // Validate input presence
    const missingParams = [];
    if (n === undefined || n === null || n === "") missingParams.push("n");
    if (p === undefined || p === null || p === "") missingParams.push("p");
    if (k === undefined || k === null || k === "") missingParams.push("k");
    if (temperature === undefined || temperature === null || temperature === "")
      missingParams.push("temperature");
    if (humidity === undefined || humidity === null || humidity === "")
      missingParams.push("humidity");
    if (ph === undefined || ph === null || ph === "") missingParams.push("ph");
    if (rainfall === undefined || rainfall === null || rainfall === "")
      missingParams.push("rainfall");

    if (missingParams.length > 0) {
      console.log("Missing parameters:", missingParams);
      return res.status(400).json({
        error: "Missing required parameters",
        missingParams: missingParams,
      });
    }

    // Parse values to float
    const parsedData = {
      n: parseFloat(n),
      p: parseFloat(p),
      k: parseFloat(k),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall),
    };

    console.log("Parsed data:", parsedData);

    // Check for NaN values after parsing
    const nanParams = Object.entries(parsedData)
      .filter(([_, value]) => isNaN(value))
      .map(([key]) => key);

    if (nanParams.length > 0) {
      console.log("Invalid number parameters:", nanParams);
      return res.status(400).json({
        error: "Invalid number format",
        invalidParams: nanParams,
      });
    }

    // Validate ranges using the same validation rules as ML route
    const outOfRangeParams = [];
    for (const [key, value] of Object.entries(parsedData)) {
      const range = validations[key];
      if (value < range.min || value > range.max) {
        outOfRangeParams.push({
          parameter: key,
          value: value,
          allowedRange: range,
        });
      }
    }

    if (outOfRangeParams.length > 0) {
      console.log("Out of range parameters:", outOfRangeParams);
      return res.status(400).json({
        error: "Parameters out of valid range",
        invalidRanges: outOfRangeParams,
      });
    }

    // Get crop recommendation using JavaScript-based system
    const recommendation = getBestCropMatch(parsedData);
    console.log("Test prediction result:", recommendation);
    res.json(recommendation);
  } catch (error) {
    console.error("Test prediction error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

module.exports = router;
