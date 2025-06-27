const twilio = require("twilio");

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

/**
 * Sends an SMS message using Twilio
 * @param {string} to - The recipient's phone number (must be in E.164 format)
 * @param {string} message - The message to send
 * @returns {Promise<object>} - Returns a promise that resolves to the message details
 */
async function sendSMS(to, message) {
  try {
    // Validate phone number format
    if (!to.startsWith("+")) {
      throw new Error(
        "Phone number must be in E.164 format (e.g., +251962484250)"
      );
    }

    // Send the message
    const messageDetails = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log("SMS sent successfully:", messageDetails.sid);
    return {
      success: true,
      messageId: messageDetails.sid,
      status: messageDetails.status,
    };
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = sendSMS;
