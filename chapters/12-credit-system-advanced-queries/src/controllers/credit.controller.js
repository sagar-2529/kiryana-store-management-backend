// ============================================================
// Controller: Credit — Repayments, statements, adjustments
// ============================================================

const asyncHandler = require("../middleware/asyncHandler");
const creditService = require("../services/credit.service");
const prisma = require("../lib/prisma");
const { NotFoundError } = require("../utils/errors");

const repay = asyncHandler(async (req, res) => {
  const { customerId, amount, note } = req.body;
  const transaction = await creditService.processRepayment({ customerId, amount, note });
  res.status(201).json({ success: true, message: "Repayment processed", data: transaction });
});

const adjust = asyncHandler(async (req, res) => {
  const { customerId, amount, note } = req.body;
  const transaction = await creditService.processAdjustment({ customerId, amount, note });
  res.json({ success: true, message: "Adjustment processed", data: transaction });
});

const getAccount = asyncHandler(async (req, res) => {
  const userCredit = await prisma.userCredit.findUnique({
    where: { customerId: req.params.customerId },
    include: {
      customer: { select: { name: true, phone: true, balance: true } },
      creditTransactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!userCredit) throw new NotFoundError("Credit account");
  res.json({ success: true, data: userCredit });
});

const getStatement = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const statement = await creditService.getStatement(req.params.customerId, startDate, endDate);
  res.json({ success: true, data: statement });
});

module.exports = { repay, adjust, getAccount, getStatement };
