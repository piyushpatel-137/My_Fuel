import { Fuel, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import Notice from "../components/Notice.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Signup = () => {
  const { completeSignup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ tone: "", text: "" });
  const [devOtp, setDevOtp] = useState("");
  const [form, setForm] = useState({
    email: "",
    otp: "",
    firstName: "",
    lastName: "",
    username: "",
    dob: "",
    password: ""
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

const sendOtp = async (event) => {
  event.preventDefault();
  setLoading(true);
  setNotice({ tone: "", text: "" });

  try {
  const { data } = await api.post("/api/auth/signup/send-otp", { email: form.email });

  setNotice({ tone: "success", text: data.message });
  setStep(2);
} catch (err) {
  setNotice({ tone: "error", text: getErrorMessage(err) });
}
finally {
    setLoading(false);
  }
};

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice({ tone: "", text: "" });
    try {
      await completeSignup(form);
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err) });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card auth-card-wide">
        <div className="brand-lockup">
          <div className="brand-mark"><Fuel size={24} /></div>
          <div>
            <h1>MyFuel</h1>
            <p>Create your verified account</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <div className={`step-pill ${step === 1 ? "step-active" : ""}`}><Mail size={16} /> Email</div>
          <div className={`step-pill ${step === 2 ? "step-active" : ""}`}><ShieldCheck size={16} /> Verify</div>
        </div>

        <div className="mt-5 space-y-3">
          <Notice tone={notice.tone || "info"}>{notice.text}</Notice>
        </div>

        {step === 1 ? (
          <form onSubmit={sendOtp} className="mt-6 space-y-4">
            <label className="field-label">
              Email
              <input className="field-input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </label>
            <button className="primary-btn w-full" disabled={loading}>
              <Mail size={18} />
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="field-label sm:col-span-2">
              OTP
              <input className="field-input tracking-[0.35em]" value={form.otp} onChange={(e) => update("otp", e.target.value)} maxLength={6} required />
            </label>
            <label className="field-label">
              First name
              <input className="field-input" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
            </label>
            <label className="field-label">
              Last name
              <input className="field-input" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
            </label>
            <label className="field-label">
              Username
              <input className="field-input" value={form.username} onChange={(e) => update("username", e.target.value)} required />
            </label>
            <label className="field-label">
              Date of birth
              <input className="field-input" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} required />
            </label>
            <label className="field-label sm:col-span-2">
              Password
              <input className="field-input" type="password" minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} required />
            </label>
            <button className="primary-btn sm:col-span-2" disabled={loading}>
              <UserPlus size={18} />
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account? <Link className="font-semibold text-sky-700" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

