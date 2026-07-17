const express = require("express");
const router = express.Router();
router.use((req, res, next) => {
  console.log("Emergency Contact Route Hit:", req.method, req.originalUrl);
  next();
});

const { protect } = require("../middleware/authMiddleware");

const {
  createEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact,
} = require("../controllers/emergencyContactController");

router.post("/", protect, createEmergencyContact);

router.get("/", protect, getEmergencyContacts);

router.put("/:id", protect, updateEmergencyContact);

router.delete("/:id", protect, deleteEmergencyContact);

module.exports = router;