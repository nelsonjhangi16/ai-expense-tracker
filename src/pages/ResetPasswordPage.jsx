import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPasswordAPI } from "../services/api";
import { LayoutDashboard, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

function ResetPasswordPage() {

  const { token }  = useParams();
  const navigate   = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm)     { setError("Passwords do not match"); return; }
    if (password.length < 6)      { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const data = await resetPasswordAPI(token, password);
    if (data.message === "Password reset successful") {
      setSuccess(true);
    } else {
      setError(data.message || "Reset failed. Link may have expired.");
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
          <h1>Set a new password.</h1>
          <p>Choose a strong password to keep your account secure.</p>
          <div className="auth-left-features">
            <div className="auth-feature">✅ Minimum 6 characters</div>
            <div className="auth-feature">✅ Use letters, numbers, symbols</div>
            <div className="auth-feature">✅ Don't reuse old passwords</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">

          {success ? (

            <div className="auth-success-state">
              <div className="auth-success-icon">
                <CheckCircle size={40} color="#22c55e" />
              </div>
              <h2>Password reset!</h2>
              <p>Your password has been updated successfully. You can now sign in with your new password.</p>
              <button
                className="auth-submit-btn"
                onClick={() => navigate("/login")}
                style={{ marginTop: 20 }}
              >
                <span>Sign In</span> <ArrowRight size={16} />
              </button>
            </div>

          ) : (

            <>
              <div className="auth-form-header">
                <h2>Create new password</h2>
                <p>Enter and confirm your new password below</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">

                <div className="auth-field">
                  <label>New Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label>Confirm New Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Repeat new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Resetting..." : <><span>Reset Password</span><ArrowRight size={16} /></>}
                </button>

              </form>

              <p className="auth-switch">
                <Link to="/login">Back to Sign In</Link>
              </p>
            </>

          )}

        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;