// Week-03/createEmergencyRequest API
//getMyEmergencyRequests API
//getEmergencyRequestById API
//updateEmergencyStatus API
const express = require("express");

const router = express.Router();

const {
  createEmergencyRequest,
  getMyEmergencyRequests,
  getEmergencyRequestById,
  updateEmergencyStatus,
  getEmergencyLocation,
  selectHospital,
  notifyEmergencyContacts,
} = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");

const {
  validateEmergencyRequest,
} = require("../validators/emergencyValidator");

// Create Emergency Request
router.post(
  "/",
  protect,
  validateEmergencyRequest,
  createEmergencyRequest
);

// Get Logged-in User Requests
router.get(
  "/my-requests",
  protect,
  getMyEmergencyRequests
);

// Get Single Request
router.get(
  "/:id",
  protect,
  getEmergencyRequestById
);

// Update Status
router.patch(
  "/:id/status",
  protect,
  updateEmergencyStatus
);

router.get(
  "/:id/location",
  protect,
  getEmergencyLocation
);
router.patch(
  "/:id/hospital",
  protect,
  selectHospital
);
router.post(
  "/:id/notify",
  protect,
  notifyEmergencyContacts
);
module.exports = router;