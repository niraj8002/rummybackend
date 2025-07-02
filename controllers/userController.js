
const User = require("../models/userModel");

const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { updateUser };
