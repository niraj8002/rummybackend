const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUser,
} = require("../controllers/authController");
const { sendOtp, verifyOtp } = require("../controllers/otp.controller");
const router = express.Router();

router.get("/get_all_user", getAllUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
