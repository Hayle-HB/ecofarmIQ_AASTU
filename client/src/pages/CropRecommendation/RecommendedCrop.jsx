import React from "react";
import { Leaf, ArrowLeft, Sprout } from "lucide-react";

const RecommendedCrop = ({ recommendation, onReset }) => {
  if (!recommendation) return null;

  // Get the recommended crop and alternative from the prediction result
  const mainCrop =
    recommendation.recommendedCrop || "No recommendation available";
  const alternativeCrop =
    recommendation.alternativeCrops?.[0]?.name || "No alternative available";

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Crop Recommendation
          </h2>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        </div>

        {/* Main Recommendation */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Best Crop:{" "}
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {mainCrop}
                </span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Based on current soil and environmental conditions
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Recommendation */}
        <div className="border-t dark:border-slate-700 pt-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Sprout className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                Alternative Option:{" "}
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {alternativeCrop}
                </span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Another suitable crop for your conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedCrop;
