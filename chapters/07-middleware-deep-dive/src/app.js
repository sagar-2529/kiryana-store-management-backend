// ============================================================
// Chapter 07 — App with Middleware Stack
// ============================================================

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { requestLogger, responseTime } = require("./middleware");
const routes = require("./routes");

const app = express();

// ── Middleware Stack (ORDER MATTERS!) ────────────────────────

// 1. CORS — must be first to handle preflight requests
app.use(cors());

// 2. Response Time — adds X-Response-Time header
app.use(responseTime);

// 3. Morgan — HTTP request logger (third-party)
//    'dev' format: :method :url :status :response-time ms
app.use(morgan("dev"));

// 4. Custom Request Logger — our own detailed logger
app.use(requestLogger);

// 5. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Kiryana Store API 🏪",
    chapter: "07 — Middleware Deep Dive",
    middleware: ["cors", "responseTime", "morgan", "requestLogger", "bodyParser"],
  });
});

app.use("/api/v1", routes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.url}` });
});

// ── Global Error Handler (must be last, must have 4 params) ─
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err.message);

  // Handle Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({ success: false, error: "Duplicate entry" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, error: "Record not found" });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

module.exports = app;
