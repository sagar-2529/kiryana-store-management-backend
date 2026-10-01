const prisma = require("../lib/prisma");
const { createPurchase, cancelPurchase, fail } = require("../services/store.service");

async function getAll(req, res) {
  const where = { ...(req.query.customerId && { customerId: req.query.customerId }), ...(req.query.paymentType && { paymentType: req.query.paymentType }), ...(req.query.status && { status: req.query.status }) };
  const data = await prisma.purchase.findMany({ where, include: { customer: true, _count: { select: { purchaseItems: true } } }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data });
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
