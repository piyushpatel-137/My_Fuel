const SibApiV3Sdk = require("sib-api-v3-sdk");

const sendOtpEmail = async ({ email, otp, purpose }) => {
  const client = SibApiV3Sdk.ApiClient.instance;

  const apiKeyInstance = client.authentications["api-key"];
  apiKeyInstance.apiKey = process.env.BREVO_API_KEY;

  const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

  const title =
    purpose === "reset"
      ? "Reset your MyFuel password"
      : "Verify your MyFuel account";

  try {
    await tranEmailApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: "MyFuel",
      },
      to: [{ email }],
      subject: title,
      htmlContent: `
        <h2>${title}</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
      `,
    });

    return { sent: true };
  } catch (err) {
    console.log("Mail error:", err.message);
    console.log(`[DEV OTP] ${email} -> ${otp}`);
    return { sent: false };
  }
};

module.exports = { sendOtpEmail };