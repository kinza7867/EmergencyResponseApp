const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const emergencyContactRoutes = require("./routes/emergencyContactRoutes");
const app = express();




// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/emergency-contacts", emergencyContactRoutes);
// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Emergency Response API is running 🚑",
  });
});

module.exports = app;
