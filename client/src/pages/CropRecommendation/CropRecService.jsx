const API_BASE_URL = "https://ecofarmiq-final.onrender.com/api";
const WEATHER_API_KEY = "3f970fdc19574d35a41110710252302";
const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json";
const DEFAULT_LOCATION = "Addis Ababa"; // Can be made configurable later

// Define valid ranges matching training data
const VALID_RANGES = {
  n: { min: 60, max: 100 }, // Nitrogen (60-100 kg/ha)
  p: { min: 35, max: 60 }, // Phosphorus (35-60 kg/ha)
  k: { min: 15, max: 45 }, // Potassium (15-45 kg/ha)
  temperature: { min: 18, max: 27 }, // Temperature in Celsius
  humidity: { min: 55, max: 85 }, // Relative humidity %
  ph: { min: 5.0, max: 8.0 }, // pH level
  rainfall: { min: 60, max: 200 }, // Annual rainfall in mm
};

// Helper function to convert sensor NPK values to kg/ha
const convertNPKToKgHa = (value) => {
  // Convert from sensor units to kg/ha
  // Assuming sensor values are in mg/kg (ppm)
  // 1 ppm = 1 mg/kg ≈ 2 kg/ha (for 15cm soil depth)
  return value * 0.002;
};

// Helper function to normalize value to fit within range
const normalizeValue = (value, min, max) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

// Helper function to fetch weather data
const fetchWeatherData = async (location = DEFAULT_LOCATION) => {
  try {
    const encodedLocation = encodeURIComponent(location);
    const response = await fetch(
      `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${encodedLocation}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      rainfall: data.current.precip_mm * 30, // Convert daily precipitation to monthly estimate
    };
  } catch (error) {
    console.error("Weather API error:", error);
    // Return default values if weather API fails
    return {
      temperature: 25,
      humidity: 70,
      rainfall: 100,
    };
  }
};

const validatePredictionData = (data) => {
  console.log("Validating prediction data:", data); // Debug log

  const requiredFields = [
    "n",
    "p",
    "k",
    "temperature",
    "humidity",
    "ph",
    "rainfall",
  ];
  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    const isValid = value !== undefined && value !== null && value !== "";
    if (!isValid) {
      console.log(`Field ${field} is invalid:`, value); // Debug log
    }
    return !isValid;
  });

  if (missingFields.length > 0) {
    throw new Error(`Missing required parameters: ${missingFields.join(", ")}`);
  }

  return true;
};

export const CropRecService = {
  predictCrop: async (data) => {
    try {
      console.log("Raw input data:", data); // Debug log

      // Fetch weather data
      const weatherData = await fetchWeatherData();
      console.log("Weather data:", weatherData); // Debug log

      // Validate data before making request
      validatePredictionData(data);

      // Process and normalize the data
      const processedData = {
        n: normalizeValue(
          convertNPKToKgHa(parseFloat(data.n)),
          VALID_RANGES.n.min,
          VALID_RANGES.n.max
        ),
        p: normalizeValue(
          convertNPKToKgHa(parseFloat(data.p)),
          VALID_RANGES.p.min,
          VALID_RANGES.p.max
        ),
        k: normalizeValue(
          convertNPKToKgHa(parseFloat(data.k)),
          VALID_RANGES.k.min,
          VALID_RANGES.k.max
        ),
        temperature: normalizeValue(
          weatherData.temperature, // Use weather API temperature
          VALID_RANGES.temperature.min,
          VALID_RANGES.temperature.max
        ),
        humidity: normalizeValue(
          weatherData.humidity, // Use weather API humidity
          VALID_RANGES.humidity.min,
          VALID_RANGES.humidity.max
        ),
        ph: normalizeValue(
          parseFloat(data.ph),
          VALID_RANGES.ph.min,
          VALID_RANGES.ph.max
        ),
        rainfall: normalizeValue(
          weatherData.rainfall, // Use weather API rainfall
          VALID_RANGES.rainfall.min,
          VALID_RANGES.rainfall.max
        ),
      };

      console.log("Processed data for API:", processedData); // Debug log

      const response = await fetch(
        `${API_BASE_URL}/crop-recommendation/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(processedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get prediction");
      }

      return await response.json();
    } catch (error) {
      console.error("Prediction service error:", error);
      throw error;
    }
  },

  // Helper function to format manual input data
  formatManualInputData: (formData) => {
    console.log("Formatting manual input:", formData); // Debug log
    const formatted = {
      n: formData.nitrogen,
      p: formData.phosphorus,
      k: formData.potassium,
      temperature: formData.temperature,
      humidity: formData.humidity,
      ph: formData.soilPh,
      rainfall: formData.rainfall,
    };
    console.log("Formatted manual data:", formatted); // Debug log
    return formatted;
  },

  // Helper function to format sensor input data
  formatSensorInputData: (sensorData) => {
    console.log("Formatting sensor input:", sensorData); // Debug log

    // Handle both raw sensor data and processed data
    const data = sensorData.sensorData || sensorData;
    console.log("Raw sensor data:", data); // Debug log

    const formatted = {
      n: data.nitrogen, // Will be converted in predictCrop
      p: data.phosphorus, // Will be converted in predictCrop
      k: data.potassium, // Will be converted in predictCrop
      temperature: data.temperature, // Will be overridden by weather API
      humidity: data.moisture, // Use moisture reading as humidity
      ph: data.pH || data.ph || data.soilPh,
      rainfall: 0, // Will be provided by weather API
    };

    console.log("Formatted sensor data:", formatted); // Debug log
    return formatted;
  },
};

export default CropRecService;
