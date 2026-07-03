# Chapter 11 — Purchase Flow & Transactions 🔴

## What You'll Learn
- Database transactions (ACID properties)
- Prisma interactive transactions (`$transaction`)
- Atomic inventory deduction
- The complete purchase flow: validate → create → deduct stock → credit ledger
- Service layer pattern (business logic separate from controllers)

## Key Concepts

### ACID Properties
| Property | Meaning |
|----------|---------|
| **Atomicity** | All operations succeed or all fail |
| **Consistency** | Database moves from one valid state to another |
| **Isolation** | Concurrent transactions don't interfere |
| **Durability** | Once committed, data survives crashes |

### Prisma Interactive Transaction
```js
const result = await prisma.$transaction(async (tx) => {
  // tx is a transactional Prisma client
  // If ANY operation throws, ALL operations are rolled back
  const item = await tx.item.update({ ... });
  const purchase = await tx.purchase.create({ ... });
  return purchase;
});
```

### Service Layer
Controllers handle HTTP (req/res). Services handle business logic:
```
Route → Controller → Service → Prisma (DB)
        (HTTP)       (Logic)   (Data)
```

## How to Run

```bash
cd chapters/11-purchase-flow-transactions
npm install
npm run dev
```

---

## 🏠 Homework

1. **Cancel Purchase** — `POST /api/v1/purchases/:id/cancel` — reverse stock + credit changes inside a transaction.
2. **Credit Limit Check** — Reject purchase if credit exceeds `UserCredit.creditLimit`.
3. **Bill Calculator** — Service function that computes total from item IDs + quantities.
