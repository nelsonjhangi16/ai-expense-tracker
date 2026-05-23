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

// ── MONGODB CONNECTION — Vercel safe ──
const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands:          false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
    };

    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("❌ MongoDB error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ── CONNECT BEFORE EVERY REQUEST ──
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ── ROUTES ──
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);

// ── HEALTH CHECK ──
app.get("/api/health", (req, res) => {
  res.json({
    status:      "ok",
    message:     "Server is running",
    dbConnected: mongoose.connection.readyState === 1,
  });
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