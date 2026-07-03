// ============================================================
// Controller: Category — FULL CRUD EXAMPLE
// Study this to complete the Product controller homework
// ============================================================

const prisma = require("../lib/prisma");
const { sendSuccess, sendError } = require("../utils/response");

// ── CREATE ──────────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, description, adminId } = req.body;
    if (!name) return sendError(res, 400, "Field 'name' is required");

    let resolvedAdminId = adminId;
    if (!resolvedAdminId) {
      const admin = await prisma.admin.findFirst();
      if (!admin) return sendError(res, 400, "No admin exists. Seed first.");
      resolvedAdminId = admin.id;
    }

    const category = await prisma.category.create({
      data: { name, description: description || null, adminId: resolvedAdminId },
    });

    sendSuccess(res, 201, category, "Category created");
  } catch (error) {
    if (error.code === "P2002") return sendError(res, 409, `Category '${req.body.name}' already exists`);
    console.error(error);
    sendError(res, 500, "Failed to create category");
  }
};

// ── GET ALL ─────────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true, items: true } } },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, 200, categories);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch categories");
  }
};

// ── GET BY ID ───────────────────────────────────────────────
const getById = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        products: {
          include: { _count: { select: { items: true } } },
        },
      },
    });

    if (!category) return sendError(res, 404, "Category not found");
    sendSuccess(res, 200, category);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch category");
  }
};

// ── UPDATE ──────────────────────────────────────────────────
const update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });
    sendSuccess(res, 200, category, "Category updated");
  } catch (error) {
    if (error.code === "P2025") return sendError(res, 404, "Category not found");
    if (error.code === "P2002") return sendError(res, 409, `Category '${req.body.name}' already exists`);
    console.error(error);
    sendError(res, 500, "Failed to update category");
  }
};

// ── DELETE ──────────────────────────────────────────────────
const remove = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) return sendError(res, 404, "Category not found");
    if (category._count.products > 0) {
      return sendError(res, 400, `Cannot delete: ${category._count.products} product(s) linked. Remove them first.`);
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    sendSuccess(res, 200, null, "Category deleted");
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to delete category");
  }
};

module.exports = { create, getAll, getById, update, remove };
