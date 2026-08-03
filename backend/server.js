const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

// Security middleware
app.use(helmet());

// CORS - restrict to known origins (configurable via env)
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "1mb" }));

// Rate limiting - protect auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // max 50 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", profileRoutes);
app.use("/api", uploadLimiter, resumeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Not allowed by CORS" });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large (max 5MB)" });
  }

  if (err.message === "Only PDF files allowed") {
    return res.status(400).json({ message: "Only PDF files allowed" });
  }

  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});