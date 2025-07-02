
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  referralCode: { type: String },
  termsAccepted: { type: Boolean, required: true },
  is18Confirmed: { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
