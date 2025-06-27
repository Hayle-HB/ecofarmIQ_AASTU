const express = require("express");
const router = express.Router();

router.get("/send", async (req, res) => {
  try {
    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    const message = await client.messages.create({
      body: "TEST MESSAGE",
      from: "+14432679390",
      to: "+251962484250",
    });

    res.json({
      success: true,
      message: "SMS sent successfully",
      messageId: message.sid,
    });
  } catch (error) {
    console.error("SMS error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
