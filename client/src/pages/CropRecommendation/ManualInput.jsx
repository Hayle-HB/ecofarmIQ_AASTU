import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
motion;
import {
  MapPin,
  Building2,
  Building,
  Mountain,
  Thermometer,
  Droplets,
  CloudRain,
  Sun,
  Wind,
  Sprout,
  Scale,
  Repeat,
  Calendar,
  AlertCircle,
  Loader,
  Clock,
} from "lucide-react";
import CropRecService from "./CropRecService";

const ManualInput = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errors, setErrors] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [formData, setFormData] = useState({
    country: "Ethiopia",
    city: "Addis Ababa",
    subCity: "",
    soilType: "",
    lastYearSoilType: "",
    soilPh: "",
    soilDepth: "",
    organicMatter: "",
    drainageRate: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    zinc: "",
    iron: "",
    temperature: "",
    humidity: "",
    rainfall: "",
    sunlight: "",
    windSpeed: "",
    previousCrop: "",
    previousYield: "",
  });

  // Add weather data fetching function
  const fetchWeatherData = async (city) => {
    try {
      const query = encodeURIComponent(city);
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=3f970fdc19574d35a41110710252302&q=${query}`
      );

      if (!response.ok) throw new Error("Failed to fetch weather data");
      const data = await response.json();

      const weatherInfo = {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        rainfall: data.current.precip_mm * 30, // Monthly estimate
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        windSpeed: data.current.wind_kph,
        pressure: data.current.pressure_mb,
        location: data.location.name,
        country: data.location.country,
        lastUpdated: data.current.last_updated,
      };

      setWeatherData(weatherInfo);

      // Auto-fill environmental conditions
      setFormData((prev) => ({
        ...prev,
        temperature: weatherInfo.temperature.toString(),
        humidity: weatherInfo.humidity.toString(),
        rainfall: (weatherInfo.rainfall * 12).toString(), // Convert to annual estimate
        windSpeed: weatherInfo.windSpeed.toString(),
      }));
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setErrors((prev) => ({
        ...prev,
        weather: "Could not fetch weather data. Please enter values manually.",
      }));
    }
  };

  // Add effect to fetch weather data when city changes
  useEffect(() => {
    if (formData.city) {
      fetchWeatherData(formData.city);
    }
  }, [formData.city]);

  const validationRules = {
    country: {
      required: true,
      message: "Country is required",
      validate: (value) => value && value.trim().length >= 2,
    },
    city: {
      required: true,
      message: "City is required",
      validate: (value) => value && value.trim().length >= 2,
    },
    soilPh: {
      required: true,
      message: "Soil pH is required",
      validate: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 14;
      },
      customMessage: (value) => {
        if (!value) return "Soil pH is required";
        if (isNaN(parseFloat(value))) return "Soil pH must be a number";
        if (parseFloat(value) < 0 || parseFloat(value) > 14)
          return "Soil pH must be between 0 and 14";
      },
    },
    nitrogen: {
      required: true,
      message: "Nitrogen level is required",
      validate: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 1000;
      },
      customMessage: (value) => {
        if (!value) return "Nitrogen level is required";
        if (isNaN(parseFloat(value))) return "Nitrogen must be a number";
        if (parseFloat(value) < 0 || parseFloat(value) > 1000)
          return "Nitrogen must be between 0 and 1000 ppm";
      },
    },
    phosphorus: {
      required: true,
      message: "Phosphorus level is required",
      validate: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 1000;
      },
      customMessage: (value) => {
        if (!value) return "Phosphorus level is required";
        if (isNaN(parseFloat(value))) return "Phosphorus must be a number";
        if (parseFloat(value) < 0 || parseFloat(value) > 1000)
          return "Phosphorus must be between 0 and 1000 ppm";
      },
    },
    potassium: {
      required: true,
      message: "Potassium level is required",
      validate: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 1000;
      },
      customMessage: (value) => {
        if (!value) return "Potassium level is required";
        if (isNaN(parseFloat(value))) return "Potassium must be a number";
        if (parseFloat(value) < 0 || parseFloat(value) > 1000)
          return "Potassium must be between 0 and 1000 ppm";
      },
    },
    temperature: {
      required: true,
      message: "Temperature is required",
      validate: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= -50 && num <= 60;
      },
      customMessage: (value) => {
        if (!value) return "Temperature is required";
        if (isNaN(parseFloat(value))) return "Temperature must be a number";
        if (parseFloat(value) < -50 || parseFloat(value) > 60)
          return "Temperature must be between -50°C and 60°C";
      },
    },
    humidity: {
      required: true,
      message: "Humidity is required",
      validate: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      customMessage: (value) => {
        if (!value) return "Humidity is required";
        if (isNaN(parseFloat(value))) return "Humidity must be a number";
        if (parseFloat(value) < 0 || parseFloat(value) > 100)
          return "Humidity must be between 0% and 100%";
      },
    },
    rainfall: {
      required: true,
      message: "Annual rainfall is required",
      validate: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0 && num <= 10000;
      },
      customMessage: (value) => {
        if (!value) return "Annual rainfall is required";
        if (isNaN(parseFloat(value))) return "Rainfall must be a number";
        if (parseFloat(value) < 0 || parseFloat(value) > 10000)
          return "Rainfall must be between 0 and 10000 mm";
      },
    },
  };

  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (rule.required && (!value || value.toString().trim() === "")) {
      return rule.message;
    }

    if (value && !rule.validate(value)) {
      return rule.customMessage ? rule.customMessage(value) : rule.message;
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submitAttempted) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Validate all fields
    let newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Format data and make prediction
        const inputData = CropRecService.formatManualInputData(formData);
        const result = await CropRecService.predictCrop(inputData);

        // Pass all form data plus the prediction result to parent
        onSubmit({
          ...formData,
          recommendedCrop: result.recommended_crop,
          predictionTimestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error making prediction:", error);
        setErrors({
          submit:
            error.message ||
            "Failed to get crop recommendation. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderError = (fieldName) => {
    if (submitAttempted && errors[fieldName]) {
      return (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-rose-500 text-sm mt-1 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {errors[fieldName]}
        </motion.p>
      );
    }
    return null;
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 w-full"
      onSubmit={handleSubmit}
    >
      {/* Location Details */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-emerald-700 dark:text-emerald-400">
          Location Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Country <span className="text-rose-500">*</span>
            </label>
            <input
              name="country"
              value={formData.country}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.country ? "border-rose-500" : ""
              }`}
              placeholder="Enter country"
              onChange={handleChange}
            />
            {renderError("country")}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              City <span className="text-rose-500">*</span>
            </label>
            <input
              name="city"
              value={formData.city}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.city ? "border-rose-500" : ""
              }`}
              placeholder="Enter city"
              onChange={handleChange}
            />
            {renderError("city")}
          </div>
        </div>
      </div>

      {/* Soil Properties */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-emerald-700 dark:text-emerald-400">
          Soil Properties
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Soil pH <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="soilPh"
              step="0.1"
              min="0"
              max="14"
              value={formData.soilPh}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.soilPh ? "border-rose-500" : ""
              }`}
              placeholder="Enter soil pH (0-14)"
              onChange={handleChange}
            />
            {renderError("soilPh")}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Nitrogen (ppm) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="nitrogen"
              value={formData.nitrogen}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.nitrogen ? "border-rose-500" : ""
              }`}
              placeholder="Enter nitrogen (0-1000)"
              onChange={handleChange}
            />
            {renderError("nitrogen")}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Phosphorus (ppm) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="phosphorus"
              value={formData.phosphorus}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.phosphorus ? "border-rose-500" : ""
              }`}
              placeholder="Enter phosphorus (0-1000)"
              onChange={handleChange}
            />
            {renderError("phosphorus")}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Potassium (ppm) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="potassium"
              value={formData.potassium}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.potassium ? "border-rose-500" : ""
              }`}
              placeholder="Enter potassium (0-1000)"
              onChange={handleChange}
            />
            {renderError("potassium")}
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-emerald-700 dark:text-emerald-400">
          Environmental Conditions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Temperature (°C) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.temperature ? "border-rose-500" : ""
              }`}
              placeholder="Enter temperature (-50 to 60)"
              onChange={handleChange}
            />
            {renderError("temperature")}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Humidity (%) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="humidity"
              value={formData.humidity}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.humidity ? "border-rose-500" : ""
              }`}
              placeholder="Enter humidity (0-100)"
              onChange={handleChange}
            />
            {renderError("humidity")}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-white flex items-center gap-2">
              <CloudRain className="w-4 h-4" />
              Annual Rainfall (mm) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="rainfall"
              value={formData.rainfall}
              className={`w-full px-3 py-3 rounded-lg border text-base transition-colors bg-slate-700/50 dark:bg-slate-800 dark:border-slate-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-400 dark:placeholder-slate-400 dark:text-white ${
                errors.rainfall ? "border-rose-500" : ""
              }`}
              placeholder="Enter annual rainfall (0-10000)"
              onChange={handleChange}
            />
            {renderError("rainfall")}
          </div>
        </div>
      </div>

      {/* Weather Data Section */}
      {weatherData && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CloudRain className="w-5 h-5" />
            Current Weather Conditions for {weatherData.location}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-sky-700 dark:text-sky-300">
                  Temperature
                </p>
                <img
                  src={weatherData.icon}
                  alt={weatherData.condition}
                  className="w-8 h-8"
                />
              </div>
              <p className="text-lg font-semibold text-sky-900 dark:text-sky-100">
                {weatherData.temperature}°C
              </p>
              <p className="text-sm text-sky-600 dark:text-sky-300">
                {weatherData.condition}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                Humidity
              </p>
              <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                {weatherData.humidity}%
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Est. Monthly Rainfall
              </p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {weatherData.rainfall.toFixed(1)} mm
              </p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                Wind Speed
              </p>
              <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                {weatherData.windSpeed} km/h
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last updated: {new Date(weatherData.lastUpdated).toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
            Weather data has been automatically filled in the environmental
            conditions section.
          </div>
        </div>
      )}

      {/* Submit Button and Validation */}
      <div className="space-y-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors text-white shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            isLoading
              ? "bg-emerald-500/50 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          <span className="flex items-center justify-center space-x-2">
            {isLoading && <Loader className="w-5 h-5 animate-spin" />}
            <span>
              {isLoading ? "Processing..." : "Get Crop Recommendations"}
            </span>
          </span>
        </button>

        {submitAttempted && Object.keys(errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4"
          >
            <h4 className="text-rose-500 font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Please fix the following errors:
            </h4>
            <ul className="list-disc list-inside text-rose-500">
              {Object.values(errors).map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-xl">
              <div className="flex items-center gap-4">
                <Loader className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-lg font-medium">
                  Analyzing soil conditions...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default ManualInput;
