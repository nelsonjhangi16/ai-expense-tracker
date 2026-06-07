import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp  } from "../context/AppContext";
import { registerAPI, verifyEmailAPI } from "../services/api";
import {
  LayoutDashboard, Mail, Lock, User,
  Eye, EyeOff, ArrowRight, ShieldCheck,
} from "lucide-react";

function RegisterPage() {

  const navigate     = useNavigate();
  const { loginWithToken } = useAuth();
  const { loadData } = useApp();

  const [step,    setStep]    = useState("register"); // "register" | "verify"
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [code,    setCode]    = useState(["", "", "", "", "", ""]);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  // ── STEP 1 — REGISTER ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const result = await registerAPI({ name: form.name, email: form.email, password: form.password });
    if (result.message === "Verification code sent") {
      setStep("verify");
      setSuccess(`Verification code sent to ${form.email}`);
    } else {
      setError(result.message || "Registration failed");
    }
    setLoading(false);
  };

  // ── STEP 2 — VERIFY CODE ──
  const handleVerify = async () => {
    setError("");
    const fullCode = code.join("");
    if (fullCode.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true);
    const result = await verifyEmailAPI(form.email, fullCode);
  if (result.token) {
  loginWithToken(result.token, result.user);
  await loadData();
  navigate("/dashboard");
} else {
      setError(result.message || "Invalid code");
    }
    setLoading(false);
  };

  // ── CODE INPUT HANDLER ──
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    // auto focus next
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pasted.split("").forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    document.getElementById(`code-${Math.min(pasted.length, 5)}`)?.focus();
  };

  // ── RESEND CODE ──
  const handleResend = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    const result = await registerAPI({ name: form.name, email: form.email, password: form.password });
    if (result.message === "Verification code sent") {
      setSuccess("New code sent to your email");
      setCode(["", "", "", "", "", ""]);
    } else {
      setError(result.message || "Failed to resend");
    }
    setLoading(false);
  };

  // ── VERIFY SCREEN ──
  if (step === "verify") {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-logo" onClick={() => navigate("/")}>
              <LayoutDashboard size={28} />
              <span>Expense <b>Tracker</b></span>
            </div>
            <h1>Almost there!</h1>
            <p>We sent a 6-digit code to your email. Enter it to activate your account.</p>
            <div className="auth-left-features">
              <div className="auth-feature">✅ Check your inbox</div>
              <div className="auth-feature">✅ Check spam folder too</div>
              <div className="auth-feature">✅ Code expires in 10 minutes</div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-box">

            <div className="auth-form-header">
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: "rgba(99,102,241,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <ShieldCheck size={28} color="#6366f1" />
              </div>
              <h2>Verify your email</h2>
              <p>Enter the 6-digit code sent to <b>{form.email}</b></p>
            </div>

            {error   && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            {/* CODE INPUTS */}
            <div style={{
              display: "flex", gap: 10, justifyContent: "center", margin: "24px 0",
            }}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onPaste={handleCodePaste}
                  style={{
                    width: 48, height: 56,
                    textAlign: "center",
                    fontSize: 22, fontWeight: 700,
                    borderRadius: 12,
                    border: `2px solid ${digit ? "#6366f1" : "var(--border)"}`,
                    background: "var(--card-bg)",
                    color: "var(--text)",
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                />
              ))}
            </div>

            <button
              className="auth-submit-btn"
              onClick={handleVerify}
              disabled={loading || code.join("").length !== 6}
            >
              {loading
                ? "Verifying..."
                : <><span>Verify & Continue</span><ArrowRight size={16} /></>}
            </button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <p className="auth-switch">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={loading}
                  style={{
                    background: "none", border: "none",
                    color: "#6366f1", fontWeight: 600,
                    cursor: "pointer", fontSize: 14,
                  }}
                >
                  Resend code
                </button>
              </p>
              <p className="auth-switch" style={{ marginTop: 8 }}>
                <button
                  onClick={() => { setStep("register"); setError(""); setSuccess(""); }}
                  style={{
                    background: "none", border: "none",
                    color: "var(--text-secondary)", cursor: "pointer", fontSize: 13,
                  }}
                >
                  ← Back to register
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── REGISTER SCREEN ──
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
                ? "Sending verification code..."
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