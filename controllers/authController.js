const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpModal = require("../models/otp.modal");

//get all user  for admin
// Get all users for admin
const getAllUser = async (req, res) => {
  try {
    const allUsers = await User.find().select("-password"); 

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      users: allUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

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

    const userEmailExists = await User.findOne({ email });
    if (userEmailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userNumberExists = await User.findOne({ mobile });
    if (userNumberExists) {
      return res
        .status(400)
        .json({ message: "Mobile number already registered" });
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

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      user: userObj,
    });
  } catch (error) {
    console.error("Register Error:", error);
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
      status: true,
      message: "Login successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { registerUser, loginUser, getAllUser };
