const axios = require("axios");
const otpModal = require("../models/otp.modal");
const userModel = require("../models/userModel");

const sendOtpService = async (mobile, forLogin = false) => {
  const existingUser = await userModel.findOne({ mobile });
  if (!forLogin && existingUser) {
    return {
      success: false,
      message: "User already exists with this mobile number.",
    };
  }
  if (forLogin && !existingUser) {
    return {
      success: false,
      message: "User not registered with this mobile number.",
    };
  }
  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();
  const otp = generateOtp();

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
      message: `Your OTP is 123456. Do not share it. FinUnique Small Private Limited. https://rummy-eight.vercel.app/`,
      language: "english",
      numbers: mobile,
    },
  };

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
