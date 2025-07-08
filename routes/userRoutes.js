const express = require("express");
const { updateUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { getProfile } = require("../controllers/authController");

const router = express.Router();
router.put("/update", authMiddleware, updateUser);
router.get("/getprofile", authMiddleware, getProfile);

module.exports = router;
