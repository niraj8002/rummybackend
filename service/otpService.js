const axios = require("axios");
const otpModal = require("../models/otp.modal");
const userModel = require("../models/userModel");

const sendOtpService = async (mobile, email, forLogin = false) => {
  console.log(forLogin);

  const existingUserByMobile = await userModel.findOne({ mobile });
  const existingUserByEmail = await userModel.findOne({ email });

  if (!forLogin) {
    if (existingUserByMobile || existingUserByEmail) {
      return {
        success: false,
        message: existingUserByMobile
          ? "User already exists with this mobile number."
          : "User already exists with this email address.",
      };
    }
  }

  // Generate OTP
  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();
  const otp = generateOtp();

  // Fast2SMS Config
  const config = {
    method: "POST",
    url: process.env.FAST2SMS_API,
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    data: {
      route: "q",
      sender_id: "TXTIND",
      message: `Your OTP is ${otp}. Do not share it. FinUnique Small Private Limited. https://rummy-eight.vercel.app/`,
      language: "english",
      numbers: mobile,
    },
  };

  try {
    const response = await axios.request(config);

    if (response.data.return === true) {
      await otpModal.findOneAndUpdate(
        { mobile },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
      );
      return { success: true, message: "OTP sent successfully" };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to send OTP",
      };
    }
  } catch (error) {
    console.error("Send OTP Error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send OTP",
    };
  }
};

const verifyOtpService = async (mobile, otp) => {
  const record = await otpModal.findOne({ mobile });
  if (!record) {
    return { success: false, message: "OTP expired or not found." };
  }
  const isMatch = record.otp == otp;
  if (!isMatch) {
    return { success: false, message: "Invalid OTP." };
  }
  await otpModal.deleteOne({ mobile });
  return { success: true, message: "OTP verified successfully." };
};

module.exports = {
  sendOtpService,
  verifyOtpService,
};
