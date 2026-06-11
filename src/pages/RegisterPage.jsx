import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp  } from "../context/AppContext";
import { registerAPI } from "../services/api";
import {
  LayoutDashboard, Mail, Lock, User,
  Eye, EyeOff, ArrowRight,
} from "lucide-react";

function RegisterPage() {

  const navigate           = useNavigate();
  const { loginWithToken } = useAuth();
  const { loadData }       = useApp();

  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const result = await registerAPI({ name: form.name, email: form.email, password: form.password });
    if (result.token) {
      loginWithToken(result.token, result.user);
      await loadData();
      navigate("/dashboard");
    } else {
      setError(result.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo" onClick={() => navigate("/")}>
            <LayoutDashboard size={28} />
            <span>Expense <b>Tracker</b></span>
          </div>
          <h1>Start your financial journey today.</h1>
          <p>Join thousands of users who track smarter and spend wiser.</p>
          <div className="auth-left-features">
            <div className="auth-feature">✅ Free forever — no credit card</div>
            <div className="auth-feature">✅ AI auto-categorizes expenses</div>
            <div className="auth-feature">✅ Budget alerts and insights</div>
            <div className="auth-feature">✅ Export to CSV and PDF</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">

          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Free forever — no credit card required</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">

            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-wrap">
                <User size={15} className="auth-input-icon" />
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

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
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPw ? "text" : "password"}
                  name="confirm-password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? "Creating account..."
                : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default RegisterPage;