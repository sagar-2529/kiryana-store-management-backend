const prisma = require("../lib/prisma");
const { fail } = require("../services/store.service");
const { getPagination, paginationMeta } = require("../utils/pagination");

async function getAll(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = { adminId: req.admin.id, ...(req.query.name && { name: { contains: req.query.name, mode: "insensitive" } }) };
  const [data, total] = await prisma.$transaction([
    prisma.category.findMany({
    where,
    include: { _count: { select: { products: true, items: true } } },
    orderBy: { name: req.query.sortOrder }, skip, take: limit,
  }),
    prisma.category.count({ where }),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

async function create(req, res) {
  if (!req.body.name) fail("Name is required");
  const data = await prisma.category.create({ data: { name: req.body.name, description: req.body.description || null, adminId: req.admin.id } });
  res.status(201).json({ success: true, data });
}

async function getById(req, res) {
  const data = await prisma.category.findFirst({ where: { id: req.params.id, adminId: req.admin.id }, include: { products: { include: { _count: { select: { items: true } } } } } });
  if (!data) fail("Category not found", 404);
  res.json({ success: true, data });
}

async function update(req, res) {
  const category = await prisma.category.findFirst({ where: { id: req.params.id, adminId: req.admin.id } });
  if (!category) fail("Category not found", 404);
  const data = await prisma.category.update({ where: { id: category.id }, data: { ...(req.body.name !== undefined && { name: req.body.name }), ...(req.body.description !== undefined && { description: req.body.description }) } });
  res.json({ success: true, data });
}

async function remove(req, res) {
  const category = await prisma.category.findFirst({ where: { id: req.params.id, adminId: req.admin.id }, include: { _count: { select: { products: true, items: true } } } });
  if (!category) fail("Category not found", 404);
  if (category._count.products || category._count.items) fail("Category has linked products or items", 409);
  await prisma.category.delete({ where: { id: category.id } });
  res.json({ success: true, message: "Category deleted" });
}

module.exports = { getAll, create, getById, update, remove };
