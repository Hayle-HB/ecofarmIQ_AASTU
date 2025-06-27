import React, { useEffect, useState } from "react";
import {
  HiOutlineWifi,
  HiOutlineSun,
  HiOutlineBeaker,
  HiArrowLeft,
  HiClock,
  HiInformationCircle,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchSensorData, subscribeToSensorDataSSE } from "./DashBoardService";
import RecentActivity from "./RecentActivity";

const DashBoard = () => {
  const [sensorData, setSensorData] = useState([]);
  const [latestReading, setLatestReading] = useState({});
  const [showActivity, setShowActivity] = useState(false);

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

  const eventStatusMap = {
    low: { label: "Low", color: "bg-blue-500" },
    high: { label: "High", color: "bg-red-500" },
    normal: { label: "Normal", color: "bg-green-500" },
    critical: { label: "Critical", color: "bg-pink-600" },
    optimal: { label: "Optimal", color: "bg-emerald-500" },
    acidic: { label: "Acidic", color: "bg-yellow-400" },
    alkaline: { label: "Alkaline", color: "bg-purple-500" },
    cold: { label: "Cold", color: "bg-cyan-500" },
    cool: { label: "Cool", color: "bg-sky-400" },
    dry: { label: "Dry", color: "bg-orange-400" },
    moderate: { label: "Moderate", color: "bg-lime-500" },
    wet: { label: "Wet", color: "bg-blue-300" },
    saturated: { label: "Saturated", color: "bg-indigo-500" },
    "too hot": { label: "Too Hot", color: "bg-rose-600" },
    "very low": { label: "Very Low", color: "bg-blue-900" },
    "very high": { label: "Very High", color: "bg-red-900" },
    indoor: { label: "Indoor", color: "bg-gray-400" },
    good: { label: "Good", color: "bg-green-400" },
    adequate: { label: "Adequate", color: "bg-teal-500" },
    // Add more as needed
  };

  const metrics = [
    {
      title: "Soil Moisture",
      value:
        latestReading.moisture !== undefined
          ? `${latestReading.moisture}%`
          : "-",
      icon: <HiOutlineWifi className="w-8 h-8 text-blue-500" />,
      color: "bg-blue-50",
      event: latestReading.moistureEvent,
    },
    {
      title: "Temperature",
      value:
        latestReading.temperature !== undefined
          ? `${latestReading.temperature}°C`
          : "-",
      icon: <HiOutlineSun className="w-8 h-8 text-red-500" />,
      color: "bg-red-50",
      event: latestReading.temperatureEvent,
    },
    {
      title: "Soil pH",
      value: latestReading.pH !== undefined ? latestReading.pH.toFixed(2) : "-",
      icon: <HiOutlineBeaker className="w-8 h-8 text-purple-500" />,
      color: "bg-purple-50",
      event: latestReading.phEvent,
    },
    {
      title: "Electric Conductivity",
      value:
        latestReading.electricConductivity !== undefined
          ? latestReading.electricConductivity
          : "-",
      icon: (
        <span className="w-8 h-8 flex items-center justify-center text-cyan-500">
          EC
        </span>
      ),
      color: "bg-cyan-50",
      event: latestReading.ecEvent,
    },
    {
      title: "Nitrogen",
      value:
        latestReading.nitrogen !== undefined ? latestReading.nitrogen : "-",
      icon: (
        <span className="w-8 h-8 flex items-center justify-center text-green-500">
          N
        </span>
      ),
      color: "bg-green-50",
      event: latestReading.nitrogenEvent,
    },
    {
      title: "Phosphorus",
      value:
        latestReading.phosphorus !== undefined ? latestReading.phosphorus : "-",
      icon: (
        <span className="w-8 h-8 flex items-center justify-center text-blue-500">
          P
        </span>
      ),
      color: "bg-blue-100",
      event: latestReading.phosphorusEvent,
    },
    {
      title: "Potassium",
      value:
        latestReading.potassium !== undefined ? latestReading.potassium : "-",
      icon: (
        <span className="w-8 h-8 flex items-center justify-center text-yellow-700">
          K
        </span>
      ),
      color: "bg-yellow-100",
      event: latestReading.potassiumEvent,
    },
    {
      title: "UV Index",
      value: latestReading.UV !== undefined ? latestReading.UV : "-",
      icon: (
        <span className="w-8 h-8 flex items-center justify-center text-yellow-500">
          UV
        </span>
      ),
      color: "bg-yellow-50",
      event: latestReading.uvEvent,
    },
    {
      title: "Water Level",
      value:
        latestReading.waterLevel !== undefined
          ? `${latestReading.waterLevel}%`
          : "-",
      icon: (
        <span className="w-8 h-8 flex items-center justify-center text-blue-400">
          WL
        </span>
      ),
      color: "bg-blue-200",
      event: latestReading.waterLevelEvent,
    },
  ];

  if (showActivity) {
    return (
      <RecentActivity
        onBack={() => setShowActivity(false)}
        sensorData={sensorData}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Farm Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Monitor your farm's key metrics in real-time
          </p>
        </div>
        <button
          onClick={() => setShowActivity(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <HiClock className="w-5 h-5" />
          <span>View Alerts</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="flex gap-6">
        {/* Left Section - 100% width (remove right section) */}
        <div className="flex-grow w-full">
          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-6">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className={`${metric.color} rounded-xl p-6 dark:bg-slate-800`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      {metric.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                      {metric.value}
                    </h3>
                    {/* Status label for event */}
                    {metric.event ? (
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                            eventStatusMap[metric.event]?.color || "bg-gray-400"
                          }`}
                        >
                          {eventStatusMap[metric.event]?.label || metric.event}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div>{metric.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Temperature Trends
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" hide />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Temperature (°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Moisture & Water Levels Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Moisture & Water Levels
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" hide />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="moisture"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      name="Moisture (%)"
                    />
                    <Area
                      type="monotone"
                      dataKey="waterLevel"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Water Level (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NPK Levels */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                NPK Levels
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" hide />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="nitrogen" fill="#ef4444" name="Nitrogen" />
                    <Bar
                      dataKey="phosphorus"
                      fill="#3b82f6"
                      name="Phosphorus"
                    />
                    <Bar dataKey="potassium" fill="#10b981" name="Potassium" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* pH & EC Levels */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                pH & Conductivity
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" hide />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="pH"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                      name="pH Level"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="electricConductivity"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      name="EC (µS/cm)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* UV Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                UV Index
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" hide />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="UV"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={false}
                      name="UV Index"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Electric Conductivity Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Electric Conductivity
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" hide />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="electricConductivity"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      name="EC (µS/cm)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
