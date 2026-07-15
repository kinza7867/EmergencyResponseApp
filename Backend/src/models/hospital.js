const mongoose = require("mongoose");
// Hospital Schema
// Stores hospital information required for emergency response,
// including location details and emergency service availability.

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },
// Geographic latitude used for nearby hospital search
    latitude: {
      type: Number,
      required: true,
    },
    // Geographic longitude used for distance calculation

    longitude: {
      type: Number,
      required: true,
    },
 // Stores emergency facilities available in hospital
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hospital", hospitalSchema);