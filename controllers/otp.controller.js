const { sendOtpService, verifyOtpService } = require("../service/otpService");

const sendOtp = async (req, res) => {
  const { mobile, email, forLogin } = req.body;
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }
  try {
    const result = await sendOtpService(mobile, email, forLogin);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP are required" });
  }
  try {
    const result = await verifyOtpService(mobile, otp);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { sendOtp, verifyOtp };
