const express    = require("express");
const jwt        = require("jsonwebtoken");
const crypto     = require("crypto");
const User       = require("../models/User");
const Data       = require("../models/Data");
const protect    = require("../middleware/auth");
const sendEmail  = require("../utils/sendEmail");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// ── REGISTER ──
// ── REGISTER — send verification code first ──
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Block if already verified
    const existingVerified = await User.findOne({ email, isVerified: true });
    if (existingVerified)
      return res.status(400).json({ message: "Email already registered" });

    // Generate 6-digit code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = Date.now() + 10 * 60 * 1000;

    // Update existing unverified user OR create new one
    let user = await User.findOne({ email, isVerified: false });
    if (user) {
      user.name             = name;
      user.password         = password;
      user.resetToken       = verifyCode;
      user.resetTokenExpiry = codeExpiry;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password,
        isVerified:       false,
        resetToken:       verifyCode,
        resetTokenExpiry: codeExpiry,
      });
    }

await sendEmail({
  to:   email,
  code: verifyCode,
});

    res.status(200).json({ message: "Verification code sent", email });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── VERIFY EMAIL CODE ──
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).json({ message: "Email and code are required" });

    const user = await User.findOne({
      email,
      resetToken:       code,
      resetTokenExpiry: { $gt: Date.now() },
      isVerified:       false,
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired code" });

    // Mark as verified and clear code
    user.isVerified       = true;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    // Create data record
    const existingData = await Data.findOne({ userId: user._id });
    if (!existingData) {
      await Data.create({ userId: user._id });
    }

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        settings: user.settings,
      },
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── LOGIN ──
// ── LOGIN ──
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Block unverified users
    if (!user.isVerified)
      return res.status(400).json({ message: "Please verify your email first" });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      token: generateToken(user._id),
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        settings: user.settings,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET PROFILE ──
router.get("/me", protect, async (req, res) => {
  res.json({
    id:       req.user._id,
    name:     req.user.name,
    email:    req.user.email,
    settings: req.user.settings,
  });
});

// ── UPDATE PROFILE (name + email) ──
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    if (name) user.name = name;
    await user.save();

    res.json({
      id:       user._id,
      name:     user.name,
      email:    user.email,
      settings: user.settings,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── UPDATE SETTINGS ──
router.put("/settings", protect, async (req, res) => {
  try {
    const user    = await User.findById(req.user._id);
    user.settings = { ...user.settings.toObject(), ...req.body };
    await user.save();
    res.json({ settings: user.settings });
  } catch (err) {
    console.error("Settings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── CHANGE PASSWORD (logged in) ──
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user  = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);

    if (!match)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── FORGOT PASSWORD — send reset email ──
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user)
      return res.json({ message: "If that email exists, a reset link has been sent" });

    // Generate reset token
    const resetToken  = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetToken       = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to:      user.email,
      subject: "Reset Your Expense Tracker Password",
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #6366f1; margin-bottom: 8px;">Reset Your Password</h2>
          <p style="color: #64748b; margin-bottom: 24px;">
            You requested a password reset for your Expense Tracker account.
            Click the button below to set a new password.
          </p>
          <a href="${resetUrl}"
            style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">
            Reset Password
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
            This link expires in 15 minutes. If you didn't request this, ignore this email.
          </p>
          <p style="color: #94a3b8; font-size: 12px;">
            Or copy this link: <br/>${resetUrl}
          </p>
        </div>
      `,
    });

    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

// ── RESET PASSWORD — with token ──
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetToken:       hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Reset link is invalid or has expired" });

    user.password         = password;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;