// ============================================================
// Chapter 04 — App Configuration (with Prisma)
// ============================================================

const express = require("express");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Kiryana Store API 🏪",
    version: "4.0.0",
    chapter: "04 — Prisma ORM Basics",
    database: "PostgreSQL via Prisma",
    endpoints: {
      categories: "/api/v1/categories",
    },
  });
});

app.use("/api/v1", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url}`,
  });
});

module.exports = app;
