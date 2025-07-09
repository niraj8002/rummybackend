const express = require("express");
const { updateUser, getProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.put("/update", authMiddleware, updateUser);
router.get("/getprofile", authMiddleware, getProfile);

module.exports = router;
