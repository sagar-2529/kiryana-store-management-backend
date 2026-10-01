const prisma = require("../lib/prisma");
const { fail } = require("../services/store.service");

async function getAll(req, res) {
  const where = { ...(req.query.name && { name: { contains: req.query.name, mode: "insensitive" } }), ...(req.query.hasCredit === "true" && { balance: { gt: 0 } }) };
  const data = await prisma.customer.findMany({ where, include: { _count: { select: { purchases: true } } }, orderBy: { name: "asc" } });
  res.json({ success: true, data });
}

async function create(req, res) {
  if (!req.body.name) fail("Name is required");
  const data = await prisma.customer.create({ data: { name: req.body.name, phone: req.body.phone || null, address: req.body.address || null } });
  res.status(201).json({ success: true, data });
}

async function getById(req, res) {
  const data = await prisma.customer.findUnique({ where: { id: req.params.id }, include: { userCredit: true, purchases: { orderBy: { createdAt: "desc" }, take: 10 }, _count: { select: { purchaseItems: true } } } });
  if (!data) fail("Customer not found", 404);
  res.json({ success: true, data });
}

async function update(req, res) {
  const { name, phone, address } = req.body;
  const data = await prisma.customer.update({ where: { id: req.params.id }, data: { ...(name !== undefined && { name }), ...(phone !== undefined && { phone: phone || null }), ...(address !== undefined && { address: address || null }) } });
  res.json({ success: true, data });
}

async function remove(req, res) {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id }, include: { _count: { select: { purchases: true } } } });
  if (!customer) fail("Customer not found", 404);
  if (Number(customer.balance) > 0 || customer._count.purchases) fail("Customer has outstanding balance or purchase history", 409);
  await prisma.customer.delete({ where: { id: customer.id } });
  res.json({ success: true, message: "Customer deleted" });
}

async function getPurchases(req, res) {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) fail("Customer not found", 404);
  const data = await prisma.purchase.findMany({ where: { customerId: customer.id }, include: { purchaseItems: { include: { item: true } } }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
}

module.exports = { getAll, create, getById, update, remove, getPurchases };
