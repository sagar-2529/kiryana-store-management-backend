const prisma = require("../lib/prisma");
const { createPurchase, cancelPurchase, fail } = require("../services/store.service");
const { getPagination, paginationMeta } = require("../utils/pagination");

async function getAll(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = { ...(req.query.customerId && { customerId: req.query.customerId }), ...(req.query.paymentType && { paymentType: req.query.paymentType }), ...(req.query.status && { status: req.query.status }) };
  if (req.query.startDate || req.query.endDate) where.createdAt = { ...(req.query.startDate && { gte: new Date(`${req.query.startDate}T00:00:00.000Z`) }), ...(req.query.endDate && { lte: new Date(`${req.query.endDate}T23:59:59.999Z`) }) };
  const [data, total] = await prisma.$transaction([
    prisma.purchase.findMany({ where, include: { customer: true, _count: { select: { purchaseItems: true } } }, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.purchase.count({ where }),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

async function create(req, res) {
  const data = await createPurchase(req.body);
  res.status(201).json({ success: true, message: "Purchase created", data });
}

async function getById(req, res) {
  const data = await prisma.purchase.findUnique({ where: { id: req.params.id }, include: { customer: true, purchaseItems: { include: { item: true } }, creditTransaction: true } });
  if (!data) fail("Purchase not found", 404);
  res.json({ success: true, data });
}

async function cancel(req, res) {
  const result = await cancelPurchase(req.params.id);
  res.json({ success: true, message: result.alreadyCancelled ? "Purchase was already cancelled" : "Purchase cancelled", data: result.purchase });
}

module.exports = { getAll, create, getById, cancel };
