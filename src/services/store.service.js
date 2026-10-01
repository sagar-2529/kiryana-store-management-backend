const prisma = require("../lib/prisma");

function fail(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

async function createPurchase({ customerId, paymentType, cashPayment = 0, creditPayment = 0, notes, items }) {
  if (!Array.isArray(items) || items.length === 0) fail("At least one item is required");
  if (!["CASH", "CREDIT", "MIXED"].includes(paymentType)) fail("paymentType must be CASH, CREDIT, or MIXED");
  if ((paymentType === "CREDIT" || paymentType === "MIXED") && !customerId) fail("Customer is required for credit purchases");

  return prisma.$transaction(async (tx) => {
    const lines = [];
    const requestedByItem = new Map();
    let totalAmount = 0;

    for (const line of items) {
      const item = await tx.item.findUnique({ where: { id: line.itemId } });
      if (!item) fail(`Item ${line.itemId} not found`, 404);
      const quantity = Number(line.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) fail(`Quantity must be positive for ${item.name}`);
      const requested = (requestedByItem.get(item.id) || 0) + quantity;
      requestedByItem.set(item.id, requested);
      if (Number(item.stock) < requested) fail(`Insufficient stock for ${item.name}`);
      const unitPrice = Number(item.price);
      const totalPrice = unitPrice * quantity;
      totalAmount += totalPrice;
      lines.push({ itemId: item.id, quantity, size: line.size || null, unitPrice, totalPrice, customerId: customerId || null });
    }

    const cash = Number(cashPayment);
    const credit = Number(creditPayment);
    if (!Number.isFinite(cash) || !Number.isFinite(credit) || cash < 0 || credit < 0) fail("Payment amounts must be non-negative numbers");
    const equalsTotal = (amount) => Math.abs(amount - totalAmount) < 0.001;
    if (paymentType === "CASH" && (!equalsTotal(cash) || credit !== 0)) fail("Cash payment must equal the bill total");
    if (paymentType === "CREDIT" && (!equalsTotal(credit) || cash !== 0)) fail("Credit payment must equal the bill total");
    if (paymentType === "MIXED" && !equalsTotal(cash + credit)) fail("Cash and credit payments must equal the bill total");

    if (customerId && !await tx.customer.findUnique({ where: { id: customerId } })) fail("Customer not found", 404);

    let userCredit;
    let creditLedger;
    if (credit > 0) {
      userCredit = await tx.userCredit.upsert({ where: { customerId }, create: { customerId, totalBalance: 0 }, update: {} });
      const before = Number(userCredit.totalBalance);
      const after = before + credit;
      if (userCredit.creditLimit !== null && after > Number(userCredit.creditLimit)) fail("Credit limit exceeded");
      userCredit = await tx.userCredit.update({ where: { id: userCredit.id }, data: { totalBalance: after } });
      await tx.customer.update({ where: { id: customerId }, data: { balance: after } });
      creditLedger = { userCreditId: userCredit.id, customerId, amount: credit, balanceBefore: before, balanceAfter: after };
    }

    const purchase = await tx.purchase.create({ data: {
      customerId: customerId || null, paymentType, totalAmount, cashPayment: cash, creditPayment: credit,
      creditId: userCredit?.id || null, notes: notes || null,
    } });
    await tx.purchaseItem.createMany({ data: lines.map((line) => ({ ...line, purchaseId: purchase.id })) });
    for (const line of lines) {
      const updated = await tx.item.updateMany({ where: { id: line.itemId, stock: { gte: line.quantity } }, data: { stock: { decrement: line.quantity } } });
      if (updated.count !== 1) fail("Stock changed while creating this purchase. Please try again.");
    }
    if (creditLedger) await tx.creditTransaction.create({ data: { ...creditLedger, purchaseId: purchase.id, type: "CREDIT_PURCHASE" } });
    return tx.purchase.findUnique({ where: { id: purchase.id }, include: { customer: true, purchaseItems: { include: { item: true } }, creditTransaction: true } });
  });
}

async function cancelPurchase(id) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({ where: { id }, include: { purchaseItems: true, creditTransaction: true } });
    if (!purchase) fail("Purchase not found", 404);
    if (purchase.status === "CANCELLED") return { purchase, alreadyCancelled: true };
    for (const line of purchase.purchaseItems) await tx.item.update({ where: { id: line.itemId }, data: { stock: { increment: line.quantity } } });
    if (purchase.creditTransaction && purchase.customerId && purchase.creditId) {
      const account = await tx.userCredit.findUnique({ where: { id: purchase.creditId } });
      const before = Number(account.totalBalance);
      const after = before - Number(purchase.creditTransaction.amount);
      if (after < 0) fail("Credit balance is inconsistent; cancellation was blocked", 409);
      await tx.userCredit.update({ where: { id: account.id }, data: { totalBalance: after } });
      await tx.customer.update({ where: { id: purchase.customerId }, data: { balance: after } });
      await tx.creditTransaction.create({ data: { userCreditId: account.id, customerId: purchase.customerId, type: "ADJUSTMENT", amount: Number(purchase.creditTransaction.amount), balanceBefore: before, balanceAfter: after, note: `Cancellation reversal for purchase ${purchase.id}` } });
    }
    const cancelled = await tx.purchase.update({ where: { id }, data: { status: "CANCELLED" }, include: { purchaseItems: true, creditTransaction: true } });
    return { purchase: cancelled, alreadyCancelled: false };
  });
}

async function repayCredit({ customerId, amount, note }) {
  const value = Number(amount);
  if (!customerId || !Number.isFinite(value) || value <= 0) fail("Valid customerId and positive amount are required");
  return prisma.$transaction(async (tx) => {
    const account = await tx.userCredit.findUnique({ where: { customerId } });
    if (!account) fail("Credit account not found", 404);
    const before = Number(account.totalBalance);
    if (value > before) fail("Repayment exceeds outstanding balance");
    const after = before - value;
    await tx.userCredit.update({ where: { id: account.id }, data: { totalBalance: after } });
    await tx.customer.update({ where: { id: customerId }, data: { balance: after } });
    return tx.creditTransaction.create({ data: { userCreditId: account.id, customerId, type: "CASH_REPAYMENT", amount: value, balanceBefore: before, balanceAfter: after, note: note || "Cash repayment" } });
  });
}

module.exports = { createPurchase, cancelPurchase, repayCredit, fail };
