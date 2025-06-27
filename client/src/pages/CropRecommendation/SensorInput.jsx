import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
motion;
import {
  Wifi,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Clock,
  ThermometerSun,
  Droplets,
  Leaf,
  CloudRain,
  MapPin,
} from "lucide-react";
import CropRecService from "./CropRecService";

const SensorInput = ({ onSubmit }) => {
  const [sensorStatus, setSensorStatus] = useState("disconnected");
  const [sensorData, setSensorData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState({
    country: "Ethiopia",
    city: "Addis Ababa",
    subCity: "",
  });

  const fetchLatestSensorData = async () => {
    try {
      const response = await fetch(
        "https://ecofarmiq-final.onrender.com/api/sensorData"
      );
      if (!response.ok) throw new Error("Failed to fetch sensor data");
      const data = await response.json();

      // Sort by timestamp and get latest reading
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const latest = sortedData[0];

      // Format the data for display
      const formattedData = {
        sensorData: latest, // Keep raw sensor data
        temperature: latest.temperature,
        moisture: latest.moisture, // Keep as moisture
        soilPh: latest.pH,
        nitrogen: latest.nitrogen,
        phosphorus: latest.phosphorus,
        potassium: latest.potassium,
        temperatureEvent: latest.temperatureEvent,
        moistureEvent: latest.moistureEvent,
        phEvent: latest.phEvent,
        nitrogenEvent: latest.nitrogenEvent,
        phosphorusEvent: latest.phosphorusEvent,
        potassiumEvent: latest.potassiumEvent,
        timestamp: latest.timestamp,
      };

      setSensorData(formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      throw new Error("Failed to fetch sensor data");
    }
  };

  const fetchWeatherData = async () => {
    try {
      const query = encodeURIComponent(location.city);
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=3f970fdc19574d35a41110710252302&q=${query}`
      );

      if (!response.ok) throw new Error("Failed to fetch weather data");
      const data = await response.json();

      setWeatherData({
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
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setConnectionMessage("Warning: Could not fetch weather data");
    }
  };

  const connectToSensor = async () => {
    setSensorStatus("connecting");
    setConnectionMessage("Initializing sensor connection...");

    // Simulate connection steps
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnectionMessage("Sensor detected, establishing connection...");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnectionMessage("Connection established, fetching latest readings...");

    try {
      await fetchLatestSensorData();
      await fetchWeatherData(); // Fetch weather data after sensor connection
      setSensorStatus("connected");
      setConnectionMessage("Sensor connected successfully!");
    } catch {
      setSensorStatus("error");
      setConnectionMessage("Failed to connect to sensor.");
      setTimeout(() => {
        setShowWarning(true);
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    if (sensorData) {
      setIsSubmitting(true);
      try {
        // Format sensor data and make prediction
        const inputData = CropRecService.formatSensorInputData(sensorData);
        console.log("Formatted sensor data:", inputData); // Debug log
        const result = await CropRecService.predictCrop(inputData);

        // Pass sensor data and prediction result to parent
        onSubmit({
          sensorData: sensorData.sensorData,
          recommendedCrop: result.recommended_crop,
          predictionTimestamp: new Date().toISOString(),
          readingTimestamp: sensorData.timestamp,
          readings: {
            temperature: sensorData.temperature,
            moisture: sensorData.moisture, // Keep as moisture
            soilPh: sensorData.soilPh || sensorData.pH,
            nitrogen: sensorData.nitrogen,
            phosphorus: sensorData.phosphorus,
            potassium: sensorData.potassium,
          },
          events: {
            temperature: sensorData.temperatureEvent,
            moisture: sensorData.moistureEvent,
            ph: sensorData.phEvent,
            nitrogen: sensorData.nitrogenEvent,
            phosphorus: sensorData.phosphorusEvent,
            potassium: sensorData.potassiumEvent,
          },
          weather: weatherData, // Include weather data in the result
        });
      } catch (error) {
        console.error("Error making prediction:", error);
        setConnectionMessage(
          error.message ||
            "Failed to get crop recommendation. Please try again."
        );
        setSensorStatus("error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDemoData = () => {
    const mockData = {
      sensorData: {
        temperature: 24.5,
        moisture: 65.0,
        pH: 6.5,
        nitrogen: 45,
        phosphorus: 30,
        potassium: 20,
        temperatureEvent: "optimal",
        moistureEvent: "optimal",
        phEvent: "optimal",
        nitrogenEvent: "good",
        phosphorusEvent: "good",
        potassiumEvent: "good",
        timestamp: new Date().toISOString(),
      },
      temperature: 24.5,
      moisture: 65.0,
      soilPh: 6.5,
      nitrogen: 45,
      phosphorus: 30,
      potassium: 20,
      temperatureEvent: "optimal",
      moistureEvent: "optimal",
      phEvent: "optimal",
      nitrogenEvent: "good",
      phosphorusEvent: "good",
      potassiumEvent: "good",
      timestamp: new Date().toISOString(),
    };
    setSensorData(mockData);
    setSensorStatus("connected");
    setConnectionMessage("Demo data loaded successfully!");
    setShowWarning(false);
    // Also fetch weather data for demo
    fetchWeatherData();
  };

  return (
    <>
      <div className="space-y-6 w-full">
        {/* Location Input Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={location.country}
                onChange={(e) =>
                  setLocation({ ...location, country: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700"
                placeholder="Enter country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={location.city}
                onChange={(e) => {
                  setLocation({ ...location, city: e.target.value });
                }}
                onBlur={fetchWeatherData} // Fetch weather data when city input loses focus
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sub City
              </label>
              <input
                type="text"
                value={location.subCity}
                onChange={(e) =>
                  setLocation({ ...location, subCity: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700"
                placeholder="Enter sub city"
              />
            </div>
          </div>
        </div>

        {/* Weather Data Section */}
        {weatherData && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200 mb-4 flex items-center">
              <CloudRain className="w-5 h-5 mr-2" />
              Weather Conditions
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
                  Monthly Rainfall
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
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(weatherData.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}

        {/* Existing Sensor Data Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {sensorStatus === "connecting" ? (
                <span className="w-6 h-6 animate-spin text-emerald-500">
                  <Loader />
                </span>
              ) : (
                <span
                  className={`w-6 h-6 ${
                    {
                      disconnected: "text-gray-500",
                      connected: "text-emerald-600 dark:text-emerald-400",
                      error: "text-red-500",
                    }[sensorStatus]
                  }`}
                >
                  {
                    {
                      disconnected: <Wifi />,
                      connected: <CheckCircle />,
                      error: <XCircle />,
                    }[sensorStatus]
                  }
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200">
                Soil Sensor
              </h3>
            </div>
            {sensorStatus !== "connecting" && (
              <button
                onClick={connectToSensor}
                className="px-4 py-2 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                {sensorStatus === "connected"
                  ? "Refresh Data"
                  : "Connect Sensor"}
              </button>
            )}
          </div>

          {/* Connection Message */}
          {connectionMessage && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center space-x-2">
                {sensorStatus === "connecting" ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : sensorStatus === "connected" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <p>{connectionMessage}</p>
              </div>
            </div>
          )}

          {sensorData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <ThermometerSun className="w-4 h-4 text-blue-500" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Temperature
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {sensorData.temperature.toFixed(1)}°C
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Status: {sensorData.temperatureEvent}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplets className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Soil Moisture
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {sensorData.moisture
                      ? sensorData.moisture.toFixed(1)
                      : "N/A"}
                    %
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Status: {sensorData.moistureEvent}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Leaf className="w-4 h-4 text-purple-500" />
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Soil pH
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    {sensorData.soilPh.toFixed(1)}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Status: {sensorData.phEvent}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Leaf className="w-4 h-4 text-amber-500" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      NPK Levels
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        N: {sensorData.nitrogen} ppm
                      </p>
                      <p className="text-xs text-amber-600">
                        {sensorData.nitrogenEvent}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        P: {sensorData.phosphorus} ppm
                      </p>
                      <p className="text-xs text-amber-600">
                        {sensorData.phosphorusEvent}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        K: {sensorData.potassium} ppm
                      </p>
                      <p className="text-xs text-amber-600">
                        {sensorData.potassiumEvent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Last Updated:{" "}
                    {new Date(sensorData.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {sensorStatus === "error" && (
            <div className="flex items-center space-x-2 text-red-500 mt-4">
              <AlertTriangle className="w-5 h-5" />
              <p>Failed to connect to sensor. Please try again.</p>
            </div>
          )}
        </div>

        {sensorData && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors text-white shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
              isSubmitting
                ? "bg-emerald-500/50 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <span className="flex items-center justify-center space-x-2">
              {isSubmitting && <Loader className="w-5 h-5 animate-spin" />}
              <span>
                {isSubmitting
                  ? "Analyzing Soil Conditions..."
                  : "Get Crop Recommendations"}
              </span>
            </span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-sm w-full text-center">
              <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                No IoT device found.
              </h4>
              <p className="text-gray-700 dark:text-slate-300 mb-4">
                Would you like to proceed with sample data for demonstration
                purposes?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    handleDemoData();
                    setShowWarning(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Use Demo Data
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SensorInput;
