// ============================================================
// Example Integration Tests — Category CRUD
// Run: npm test
// ============================================================

const request = require("supertest");

// We need a test app — in a real setup, import your app.js
// For this example, we create a minimal test app
const express = require("express");
const app = express();
app.use(express.json());

// In-memory mock for demonstration
let categories = [];
let nextId = 1;

app.post("/api/v1/categories", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, error: "Name required" });
  const cat = { id: nextId++, name, description: description || null };
  categories.push(cat);
  res.status(201).json({ success: true, data: cat });
});

app.get("/api/v1/categories", (req, res) => {
  res.json({ success: true, data: categories });
});

app.get("/api/v1/categories/:id", (req, res) => {
  const cat = categories.find((c) => c.id === parseInt(req.params.id));
  if (!cat) return res.status(404).json({ success: false, error: "Not found" });
  res.json({ success: true, data: cat });
});

app.delete("/api/v1/categories/:id", (req, res) => {
  const idx = categories.findIndex((c) => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: "Not found" });
  categories.splice(idx, 1);
  res.json({ success: true, message: "Deleted" });
});

// ── Tests ───────────────────────────────────────────────────

describe("Category CRUD", () => {
  beforeEach(() => {
    categories = [];
    nextId = 1;
  });

  describe("POST /api/v1/categories", () => {
    it("should create a category with valid data", async () => {
      const res = await request(app)
        .post("/api/v1/categories")
        .send({ name: "Dairy", description: "Milk products" });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Dairy");
      expect(res.body.data.id).toBeDefined();
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app)
        .post("/api/v1/categories")
        .send({ description: "No name" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should handle optional description", async () => {
      const res = await request(app)
        .post("/api/v1/categories")
        .send({ name: "Grains" });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.description).toBeNull();
    });
  });

  describe("GET /api/v1/categories", () => {
    it("should return empty array when no categories", async () => {
      const res = await request(app).get("/api/v1/categories");
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("should return all categories", async () => {
      // Create 2 categories first
      await request(app).post("/api/v1/categories").send({ name: "A" });
      await request(app).post("/api/v1/categories").send({ name: "B" });

      const res = await request(app).get("/api/v1/categories");
      expect(res.body.data.length).toBe(2);
    });
  });

  describe("GET /api/v1/categories/:id", () => {
    it("should return a category by id", async () => {
      await request(app).post("/api/v1/categories").send({ name: "Dairy" });
      const res = await request(app).get("/api/v1/categories/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe("Dairy");
    });

    it("should return 404 for non-existent id", async () => {
      const res = await request(app).get("/api/v1/categories/999");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/v1/categories/:id", () => {
    it("should delete a category", async () => {
      await request(app).post("/api/v1/categories").send({ name: "Temp" });
      const res = await request(app).delete("/api/v1/categories/1");
      expect(res.statusCode).toBe(200);

      // Verify it's gone
      const check = await request(app).get("/api/v1/categories/1");
      expect(check.statusCode).toBe(404);
    });
  });

  // ────────────────────────────────────────────
  // HOMEWORK: Write tests for:
  // - Customer CRUD (similar pattern)
  // - Purchase flow (create purchase, verify stock deduction)
  // ────────────────────────────────────────────
});
