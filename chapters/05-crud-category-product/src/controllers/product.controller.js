

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

const getById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });

    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    return sendSuccess(res, 200, product);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal Server Error");
  }
};
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...(name && { name }),
        ...(description && { description }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sendSuccess(res, 200, updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);

    // Product not found
    if (error.code === "P2025") {
      return sendError(res, 404, "Product not found");
    }

    return sendError(res, 500, "Internal Server Error");
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists and count linked items
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    // Don't allow deletion if items exist
    if (product._count.items > 0) {
      return sendError(
        res,
        400,
        `Cannot delete product. It has ${product._count.items} linked item(s).`
      );
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return sendSuccess(res, 200, {
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

module.exports = { create, getAll, getById, update, remove };
