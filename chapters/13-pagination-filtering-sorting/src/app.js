const express = require("express"); const cors = require("cors"); const morgan = require("morgan");
const routes = require("./routes");
const app = express(); app.use(cors()); app.use(morgan("dev")); app.use(express.json());
app.get("/", (req, res) => res.json({ message: "Kiryana Store API 🏪", chapter: "13 — Pagination" }));
app.use("/api/v1", routes);
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ success: false, error: err.message }));
module.exports = app;
