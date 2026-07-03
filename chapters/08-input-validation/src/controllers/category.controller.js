// ============================================================
// Controller: Category — with Zod validation already applied via route
// ============================================================

const prisma = require("../lib/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const asyncHandler = require("../middleware/asyncHandler");

const create = asyncHandler(async (req, res) => {
  // req.body is already validated & cleaned by Zod middleware!
  const { name, description, adminId } = req.body;

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
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  sendSuccess(res, 200, categories);
});

const getById = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { products: true },
  });
  if (!category) return sendError(res, 404, "Category not found");
  sendSuccess(res, 200, category);
});

const update = asyncHandler(async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body, // Already validated by Zod!
  });
  sendSuccess(res, 200, category, "Category updated");
});

const remove = asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!cat) return sendError(res, 404, "Category not found");
  if (cat._count.products > 0) return sendError(res, 400, `Has ${cat._count.products} product(s)`);
  await prisma.category.delete({ where: { id: req.params.id } });
  sendSuccess(res, 200, null, "Deleted");
});

module.exports = { create, getAll, getById, update, remove };
