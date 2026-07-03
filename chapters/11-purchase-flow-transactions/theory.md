# Chapter 11 — Theory: Database Transactions & Purchase Flow

---

## 1. What is a Transaction?

A transaction groups multiple database operations into a single atomic unit. Either ALL operations succeed, or ALL are rolled back.

### The Kiryana Store Purchase Problem

When a customer buys items, we must:
1. Validate items and stock
2. Create a Purchase record
3. Create PurchaseItem records
4. Deduct stock from each Item
5. Update customer credit (if applicable)
6. Create a CreditTransaction record

**If step 4 succeeds but step 5 fails**, we've deducted stock without recording the credit. The inventory is wrong. Money is lost.

**With a transaction:** If step 5 fails, steps 1-4 are automatically reversed.

---

## 2. ACID Properties

| Property | Meaning | Example |
|----------|---------|---------|
| **Atomicity** | All-or-nothing | Purchase creation either fully succeeds or fully rolls back |
| **Consistency** | Valid state → valid state | Stock can never go negative; balances always match transactions |
| **Isolation** | Concurrent transactions don't interfere | Two cashiers billing simultaneously don't double-deduct stock |
| **Durability** | Committed = permanent | Even if server crashes after commit, data is saved |

---

## 3. Prisma Interactive Transactions

```js
const result = await prisma.$transaction(async (tx) => {
  // tx is a transactional Prisma Client
  // ALL operations through tx are in the same transaction

  const item = await tx.item.update({
    where: { id: itemId },
    data: { stock: { decrement: quantity } },
  });

  const purchase = await tx.purchase.create({
    data: { ... },
  });

  // If this throws, EVERYTHING above is rolled back
  await tx.creditTransaction.create({ data: { ... } });

  return purchase; // Transaction commits on successful return
});
```

### Key Rules
1. Use `tx` (not `prisma`) for all operations inside the transaction
2. If any operation throws, ALL operations roll back
3. The transaction auto-commits when the callback returns
4. Return the result you need — it becomes the return value of `$transaction`

---

## 4. The Purchase Flow Step-by-Step

```
Customer → { items: [{itemId, quantity}], paymentType: "CREDIT" }

Step 1: Validate each item exists + has enough stock
Step 2: Calculate total from item prices × quantities
Step 3: Validate payment amounts
Step 4: Create/update UserCredit account (upsert)
Step 5: Create Purchase record
Step 6: Create PurchaseItem records (with price snapshots)
Step 7: Deduct stock: item.stock -= quantity
Step 8: Create CreditTransaction ledger entry
Step 9: Update customer.balance

All inside prisma.$transaction() — atomic!
```

### Price Snapshot

```js
purchaseItems.push({
  itemId: item.id,
  unitPrice: parseFloat(item.price), // Snapshot current price
  totalPrice: unitPrice * quantity,
});
```

Why snapshot? If rice costs ₹120 today and ₹130 tomorrow, yesterday's purchase should still show ₹120.

---

## 5. The Service Layer Pattern

```
Route → Controller → Service → Prisma (DB)
        (HTTP)       (Logic)   (Data)
```

Controllers handle HTTP concerns (req/res). Services handle business logic:

```js
// Controller — thin, only HTTP
const create = asyncHandler(async (req, res) => {
  const purchase = await createPurchase(req.body);
  res.status(201).json({ data: purchase });
});

// Service — contains all business rules
async function createPurchase(data) {
  return prisma.$transaction(async (tx) => {
    // Validation, stock checks, credit logic...
  });
}
```

**Benefits:**
- Services can be reused (called from controllers, cron jobs, CLI scripts)
- Services are testable without HTTP
- Controllers stay small and focused

---

## 6. `upsert` — Create or Update

```js
const userCredit = await tx.userCredit.upsert({
  where: { customerId },
  create: { customerId, totalBalance: 0 },  // If doesn't exist
  update: {},                                 // If exists, do nothing
});
```

`upsert` = Update + Insert. If the record exists, update it. If not, create it. Eliminates the "find, then create if null" pattern.

---

## 7. `{ decrement }` — Atomic Operations

```js
await tx.item.update({
  where: { id: itemId },
  data: { stock: { decrement: quantity } },
});
```

This is better than:
```js
// ❌ Race condition!
const item = await tx.item.findUnique({ where: { id: itemId } });
await tx.item.update({
  where: { id: itemId },
  data: { stock: item.stock - quantity },
});
```

The first approach uses SQL `SET stock = stock - 5` which is atomic. The second reads then writes — another transaction could change the value between the read and write.

---

## 8. Summary

| Concept | What You Learned |
|---------|-----------------|
| Transactions | Atomic groups of operations — all or nothing |
| ACID | Atomicity, Consistency, Isolation, Durability |
| `$transaction` | Prisma interactive transaction with `tx` client |
| Service layer | Business logic separate from HTTP concerns |
| Price snapshot | Store price at purchase time, not reference |
| `upsert` | Create-or-update in one operation |
| `decrement` | Atomic stock deduction without race conditions |

**Next Chapter →** Credit system with repayments and advanced queries.
