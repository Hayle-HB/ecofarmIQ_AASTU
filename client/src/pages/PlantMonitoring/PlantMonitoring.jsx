import React, { useState, useEffect } from "react";
import {
  fetchSensorData,
  subscribeToSensorDataSSE,
} from "../DashBoard/DashBoardService";
import {
  HiOutlineBeaker,
  HiOutlineSun,
  HiOutlineCloud,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineInformationCircle,
} from "react-icons/hi";

const PlantMonitoring = () => {
  const [sensorData, setSensorData] = useState([]);
  const [latestReading, setLatestReading] = useState({});

  console.log(sensorData);
  // Wheat optimal ranges
  const wheatRanges = {
    soil: {
      pH: { low: 5.5, medium: 6.5, high: 7.5 },
      NPK: {
        nitrogen: { low: 80, medium: 120, high: 225 },
        phosphorus: { low: 40, medium: 60, high: 100 },
        potassium: { low: 40, medium: 60, high: 100 },
      },
      electricConductivity: { low: 0.1, medium: 1.5, high: 3.0 },
      temperature: { low: 10, medium: 18, high: 25 },
      moisture: { low: 15, medium: 50, high: 80 },
    },
    climate: {
      temperature: { low: 4, medium: 20, high: 26 },
      humidity: { low: 40, medium: 55, high: 70 },
      uvIndex: { low: 3, medium: 5, high: 7 },
      sunlightHours: { low: 6, medium: 8, high: 12 },
      rainfall: { low: 250, medium: 500, high: 1500 },
    },
  };

  useEffect(() => {
    // Initial fetch for fast load
    fetchSensorData()
      .then((data) => {
        setSensorData(data);
        // Get latest reading
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLatestReading(sorted[0] || {});
      })
      .catch(console.error);

    // Subscribe to SSE for live updates
    const unsubscribe = subscribeToSensorDataSSE((newData) => {
      setSensorData(newData);
      // Update latest reading
      const sorted = [...newData].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setLatestReading(sorted[0] || {});
    });

    // Cleanup on unmount
    return unsubscribe;
  }, []);

  // Generate alerts based on current readings
  const generateAlerts = () => {
    const alerts = [];

    // Soil pH Alert
    if (latestReading.pH < wheatRanges.soil.pH.low) {
      alerts.push({
        type: "warning",
        message: "Soil pH is too low",
        description:
          "Consider adding lime to increase soil pH. Low pH can limit nutrient availability.",
        action: "Add agricultural lime at 2-3 tons per hectare.",
      });
    }

    // Moisture Alert
    if (latestReading.moisture < wheatRanges.soil.moisture.low) {
      alerts.push({
        type: "error",
        message: "Critical: Low Soil Moisture",
        description:
          "Wheat requires adequate moisture for proper growth. Current levels are below optimal.",
        action: "Irrigate immediately. Consider mulching to retain moisture.",
      });
    }

    // Temperature Alert
    if (latestReading.temperature > wheatRanges.climate.temperature.high) {
      alerts.push({
        type: "warning",
        message: "High Temperature Alert",
        description: "Temperature is above optimal range for wheat growth.",
        action: "Consider providing shade or increasing irrigation frequency.",
      });
    }

    return alerts;
  };

  // Growth stage-specific suggestions
  const growthStageSuggestions = [
    {
      stage: "Germination",
      conditions: "Soil temperature 12-25°C, adequate moisture",
      actions: "Ensure proper seed depth (2-5cm) and soil contact",
      icon: <HiOutlineSun className="w-6 h-6" />,
    },
    {
      stage: "Tillering",
      conditions: "Good nitrogen availability, adequate moisture",
      actions: "Apply first nitrogen dose if not done at sowing",
      icon: <HiOutlineBeaker className="w-6 h-6" />,
    },
    {
      stage: "Stem Extension",
      conditions: "Increasing water and nutrient demand",
      actions: "Monitor for diseases, apply second nitrogen dose",
      icon: <HiOutlineCloud className="w-6 h-6" />,
    },
    {
      stage: "Heading",
      conditions: "Critical period for water requirement",
      actions: "Ensure adequate irrigation, monitor for pests",
      icon: <HiOutlineLightningBolt className="w-6 h-6" />,
    },
  ];

  // Calculate progress percentage
  const calculateProgress = (value, range) => {
    const percentage = Math.round((value / range.high) * 100);
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
  };

  // Determine status color based on value and range
  const getStatusColor = (value, range) => {
    if (value < range.low) return "bg-red-500";
    if (value > range.high) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Wheat Crop Monitoring
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Real-time monitoring and recommendations for optimal wheat growth
        </p>
      </div>

      {/* Alerts Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <HiOutlineExclamationCircle className="w-6 h-6 mr-2" />
          Active Alerts
        </h2>
        <div className="space-y-4">
          {generateAlerts().map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-yellow-50 border-yellow-200 text-yellow-700"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`p-2 rounded-full ${
                    alert.type === "error" ? "bg-red-100" : "bg-yellow-100"
                  } mr-3`}
                >
                  <HiOutlineExclamationCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{alert.message}</h3>
                  <p className="mt-1 text-sm">{alert.description}</p>
                  <p className="mt-2 text-sm font-medium">
                    Recommended Action: {alert.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Readings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Soil Conditions Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <HiOutlineBeaker className="w-6 h-6 mr-2" />
            Soil Conditions
          </h3>
          <div className="space-y-6">
            {/* pH Level */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Soil pH
                </span>
                <span className="font-semibold">
                  {latestReading.pH?.toFixed(1) || "-"}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(
                    latestReading.pH,
                    wheatRanges.soil.pH
                  )} transition-all duration-300`}
                  style={{
                    width: `${calculateProgress(
                      latestReading.pH,
                      wheatRanges.soil.pH
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Moisture */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Soil Moisture
                </span>
                <span className="font-semibold">
                  {latestReading.moisture || "-"}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(
                    latestReading.moisture,
                    wheatRanges.soil.moisture
                  )} transition-all duration-300`}
                  style={{
                    width: `${calculateProgress(
                      latestReading.moisture,
                      wheatRanges.soil.moisture
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* NPK Levels */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  NPK Levels
                </span>
                <span className="font-semibold">
                  {latestReading.nitrogen || "-"}-
                  {latestReading.phosphorus || "-"}-
                  {latestReading.potassium || "-"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(
                      latestReading.nitrogen,
                      wheatRanges.soil.NPK.nitrogen
                    )} transition-all duration-300`}
                    style={{
                      width: `${calculateProgress(
                        latestReading.nitrogen,
                        wheatRanges.soil.NPK.nitrogen
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(
                      latestReading.phosphorus,
                      wheatRanges.soil.NPK.phosphorus
                    )} transition-all duration-300`}
                    style={{
                      width: `${calculateProgress(
                        latestReading.phosphorus,
                        wheatRanges.soil.NPK.phosphorus
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(
                      latestReading.potassium,
                      wheatRanges.soil.NPK.potassium
                    )} transition-all duration-300`}
                    style={{
                      width: `${calculateProgress(
                        latestReading.potassium,
                        wheatRanges.soil.NPK.potassium
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Climate Conditions Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <HiOutlineCloud className="w-6 h-6 mr-2" />
            Climate Conditions
          </h3>
          <div className="space-y-6">
            {/* Temperature */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Temperature
                </span>
                <span className="font-semibold">
                  {latestReading.temperature || "-"}°C
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(
                    latestReading.temperature,
                    wheatRanges.climate.temperature
                  )} transition-all duration-300`}
                  style={{
                    width: `${calculateProgress(
                      latestReading.temperature,
                      wheatRanges.climate.temperature
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Humidity */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Humidity
                </span>
                <span className="font-semibold">
                  {latestReading.humidity || "-"}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(
                    latestReading.humidity,
                    wheatRanges.climate.humidity
                  )} transition-all duration-300`}
                  style={{
                    width: `${calculateProgress(
                      latestReading.humidity,
                      wheatRanges.climate.humidity
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* UV Index */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  UV Index
                </span>
                <span className="font-semibold">{latestReading.UV || "-"}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor(
                    latestReading.UV,
                    wheatRanges.climate.uvIndex
                  )} transition-all duration-300`}
                  style={{
                    width: `${calculateProgress(
                      latestReading.UV,
                      wheatRanges.climate.uvIndex
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Stage Guidelines */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <HiOutlineLightningBolt className="w-6 h-6 mr-2" />
          Growth Stage Guidelines
        </h3>
        <div className="space-y-6">
          {growthStageSuggestions.map((stage, index) => (
            <div
              key={index}
              className="flex items-start p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
            >
              <div className="mr-4 text-emerald-500">{stage.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  {stage.stage}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium">Optimal Conditions:</span>{" "}
                  {stage.conditions}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium">Recommended Actions:</span>{" "}
                  {stage.actions}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <HiOutlineInformationCircle className="w-6 h-6 mr-2" />
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            Generate Detailed Report
          </button>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Update Sensor Readings
          </button>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
            View Historical Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantMonitoring;
