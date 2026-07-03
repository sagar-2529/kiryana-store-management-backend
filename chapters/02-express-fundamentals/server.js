// ============================================================
// Chapter 02 — Express.js Fundamentals
// Your first Express server with in-memory CRUD
// ============================================================

const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
// This parses incoming JSON request bodies and makes them
// available on req.body — without this, req.body is undefined!
app.use(express.json());

// Parse URL-encoded bodies (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// ── In-Memory Data Store ────────────────────────────────────
// We'll replace this with a real database in Chapter 04
let items = [
  { id: 1, name: "Sugar", price: 45, unit: "kg" },
  { id: 2, name: "Rice (Basmati)", price: 120, unit: "kg" },
  { id: 3, name: "Toor Dal", price: 160, unit: "kg" },
  { id: 4, name: "Milk (Amul)", price: 28, unit: "litre" },
  { id: 5, name: "Cooking Oil", price: 180, unit: "litre" },
];
let nextId = 6;

// ── Routes ──────────────────────────────────────────────────

// Home
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Kiryana Store API 🏪",
    version: "2.0.0",
    chapter: "02 — Express Fundamentals",
    endpoints: {
      items: "/api/items",
      health: "/health",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── ITEMS CRUD ──────────────────────────────────────────────

// GET all items (with optional query filter)
app.get("/api/items", (req, res) => {
  let result = items;

  // Filter by name if query param provided: /api/items?name=sugar
  if (req.query.name) {
    result = result.filter((item) =>
      item.name.toLowerCase().includes(req.query.name.toLowerCase())
    );
  }

  // Filter by unit if provided: /api/items?unit=kg
  if (req.query.unit) {
    result = result.filter(
      (item) => item.unit.toLowerCase() === req.query.unit.toLowerCase()
    );
  }

  res.json({
    count: result.length,
    data: result,
  });
});

// GET single item by ID
app.get("/api/items/:id", (req, res) => {
  // req.params.id is always a string — convert to number
  const id = parseInt(req.params.id);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({
      error: "Not Found",
      message: `Item with id ${id} does not exist`,
    });
  }

  res.json({ data: item });
});

// POST — create a new item
app.post("/api/items", (req, res) => {
  const { name, price, unit } = req.body;

  // Basic validation (we'll learn proper validation in Chapter 08)
  if (!name || price === undefined) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Fields 'name' and 'price' are required",
    });
  }

  const newItem = {
    id: nextId++,
    name,
    price: Number(price),
    unit: unit || "piece",
  };

  items.push(newItem);

  // 201 Created — the standard status code for resource creation
  res.status(201).json({
    message: "Item created successfully",
    data: newItem,
  });
});

// ──────────────────────────────────────────────
// HOMEWORK: Implement these routes
// ──────────────────────────────────────────────

// PUT /api/items/:id — Update an item
// Hint: Find the item by id, update fields from req.body, return updated item
// Return 404 if item not found
//
// app.put("/api/items/:id", (req, res) => {
//   // Your code here
// });

// DELETE /api/items/:id — Delete an item
// Hint: Find index with findIndex, use splice to remove, return 204
// Return 404 if item not found
//
// app.delete("/api/items/:id", (req, res) => {
//   // Your code here
// });

// ── 404 Catch-all ───────────────────────────────────────────
// This MUST be the last route — it catches everything unmatched
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🏪 Kiryana Store — Chapter 02          ║
  ║   Express server on http://localhost:${PORT} ║
  ║   Environment: ${process.env.NODE_ENV || "development"}              ║
  ╚═══════════════════════════════════════════╝
  `);
});
