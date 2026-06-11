// ── REGISTER ──
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, isVerified: true });
    await Data.create({ userId: user._id });

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
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});