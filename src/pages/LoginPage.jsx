import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp  } from "../context/AppContext";
import { LayoutDashboard, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginPage() {

  const navigate     = useNavigate();
  const { login }    = useAuth();
  const { loadData } = useApp();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const result = await login(form.email, form.password);

  if (result.success) {
    await loadData();
    navigate("/dashboard");
  } else {
    if (
      result.message === "Invalid email or password" ||
      result.message?.toLowerCase().includes("invalid")
    ) {
      setError("No account found with this email or password is incorrect.");
    } else {
      setError(result.message || "Login failed. Please try again.");
    }
  }

  setLoading(false);
};

  return (
    <div className="auth-page">

      {/* LEFT */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo" onClick={() => navigate("/")}>
            <LayoutDashboard size={28} />
            <span>Expense <b>Tracker</b></span>
          </div>
          <h1>Track smarter,<br />spend wiser.</h1>
          <p>Your AI-powered finance companion. Monitor every dollar, grow every day.</p>
          <div className="auth-left-features">
            <div className="auth-feature">✅ Free forever</div>
            <div className="auth-feature">✅ AI powered insights</div>
            <div className="auth-feature">✅ 60+ currencies</div>
            <div className="auth-feature">✅ Secure JWT auth</div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-form-box">

          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
  <div className="auth-error">
    {error}
    {error.includes("No account found") && (
      <div style={{ marginTop: 8 }}>
        <Link to="/register" style={{ color: "#6366f1", fontWeight: 600, fontSize: 13 }}>
          Create a free account →
        </Link>
      </div>
    )}
  </div>
)}

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">

            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field-header">
                <label>Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>

          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;