const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { NotFoundError } = require("./utils/errors");

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.get("/", (req, res) => res.json({ message: "Kiryana Store API 🏪", chapter: "09 — Error Handling" }));
app.use("/api/v1", routes);

// 404 — now throws a proper error
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.url}`));
});

// Global error handler — MUST be the LAST middleware
app.use(errorHandler);

module.exports = app;
