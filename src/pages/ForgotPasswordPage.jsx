import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPasswordAPI } from "../services/api";
import { LayoutDashboard, Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

function ForgotPasswordPage() {

  const navigate = useNavigate();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPasswordAPI(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
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
          <h1>Forgot your password?</h1>
          <p>No worries — enter your email and we'll send you a reset link within seconds.</p>
          <div className="auth-left-features">
            <div className="auth-feature">✅ Reset link valid for 15 minutes</div>
            <div className="auth-feature">✅ Secure one-time link</div>
            <div className="auth-feature">✅ Check spam folder if not received</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">

          {sent ? (

            /* ── SUCCESS STATE ── */
            <div className="auth-success-state">
              <div className="auth-success-icon">
                <CheckCircle size={40} color="#22c55e" />
              </div>
              <h2>Check your email</h2>
              <p>
                We sent a password reset link to <b>{email}</b>.
                The link expires in 15 minutes.
              </p>
              <p className="auth-success-hint">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  className="auth-resend-btn"
                  onClick={() => setSent(false)}
                >
                  try again
                </button>
              </p>
              <Link to="/login" className="auth-back-btn">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>

          ) : (

            /* ── FORM ── */
            <>
              <div className="auth-form-header">
                <h2>Reset password</h2>
                <p>Enter your email and we'll send you a reset link</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label>Email Address</label>
                  <div className="auth-input-wrap">
                    <Mail size={15} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Sending..." : <><span>Send Reset Link</span><ArrowRight size={16} /></>}
                </button>

              </form>

              <p className="auth-switch">
                Remember your password? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;