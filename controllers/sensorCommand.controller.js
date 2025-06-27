const {
  isTemperatureHigh,
  isTemperatureLow,
  isMoistureHigh,
  isMoistureLow,
  isWaterLevelHigh,
  isWaterLevelLow,
  isPhHigh,
  isPhLow,
  isNitrogenHigh,
  isNitrogenLow,
  isPhosphorusHigh,
  isPhosphorusLow,
  isPotassiumHigh,
  isPotassiumLow,
} = require("./sensorReadingAnalaysis");

function turnOnBuzzer(time = 3) {
  return { success: true, time };
}

function turnOnWaterPump() {
  // Water pump ON, green LED BLINKS
  console.log("Water pump on");
  return {
    success: true,
    time: 3,
    led: { color: "green", blink: true, success: true },
  };
}

function turnOnFertilizerPump() {
  // Fertilizer pump ON, blue LED ON
  console.log("Fertilizer pump on");
  return {
    success: true,
    time: 3,
    led: { color: "blue", on: true, success: true },
  };
}

function turnOnLED(color, opts = {}) {
  return { success: true, color, ...opts };
}

// Generic high/low alert handler generator
function makeHighAlertHandler(attrName, printMsg) {
  return (req, res) => {
    if (attrName === "temperature" && isTemperatureHigh()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "moisture" && isMoistureHigh()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "waterLevel" && isWaterLevelHigh()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "ph" && isPhHigh()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "nitrogen" && isNitrogenHigh()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "phosphorus" && isPhosphorusHigh()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "potassium" && isPotassiumHigh()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    res.json({ success: false, message: `No critical high ${attrName} event` });
  };
}

function makeLowAlertHandler(attrName, printMsg) {
  return (req, res) => {
    if (attrName === "temperature" && isTemperatureLow()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "moisture" && isMoistureLow()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "waterLevel" && isWaterLevelLow()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "ph" && isPhLow()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "nitrogen" && isNitrogenLow()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "phosphorus" && isPhosphorusLow()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    if (attrName === "potassium" && isPotassiumLow()) {
      console.log(printMsg);
      return res.json({
        buzzer: turnOnBuzzer(),
        led: turnOnLED("red", { blink: true }),
        message: printMsg,
      });
    }
    res.json({ success: false, message: `No critical low ${attrName} event` });
  };
}

// Command handlers
exports.buzzerCommand = (req, res) => {
  res.json(turnOnBuzzer());
};

exports.waterPumpCommand = (req, res) => {
  res.json(turnOnWaterPump());
};

exports.fertilizerPumpCommand = (req, res) => {
  res.json(turnOnFertilizerPump());
};

exports.waterLevelAlertCommand = (req, res) => {
  if (isWaterLevelLow()) {
    console.log("Water tank level is low, fill the tank");
    return res.json({
      led: turnOnLED("red", { blink: true }),
      success: true,
      time: 3,
      message: "Water tank level is low, fill the tank",
    });
  }
  res.json({ success: false, message: "Water level normal" });
};

// High alert routes
exports.temperatureHighAlert = makeHighAlertHandler(
  "temperature",
  "Critical temperature"
);
exports.moistureHighAlert = makeHighAlertHandler(
  "moisture",
  "Critical moisture"
);
exports.waterLevelHighAlert = makeHighAlertHandler(
  "waterLevel",
  "Critical water level"
);
exports.phHighAlert = makeHighAlertHandler("ph", "Critical pH");
exports.nitrogenHighAlert = makeHighAlertHandler(
  "nitrogen",
  "Critical nitrogen"
);
exports.phosphorusHighAlert = makeHighAlertHandler(
  "phosphorus",
  "Critical phosphorus"
);
exports.potassiumHighAlert = makeHighAlertHandler(
  "potassium",
  "Critical potassium"
);

// Low alert routes
exports.temperatureLowAlert = makeLowAlertHandler(
  "temperature",
  "Low temperature"
);
exports.moistureLowAlert = makeLowAlertHandler("moisture", "Low moisture");
exports.waterLevelLowAlert = makeLowAlertHandler(
  "waterLevel",
  "Low water level"
);
exports.phLowAlert = makeLowAlertHandler("ph", "Low pH");
exports.nitrogenLowAlert = makeLowAlertHandler("nitrogen", "Low nitrogen");
exports.phosphorusLowAlert = makeLowAlertHandler(
  "phosphorus",
  "Low phosphorus"
);
exports.potassiumLowAlert = makeLowAlertHandler("potassium", "Low potassium");
