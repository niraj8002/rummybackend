const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpModal = require("../models/otp.modal");

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      mobile,
      email,
      password,
      confirmPassword,
      referralCode,
      termsAccepted,
      is18Confirmed,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email or Mobile already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      mobile,
      email,
      password: hashedPassword,
      referralCode,
      termsAccepted,
      is18Confirmed,
    });

    res
      .status(201)
      .json({ status: true, message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailOrMobile, password, otp } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (otp) {
      const findOtp = await otpModal.findOne({ mobile: user.mobile });
      if (!findOtp || findOtp.otp !== otp) {
        return res.status(400).json({ message: "Invaild OTP" });
      }
      const now = new Date();
      const otpAge = (now - new Date(findOtp.createdAt)) / 1000;
      if (otpAge > 300) {
        return res.status(400).json({ message: "OTP expired" });
      }
      await otpModal.deleteOne({ mobile: user.mobile });
    } else {
      if (!password) {
        return res.status(400).json({ message: "Password is requried" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "invaild password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { registerUser, loginUser };
