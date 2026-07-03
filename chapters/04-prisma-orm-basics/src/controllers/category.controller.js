// ============================================================
// Controller: Category — NOW WITH PRISMA! 🎉
// Compare this to Chapter 03's in-memory version
// ============================================================

const prisma = require("../lib/prisma");
const { sendSuccess, sendError } = require("../utils/response");

// ── GET all categories ──────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    sendSuccess(res, 200, categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    sendError(res, 500, "Failed to fetch categories");
  }
};

// ── GET category by ID ──────────────────────────────────────
const getById = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        products: true, // Include related products
      },
    });

    if (!category) {
      return sendError(res, 404, `Category not found`);
    }

    sendSuccess(res, 200, category);
  } catch (error) {
    console.error("Error fetching category:", error);
    sendError(res, 500, "Failed to fetch category");
  }
};

// ── CREATE category ─────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, description, adminId } = req.body;

    if (!name) {
      return sendError(res, 400, "Field 'name' is required");
    }

    // For now, use the first admin if adminId not provided
    let resolvedAdminId = adminId;
    if (!resolvedAdminId) {
      const admin = await prisma.admin.findFirst();
      if (!admin) {
        return sendError(res, 400, "No admin exists. Seed the database first.");
      }
      resolvedAdminId = admin.id;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        adminId: resolvedAdminId,
      },
    });

    sendSuccess(res, 201, category, "Category created successfully");
  } catch (error) {
    // Handle Prisma unique constraint violation
    if (error.code === "P2002") {
      return sendError(res, 409, `Category '${req.body.name}' already exists`);
    }
    console.error("Error creating category:", error);
    sendError(res, 500, "Failed to create category");
  }
};

// ── UPDATE category ─────────────────────────────────────────
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

    sendSuccess(res, 200, category, "Category updated successfully");
  } catch (error) {
    if (error.code === "P2025") {
      return sendError(res, 404, "Category not found");
    }
    if (error.code === "P2002") {
      return sendError(res, 409, `Category '${req.body.name}' already exists`);
    }
    console.error("Error updating category:", error);
    sendError(res, 500, "Failed to update category");
  }
};

// ── DELETE category ─────────────────────────────────────────
const remove = async (req, res) => {
  try {
    // Check if category has linked products
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return sendError(res, 404, "Category not found");
    }

    if (category._count.products > 0) {
      return sendError(
        res,
        400,
        `Cannot delete: category has ${category._count.products} linked product(s). Remove them first.`
      );
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    sendSuccess(res, 200, null, "Category deleted successfully");
  } catch (error) {
    console.error("Error deleting category:", error);
    sendError(res, 500, "Failed to delete category");
  }
};

module.exports = { getAll, getById, create, update, remove };
