const Mongoose = require("mongoose");
const User = require("../models/userModel");

const getProfile = async (req, res) => {
  const userId = new Mongoose.Types.ObjectId(req.user.id);

  const user = await User.findOne({ _id: userId }).select("-password");
  if (!user) {
    return res.json({
      message: "user not found",
    });
  }
  return res.status(200).json({
    message: "user get",
    user,
  });
};
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    res.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { updateUser, getProfile };
