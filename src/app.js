const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middleware/error-handler");

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => res.json({
  success: true,
  service: "Kiryana Store Management API",
  version: "1.0.0",
}));
app.get("/health", (req, res) => res.status(200).json({ success: true, status: "ok" }));
app.use("/api/v1", routes);
app.use((req, res) => res.status(404).json({ success: false, error: "Route not found" }));
app.use(errorHandler);

module.exports = app;
