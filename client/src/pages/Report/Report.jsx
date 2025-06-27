import React, { useState } from "react";
import axios from "axios";
import "./Report.css";

const Report = () => {
  const [sendingStatus, setSendingStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      setSendingStatus("Sending message...");

      const response = await axios.get("http://localhost:3000/send", {
        timeout: 10000, // 10 second timeout
      });

      if (response.data.success) {
        setSendingStatus("Message sent successfully! ✓");

        // If there are any warnings, display them
        if (response.data.warnings && response.data.warnings.length > 0) {
          setSendingStatus(
            (prev) =>
              `${prev}\n\nWarnings sent:\n${response.data.warnings.join("\n")}`
          );
        }
      } else {
        setSendingStatus("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSendingStatus(
        `Failed to send message: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Farm Status Report</h1>
        <button
          className="send-message-btn"
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Status Report"}
        </button>
        {sendingStatus && (
          <div
            className={`status-message ${
              sendingStatus.includes("success") ? "success" : "error"
            }`}
          >
            {sendingStatus}
          </div>
        )}
      </div>

      <div className="report-content">
        <h2>Report Overview</h2>
        <p>
          This report provides real-time updates about your farm's conditions
          including:
        </p>
        <ul>
          <li>Water Level Status</li>
          <li>UV Level Readings</li>
          <li>NPK (Nitrogen, Phosphorus, Potassium) Levels</li>
        </ul>
        <p>
          Click the "Send Status Report" button above to receive these updates
          via SMS.
        </p>
      </div>
    </div>
  );
};

export default Report;
