const express = require("express"); const cors = require("cors"); const morgan = require("morgan");
const routes = require("./routes"); const errorHandler = require("./middleware/errorHandler");
const app = express(); app.use(cors()); app.use(morgan("dev")); app.use(express.json());
app.get("/", (req, res) => res.json({ message: "Kiryana Store API 🏪", chapter: "11 — Transactions" }));
app.use("/api/v1", routes);
app.use((req, res, next) => { const e = new Error(`Cannot ${req.method} ${req.url}`); e.statusCode = 404; next(e); });
app.use(errorHandler); module.exports = app;
