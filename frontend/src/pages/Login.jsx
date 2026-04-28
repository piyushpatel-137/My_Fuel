import { Fuel, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/axios";
import Notice from "../components/Notice.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
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
            <p>Sign in to your tracker</p>
          </div>
        </div>

        <Notice tone="error">{error}</Notice>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="field-label">
            Email
            <input className="field-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="field-label">
            Password
            <input className="field-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <button className="primary-btn w-full" disabled={loading}>
            <LogIn size={18} />
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link className="text-sky-700 hover:text-sky-900" to="/forgot-password">Forgot password?</Link>
          <Link className="font-semibold text-sky-700 hover:text-sky-900" to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

