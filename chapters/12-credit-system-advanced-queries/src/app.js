const express = require("express"); const cors = require("cors"); const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = (err, req, res, next) => { res.status(err.statusCode || 500).json({ success: false, error: err.message }); };
const app = express(); app.use(cors()); app.use(morgan("dev")); app.use(express.json());
app.get("/", (req, res) => res.json({ message: "Kiryana Store API 🏪", chapter: "12 — Credit System" }));
app.use("/api/v1", routes); app.use(errorHandler); module.exports = app;
