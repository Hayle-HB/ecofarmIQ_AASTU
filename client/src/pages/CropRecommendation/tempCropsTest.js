import cropData from "./tempTestCropData.json";

// Define parameter weights and critical thresholds
const PARAMETER_WEIGHTS = {
  temperature: 0.25, // 25% - Most critical for crop survival
  ph: 0.2, // 20% - Critical for nutrient absorption
  humidity: 0.15, // 15% - Important for growth
  rainfall: 0.15, // 15% - Important for growth
  n: 0.1, // 10% - Primary nutrient
  p: 0.08, // 8%  - Secondary nutrient
  k: 0.07, // 7%  - Secondary nutrient
};

// Define critical thresholds where crops will definitely fail
const CRITICAL_THRESHOLDS = {
  temperature: {
    min: 8, // Changed from 5 to 8
    max: 50, // Changed from 40 to 50
  },
  ph: {
    min: 2.0, // Too acidic
    max: 12.0, // Too alkaline
  },
  humidity: {
    min: 10, // Too dry
    max: 100, // Too humid
  },
};

// Define optimal ranges as percentage deviations from ideal
const OPTIMAL_RANGES = {
  temperature: { optimal: 0.1, acceptable: 0.2 }, // ±10% optimal, ±20% acceptable
  ph: { optimal: 0.05, acceptable: 0.1 }, // ±5% optimal, ±10% acceptable
  humidity: { optimal: 0.1, acceptable: 0.2 }, // ±10% optimal, ±20% acceptable
  rainfall: { optimal: 0.15, acceptable: 0.3 }, // ±15% optimal, ±30% acceptable
  n: { optimal: 0.1, acceptable: 0.3 }, // ±10% optimal, ±30% acceptable
  p: { optimal: 0.1, acceptable: 0.3 }, // ±10% optimal, ±30% acceptable
  k: { optimal: 0.1, acceptable: 0.3 }, // ±10% optimal, ±30% acceptable
};

/**
 * Calculate sophisticated match score for a single parameter
 * @param {string} param - Parameter name
 * @param {number} actual - Actual value from sensor
 * @param {number} ideal - Ideal value from crop data
 * @returns {Object} Score details
 */
function calculateParameterScore(param, actual, ideal) {
  // Check critical thresholds first
  if (CRITICAL_THRESHOLDS[param]) {
    const { min, max } = CRITICAL_THRESHOLDS[param];
    if (actual < min || actual > max) {
      return {
        score: 0,
        status: "critical",
        message: `${param} is outside critical thresholds (${min}-${max})`,
      };
    }
  }

  const range = OPTIMAL_RANGES[param];
  const percentDiff = Math.abs(actual - ideal) / ideal;

  // Calculate base score
  let score;
  let status;

  if (percentDiff <= range.optimal) {
    // Within optimal range
    score = 1 - percentDiff / range.optimal;
    status = "optimal";
  } else if (percentDiff <= range.acceptable) {
    // Within acceptable range
    const acceptableDiff = percentDiff - range.optimal;
    const acceptableRange = range.acceptable - range.optimal;
    score = 0.7 * (1 - acceptableDiff / acceptableRange);
    status = "acceptable";
  } else {
    // Outside acceptable range
    score = Math.max(0, 0.4 * (1 - (percentDiff - range.acceptable)));
    status = "suboptimal";
  }

  // Apply weight
  const weightedScore = score * PARAMETER_WEIGHTS[param];

  return {
    score: weightedScore,
    rawScore: score,
    status,
    percentDiff: percentDiff * 100,
    actual,
    ideal,
  };
}

/**
 * Get the best crop match with detailed analysis
 * @param {Object} sensorData - Current sensor readings
 * @returns {Object} Best crop match with detailed analysis
 */
function getBestCropMatch(sensorData) {
  let bestMatch = null;
  let bestScore = 0;
  let allScores = [];

  // Check temperature extremes first
  if (sensorData.temperature < 8 || sensorData.temperature > 50) {
    return {
      success: false,
      message: "Temperature is too extreme for crop growth",
      recommendedCrop: "Temperature too extreme for farming",
      alternativeCrops: [],
      conditions: {
        temperature: {
          current: sensorData.temperature,
          acceptable: `${CRITICAL_THRESHOLDS.temperature.min}°C - ${CRITICAL_THRESHOLDS.temperature.max}°C`,
          status: sensorData.temperature < 8 ? "Too cold" : "Too hot",
        },
      },
    };
  }

  // Evaluate each crop
  for (const [cropName, idealValues] of Object.entries(cropData)) {
    let totalScore = 0;
    let parameterScores = {};
    let criticalFailure = false;

    // Calculate scores for each parameter
    for (const param of Object.keys(PARAMETER_WEIGHTS)) {
      const score = calculateParameterScore(
        param,
        sensorData[param],
        idealValues[param]
      );
      parameterScores[param] = score;

      if (score.status === "critical") {
        criticalFailure = true;
        break;
      }

      totalScore += score.score;
    }

    // Skip this crop if any critical failures
    if (criticalFailure) continue;

    // Calculate final score (0-100)
    const finalScore = Math.round(totalScore * 100);

    allScores.push({
      crop: cropName,
      score: finalScore,
      details: parameterScores,
    });

    // Update best match if this is the highest score
    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMatch = {
        crop: cropName,
        score: finalScore,
        details: parameterScores,
      };
    }
  }

  // Sort all scores for ranking
  allScores.sort((a, b) => b.score - a.score);

  // If no viable crops found (but temperature is within range)
  if (!bestMatch) {
    return {
      success: false,
      message:
        "No suitable crops found due to other critical condition failures",
      recommendedCrop: "Improve soil conditions first",
      alternativeCrops: [],
      conditions: Object.keys(CRITICAL_THRESHOLDS).map((param) => ({
        parameter: param,
        current: sensorData[param],
        acceptable: `${CRITICAL_THRESHOLDS[param].min} - ${CRITICAL_THRESHOLDS[param].max}`,
      })),
    };
  }

  // Generate recommendation with confidence level
  const confidence =
    bestMatch.score >= 80 ? "High" : bestMatch.score >= 60 ? "Moderate" : "Low";

  // Format the response
  return {
    success: true,
    recommendedCrop: bestMatch.crop,
    confidence,
    matchScore: bestMatch.score,
    analysis: {
      temperature: bestMatch.details.temperature,
      moisture: bestMatch.details.humidity,
      soil: {
        ph: bestMatch.details.ph,
        nutrients: {
          n: bestMatch.details.n,
          p: bestMatch.details.p,
          k: bestMatch.details.k,
        },
      },
      rainfall: bestMatch.details.rainfall,
    },
    alternativeCrops: allScores.slice(1, 3).map((crop) => ({
      name: crop.crop,
      score: crop.score,
    })),
  };
}

export default getBestCropMatch;
