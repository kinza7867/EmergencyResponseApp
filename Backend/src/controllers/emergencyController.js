// Week-03/createEmergencyRequest API
//getMyEmergencyRequests API
//getEmergencyRequestById API
//updateEmergencyStatus API

const EmergencyRequest = require("../models/EmergencyRequest");
const Hospital = require("../models/hospital");
// Create Emergency Request
const createEmergencyRequest = async (req, res) => {

    console.log("===== CREATE EMERGENCY API =====");
  console.log(req.body);

  try {
    const { emergencyType, notes, location } = req.body;

    const emergencyRequest = await EmergencyRequest.create({
      requestedBy: req.user._id,
      emergencyType,
      notes,
      location,
    });

    res.status(201).json({
      success: true,
      message: "Emergency request created successfully.",
      data: emergencyRequest,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get Logged-in User Requests
// ===============================

const getMyEmergencyRequests = async (req, res) => {
  try {
    const requests = await EmergencyRequest.find({
      requestedBy: req.user._id,
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
// Get Single Emergency Request

const getEmergencyRequestById = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
//getEmergencyLocation

const getEmergencyLocation = async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    res.status(200).json({
      success: true,
      userLocation: emergency.location,

      ambulanceLocation: {
        latitude: 31.5204,
        longitude: 74.3587,
      },

      eta: "8 minutes",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update Emergency Status
// ===============================
const updateEmergencyStatus = async (req, res) => {

  try {

    const { status } = req.body;

    const request = await EmergencyRequest.findById(req.params.id);

    if (!request) {

      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });

    }

    request.status = status;

    await request.save();

    res.status(200).json({
      success: true,
      message: "Emergency status updated successfully.",
      data: request,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
  const selectHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.body;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required.",
      });
    }

    // Check emergency request
    const emergencyRequest = await EmergencyRequest.findById(id);

    if (!emergencyRequest) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found.",
      });
    }

    // Check hospital
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    // Save selected hospital
    emergencyRequest.hospitalId = hospitalId;

    await emergencyRequest.save();

    // Return updated request with hospital details
    const updatedRequest = await EmergencyRequest.findById(id)
      .populate("hospitalId", "name address phone isAvailable");

    return res.status(200).json({
      success: true,
      message: "Hospital selected successfully.",
      data: updatedRequest,
    });

  } catch (error) {
    console.error("Select Hospital Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to select hospital.",
    });
  }
};

module.exports = {
  createEmergencyRequest,
  getMyEmergencyRequests,
  getEmergencyRequestById,
  updateEmergencyStatus,
  getEmergencyLocation,
  selectHospital,
};