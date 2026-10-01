const prisma = require("../lib/prisma");
const { fail } = require("../services/store.service");

async function getAll(req, res) {
  const where = { category: { adminId: req.admin.id }, ...(req.query.categoryId && { categoryId: req.query.categoryId }) };
  const data = await prisma.product.findMany({ where, include: { category: true, _count: { select: { items: true } } }, orderBy: { name: "asc" } });
  res.json({ success: true, data });
}

async function create(req, res) {
  const { name, description, categoryId } = req.body;
  if (!name || !categoryId) fail("name and categoryId are required");
  const category = await prisma.category.findFirst({ where: { id: categoryId, adminId: req.admin.id } });
  if (!category) fail("Category not found", 404);
  const data = await prisma.product.create({ data: { name, description: description || null, categoryId }, include: { category: true } });
  res.status(201).json({ success: true, data });
}

async function getById(req, res) {
  const data = await prisma.product.findFirst({ where: { id: req.params.id, category: { adminId: req.admin.id } }, include: { category: true, items: true } });
  if (!data) fail("Product not found", 404);
  res.json({ success: true, data });
}

async function update(req, res) {
  const product = await prisma.product.findFirst({ where: { id: req.params.id, category: { adminId: req.admin.id } } });
  if (!product) fail("Product not found", 404);
  const data = await prisma.product.update({ where: { id: product.id }, data: { ...(req.body.name !== undefined && { name: req.body.name }), ...(req.body.description !== undefined && { description: req.body.description }) } });
  res.json({ success: true, data });
}

async function remove(req, res) {
  const product = await prisma.product.findFirst({ where: { id: req.params.id, category: { adminId: req.admin.id } }, include: { _count: { select: { items: true } } } });
  if (!product) fail("Product not found", 404);
  if (product._count.items) fail("Product has linked items", 409);
  await prisma.product.delete({ where: { id: product.id } });
  res.json({ success: true, message: "Product deleted" });
}

module.exports = { getAll, create, getById, update, remove };
