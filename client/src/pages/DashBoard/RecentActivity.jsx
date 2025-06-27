import React, { useState } from "react";
import {
  HiArrowLeft,
  HiClock,
  HiInformationCircle,
  HiXCircle,
  HiCheckCircle,
  HiExclamationCircle,
  HiChevronRight,
  HiX,
} from "react-icons/hi";

const getPriorityInfo = (type) => {
  switch (type) {
    case "critical":
      return {
        label: "Urgent",
        color:
          "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
        icon: <HiXCircle className="w-5 h-5" />,
      };
    case "warning":
      return {
        label: "High",
        color:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        icon: <HiExclamationCircle className="w-5 h-5" />,
      };
    default:
      return {
        label: "Normal",
        color:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        icon: <HiInformationCircle className="w-5 h-5" />,
      };
  }
};

const AlertCard = ({ type, message, timestamp, onClick, isSelected }) => {
  const priority = getPriorityInfo(type);
  const timeAgo = Math.round(
    (Date.now() - new Date(timestamp).getTime()) / (1000 * 60)
  );
  const formattedTime =
    timeAgo < 60
      ? `${timeAgo}m ago`
      : timeAgo < 1440
      ? `${Math.floor(timeAgo / 60)}h ago`
      : `${Math.floor(timeAgo / 1440)}d ago`;

  const mainMessage = message.split("\n")[0];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer group transition-all duration-200 ${
        isSelected
          ? "bg-gray-100 dark:bg-slate-800 border-emerald-500"
          : "bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 border-transparent"
      } border rounded-lg shadow-sm`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${priority.color}`}>
              {priority.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${priority.color}`}
                >
                  {priority.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formattedTime}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                {mainMessage}
              </p>
            </div>
          </div>
          <div
            className={`transition-transform duration-200 ${
              isSelected ? "rotate-90" : "group-hover:translate-x-1"
            }`}
          >
            <HiChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailPanel = ({ alert, onClose }) => {
  if (!alert) return null;

  const steps = alert.message
    .split("\n")
    .filter((step) => step.startsWith("•"));
  const priority = getPriorityInfo(alert.type);

  return (
    <div className="bg-white dark:bg-slate-800 h-full p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${priority.color}`}>
            {priority.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detailed Instructions
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <HiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Issue Description
          </h4>
          <p className="text-gray-900 dark:text-white">
            {alert.message.split("\n")[0]}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Required Actions
          </h4>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {step.replace("•", "").trim()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Priority Level
          </h4>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${priority.color}`}
            >
              {priority.label}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(alert.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getRecommendations = (reading) => {
  const recommendations = [];

  // Temperature recommendations
  if (reading.temperatureEvent === "too hot") {
    recommendations.push({
      type: "critical",
      message:
        "🌡️ Critical: Temperature exceeding safe limits! Immediate action required:\n• Activate cooling systems\n• Deploy shade structures\n• Check ventilation systems",
      timestamp: reading.timestamp,
    });
  } else if (reading.temperatureEvent === "high") {
    recommendations.push({
      type: "warning",
      message:
        "🌡️ Temperature trending high. Actions needed:\n• Increase ventilation\n• Monitor crop stress\n• Prepare cooling systems",
      timestamp: reading.timestamp,
    });
  }

  // Moisture recommendations
  if (reading.moistureEvent === "dry") {
    recommendations.push({
      type: "warning",
      message:
        "💧 Low soil moisture detected! Next steps:\n• Schedule irrigation within 2 hours\n• Check irrigation system functionality\n• Monitor affected areas",
      timestamp: reading.timestamp,
    });
  } else if (reading.moistureEvent === "saturated") {
    recommendations.push({
      type: "warning",
      message:
        "💧 Soil saturation warning! Required actions:\n• Pause all irrigation\n• Inspect drainage systems\n• Monitor for root health issues",
      timestamp: reading.timestamp,
    });
  }

  // Water level recommendations
  if (reading.waterLevelEvent === "very low") {
    recommendations.push({
      type: "critical",
      message:
        "⚠️ Critical water level alert! Urgent actions:\n• Refill water tanks immediately\n• Check for system leaks\n• Verify pump operation",
      timestamp: reading.timestamp,
    });
  } else if (reading.waterLevelEvent === "low") {
    recommendations.push({
      type: "warning",
      message:
        "⚠️ Water level low. Plan ahead:\n• Schedule tank refill within 24h\n• Review water consumption patterns\n• Check system efficiency",
      timestamp: reading.timestamp,
    });
  }

  // pH recommendations
  if (reading.phEvent === "acidic") {
    recommendations.push({
      type: "warning",
      message:
        "🧪 Acidic soil conditions detected:\n• Apply lime treatment\n• Monitor pH changes\n• Review fertilization schedule",
      timestamp: reading.timestamp,
    });
  } else if (reading.phEvent === "alkaline") {
    recommendations.push({
      type: "warning",
      message:
        "🧪 Alkaline soil detected:\n• Add sulfur or organic matter\n• Adjust fertilization program\n• Schedule follow-up testing",
      timestamp: reading.timestamp,
    });
  }

  // NPK recommendations
  if (
    reading.nitrogenEvent === "low" ||
    reading.phosphorusEvent === "low" ||
    reading.potassiumEvent === "low"
  ) {
    recommendations.push({
      type: "warning",
      message:
        "🌱 Nutrient deficiency alert:\n• Schedule fertilization within 48h\n• Perform soil testing\n• Adjust nutrient program",
      timestamp: reading.timestamp,
    });
  }

  // EC recommendations
  if (reading.ecEvent === "high") {
    recommendations.push({
      type: "warning",
      message:
        "⚡ High salt concentration detected:\n• Flush soil with fresh water\n• Reduce fertilizer application\n• Monitor drainage quality",
      timestamp: reading.timestamp,
    });
  }

  // UV recommendations
  if (reading.uvEvent === "very high") {
    recommendations.push({
      type: "critical",
      message:
        "☀️ Extreme UV levels! Protect crops now:\n• Deploy shade cloths\n• Increase humidity\n• Monitor sensitive crops",
      timestamp: reading.timestamp,
    });
  }

  return recommendations;
};

const RecentActivity = ({ onBack, sensorData }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);

  const sortedData = [...sensorData].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const allRecommendations = sortedData
    .flatMap((reading) => getRecommendations(reading))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Farm Alerts & Actions
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Prioritized alerts and detailed recommendations
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts List */}
          <div className="space-y-4">
            {allRecommendations.length > 0 ? (
              allRecommendations.map((rec, index) => (
                <AlertCard
                  key={index}
                  {...rec}
                  onClick={() => setSelectedAlert(rec)}
                  isSelected={selectedAlert === rec}
                />
              ))
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center">
                <HiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  All Systems Optimal
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Your farm is operating within ideal parameters
                </p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="hidden lg:block">
            {selectedAlert ? (
              <DetailPanel
                alert={selectedAlert}
                onClose={() => setSelectedAlert(null)}
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 h-full rounded-lg p-6 flex items-center justify-center text-center">
                <div className="max-w-sm">
                  <HiInformationCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select an Alert
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Choose an alert from the list to view detailed instructions
                    and recommendations
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Detail Panel */}
      {selectedAlert && (
        <div className="lg:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm">
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-t-xl">
              <DetailPanel
                alert={selectedAlert}
                onClose={() => setSelectedAlert(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
