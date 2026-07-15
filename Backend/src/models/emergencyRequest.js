//Week-3/createEmergencyRequest API


const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    emergencyType: {
      type: String,
      required: true,
      enum: ["medical", "fire", "police", "accident", "other"],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
  label: {
    type: String,
    default: "",
  },

  latitude: {
    type: Number,
    required: true,
  },

  longitude: {
    type: Number,
    required: true,
  },
},
hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    default: null,
},

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "dispatched",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);