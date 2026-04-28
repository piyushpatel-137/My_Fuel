const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    const [rows] = await pool.query(
      "SELECT id, email, first_name, last_name, username, dob, is_verified FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = { protect };

