const prisma = require("../lib/prisma");
const { repayCredit, fail } = require("../services/store.service");

async function repay(req, res) {
  const data = await repayCredit(req.body);
  res.status(201).json({ success: true, message: "Repayment processed", data });
}

async function getAccount(req, res) {
  const data = await prisma.userCredit.findUnique({ where: { customerId: req.params.customerId }, include: { customer: true, creditTransactions: { orderBy: { createdAt: "desc" }, take: 20 } } });
  if (!data) fail("Credit account not found", 404);
  res.json({ success: true, data });
}

async function getStatement(req, res) {
  const where = { customerId: req.params.customerId };
  if (req.query.startDate || req.query.endDate) {
    where.createdAt = { ...(req.query.startDate && { gte: new Date(req.query.startDate) }), ...(req.query.endDate && { lte: new Date(req.query.endDate) }) };
  }
  const transactions = await prisma.creditTransaction.findMany({ where, include: { purchase: true }, orderBy: { createdAt: "desc" } });
  const account = await prisma.userCredit.findUnique({ where: { customerId: req.params.customerId }, include: { customer: true } });
  if (!account) fail("Credit account not found", 404);
  res.json({ success: true, data: { customer: account.customer, currentBalance: account.totalBalance, transactions } });
}

module.exports = { repay, getAccount, getStatement };
