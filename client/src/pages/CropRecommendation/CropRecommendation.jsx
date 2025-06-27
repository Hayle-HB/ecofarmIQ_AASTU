import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
motion;
import { ClipboardList, Wifi, ChevronRight } from "lucide-react";
import ManualInput from "./ManualInput";
import SensorInput from "./SensorInput";
import RecommendedCrop from "./RecommendedCrop";

const CropRecommendation = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const inputMethods = [
    {
      id: "manual",
      title: "Manual Input",
      description: "Enter crop and soil details manually",
      icon: ClipboardList,
      component: ManualInput,
    },
    {
      id: "sensor",
      title: "Sensor Reading",
      description: "Read data from connected soil sensors",
      icon: Wifi,
      component: SensorInput,
    },
  ];

  const handleDataSubmit = (data) => {
    // Set the recommendation data directly from the input components
    setRecommendation(data);
  };

  return (
    <div className="w-full px-2 pt-8 pb-16 min-h-screen">
      <div className="mb-8 px-2">
        <h1 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mb-2">
          Crop Recommendation
        </h1>
        <p className="text-gray-600 dark:text-slate-300 mb-2">
          Choose how you want to provide your field and soil data.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-400 mb-2">
          <span
            className={
              selectedMethod
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : ""
            }
          >
            1. Select Method
          </span>
          <span>→</span>
          <span
            className={
              selectedMethod && !recommendation
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : ""
            }
          >
            2. Input Data
          </span>
          <span>→</span>
          <span
            className={
              recommendation
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : ""
            }
          >
            3. Recommendation
          </span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {!selectedMethod && !recommendation && (
          <motion.div
            key="method-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2"
          >
            {inputMethods.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.03 }}
                className="p-8 rounded-2xl cursor-pointer transition-all bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-gray-100 dark:border-slate-700"
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <method.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200">
                        {method.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-slate-400">
                      {method.description}
                    </p>
                  </div>
                  <ChevronRight className="text-gray-400 dark:text-slate-400" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {selectedMethod && !recommendation && (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6"
          >
            <button
              onClick={() => setSelectedMethod(null)}
              className="mb-4 px-3 py-1 rounded-full text-sm text-gray-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              ← Back to selection
            </button>
            {selectedMethod === "manual" ? (
              <ManualInput onSubmit={handleDataSubmit} />
            ) : (
              <SensorInput onSubmit={handleDataSubmit} />
            )}
          </motion.div>
        )}
        {recommendation && (
          <RecommendedCrop
            recommendation={recommendation}
            onReset={() => {
              setRecommendation(null);
              setSelectedMethod(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CropRecommendation;
