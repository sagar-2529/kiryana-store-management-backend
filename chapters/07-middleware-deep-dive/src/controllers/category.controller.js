// ============================================================
// Controller: Category — now using asyncHandler! 🎉
// No more try/catch in every function
// ============================================================

const prisma = require("../lib/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const asyncHandler = require("../middleware/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const { name, description, adminId } = req.body;
  if (!name) return sendError(res, 400, "Field 'name' is required");

  let resolvedAdminId = adminId;
  if (!resolvedAdminId) {
    const admin = await prisma.admin.findFirst();
    if (!admin) return sendError(res, 400, "No admin exists");
    resolvedAdminId = admin.id;
  }

  const category = await prisma.category.create({
    data: { name, description: description || null, adminId: resolvedAdminId },
  });
  sendSuccess(res, 201, category, "Category created");
});

const getAll = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true, items: true } } },
    orderBy: { name: "asc" },
  });
  sendSuccess(res, 200, categories);
});

const getById = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { products: { include: { _count: { select: { items: true } } } } },
  });
  if (!category) return sendError(res, 404, "Category not found");
  sendSuccess(res, 200, category);
});

const update = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    },
  });
  sendSuccess(res, 200, category, "Category updated");
});

const remove = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return sendError(res, 404, "Category not found");
  if (category._count.products > 0) {
    return sendError(res, 400, `Cannot delete: ${category._count.products} product(s) linked`);
  }
  await prisma.category.delete({ where: { id: req.params.id } });
  sendSuccess(res, 200, null, "Category deleted");
});

module.exports = { create, getAll, getById, update, remove };
