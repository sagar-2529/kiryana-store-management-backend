// ============================================================
// Chapter 03 — Express App Configuration
// Middleware setup + route mounting
// ============================================================

const express = require("express");
const routes = require("./routes");

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Info Route ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Kiryana Store API 🏪",
    version: "3.0.0",
    chapter: "03 — Routing & Controllers",
    endpoints: {
      admin: "/api/v1/admin",
      categories: "/api/v1/categories",
    },
  });
});

// ── Mount All API Routes ────────────────────────────────────
// All routes defined in ./routes/index.js are prefixed with /api/v1
app.use("/api/v1", routes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url}`,
  });
});

module.exports = app;
