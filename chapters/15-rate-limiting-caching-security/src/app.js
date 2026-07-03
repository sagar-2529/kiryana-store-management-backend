// ============================================================
// Chapter 15 — App with Security Stack
// ============================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// ── Security Middleware ─────────────────────────────────────

// Helmet — sets various HTTP security headers
app.use(helmet());

// CORS — configure properly for production
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// HPP — protect against HTTP parameter pollution
app.use(hpp());

// Morgan — request logging
app.use(morgan("dev"));

// Body parsing with size limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Rate Limiters ───────────────────────────────────────────

// Global rate limit: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later" },
});
app.use(globalLimiter);

// Auth rate limit: 5 login attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Too many login attempts. Try again in 15 minutes." },
});
app.use("/api/v1/auth/login", authLimiter);

// ── Routes ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Kiryana Store API 🏪",
    chapter: "15 — Security & Caching",
    security: ["helmet", "cors", "hpp", "rate-limit"],
  });
});

// ── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ success: false, error: err.message });
});

module.exports = app;
