const axios = require("axios");

const sendPushNotification = async (expoPushToken, title, body) => {
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title,
      body,
    });

    console.log("Push notification sent successfully.");
  } catch (error) {
    console.error("Push notification failed:", error.message);
  }
};

module.exports = {
  sendPushNotification,
};