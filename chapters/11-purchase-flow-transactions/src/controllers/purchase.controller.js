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
  // HOMEWORK: Implement purchase cancellation inside a transaction
  // - Restore stock for each PurchaseItem
  // - Reverse credit transaction if exists
  // - Update customer balance
  // - Mark purchase as cancelled (you may want to add a 'status' field)
  res.status(501).json({ success: false, error: "Not implemented — homework!" });
});

module.exports = { create, getAll, getById, cancel };
