const jwt = require("jsonwebtoken");

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = { signToken };

