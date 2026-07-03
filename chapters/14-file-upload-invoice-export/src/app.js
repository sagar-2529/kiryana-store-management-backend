const express = require("express"); const cors = require("cors"); const morgan = require("morgan");
const path = require("path"); const routes = require("./routes");
const app = express(); app.use(cors()); app.use(morgan("dev")); app.use(express.json());
// Serve uploaded files as static
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/", (req, res) => res.json({ message: "Kiryana Store API 🏪", chapter: "14 — Uploads & Exports" }));
app.use("/api/v1", routes);
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ success: false, error: "File too large (max 5MB)" });
  res.status(err.statusCode || 500).json({ success: false, error: err.message });
});
module.exports = app;
