const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.get("/", (req, res) => res.json({ message: "Kiryana Store API 🏪", chapter: "08 — Input Validation" }));
app.use("/api/v1", routes);
app.use((req, res) => res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.url}` }));
app.use((err, req, res, next) => {
  if (err.code === "P2002") return res.status(409).json({ success: false, error: "Duplicate entry" });
  if (err.code === "P2025") return res.status(404).json({ success: false, error: "Not found" });
  res.status(500).json({ success: false, error: err.message });
});
module.exports = app;
