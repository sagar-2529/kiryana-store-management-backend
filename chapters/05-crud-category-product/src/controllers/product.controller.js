// ============================================================
// Controller: Product — PARTIAL (Homework!)
// ============================================================
// ✅ create  — provided
// ✅ getAll  — provided
// ❌ getById — HOMEWORK: follow the Category pattern
// ❌ update  — HOMEWORK: follow the Category pattern
// ❌ remove  — HOMEWORK: follow the Category pattern
// ============================================================

const prisma = require("../lib/prisma");
const { sendSuccess, sendError } = require("../utils/response");

// ── CREATE ✅ ───────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    if (!name || !categoryId) {
      return sendError(res, 400, "Fields 'name' and 'categoryId' are required");
    }

    // Validate that category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return sendError(res, 400, `Category with id '${categoryId}' does not exist`);
    }

    const product = await prisma.product.create({
      data: { name, description: description || null, categoryId },
      include: { category: { select: { id: true, name: true } } },
    });

    sendSuccess(res, 201, product, "Product created");
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to create product");
  }
};

// ── GET ALL ✅ ──────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    // Optional filter by categoryId
    const where = {};
    if (req.query.categoryId) {
      where.categoryId = req.query.categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { name: "asc" },
    });

    sendSuccess(res, 200, products);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch products");
  }
};

// ── GET BY ID ❌ ────────────────────────────────────────────
// HOMEWORK: Implement this!
// Requirements:
//   - Find product by req.params.id
//   - Include: category (select id & name), items (all fields)
//   - Return 404 if not found
//
const getById = async (req, res) => {
  // 👇 YOUR CODE HERE
  sendError(res, 501, "Not implemented yet — this is your homework!");
};

// ── UPDATE ❌ ───────────────────────────────────────────────
// HOMEWORK: Implement this!
// Requirements:
//   - Update name and/or description
//   - Handle P2025 (not found)
//   - Return updated product
//
const update = async (req, res) => {
  // 👇 YOUR CODE HERE
  sendError(res, 501, "Not implemented yet — this is your homework!");
};

// ── DELETE ❌ ───────────────────────────────────────────────
// HOMEWORK: Implement this!
// Requirements:
//   - Check if product has linked items first
//   - If items exist, return 400 with count
//   - If no items, delete and return success
//   - Handle not found
//
const remove = async (req, res) => {
  // 👇 YOUR CODE HERE
  sendError(res, 501, "Not implemented yet — this is your homework!");
};

module.exports = { create, getAll, getById, update, remove };
