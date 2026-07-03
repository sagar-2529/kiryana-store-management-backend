// ============================================================
// Controller: Item — FULL CRUD EXAMPLE
// Demonstrates foreign key validation, enums, decimal fields
// ============================================================

const prisma = require("../lib/prisma");
const { sendSuccess, sendError } = require("../utils/response");

// Valid UnitType values (from Prisma schema)
const VALID_UNIT_TYPES = [
  "KG", "GRAM", "LITRE", "ML", "PIECE", "DOZEN", "PACKET", "BOX", "BOTTLE", "OTHER",
];

// ── CREATE ──────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, price, unitType, stock, productId, categoryId } = req.body;

    // Validate required fields
    if (!name || price === undefined || !unitType || !productId || !categoryId) {
      return sendError(res, 400, "Fields name, price, unitType, productId, categoryId are required");
    }

    // Validate enum
    if (!VALID_UNIT_TYPES.includes(unitType)) {
      return sendError(res, 400, `Invalid unitType. Must be one of: ${VALID_UNIT_TYPES.join(", ")}`);
    }

    // Validate foreign keys exist
    const [product, category] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.category.findUnique({ where: { id: categoryId } }),
    ]);

    if (!product) return sendError(res, 400, `Product '${productId}' not found`);
    if (!category) return sendError(res, 400, `Category '${categoryId}' not found`);

    // Validate product belongs to category
    if (product.categoryId !== categoryId) {
      return sendError(res, 400, `Product '${product.name}' does not belong to category '${category.name}'`);
    }

    const item = await prisma.item.create({
      data: {
        name,
        price: parseFloat(price),
        unitType,
        stock: stock !== undefined ? parseFloat(stock) : 0,
        productId,
        categoryId,
      },
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    sendSuccess(res, 201, item, "Item created");
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to create item");
  }
};

// ── GET ALL (with filters) ──────────────────────────────────
const getAll = async (req, res) => {
  try {
    const where = {};

    // Filter by categoryId: /api/v1/items?categoryId=xxx
    if (req.query.categoryId) where.categoryId = req.query.categoryId;

    // Filter by productId: /api/v1/items?productId=xxx
    if (req.query.productId) where.productId = req.query.productId;

    // Filter by unitType: /api/v1/items?unitType=KG
    if (req.query.unitType) where.unitType = req.query.unitType;

    // Filter by name (partial match): /api/v1/items?name=sugar
    if (req.query.name) {
      where.name = { contains: req.query.name, mode: "insensitive" };
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    sendSuccess(res, 200, items);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch items");
  }
};

// ── GET BY ID ───────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: req.params.id },
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        purchases: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: { id: true, quantity: true, totalPrice: true, createdAt: true },
        },
      },
    });

    if (!item) return sendError(res, 404, "Item not found");
    sendSuccess(res, 200, item);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch item");
  }
};

// ── UPDATE ──────────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { name, price, unitType, stock } = req.body;

    // Validate unitType if provided
    if (unitType && !VALID_UNIT_TYPES.includes(unitType)) {
      return sendError(res, 400, `Invalid unitType. Must be one of: ${VALID_UNIT_TYPES.join(", ")}`);
    }

    // Validate stock is not negative
    if (stock !== undefined && parseFloat(stock) < 0) {
      return sendError(res, 400, "Stock cannot be negative");
    }

    const item = await prisma.item.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(unitType !== undefined && { unitType }),
        ...(stock !== undefined && { stock: parseFloat(stock) }),
      },
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    sendSuccess(res, 200, item, "Item updated");
  } catch (error) {
    if (error.code === "P2025") return sendError(res, 404, "Item not found");
    console.error(error);
    sendError(res, 500, "Failed to update item");
  }
};

// ── DELETE ──────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { purchases: true } } },
    });

    if (!item) return sendError(res, 404, "Item not found");

    if (item._count.purchases > 0) {
      return sendError(res, 400, `Cannot delete: item has ${item._count.purchases} purchase record(s)`);
    }

    await prisma.item.delete({ where: { id: req.params.id } });
    sendSuccess(res, 200, null, "Item deleted");
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to delete item");
  }
};

module.exports = { create, getAll, getById, update, remove };
