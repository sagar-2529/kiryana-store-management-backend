const express = require("express");
const routes = require("./routes");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "Kiryana Store API 🏪", chapter: "05 — CRUD Category & Product" });
});
app.use("/api/v1", routes);
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.url}` });
});
module.exports = app;
