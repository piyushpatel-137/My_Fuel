const express = require("express");
const {
  sendSignupOtp,
  verifySignupOtp,
  login,
  sendResetOtp,
  resetPassword,
  me
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup/send-otp", sendSignupOtp);
router.post("/signup/verify", verifySignupOtp);
router.post("/login", login);
router.post("/forgot/send-otp", sendResetOtp);
router.post("/forgot/reset", resetPassword);
router.get("/me", protect, me);

module.exports = router;

