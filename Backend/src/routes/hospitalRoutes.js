const express = require("express");
const router = express.Router();

const { getHospitals } = require("../controllers/hospitalController");
const { protect } = require("../middleware/authMiddleware");

// Protected route
router.get("/", protect, getHospitals);

module.exports = router;