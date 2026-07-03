// ============================================================
// Controller: Export — CSV exports for purchases and items
// ============================================================

const prisma = require("../lib/prisma");
const { Parser } = require("json2csv");
const asyncHandler = require("../middleware/asyncHandler");

const exportPurchases = asyncHandler(async (req, res) => {
  const purchases = await prisma.purchase.findMany({
    include: {
      customer: { select: { name: true } },
      purchaseItems: { include: { item: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Flatten for CSV
  const rows = purchases.map((p) => ({
    id: p.id,
    customer: p.customer?.name || "Cash Customer",
    paymentType: p.paymentType,
    totalAmount: p.totalAmount,
    cashPayment: p.cashPayment,
    creditPayment: p.creditPayment,
    items: p.purchaseItems.map((pi) => `${pi.item.name} x${pi.quantity}`).join("; "),
    date: p.createdAt.toISOString(),
  }));

  const parser = new Parser({
    fields: ["id", "customer", "paymentType", "totalAmount", "cashPayment", "creditPayment", "items", "date"],
  });
  const csv = parser.parse(rows);

  res.header("Content-Type", "text/csv");
  res.header("Content-Disposition", "attachment; filename=purchases.csv");
  res.send(csv);
});

const exportItems = asyncHandler(async (req, res) => {
  const items = await prisma.item.findMany({
    include: {
      product: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  const rows = items.map((i) => ({
    name: i.name, price: i.price, unitType: i.unitType, stock: i.stock,
    product: i.product.name, category: i.category.name,
  }));

  const parser = new Parser({ fields: ["name", "price", "unitType", "stock", "product", "category"] });
  res.header("Content-Type", "text/csv");
  res.header("Content-Disposition", "attachment; filename=items.csv");
  res.send(parser.parse(rows));
});

module.exports = { exportPurchases, exportItems };
