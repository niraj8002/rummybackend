const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { sendOtp, verifyOtp } = require("../controllers/otp.controller");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
