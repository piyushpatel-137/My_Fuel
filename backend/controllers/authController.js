const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { sendOtpEmail } = require("../config/mail");
const asyncHandler = require("../utils/asyncHandler");
const generateOtp = require("../utils/generateOtp");
const { signToken } = require("../utils/jwt");
const { toSqlDateTime } = require("../utils/date");

const OTP_MINUTES = 10;

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  username: user.username,
  dob: user.dob,
  isVerified: Boolean(user.is_verified)
});

const createOtp = async (email, purpose) => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = toSqlDateTime(Date.now() + OTP_MINUTES * 60 * 1000);

  await pool.query("DELETE FROM otps WHERE email = ? AND purpose = ?", [email, purpose]);
  await pool.query(
    "INSERT INTO otps (email, otp_hash, purpose, expires_at) VALUES (?, ?, ?, ?)",
    [email, otpHash, purpose, expiresAt]
  );

  const mail = await sendOtpEmail({ email, otp, purpose });
  return { otp, mail };
};

const verifyOtp = async (email, otp, purpose, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT id, otp_hash
     FROM otps
     WHERE email = ? AND purpose = ? AND consumed_at IS NULL AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [email, purpose]
  );

  if (!rows.length) {
    return null;
  }

  const isValid = await bcrypt.compare(String(otp || ""), rows[0].otp_hash);
  return isValid ? rows[0] : null;
};

const sendSignupOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const { otp, mail } = await createOtp(email, "signup");

  res.json({
  message: mail.sent ? "OTP sent to email" : "OTP generated in server console",
  devOtp: otp
});
});

const verifySignupOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { otp, password, firstName, lastName, username, dob } = req.body;

  if (!email || !otp || !password || !firstName || !lastName || !username || !dob) {
    return res.status(400).json({ message: "All signup fields are required" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const validOtp = await verifyOtp(email, otp, "signup", connection);
    if (!validOtp) {
      await connection.rollback();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username.trim()]
    );
    if (existing.length) {
      await connection.rollback();
      return res.status(409).json({ message: "Email or username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await connection.query(
      `INSERT INTO users (email, password, first_name, last_name, username, dob, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [email, passwordHash, firstName.trim(), lastName.trim(), username.trim(), dob]
    );
    await connection.query("UPDATE otps SET consumed_at = NOW() WHERE id = ?", [validOtp.id]);

    await connection.commit();

    const user = {
      id: result.insertId,
      email,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim(),
      dob,
      is_verified: 1
    };

    res.status(201).json({
      message: "Account created",
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email or username already exists" });
    }
    throw error;
  } finally {
    connection.release();
  }
});

const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  if (!rows.length) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    token: signToken(user),
    user: publicUser(user)
  });
});

const sendResetOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (!users.length) {
    return res.status(404).json({ message: "No account found with this email" });
  }

  const { otp, mail } = await createOtp(email, "reset");

  res.json({
    message: mail.sent ? "Reset OTP sent to email" : "Reset OTP generated in server console",
    devOtp: mail.sent ? undefined : otp
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const validOtp = await verifyOtp(email, otp, "reset", connection);
    if (!validOtp) {
      await connection.rollback();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await connection.query("UPDATE users SET password = ? WHERE email = ?", [passwordHash, email]);
    await connection.query("UPDATE otps SET consumed_at = NOW() WHERE id = ?", [validOtp.id]);
    await connection.commit();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = {
  sendSignupOtp,
  verifySignupOtp,
  login,
  sendResetOtp,
  resetPassword,
  me
};

