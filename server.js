const express = require("express");
const sensorsRoutes = require("./routes/sensors.routes");
const sensorDataRoutes = require("./routes/sensorData.routes");
const sensorCommandRoutes = require("./routes/sensorCommand.routes");
const cropRecommendationRoutes = require("./routes/cropRecommendation.routes");
const smsRoutes = require("./routes/sms.routes");
const { readJsonFile } = require("./service/readFile");
const {
  isWaterLevelLow,
  isNitrogenLow,
  isNitrogenHigh,
  isPhosphorusLow,
  isPhosphorusHigh,
  isPotassiumLow,
  isPotassiumHigh,
} = require("./controllers/sensorReadingAnalaysis");

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Update CORS policy to allow requests from http://localhost:5173 and https://ecofarm-iq-final-ckcq.vercel.app/
const corsOptions = {
  origin: [
    "https://ecofarm-iq-final-ckcq.vercel.app",
    "https://ecofarm-iq-final-ckcq.vercel.app/api",
    "https://ecofarm-iq-final-ckcq.vercel.app/api/sensors",
    "https://ecofarm-iq-final-ckcq.vercel.app/api/sensorData",
    "https://ecofarm-iq-final-ckcq.vercel.app/api/commands",
    "https://ecofarm-iq-final-ckcq.vercel.app/api/events", // SSE endpoint
    "http://localhost:5173",
    "https://ecofarm-iq-final.vercel.app",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/sensors", sensorsRoutes);
app.use("/api/sensorData", sensorDataRoutes);
app.use("/api/commands", sensorCommandRoutes);
app.use("/api/crop-recommendation", cropRecommendationRoutes);
app.use("/api/sms", smsRoutes);

app.get("/api", (req, res) => {
  res.render("API");
});

// Direct SMS endpoint
app.get("/send", async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilio = require("twilio");

    // Get latest sensor data for the message
    const sensorData = readJsonFile("data/sensorData.json", []);
    const latestReading = sensorData[sensorData.length - 1];

    // Check all conditions and build message
    const warnings = [];

    // Water Level check (only low warning as requested)
    if (isWaterLevelLow()) {
      warnings.push(
        `ALERT: Water level low at ${latestReading.waterLevel}%. Refill water tank.`
      );
    }

    // UV check (assuming UV data exists in latestReading)
    if (latestReading.uv && latestReading.uv > 8) {
      // High UV threshold
      warnings.push(
        `ALERT: UV levels are high at ${latestReading.uv}. Protect sensitive plants.`
      );
    }

    // NPK checks
    if (isNitrogenLow()) {
      warnings.push(
        `ALERT: Nitrogen deficiency detected at ${latestReading.nitrogen}. Apply nitrogen-rich fertilizer.`
      );
    } else if (isNitrogenHigh()) {
      warnings.push(
        `ALERT: Nitrogen levels too high at ${latestReading.nitrogen}. Reduce fertilization.`
      );
    }

    if (isPhosphorusLow()) {
      warnings.push(
        `ALERT: Phosphorus deficiency at ${latestReading.phosphorus}. Apply phosphate fertilizer.`
      );
    } else if (isPhosphorusHigh()) {
      warnings.push(
        `ALERT: High phosphorus levels at ${latestReading.phosphorus}. Stop phosphate application.`
      );
    }

    if (isPotassiumLow()) {
      warnings.push(
        `ALERT: Potassium deficiency at ${latestReading.potassium}. Apply potash fertilizer.`
      );
    } else if (isPotassiumHigh()) {
      warnings.push(
        `ALERT: High potassium levels at ${latestReading.potassium}. Reduce potassium input.`
      );
    }

    // Create the message body
    let messageBody;
    if (warnings.length > 0) {
      messageBody = `EcoFarmIQ Alert\nDate: ${new Date().toLocaleString()}\n\n${warnings.join(
        "\n\n"
      )}\n\nPlease check the EcoFarmIQ app for more details.`;
    } else {
      messageBody = `EcoFarmIQ Status Update\nDate: ${new Date().toLocaleString()}\n\nAll monitored parameters are within normal ranges:\nWater Level: ${
        latestReading.waterLevel
      }%\nNPK: ${latestReading.nitrogen}-${latestReading.phosphorus}-${
        latestReading.potassium
      }${latestReading.uv ? "\nUV Level: " + latestReading.uv : ""}`;
    }

    // Configure Twilio client with timeout
    const client = twilio(accountSid, authToken, {
      timeout: 10000,
      keepAlive: false,
    });

    console.log("Attempting to send SMS...");

    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.FARMER_PHONE_NUMBER,
      attempt: 2,
    });

    console.log("SMS sent successfully, SID:", message.sid);

    res.json({
      success: true,
      message: "SMS sent successfully",
      messageId: message.sid,
      status: message.status,
      warnings: warnings,
    });
  } catch (error) {
    console.error("SMS error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
    });

    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || "UNKNOWN",
      suggestion: "Please check your network connection and try again",
    });
  }
});

// Optional: SMS status webhook
app.post("/sms-status", (req, res) => {
  console.log("SMS Status Update:", req.body);
  res.sendStatus(200);
});

// SSE clients
let clients = [];
const dataFile = path.join(__dirname, "data/sensorData.json");

// SSE endpoint
app.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Send initial data
  const sensors = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
  // Sort by timestamp before sending
  const sortedSensors = sensors.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.write(`data: ${JSON.stringify(sortedSensors)}\n\n`);

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

// Use fs.watch for real-time file change detection
fs.watch(dataFile, (eventType) => {
  if (eventType === "change") {
    try {
      const sensors = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
      // Sort by timestamp before sending
      const sortedSensors = sensors.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      clients.forEach((client) => {
        client.write(`data: ${JSON.stringify(sortedSensors)}\n\n`);
      });
    } catch (e) {
      console.error("Error processing file change:", e);
    }
  }
});

app.listen(3000, () => {
  console.log(`Server is running at url of ${"http://localhost:3000"}`);
});
