// ============================================================
// Controller: Category — NOW USING throw INSTEAD OF sendError
// Errors are thrown and caught by asyncHandler → errorHandler
// ============================================================

const prisma = require("../lib/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { NotFoundError, ValidationError } = require("../utils/errors");

const create = asyncHandler(async (req, res) => {
  const { name, description, adminId } = req.body;
  if (!name) throw new ValidationError("Field 'name' is required");

  let resolvedAdminId = adminId;
  if (!resolvedAdminId) {
    const admin = await prisma.admin.findFirst();
    if (!admin) throw new ValidationError("No admin exists. Seed the database first.");
    resolvedAdminId = admin.id;
  }

  // If this throws P2002 (duplicate), errorHandler catches it automatically!
  const category = await prisma.category.create({
    data: { name, description: description || null, adminId: resolvedAdminId },
  });

  res.status(201).json({ success: true, message: "Category created", data: category });
});

const getAll = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
});

const getById = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { products: true },
  });

  // Throw instead of sendError — cleaner!
  if (!category) throw new NotFoundError("Category");

  res.json({ success: true, data: category });
});

const update = asyncHandler(async (req, res) => {
  // P2025 (not found) → caught by errorHandler automatically
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, message: "Updated", data: category });
});

const remove = asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });

  if (!cat) throw new NotFoundError("Category");
  if (cat._count.products > 0) {
    throw new ValidationError(`Cannot delete: ${cat._count.products} product(s) linked`);
  }

  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Deleted" });
});

module.exports = { create, getAll, getById, update, remove };
