const Hospital = require("../models/hospital");

// Calculate distance using Haversine Formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in KM

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// GET /api/hospitals?lat=33.68&lng=73.04
const getHospitals = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required.",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const hospitals = await Hospital.find();

    const hospitalsWithDistance = hospitals.map((hospital) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        hospital.latitude,
        hospital.longitude
      );

      return {
        ...hospital.toObject(),
        distance: Number(distance.toFixed(2)),
      };
    });

    hospitalsWithDistance.sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      success: true,
      count: hospitalsWithDistance.length,
      data: hospitalsWithDistance,
    });

  } catch (error) {
    console.error("Hospital Fetch Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals.",
    });
  }
};

module.exports = {
  getHospitals,
};