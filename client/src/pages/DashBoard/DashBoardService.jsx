/**
 * Fetch sensor data from the API
 * @returns {Promise<Array>} Array of sensor data objects (with event fields)
 */
export async function fetchSensorData() {
  const response = await fetch(
    "https://ecofarmiq-final.onrender.com/api/sensorData"
  );
  if (!response.ok) throw new Error("Failed to fetch sensor data");
  const data = await response.json();
  // Sort by timestamp in descending order (newest first)
  return data
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(-20);
}

/**
 * Process NPK string into separate N, P, K values for charting
 * @param {Array} sensorData - Array of sensor data objects
 * @returns {Array} Array with N, P, K fields added
 */
export function processNPKData(sensorData) {
  return sensorData.map((reading) => {
    const [n, p, k] = (reading.NPK || "0-0-0").split("-").map(Number);
    return {
      ...reading,
      N: n,
      P: p,
      K: k,
    };
  });
}

/**
 * Subscribe to sensor data updates via SSE.
 * @param {function} onData - Callback to receive new sensor data array.
 * @returns {function} Unsubscribe function.
 */
export function subscribeToSensorDataSSE(onData) {
  const eventSource = new EventSource(
    "https://ecofarmiq-final.onrender.com/events"
  );
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Sort by timestamp in descending order before sending to callback
      const sortedData = data
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(-20);
      onData(sortedData);
    } catch (e) {
      console.error("Error processing SSE data:", e);
    }
  };
  return () => eventSource.close();
}
