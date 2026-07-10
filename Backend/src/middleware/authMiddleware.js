//WEEK-3/
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {

    console.log("Authorization Header:", req.headers.authorization);
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      console.log("Authorization Header:", req.headers.authorization);

const parts = req.headers.authorization.trim().split(/\s+/);

console.log("Parts:", parts);

token = parts[1];

console.log("Extracted Token:", token);
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   

    // Find user (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = {
  protect,
};