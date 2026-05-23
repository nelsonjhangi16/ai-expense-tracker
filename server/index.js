const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");

const app = express();

// ── CORS ──
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.use(express.json());

// ── ROUTES ──
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);

// ── HEALTH CHECK ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// ── CONNECT DB ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

// ── EXPORT FOR VERCEL ──
module.exports = app;

// ── START LOCAL SERVER ──
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}