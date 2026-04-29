const nodemailer = require("nodemailer");
require("./env");

const isRealCredential = (value) => {
  return value && !value.startsWith("your_") && !value.includes("change_this");
};

const createTransporter = () => {
  if (!isRealCredential(process.env.EMAIL_USER) || !isRealCredential(process.env.EMAIL_PASS)) {
    console.log("❌ Email credentials missing or invalid");
    return null;
  }


  return nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s/g, "")
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4
});
};

const sendOtpEmail = async ({ email, otp, purpose }) => {
  const transporter = createTransporter();
  const title = purpose === "reset" ? "Reset your MyFuel password" : "Verify your MyFuel account";

  if (!transporter) {
    console.log(`[DEV OTP] ${email} -> ${otp}`);
    return { sent: false };
  }

  try {
    await transporter.sendMail({
      from: `"MyFuel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: title,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin:0 0 12px;color:#0369a1;">${title}</h2>
          <p style="color:#334155;">Use this OTP to continue. It is valid for 10 minutes.</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a;background:#e0f2fe;padding:18px;border-radius:10px;text-align:center;">
            ${otp}
          </div>
          <p style="color:#64748b;font-size:13px;margin-top:18px;">If you did not request this, you can ignore this email.</p>
        </div>
      `
    });

    return { sent: true };

  } catch (err) {
    console.log("❌ Mail error:", err.message);
    console.log(`[DEV OTP] ${email} -> ${otp}`);
    return { sent: false };
  }
};

module.exports = { sendOtpEmail };