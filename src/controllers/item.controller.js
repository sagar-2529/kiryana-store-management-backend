const prisma = require("../lib/prisma");
const { fail } = require("../services/store.service");
const UNIT_TYPES = ["KG", "GRAM", "LITRE", "ML", "PIECE", "DOZEN", "PACKET", "BOX", "BOTTLE", "OTHER"];

async function getAll(req, res) {
  const where = { product: { category: { adminId: req.admin.id } }, ...(req.query.categoryId && { categoryId: req.query.categoryId }), ...(req.query.productId && { productId: req.query.productId }), ...(req.query.unitType && { unitType: req.query.unitType }), ...(req.query.name && { name: { contains: req.query.name, mode: "insensitive" } }) };
  const data = await prisma.item.findMany({ where, include: { product: true, category: true }, orderBy: { name: "asc" } });
  res.json({ success: true, data });
}

async function create(req, res) {
  const { name, price, unitType, stock = 0, productId, categoryId } = req.body;
  if (!name || price === undefined || !unitType || !productId || !categoryId) fail("name, price, unitType, productId and categoryId are required");
  if (!UNIT_TYPES.includes(unitType)) fail("Invalid unit type");
  if (!Number.isFinite(Number(price)) || Number(price) <= 0 || Number(stock) < 0) fail("Price must be positive and stock cannot be negative");
  const product = await prisma.product.findFirst({ where: { id: productId, categoryId, category: { adminId: req.admin.id } } });
  if (!product) fail("Product/category combination not found", 404);
  const data = await prisma.item.create({ data: { name, price: Number(price), unitType, stock: Number(stock), productId, categoryId } });
  res.status(201).json({ success: true, data });
}

async function getById(req, res) {
  const data = await prisma.item.findFirst({ where: { id: req.params.id, product: { category: { adminId: req.admin.id } } }, include: { product: true, category: true, purchases: { take: 10, orderBy: { createdAt: "desc" } } } });
  if (!data) fail("Item not found", 404);
  res.json({ success: true, data });
}

async function update(req, res) {
  const item = await prisma.item.findFirst({ where: { id: req.params.id, product: { category: { adminId: req.admin.id } } } });
  if (!item) fail("Item not found", 404);
  const { name, price, unitType, stock } = req.body;
  if (unitType && !UNIT_TYPES.includes(unitType)) fail("Invalid unit type");
  if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) <= 0)) fail("Price must be positive");
  if (stock !== undefined && (!Number.isFinite(Number(stock)) || Number(stock) < 0)) fail("Stock cannot be negative");
  const data = await prisma.item.update({ where: { id: item.id }, data: { ...(name !== undefined && { name }), ...(price !== undefined && { price: Number(price) }), ...(unitType !== undefined && { unitType }), ...(stock !== undefined && { stock: Number(stock) }) } });
  res.json({ success: true, data });
}

async function remove(req, res) {
  const item = await prisma.item.findFirst({ where: { id: req.params.id, product: { category: { adminId: req.admin.id } } }, include: { _count: { select: { purchases: true } } } });
  if (!item) fail("Item not found", 404);
  if (item._count.purchases) fail("Item has purchase history", 409);
  await prisma.item.delete({ where: { id: item.id } });
  res.json({ success: true, message: "Item deleted" });
}

module.exports = { getAll, create, getById, update, remove };
