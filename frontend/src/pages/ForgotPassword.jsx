import { Fuel, KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Notice from "../components/Notice.jsx";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [notice, setNotice] = useState({ tone: "", text: "" });
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const sendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice({ tone: "", text: "" });
    try {
      const { data } = await api.post("/auth/forgot/send-otp", { email: form.email });
      setDevOtp(data.devOtp || "");
      setNotice({ tone: "success", text: data.message });
      setStep(2);
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const reset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice({ tone: "", text: "" });
    try {
      await api.post("/auth/forgot/reset", form);
      setNotice({ tone: "success", text: "Password reset successful" });
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand-lockup">
          <div className="brand-mark"><Fuel size={24} /></div>
          <div>
            <h1>MyFuel</h1>
            <p>Reset your password</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Notice tone={notice.tone || "info"}>{notice.text}</Notice>
          {devOtp && <Notice tone="info">Dev OTP: {devOtp}</Notice>}
        </div>

        {step === 1 ? (
          <form onSubmit={sendOtp} className="mt-6 space-y-4">
            <label className="field-label">
              Email
              <input className="field-input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </label>
            <button className="primary-btn w-full" disabled={loading}>
              <Mail size={18} />
              {loading ? "Sending..." : "Send reset OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={reset} className="mt-6 space-y-4">
            <label className="field-label">
              OTP
              <input className="field-input tracking-[0.35em]" value={form.otp} onChange={(e) => update("otp", e.target.value)} maxLength={6} required />
            </label>
            <label className="field-label">
              New password
              <input className="field-input" type="password" minLength={6} value={form.newPassword} onChange={(e) => update("newPassword", e.target.value)} required />
            </label>
            <button className="primary-btn w-full" disabled={loading}>
              <KeyRound size={18} />
              {loading ? "Saving..." : "Reset password"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link className="font-semibold text-sky-700" to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

