const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  registerPushToken,
} = require("../controllers/notificationController");

router.post("/register-token", protect, registerPushToken);

module.exports = router;