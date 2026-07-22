const User = require("../models/User");

const registerPushToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;

    if (!expoPushToken) {
      return res.status(400).json({
        success: false,
        message: "Expo push token is required.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { expoPushToken },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Push token registered successfully.",
      data: user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  registerPushToken,
};