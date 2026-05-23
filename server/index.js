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

// ── CACHED MONGODB CONNECTION ──
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    mongoose.set("bufferCommands", false);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    isConnected = false;
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
}

// ── MIDDLEWARE TO ENSURE DB CONNECTION ──
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ── ROUTES ──
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);

// ── HEALTH CHECK ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running", dbConnected: isConnected });
});

// ── EXPORT FOR VERCEL ──
module.exports = app;

// ── START LOCAL SERVER ──
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  });
}