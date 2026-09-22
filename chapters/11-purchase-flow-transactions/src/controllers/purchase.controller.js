// ============================================================
// Controller: Purchase — uses the purchase service
// ============================================================

const prisma = require("../lib/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { createPurchase } = require("../services/purchase.service");
const { NotFoundError } = require("../utils/errors");

// ── CREATE PURCHASE ─────────────────────────────────────────
const create = asyncHandler(async (req, res) => {
  const purchase = await createPurchase(req.body);

  res.status(201).json({
    success: true,
    message: "Purchase created successfully",
    data: purchase,
  });
});

// ── GET ALL PURCHASES ───────────────────────────────────────
const getAll = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.customerId) where.customerId = req.query.customerId;
  if (req.query.paymentType) where.paymentType = req.query.paymentType;

  const purchases = await prisma.purchase.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true } },
      _count: { select: { purchaseItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: purchases });
});

// ── GET PURCHASE BY ID ──────────────────────────────────────
const getById = asyncHandler(async (req, res) => {
  const purchase = await prisma.purchase.findUnique({
    where: { id: req.params.id },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      purchaseItems: {
        include: { item: { select: { name: true, unitType: true } } },
      },
      creditTransaction: true,
    },
  });

  if (!purchase) throw new NotFoundError("Purchase");
  res.json({ success: true, data: purchase });
});

// ── CANCEL PURCHASE (homework) ──────────────────────────────
const cancel = asyncHandler(async (req, res) => {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.purchase.findUnique({
      where: { id: req.params.id },
      include: { purchaseItems: true, creditTransaction: true },
    });
    if (!existing) throw new NotFoundError("Purchase");
    if (existing.status === "CANCELLED") {
      return { purchase: existing, alreadyCancelled: true }; // never restore stock twice
    }

    for (const line of existing.purchaseItems) {
      await tx.item.update({
        where: { id: line.itemId },
        data: { stock: { increment: line.quantity } },
      });
    }

    if (existing.creditTransaction && existing.customerId && existing.creditId) {
      const credit = await tx.userCredit.findUnique({ where: { id: existing.creditId } });
      if (!credit) throw new NotFoundError("Credit account");
      const amount = Number(existing.creditTransaction.amount);
      const balanceBefore = Number(credit.totalBalance);
      const balanceAfter = balanceBefore - amount;
      if (balanceAfter < 0) {
        throw new Error("Credit balance is inconsistent; purchase cannot be cancelled safely");
      }

      await tx.userCredit.update({ where: { id: credit.id }, data: { totalBalance: balanceAfter } });
      await tx.customer.update({ where: { id: existing.customerId }, data: { balance: balanceAfter } });
      await tx.creditTransaction.create({
        data: {
          userCreditId: credit.id,
          customerId: existing.customerId,
          type: "ADJUSTMENT",
          amount,
          balanceBefore,
          balanceAfter,
          note: `Cancellation reversal for purchase ${existing.id}`,
        },
      });
    }

    const purchase = await tx.purchase.update({
      where: { id: existing.id },
      data: { status: "CANCELLED" },
      include: { purchaseItems: true, creditTransaction: true },
    });
    return { purchase, alreadyCancelled: false };
  });

  res.json({
    success: true,
    message: result.alreadyCancelled ? "Purchase was already cancelled" : "Purchase cancelled",
    data: result.purchase,
  });
});

module.exports = { create, getAll, getById, cancel };
