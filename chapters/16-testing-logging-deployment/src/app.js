const express = require("express"); const cors = require("cors"); const morgan = require("morgan");
const logger = require("./lib/logger");
const app = express(); app.use(cors()); app.use(morgan("dev")); app.use(express.json());
app.get("/", (req, res) => res.json({ message: "Kiryana Store API 🏪", chapter: "16 — Testing & Deployment" }));
app.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.statusCode || 500).json({ success: false, error: err.message });
});
module.exports = app;
