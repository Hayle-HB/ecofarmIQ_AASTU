import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  Clock,
  MapPin,
  Compass,
  Eye,
  Gauge,
  CloudRain,
  ThermometerSun,
} from "lucide-react";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          "https://api.weatherapi.com/v1/current.json?key=3f970fdc19574d35a41110710252302&q=Addis%20Ababa"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-rose-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!weatherData) return null;

  const { location, current } = weatherData;

  // Weather condition categories for analysis
  const getWeatherAdvice = () => {
    const conditions = [];

    // Temperature analysis
    if (current.temp_c > 30) {
      conditions.push("High temperature detected. Consider irrigation.");
    } else if (current.temp_c < 10) {
      conditions.push("Low temperature detected. Monitor frost risk.");
    }

    // Humidity analysis
    if (current.humidity > 80) {
      conditions.push("High humidity may increase disease risk.");
    } else if (current.humidity < 30) {
      conditions.push("Low humidity. Plants may need extra water.");
    }

    // Wind analysis
    if (current.wind_kph > 20) {
      conditions.push("Strong winds. Check for plant damage.");
    }

    // UV analysis
    if (current.uv > 8) {
      conditions.push("High UV levels. Consider shade protection.");
    }

    return conditions;
  };

  const weatherAdvice = getWeatherAdvice();

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Location Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MapPin className="w-8 h-8 text-emerald-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {location.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {location.country}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  {location.localtime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={current.condition.icon}
                  alt={current.condition.text}
                  className="w-16 h-16"
                />
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {current.temp_c}°C
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {current.condition.text}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 dark:text-gray-400">
                  Feels like: {current.feelslike_c}°C
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Humidity: {current.humidity}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Wind: {current.wind_kph} km/h
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-purple-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Direction: {current.wind_dir}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Visibility: {current.vis_km} km
                </span>
              </div>
            </div>
          </motion.div>

          {/* Detailed Measurements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Detailed Measurements
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Gauge className="w-5 h-5 text-amber-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Pressure: {current.pressure_mb} mb
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CloudRain className="w-5 h-5 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Precipitation: {current.precip_mm} mm
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Cloud Cover: {current.cloud}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  UV Index: {current.uv}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ThermometerSun className="w-5 h-5 text-rose-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Heat Index: {current.heatindex_c}°C
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Dew Point: {current.dewpoint_c}°C
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weather Analysis and Advice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Weather Analysis & Agricultural Advice
          </h3>
          <div className="space-y-4">
            {weatherAdvice.map((advice, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <p>{advice}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Weather;
