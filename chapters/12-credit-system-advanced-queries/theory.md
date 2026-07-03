# Chapter 12 — Theory: Credit System & Advanced Queries

---

## 1. The Double-Entry Ledger

Every credit transaction records `balanceBefore` and `balanceAfter`. This creates an auditable trail:

```
Transaction 1: Purchase   ₹200  | before: 0    → after: 200
Transaction 2: Purchase   ₹150  | before: 200  → after: 350
Transaction 3: Repayment  ₹100  | before: 350  → after: 250
Transaction 4: Adjustment -₹50  | before: 250  → after: 200
```

**Why not just store the balance?** Because if the balance is wrong, you can reconstruct it from the transaction history. Without this history, debugging "why is this customer's balance ₹500?" is impossible.

### Transaction Types
| Type | Effect | Balance |
|------|--------|---------|
| `CREDIT_PURCHASE` | Customer buys on credit | ↑ Increases |
| `CASH_REPAYMENT` | Customer pays back | ↓ Decreases |
| `ADJUSTMENT` | Admin correction | ↑↓ Either direction |

---

## 2. Prisma Aggregations

### `aggregate()` — Sum, Average, Count
```js
const result = await prisma.purchase.aggregate({
  _sum: { totalAmount: true, cashPayment: true },
  _avg: { totalAmount: true },
  _count: true,
  where: { createdAt: { gte: startOfDay, lte: endOfDay } },
});
// { _sum: { totalAmount: 15000 }, _avg: { totalAmount: 500 }, _count: 30 }
```

### `groupBy()` — Group and Aggregate
```js
const salesByType = await prisma.purchase.groupBy({
  by: ["paymentType"],
  _sum: { totalAmount: true },
  _count: true,
});
// [
//   { paymentType: "CASH", _sum: { totalAmount: 8000 }, _count: 20 },
//   { paymentType: "CREDIT", _sum: { totalAmount: 7000 }, _count: 10 },
// ]
```

---

## 3. Date Filtering

```js
const where = {};
if (startDate) where.createdAt = { gte: new Date(startDate) };
if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
```

**Common patterns:**
- Today's sales: `gte: startOfDay, lte: endOfDay`
- This month: `gte: firstDayOfMonth`
- Custom range: `gte: startDate, lte: endDate`

---

## 4. Raw SQL with `$queryRaw`

For complex reports Prisma's API can't handle:

```js
const result = await prisma.$queryRaw`
  SELECT c.name, SUM(p.total_amount) as total
  FROM purchases p
  JOIN customers c ON p.customer_id = c.id
  GROUP BY c.name
  ORDER BY total DESC
  LIMIT 5
`;
```

**Use raw SQL when:**
- Complex JOINs across many tables
- Window functions (RANK, ROW_NUMBER)
- Database-specific features
- Performance-critical queries

**Stick with Prisma when:**
- Simple CRUD
- Type safety matters
- Query is straightforward

---

## 5. `select` vs `include` Performance

```js
// include — loads ALL fields + relation
const data = await prisma.customer.findMany({
  include: { purchases: true }, // Every column of every purchase
});

// select — loads ONLY specified fields
const data = await prisma.customer.findMany({
  select: { id: true, name: true, balance: true }, // 3 fields only
});
```

For list endpoints returning 100+ records, `select` significantly reduces data transfer and response size.

---

## 6. Summary

| Concept | What You Learned |
|---------|-----------------|
| Double-entry ledger | balanceBefore/balanceAfter for audit trail |
| `aggregate()` | Sum, average, count operations |
| `groupBy()` | Group and aggregate results |
| Date filtering | `gte`/`lte` for date ranges |
| `$queryRaw` | Escape hatch for complex SQL |
| `select` vs `include` | Performance optimization for queries |

**Next Chapter →** Pagination, filtering, and sorting for production-ready list endpoints.
