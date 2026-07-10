const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

// Register
router.post("/register", registerValidator, registerUser);

// Login
router.post("/login", loginValidator, loginUser);

module.exports = router;