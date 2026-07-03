// ============================================================
// Service: Credit — Repayment, Adjustments, Statements
// ============================================================

const prisma = require("../lib/prisma");
const { NotFoundError, ValidationError } = require("../utils/errors");

/**
 * Process a cash repayment from a customer.
 * Creates a CASH_REPAYMENT credit transaction and reduces balance.
 */
async function processRepayment({ customerId, amount, note }) {
  if (!customerId || !amount || amount <= 0) {
    throw new ValidationError("Valid customerId and positive amount are required");
  }

  return prisma.$transaction(async (tx) => {
    const userCredit = await tx.userCredit.findUnique({ where: { customerId } });
    if (!userCredit) throw new NotFoundError("Credit account for this customer");

    const balanceBefore = parseFloat(userCredit.totalBalance);
    if (amount > balanceBefore) {
      throw new ValidationError(`Repayment (${amount}) exceeds balance (${balanceBefore})`);
    }

    const balanceAfter = balanceBefore - amount;

    // Update credit balance
    await tx.userCredit.update({
      where: { id: userCredit.id },
      data: { totalBalance: balanceAfter },
    });

    // Update customer balance
    await tx.customer.update({
      where: { id: customerId },
      data: { balance: balanceAfter },
    });

    // Create transaction record
    const transaction = await tx.creditTransaction.create({
      data: {
        userCreditId: userCredit.id,
        customerId,
        type: "CASH_REPAYMENT",
        amount,
        balanceBefore,
        balanceAfter,
        note: note || "Cash repayment",
      },
    });

    return transaction;
  });
}

/**
 * Admin manual adjustment (e.g., write-off, correction)
 */
async function processAdjustment({ customerId, amount, note }) {
  if (!customerId || amount === undefined) {
    throw new ValidationError("customerId and amount are required");
  }

  return prisma.$transaction(async (tx) => {
    const userCredit = await tx.userCredit.findUnique({ where: { customerId } });
    if (!userCredit) throw new NotFoundError("Credit account");

    const balanceBefore = parseFloat(userCredit.totalBalance);
    const balanceAfter = balanceBefore + parseFloat(amount); // negative = reduce, positive = add

    await tx.userCredit.update({ where: { id: userCredit.id }, data: { totalBalance: balanceAfter } });
    await tx.customer.update({ where: { id: customerId }, data: { balance: balanceAfter } });

    return tx.creditTransaction.create({
      data: {
        userCreditId: userCredit.id, customerId, type: "ADJUSTMENT",
        amount: Math.abs(amount), balanceBefore, balanceAfter,
        note: note || "Admin adjustment",
      },
    });
  });
}

/**
 * Get credit statement with date range filter
 */
async function getStatement(customerId, startDate, endDate) {
  const where = { customerId };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const transactions = await prisma.creditTransaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      purchase: { select: { id: true, totalAmount: true, createdAt: true } },
    },
  });

  const userCredit = await prisma.userCredit.findUnique({
    where: { customerId },
    include: { customer: { select: { name: true, phone: true } } },
  });

  return {
    customer: userCredit?.customer || null,
    currentBalance: userCredit?.totalBalance || 0,
    transactions,
    summary: {
      totalTransactions: transactions.length,
      totalCredits: transactions.filter(t => t.type === "CREDIT_PURCHASE").reduce((sum, t) => sum + parseFloat(t.amount), 0),
      totalRepayments: transactions.filter(t => t.type === "CASH_REPAYMENT").reduce((sum, t) => sum + parseFloat(t.amount), 0),
    },
  };
}

module.exports = { processRepayment, processAdjustment, getStatement };
