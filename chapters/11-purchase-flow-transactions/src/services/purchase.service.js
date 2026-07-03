// ============================================================
// Service: Purchase — THE CORE BUSINESS LOGIC
// This is the most complex and important file in the project
// ============================================================

const prisma = require("../lib/prisma");
const { ValidationError, NotFoundError } = require("../utils/errors");

/**
 * Create a purchase with full inventory + credit management.
 * Everything happens inside a Prisma transaction.
 *
 * @param {Object} purchaseData
 * @param {string|null} purchaseData.customerId - null for anonymous cash
 * @param {string} purchaseData.paymentType - CASH, CREDIT, MIXED
 * @param {number} purchaseData.cashPayment
 * @param {number} purchaseData.creditPayment
 * @param {string} [purchaseData.notes]
 * @param {Array} purchaseData.items - [{ itemId, quantity, size? }]
 */
async function createPurchase(purchaseData) {
  const { customerId, paymentType, cashPayment = 0, creditPayment = 0, notes, items } = purchaseData;

  if (!items || items.length === 0) {
    throw new ValidationError("At least one item is required");
  }

  if (paymentType === "CREDIT" && !customerId) {
    throw new ValidationError("Customer is required for credit purchases");
  }

  // ── Run everything in a transaction ─────────────────────
  const result = await prisma.$transaction(async (tx) => {

    // ── Step 1: Validate items exist and have sufficient stock ──
    let totalAmount = 0;
    const purchaseItems = [];

    for (const lineItem of items) {
      const item = await tx.item.findUnique({
        where: { id: lineItem.itemId },
      });

      if (!item) {
        throw new NotFoundError(`Item ${lineItem.itemId}`);
      }

      const quantity = parseFloat(lineItem.quantity);
      if (quantity <= 0) {
        throw new ValidationError(`Quantity must be positive for ${item.name}`);
      }

      if (parseFloat(item.stock) < quantity) {
        throw new ValidationError(
          `Insufficient stock for ${item.name}: available ${item.stock}, requested ${quantity}`
        );
      }

      const unitPrice = parseFloat(item.price);
      const lineTotal = unitPrice * quantity;
      totalAmount += lineTotal;

      purchaseItems.push({
        itemId: item.id,
        quantity,
        size: lineItem.size || null,
        unitPrice,       // Snapshot price at time of purchase
        totalPrice: lineTotal,
        customerId: customerId || null,
      });
    }

    // ── Step 2: Validate payment amounts ────────────────────
    const cash = parseFloat(cashPayment);
    const credit = parseFloat(creditPayment);

    if (paymentType === "CASH" && cash < totalAmount) {
      throw new ValidationError(`Cash payment (${cash}) is less than total (${totalAmount})`);
    }

    if (paymentType === "CREDIT" && credit < totalAmount) {
      throw new ValidationError(`Credit amount (${credit}) is less than total (${totalAmount})`);
    }

    if (paymentType === "MIXED" && (cash + credit) < totalAmount) {
      throw new ValidationError(`Cash (${cash}) + Credit (${credit}) is less than total (${totalAmount})`);
    }

    // ── Step 3: Handle credit account ───────────────────────
    let userCredit = null;
    let creditTransaction = null;

    if ((paymentType === "CREDIT" || paymentType === "MIXED") && customerId) {
      // Find or create credit account
      userCredit = await tx.userCredit.upsert({
        where: { customerId },
        create: { customerId, totalBalance: 0 },
        update: {},
      });

      const balanceBefore = parseFloat(userCredit.totalBalance);
      const creditAmount = paymentType === "CREDIT" ? totalAmount : credit;
      const balanceAfter = balanceBefore + creditAmount;

      // Update credit balance
      userCredit = await tx.userCredit.update({
        where: { id: userCredit.id },
        data: { totalBalance: balanceAfter },
      });

      // Update customer balance
      await tx.customer.update({
        where: { id: customerId },
        data: { balance: balanceAfter },
      });

      // Prepare credit transaction (created after purchase)
      creditTransaction = {
        balanceBefore,
        balanceAfter,
        creditAmount,
        userCreditId: userCredit.id,
      };
    }

    // ── Step 4: Create Purchase record ──────────────────────
    const purchase = await tx.purchase.create({
      data: {
        customerId: customerId || null,
        paymentType,
        totalAmount,
        cashPayment: cash,
        creditPayment: paymentType === "CREDIT" ? totalAmount : credit,
        creditId: userCredit?.id || null,
        notes: notes || null,
      },
    });

    // ── Step 5: Create PurchaseItem records ──────────────────
    for (const pi of purchaseItems) {
      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          ...pi,
        },
      });
    }

    // ── Step 6: Deduct stock from items ─────────────────────
    for (const pi of purchaseItems) {
      await tx.item.update({
        where: { id: pi.itemId },
        data: {
          stock: { decrement: pi.quantity },
        },
      });
    }

    // ── Step 7: Create credit transaction record ────────────
    if (creditTransaction) {
      await tx.creditTransaction.create({
        data: {
          userCreditId: creditTransaction.userCreditId,
          purchaseId: purchase.id,
          customerId,
          type: "CREDIT_PURCHASE",
          amount: creditTransaction.creditAmount,
          balanceBefore: creditTransaction.balanceBefore,
          balanceAfter: creditTransaction.balanceAfter,
        },
      });
    }

    // ── Return the complete purchase ────────────────────────
    return tx.purchase.findUnique({
      where: { id: purchase.id },
      include: {
        purchaseItems: {
          include: { item: { select: { name: true, unitType: true } } },
        },
        customer: { select: { id: true, name: true, balance: true } },
        creditTransaction: true,
      },
    });
  });

  return result;
}

module.exports = { createPurchase };
